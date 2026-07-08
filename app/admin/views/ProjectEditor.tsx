"use client";

import React, { useState, useTransition } from "react";
import { ArrowLeft, Save, Sparkles, Copy, ExternalLink } from "lucide-react";
import { updateProjectAction } from "../project-actions";
import { generateProjectCaseStudyAction, generateLinkedInPostAction } from "../ai-audit-actions";
import ProjectGalleryEditor from "../components/ProjectGalleryEditor";
import AIAssistantPanel from "../components/AIAssistantPanel";
import AIAuditPanel from "../components/AIAuditPanel";

// Custom LinkedIn Icon for older lucide-react versions compatibility
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  overview: string;
  status: string;
  source_json?: Record<string, unknown>;
}

interface ProjectEditorProps {
  project: ProjectItem;
  onBack: () => void;
}

export default function ProjectEditor({ project, onBack }: ProjectEditorProps) {
  const [isPending, startTransition] = useTransition();

  const sourceJson = (project.source_json || {}) as Record<string, unknown>;
  const initialCover = (sourceJson.cover_image as string) || "";
  const initialGallery = (sourceJson.gallery as string[]) || [];

  // Controlled states for AI compatibility
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [year, setYear] = useState(project.year.toString());
  const [status, setStatus] = useState(project.status);
  const [description, setDescription] = useState(project.description || "");
  const [overview, setOverview] = useState(project.overview || "");

  const initialTechs = Array.isArray(sourceJson.technologies)
    ? sourceJson.technologies.join(", ")
    : (sourceJson.technologies as string) || "";
  const initialTags = Array.isArray(sourceJson.tags)
    ? sourceJson.tags.join(", ")
    : (sourceJson.tags as string) || "";

  const [technologies, setTechnologies] = useState(initialTechs);
  const [tags, setTags] = useState(initialTags);

  const [coverUrl, setCoverUrl] = useState(initialCover);
  const [galleryUrls, setGalleryUrls] = useState(initialGallery);

  const [aiOpen, setAiOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [isGeneratingCaseStudy, setIsGeneratingCaseStudy] = useState(false);

  // LinkedIn Modal States
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
  const [isGeneratingLinkedIn, setIsGeneratingLinkedIn] = useState(false);
  const [linkedInPostText, setLinkedInPostText] = useState("");
  const [copied, setCopied] = useState(false);

  // Advanced fields state variables
  const [challenges, setChallenges] = useState((sourceJson.challenges as string) || "");
  const [implementation, setImplementation] = useState((sourceJson.implementation as string) || "");
  const [outcomes, setOutcomes] = useState(
    Array.isArray(sourceJson.outcomes)
      ? sourceJson.outcomes.map(o => `- ${o}`).join("\n")
      : (sourceJson.outcomes as string) || ""
  );
  const [futureImprovements, setFutureImprovements] = useState(
    (sourceJson.future_improvements as string) || (sourceJson.futureImprovements as string) || ""
  );
  const [githubUrl, setGithubUrl] = useState(
    (sourceJson.githubUrl as string) || (sourceJson.github_url as string) || ""
  );
  const [liveUrl, setLiveUrl] = useState(
    (sourceJson.liveUrl as string) || (sourceJson.live_url as string) || ""
  );
  const [domain, setDomain] = useState((sourceJson.domain as string) || "Civil Engineering");

  const initialIdentity = (sourceJson.identity as Record<string, any>) || {};
  const [identityAccent, setIdentityAccent] = useState(initialIdentity.accent || "#6366f1");
  const [identityBg, setIdentityBg] = useState(initialIdentity.background || "#08090b");
  const [identitySurface, setIdentitySurface] = useState(initialIdentity.surface || "#111216");
  const [identityTypography, setIdentityTypography] = useState(initialIdentity.typography || "sans");
  const [identityNoise, setIdentityNoise] = useState(initialIdentity.noiseIntensity?.toString() || "0.015");
  const [identityGlow, setIdentityGlow] = useState(initialIdentity.glowIntensity?.toString() || "0.1");
  const [identityRadius, setIdentityRadius] = useState(initialIdentity.radius || "0.75rem");
  const [identityMotion, setIdentityMotion] = useState(initialIdentity.motionPersonality || "smooth");

  const handleGenerateLinkedInPost = async () => {
    if (!title) {
      alert("Please provide a Project Title first.");
      return;
    }
    setLinkedInModalOpen(true);
    setIsGeneratingLinkedIn(true);
    setCopied(false);
    try {
      const techList = technologies
        ? technologies.split(",").map((t) => t.trim())
        : [];
      const res = await generateLinkedInPostAction(
        title,
        overview || description || "A professional portfolio project.",
        techList
      );
      if (res.error) {
        alert(res.error);
        setLinkedInModalOpen(false);
      } else if (res.postText) {
        setLinkedInPostText(res.postText);
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate LinkedIn post.");
      setLinkedInModalOpen(false);
    } finally {
      setIsGeneratingLinkedIn(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(linkedInPostText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoCaseStudy = async () => {
    if (!title) {
      alert("Please provide a Project Title first.");
      return;
    }
    setIsGeneratingCaseStudy(true);
    try {
      const techList = technologies
        ? technologies.split(",").map((t) => t.trim())
        : [];
      const res = await generateProjectCaseStudyAction(
        title,
        overview || description || "A professional portfolio project.",
        techList
      );
      if (res.error) {
        alert(res.error);
      } else if (res.caseStudy) {
        const cs = res.caseStudy;
        const compiledOverview = `${cs.detailedOverview}\n\n### Key Engineering Challenges\n${cs.challenges}\n\n### Technical Solution & Implementation\n${cs.solution}\n\n### Key Outcomes\n${cs.keyOutcomes.map((o) => `- ${o}`).join("\n")}\n\n### Future Roadmap\n${cs.futureImprovements}`;
        
        setOverview(compiledOverview);
        setDescription(cs.detailedOverview.split(".")[0] + ".");
        setChallenges(cs.challenges);
        setImplementation(cs.solution);
        setOutcomes(cs.keyOutcomes.map((o) => `- ${o}`).join("\n"));
        setFutureImprovements(cs.futureImprovements);
        alert("Case study generated successfully!");
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate case study.");
    } finally {
      setIsGeneratingCaseStudy(false);
    }
  };

  const toggleAi = () => {
    setAiOpen(!aiOpen);
    setAuditOpen(false);
  };

  const toggleAudit = () => {
    setAuditOpen(!auditOpen);
    setAiOpen(false);
  };

  const handleApplyField = (field: string, value: string) => {
    if (field === "title") setTitle(value);
    else if (field === "slug") setSlug(value);
    else if (field === "year") setYear(value);
    else if (field === "status") setStatus(value);
    else if (field === "description") setDescription(value);
    else if (field === "overview") setOverview(value);
    else if (field === "technologies") setTechnologies(value);
    else if (field === "tags") setTags(value);
    else if (field === "challenges") setChallenges(value);
    else if (field === "implementation") setImplementation(value);
    else if (field === "outcomes") setOutcomes(value);
    else if (field === "futureImprovements") setFutureImprovements(value);
    else if (field === "githubUrl") setGithubUrl(value);
    else if (field === "liveUrl") setLiveUrl(value);
    else if (field === "domain") setDomain(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("year", year);
    formData.set("status", status);
    formData.set("description", description);
    formData.set("overview", overview);
    formData.set("technologies", technologies);
    formData.set("tags", tags);
    formData.set("challenges", challenges);
    formData.set("implementation", implementation);
    formData.set("outcomes", outcomes);
    formData.set("futureImprovements", futureImprovements);
    formData.set("githubUrl", githubUrl);
    formData.set("liveUrl", liveUrl);
    formData.set("domain", domain);
    formData.set("coverImage", coverUrl);
    formData.set("galleryImages", galleryUrls.join(","));
    formData.set("identity", JSON.stringify({
      accent: identityAccent,
      background: identityBg,
      surface: identitySurface,
      typography: identityTypography,
      noiseIntensity: parseFloat(identityNoise) || 0,
      glowIntensity: parseFloat(identityGlow) || 0,
      radius: identityRadius,
      motionPersonality: identityMotion,
    }));

    startTransition(async () => {
      const res = await updateProjectAction(project.id, formData);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Project updated successfully!");
        onBack();
      }
    });
  };

  const statuses = [
    { value: "draft", label: "Draft" },
    { value: "review", label: "Review" },
    { value: "scheduled", label: "Scheduled" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-6xl items-start font-mono text-xs select-none">
      <div className="flex-1 w-full space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-purple-500/15 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Edit Project</h1>
              <p className="text-[10px] text-[var(--muted)]">MODIFICATION CONSOLE · {project.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateLinkedInPost}
              className="py-2 px-3 rounded-xl border border-purple-500/15 text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
            >
              <LinkedinIcon className="w-3.5 h-3.5 text-cyan-400" />
              LinkedIn Share
            </button>
            <button
              type="button"
              onClick={toggleAi}
              className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 ${
                aiOpen
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                  : "border-purple-500/15 text-[var(--muted)] hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aiOpen ? "Close AI" : "Ask AI"}
            </button>
            <button
              type="button"
              onClick={toggleAudit}
              className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 ${
                auditOpen
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                  : "border-purple-500/15 text-[var(--muted)] hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {auditOpen ? "Close Audit" : "AI Audit"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Project Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Release Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Technologies</label>
              <input
                type="text"
                placeholder="React, Next.js, Go"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Tags</label>
              <input
                type="text"
                placeholder="featured, open-source"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Short Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
            />
          </div>

          {/* Detailed Overview */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] uppercase text-[var(--muted)]">Detailed Overview</label>
              <button
                type="button"
                onClick={handleAutoCaseStudy}
                disabled={isGeneratingCaseStudy}
                className="flex items-center gap-1.5 py-1 px-2 rounded border border-purple-500/20 bg-purple-500/10 text-purple-400 font-bold hover:bg-purple-500/20 transition-all text-[9px]"
              >
                <Sparkles className="w-2.5 h-2.5" />
                {isGeneratingCaseStudy ? "Compiling..." : "AI Auto-Case Study"}
              </button>
            </div>
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
            />
          </div>

          {/* Domain and URLs Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Domain</label>
              <input
                type="text"
                placeholder="e.g. Civil Engineering"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">GitHub URL</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Live Demo URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
          </div>

          {/* Detailed Case Study Sections */}
          <div className="border border-purple-500/15 bg-[#100824] p-4 rounded-2xl space-y-4">
            <h4 className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
              Advanced Case Study Sections
            </h4>
            
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Key Engineering Challenges</label>
              <textarea
                rows={3}
                placeholder="- Challenge 1&#10;- Challenge 2"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Technical Solution & Implementation</label>
              <textarea
                rows={3}
                placeholder="Detailed description of the steps taken to implement..."
                value={implementation}
                onChange={(e) => setImplementation(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Key Outcomes (Bullet points)</label>
              <textarea
                rows={3}
                placeholder="- 40% efficiency gains&#10;- Successful deployment in..."
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Future Roadmap</label>
              <textarea
                rows={2}
                placeholder="Next steps, future upgrades, integrations..."
                value={futureImprovements}
                onChange={(e) => setFutureImprovements(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
          </div>

          {/* Identity & Theme Config */}
          <div className="border border-cyan-500/15 bg-cyan-900/10 p-4 rounded-2xl space-y-4">
            <h4 className="text-[10px] text-cyan-300 uppercase font-bold tracking-wider">
              Cinematic Identity & Theme
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Accent Color</label>
                <input type="color" value={identityAccent} onChange={e => setIdentityAccent(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Background</label>
                <input type="color" value={identityBg} onChange={e => setIdentityBg(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Surface</label>
                <input type="color" value={identitySurface} onChange={e => setIdentitySurface(e.target.value)} className="w-full h-8 cursor-pointer rounded" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Typography</label>
                <select value={identityTypography} onChange={e => setIdentityTypography(e.target.value)} className="block w-full py-1.5 px-2 bg-[#130a2a] border border-purple-500/15 rounded text-xs text-white">
                  <option value="sans">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Monospace</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Noise Intensity</label>
                <input type="number" step="0.005" value={identityNoise} onChange={e => setIdentityNoise(e.target.value)} className="block w-full py-1.5 px-2 bg-[#130a2a] border border-purple-500/15 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Glow Intensity</label>
                <input type="number" step="0.05" value={identityGlow} onChange={e => setIdentityGlow(e.target.value)} className="block w-full py-1.5 px-2 bg-[#130a2a] border border-purple-500/15 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Border Radius</label>
                <input type="text" value={identityRadius} onChange={e => setIdentityRadius(e.target.value)} className="block w-full py-1.5 px-2 bg-[#130a2a] border border-purple-500/15 rounded text-xs text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Motion Personality</label>
                <select value={identityMotion} onChange={e => setIdentityMotion(e.target.value)} className="block w-full py-1.5 px-2 bg-[#130a2a] border border-purple-500/15 rounded text-xs text-white">
                  <option value="smooth">Smooth (Digital)</option>
                  <option value="mechanical">Mechanical (Industrial)</option>
                  <option value="snappy">Snappy (Editorial)</option>
                </select>
              </div>
            </div>
          </div>

          <ProjectGalleryEditor
            coverUrl={coverUrl}
            onCoverUrlChange={setCoverUrl}
            galleryUrls={galleryUrls}
            onUrlsChange={setGalleryUrls}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black font-semibold rounded-xl text-xs disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/10"
            >
              <Save className="w-3.5 h-3.5" />
              {isPending ? "Saving..." : "Save Project Details"}
            </button>
          </div>
        </form>
      </div>

      {aiOpen && (
        <div className="sticky top-6 shrink-0 w-full xl:w-96 h-auto xl:h-[500px] z-10 mb-8 xl:mb-0">
          <AIAssistantPanel
            context={{
              title,
              slug,
              year,
              description,
              overview,
              technologies,
              tags,
            }}
            onApplyField={handleApplyField}
            onClose={() => setAiOpen(false)}
          />
        </div>
      )}

      {auditOpen && (
        <div className="sticky top-6 shrink-0 w-full xl:w-96 h-auto xl:h-[500px] z-10 mb-8 xl:mb-0">
          <AIAuditPanel
            projectFields={{
              title,
              slug,
              year,
              description,
              overview,
              technologies,
              tags,
              coverImage: coverUrl,
              galleryImages: galleryUrls.join(","),
            }}
            onApplyField={handleApplyField}
            onClose={() => setAuditOpen(false)}
          />
        </div>
      )}

      {linkedInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#130a2a] p-6 shadow-2xl font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/15 pb-4">
              <div className="flex items-center gap-2">
                <LinkedinIcon className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Recruiter LinkedIn Post</span>
              </div>
              <button
                onClick={() => setLinkedInModalOpen(false)}
                className="p-1 rounded hover:bg-white/5 text-[var(--muted)] hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {isGeneratingLinkedIn ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
                <span className="text-xs text-[var(--muted)]">Generating recruiter-optimized post...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--muted)] uppercase leading-relaxed">
                  Below is a high-level, IP-safe post designed for recruiters. You can review/edit it below.
                </p>
                <textarea
                  rows={8}
                  value={linkedInPostText}
                  onChange={(e) => setLinkedInPostText(e.target.value)}
                  className="w-full p-3 bg-[#0d061c] border border-purple-500/15 rounded-xl text-xs text-purple-50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed font-sans"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyText}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs transition-all font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(linkedInPostText);
                      setCopied(true);
                      window.open("https://www.linkedin.com/feed/", "_blank");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-300 hover:bg-cyan-200 text-slate-950 rounded-xl text-xs transition-all font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Copy & Open LinkedIn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
