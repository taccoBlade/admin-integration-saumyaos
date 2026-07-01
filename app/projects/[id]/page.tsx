import Link from "next/link";
import { getProject, getProjects } from "@/lib/content";
import Image from "next/image";
import { ArrowLeft, Globe, Zap, Lightbulb, Users, Clock, ShieldCheck, Layers, Cpu, BarChart3, Wrench, ArrowRight } from "lucide-react";
import { ArchitectureVisualizer, TreeNode } from "@/components/home/architecture-visualizer";
import React from "react";
import type { Metadata } from "next";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject(params.id);
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }
  return {
    title: project.title,
    description: project.description || `Technical overview of the project: ${project.title}`,
    openGraph: {
      title: `${project.title} | Saumya Parekh`,
      description: project.description,
      url: `https://saumya.space/projects/${params.id}`,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

/* ─────────────────────────────────────────────────────────────
   HELPERS: Extract structured data from raw project JSON
   ───────────────────────────────────────────────────────────── */

interface FeatureGroup {
  title: string;
  items: string[];
}

interface TechCategory {
  label: string;
  items: string[];
}

function parseMarkdownSections(md: string): FeatureGroup[] {
  if (!md) return [];
  const processed = md.replace(/\\n/g, "\n");
  const lines = processed.split("\n");
  const groups: FeatureGroup[] = [];
  let current: FeatureGroup | null = null;

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    const h4 = line.match(/^####\s+(.+)/);
    const bullet = line.match(/^\s*[\-\*]\s+(.+)/);

    if (h3 || h4) {
      if (current && current.items.length > 0) groups.push(current);
      current = { title: (h3 ? h3[1] : h4![1]).replace(/\*\*/g, ""), items: [] };
    } else if (bullet && current) {
      current.items.push(bullet[1].replace(/\*\*/g, ""));
    } else if (line.trim() && current && !line.startsWith("#")) {
      // Non-bullet descriptive text becomes an item too
      if (line.trim().length > 10) current.items.push(line.trim().replace(/\*\*/g, ""));
    }
  }
  if (current && current.items.length > 0) groups.push(current);
  return groups;
}

function categorizeTech(
  technologies: string[],
  hardware: string[],
  software: string[],
  concepts: string[]
): TechCategory[] {
  const categories: TechCategory[] = [];
  
  // Backend/Languages
  const backendKw = ["Python", "Flask", "NumPy", "SciPy", "Pandas", "Scikit-learn", "C++", "Arduino C++"];
  const backend = technologies.filter(t => backendKw.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
  if (backend.length) categories.push({ label: "Backend & Languages", items: backend });

  // Frontend
  const frontendKw = ["HTML", "CSS", "JavaScript", "Chart.js", "Jinja", "React", "Next"];
  const frontend = technologies.filter(t => frontendKw.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
  if (frontend.length) categories.push({ label: "Frontend", items: frontend });

  // Protocols & APIs
  const protoKw = ["MQTT", "Socket.IO", "HTTP", "API", "WebSocket"];
  const protocols = technologies.filter(t => protoKw.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
  if (protocols.length) categories.push({ label: "Protocols & APIs", items: protocols });

  // Hardware
  const hwKw = ["ESP32", "Raspberry", "Arduino", "Sensor"];
  const hw = technologies.filter(t => hwKw.some(kw => t.toLowerCase().includes(kw.toLowerCase())));
  const allHw = Array.from(new Set([...hw, ...hardware]));
  if (allHw.length) categories.push({ label: "Hardware & IoT", items: allHw });

  // Software modules
  if (software.length) categories.push({ label: "Software Modules", items: software });

  // Engineering concepts
  if (concepts.length) categories.push({ label: "Engineering Concepts", items: concepts });

  // Catch any uncategorised tech
  const allCategorised = new Set([...backend, ...frontend, ...protocols, ...hw]);
  const remaining = technologies.filter(t => !allCategorised.has(t));
  if (remaining.length) {
    const existing = categories.find(c => c.label === "Backend & Languages");
    if (existing) existing.items.push(...remaining);
    else categories.push({ label: "Other", items: remaining });
  }

  return categories;
}

function formatMetricLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

/* ─────────────────────────────────────────────────────────────
   PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */

export default async function ProjectPage({ params }: PageProps) {
  const project = await getProject(params.id);
  if (!project) {
    return (
      <main className="min-h-screen bg-[#08090b] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Project Not Found</h1>
          <Link href="/" className="text-attention-400 hover:underline font-mono text-sm">
            ← Return to System Terminal
          </Link>
        </div>
      </main>
    );
  }

  // Extract raw JSON fields not in TypeScript interface
  const raw = project as unknown as Record<string, unknown>;
  const hardwareComponents = (raw.hardware_components as string[]) || [];
  const softwareComponents = (raw.software_components as string[]) || [];
  const engineeringConcepts = (raw.engineering_concepts as string[]) || [];
  const rawMetrics = raw.metrics as Record<string, string> | undefined;
  const timeline = (raw.timeline as string) || project.duration || "";

  // Build metrics array from object
  const metricsArray = rawMetrics
    ? Object.entries(rawMetrics).map(([key, value]) => ({
        label: formatMetricLabel(key),
        value: value,
      }))
    : project.metrics || [];

  // Parse implementation into feature groups
  const featureGroups = parseMarkdownSections(project.implementation || "");

  // Categorise technologies
  const techCategories = categorizeTech(
    project.technologies,
    hardwareComponents,
    softwareComponents,
    engineeringConcepts
  );

  // Parse challenges into items
  const challengeText = (project.challenges || "").replace(/\\n/g, "\n");
  const challengeItems = challengeText
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Related projects
  const allProjects = await getProjects();
  const relatedProjects = allProjects
    .filter(p => p.id !== project.id && p.domain === project.domain)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#08090b] text-slate-200 font-sans selection:bg-attention-500/30 overflow-x-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-attention-500/[0.02] to-transparent pointer-events-none" />

      {/* ═══════════ SECTION 1 — HERO ═══════════ */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 pt-8 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group text-sm font-mono text-slate-400 hover:text-attention-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Badges */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          <span className="text-[10px] font-bold font-mono px-3 py-1 bg-attention-500/10 border border-attention-500/20 text-attention-400 rounded-md">
            {project.domain}
          </span>
          <span className="text-[10px] font-bold font-mono px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-md">
            {project.year}
          </span>
          <span className="text-[10px] font-bold font-mono px-3 py-1 bg-attention-500/10 border border-attention-500/20 text-attention-400 rounded-md">
            {project.status.toUpperCase()}
          </span>
          {timeline && (
            <span className="text-[10px] font-mono px-3 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-md flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {timeline}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-4 max-w-4xl">
          {project.title}
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Links */}
        {(project.githubUrl || project.liveUrl) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all font-mono text-xs text-white"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                Source Code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-attention-500/10 border border-attention-500/30 text-attention-400 hover:bg-attention-500/20 transition-all font-mono text-xs"
              >
                <Globe className="w-4 h-4" />
                Live Demo
              </a>
            )}
          </div>
        )}

        {/* Tech chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          {project.technologies.map(tech => (
            <span key={tech} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5 text-slate-400">
              {tech}
            </span>
          ))}
        </div>

        {/* Metrics Strip */}
        {metricsArray.length > 0 && (
          <div className={`grid gap-px rounded-xl overflow-hidden border border-white/5 bg-white/5 mb-4 ${
            metricsArray.length === 3 
              ? "grid-cols-1 sm:grid-cols-3" 
              : metricsArray.length === 2 
                ? "grid-cols-2" 
                : "grid-cols-2 md:grid-cols-4"
          }`}>
            {metricsArray.map((m, idx) => (
              <div key={idx} className="bg-[#08090b] p-5 flex flex-col items-center text-center gap-1">
                <span className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-attention-400 tracking-tight">
                  {typeof m === "object" && "value" in m ? m.value : ""}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                  {typeof m === "object" && "label" in m ? m.label : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
        <hr className="border-white/5 my-10" />

        {/* ═══════════ SECTION 2 — PROJECT SUMMARY ═══════════ */}
        <section className="mb-16">
          <SectionLabel>Project Summary</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {project.overview && (
              <SummaryCard title="Overview" text={project.overview} />
            )}
            {project.problem && (
              <SummaryCard title="The Problem" text={project.problem} />
            )}
            {(project.mySolution || project.architecture) && (
              <SummaryCard
                title={project.mySolution ? "The Solution" : "Architecture"}
                text={(project.mySolution || project.architecture)!}
              />
            )}
          </div>
        </section>

        {/* ═══════════ SECTION 3 — ARCHITECTURE ═══════════ */}
        {(project.architecture || hardwareComponents.length > 0 || softwareComponents.length > 0) && (
          <section className="mb-16">
            <SectionLabel>System Architecture</SectionLabel>

            {/* Architecture description */}
            {project.architecture && (
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl mb-8">
                {project.architecture.replace(/\\n/g, " ").replace(/###[^*]*/g, "").substring(0, 300).trim()}
                {project.architecture.length > 300 ? "…" : ""}
              </p>
            )}

            {/* Architecture tree */}
            {!!project.architectureTree && (
              <div className="mb-8">
                <ArchitectureVisualizer tree={project.architectureTree as TreeNode} />
              </div>
            )}

            {/* Subsystem cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hardwareComponents.length > 0 && (
                <SubsystemCard
                  icon={<Cpu className="w-4 h-4 text-attention-400" />}
                  title="Hardware & Sensors"
                  items={hardwareComponents}
                />
              )}
              {softwareComponents.length > 0 && (
                <SubsystemCard
                  icon={<Layers className="w-4 h-4 text-attention-400" />}
                  title="Software Core"
                  items={softwareComponents}
                />
              )}
              {engineeringConcepts.length > 0 && (
                <SubsystemCard
                  icon={<BarChart3 className="w-4 h-4 text-attention-400" />}
                  title="Engineering Methods"
                  items={engineeringConcepts}
                />
              )}
              {project.engineeringInsights && project.engineeringInsights.length > 0 && (
                <SubsystemCard
                  icon={<Zap className="w-4 h-4 text-attention-400" />}
                  title="Key Insights"
                  items={project.engineeringInsights}
                />
              )}
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 4 — KEY FEATURES (BENTO GRID) ═══════════ */}
        {featureGroups.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Key Features</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureGroups.map((group, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl bg-white/[0.015] border border-white/5 hover:border-attention-500/15 transition-colors ${
                    idx === 0 ? "sm:col-span-2 lg:col-span-2" : ""
                  }`}
                >
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-attention-400" />
                    {group.title}
                  </h4>
                  <div className="space-y-1.5">
                    {group.items.slice(0, 6).map((item, i) => (
                      <p key={i} className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                        <span className="text-attention-500 mt-0.5 select-none">▪</span>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 5 — TECHNOLOGY MATRIX ═══════════ */}
        {techCategories.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Technology Stack</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techCategories.map((cat, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-white/[0.015] border border-white/5">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
                    {cat.label}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-md bg-attention-500/5 border border-attention-500/10 text-attention-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 6 — GALLERY ═══════════ */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Gallery</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.gallery.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl overflow-hidden border border-white/5 bg-white/[0.01] ${
                    idx === 0 ? "md:col-span-2 aspect-video" : "aspect-video"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${project.title} - Asset ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded font-mono text-[9px] text-slate-400 border border-white/5">
                    ASSET_{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 7 — ENGINEERING DECISIONS ═══════════ */}
        {project.engineeringInsights && project.engineeringInsights.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Engineering Decisions</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.engineeringInsights.map((insight, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-white/[0.015] border border-white/5 hover:border-attention-500/15 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-attention-500 bg-attention-500/10 px-2 py-0.5 rounded">
                      D-{String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Decision</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 8 — CHALLENGES ═══════════ */}
        {challengeItems.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Technical Challenges</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challengeItems.map((challenge, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-white/[0.015] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-attention-500/20 rounded-l-xl" />
                  <div className="pl-3">
                    <span className="text-[10px] font-mono text-attention-400 font-bold mb-2 block">
                      CHALLENGE {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">{challenge}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 9 — OUTCOMES, LESSONS & STATUS ═══════════ */}
        <section className="mb-16">
          <SectionLabel>Outcomes & Lessons</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Key Outcomes */}
            {project.keyOutcomes && project.keyOutcomes.length > 0 && (
              <div className="p-5 rounded-xl bg-[#08090b] border border-attention-500/10 hover:border-attention-500/20 transition-colors">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                  <Zap className="w-3.5 h-3.5 text-attention-400" />
                  Key Outcomes
                </h4>
                <div className="space-y-3">
                  {project.keyOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-attention-500 font-mono text-xs mt-0.5 select-none">[✓]</span>
                      <span className="text-xs text-slate-300 leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons Learned */}
            {project.lessonsLearned && project.lessonsLearned.length > 0 && (
              <div className="p-5 rounded-xl bg-[#08090b] border border-attention-500/10 hover:border-attention-500/20 transition-colors">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                  <Lightbulb className="w-3.5 h-3.5 text-attention-400" />
                  Lessons Learned
                </h4>
                <div className="space-y-3">
                  {project.lessonsLearned.map((lesson, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-attention-500 font-mono text-xs mt-0.5 select-none">[!]</span>
                      <span className="text-xs text-slate-300 leading-relaxed">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status & What I Learned */}
            <div className="p-5 rounded-xl bg-[#08090b] border border-white/5 space-y-5">
              {project.whatILearned && (
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-attention-400" />
                    What I Learned
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {project.whatILearned.replace(/\\n/g, " ").substring(0, 250)}{project.whatILearned.length > 250 ? "…" : ""}
                  </p>
                </div>
              )}
              {project.currentStatus && (
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-attention-400" />
                    Current Status
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {project.currentStatus.replace(/\\n/g, " ").substring(0, 200)}{project.currentStatus.length > 200 ? "…" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Future Roadmap */}
          {project.futureImprovements && project.futureImprovements !== "N/A" && (
            <div className="mt-6 p-5 rounded-xl bg-white/[0.015] border border-white/5">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-4">
                Future Roadmap
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.futureImprovements
                  .replace(/\\n/g, "\n")
                  .split("\n")
                  .map(s => s.replace(/^\s*[\-\*]\s*/, "").trim())
                  .filter(s => s.length > 3)
                  .map((item, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-attention-500" />
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* ═══════════ SECTION 10 — ROLE (if present) ═══════════ */}
        {project.role && (
          <section className="mb-16">
            <SectionLabel>My Role</SectionLabel>
            <div className="p-5 rounded-xl bg-white/[0.015] border border-white/5 max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-attention-400" />
                <span className="text-sm font-semibold text-white">
                  {(raw.teamSize as string) || "Individual Contributor"}
                </span>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                {project.role
                  .replace(/\\n/g, "\n")
                  .split("\n")
                  .filter(line => line.trim() && !line.startsWith("###"))
                  .map(line => line.replace(/^\s*[\-\*]\s*/, "").trim())
                  .filter(l => l.length > 0)
                  .slice(0, 8)
                  .map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ RELATED PROJECTS ═══════════ */}
        {relatedProjects.length > 0 && (
          <section className="mb-16">
            <SectionLabel>Related Projects</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProjects.map(rel => (
                <Link
                  key={rel.id}
                  href={`/projects/${rel.id}`}
                  className="block p-5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-attention-500/20 hover:bg-white/[0.03] transition-all group"
                >
                  <span className="text-[10px] font-mono text-attention-400 block mb-1">{rel.domain}</span>
                  <h4 className="text-sm font-semibold text-white group-hover:text-attention-400 transition-colors mb-1.5">{rel.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{rel.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom spacer */}
        <div className="h-16" />
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   REUSABLE COMPONENTS
   ───────────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-slate-500 pb-4 mb-6 border-b border-white/5">
      {children}
    </h2>
  );
}

function SummaryCard({ title, text }: { title: string; text: string }) {
  const cleanText = text.replace(/\\n/g, " ").replace(/###[^*]*/g, "").replace(/\*\*/g, "");
  const truncated = cleanText.substring(0, 280).trim();
  return (
    <div className="p-5 rounded-xl bg-white/[0.015] border border-white/5 hover:border-attention-500/15 transition-colors flex flex-col">
      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-attention-400 mb-3">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed flex-1">
        {truncated}{cleanText.length > 280 ? "…" : ""}
      </p>
    </div>
  );
}

function SubsystemCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.015] border border-white/5 hover:border-attention-500/15 transition-colors">
      <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <p key={idx} className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <span className="text-attention-500 mt-0.5 select-none text-[8px]">◆</span>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
