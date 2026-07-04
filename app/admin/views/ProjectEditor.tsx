"use client";

import React, { useState, useTransition } from "react";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { updateProjectAction } from "../project-actions";
import ProjectGalleryEditor from "../components/ProjectGalleryEditor";
import AIAssistantPanel from "../components/AIAssistantPanel";
import AIAuditPanel from "../components/AIAuditPanel";

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
  const [year, setYear] = useState(project.year.toString());
  const [status, setStatus] = useState(project.status);
  const [description, setDescription] = useState(project.description || "");
  const [overview, setOverview] = useState(project.overview || "");
  const [technologies, setTechnologies] = useState((sourceJson.technologies as string) || "");
  const [tags, setTags] = useState((sourceJson.tags as string) || "");

  const [coverUrl, setCoverUrl] = useState(initialCover);
  const [galleryUrls, setGalleryUrls] = useState(initialGallery);

  const [aiOpen, setAiOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

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
    else if (field === "year") setYear(value);
    else if (field === "status") setStatus(value);
    else if (field === "description") setDescription(value);
    else if (field === "overview") setOverview(value);
    else if (field === "technologies") setTechnologies(value);
    else if (field === "tags") setTags(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("title", title);
    formData.set("year", year);
    formData.set("status", status);
    formData.set("description", description);
    formData.set("overview", overview);
    formData.set("technologies", technologies);
    formData.set("tags", tags);
    formData.set("coverImage", coverUrl);
    formData.set("galleryImages", galleryUrls.join(","));

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
    <div className="flex gap-6 max-w-5xl items-start font-mono text-xs select-none">
      <div className="flex-1 space-y-6 max-w-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-white/5 transition-all"
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
              onClick={toggleAi}
              className={`py-2 px-3 rounded-xl border transition-all flex items-center gap-1.5 ${
                aiOpen
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                  : "border-white/5 text-[var(--muted)] hover:text-white hover:bg-white/5"
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
                  : "border-white/5 text-[var(--muted)] hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {auditOpen ? "Close Audit" : "AI Audit"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Release Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
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
                className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Tags</label>
              <input
                type="text"
                placeholder="featured, open-source"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Short Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Detailed Overview</label>
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
            />
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
        <div className="sticky top-6 shrink-0 h-[500px]">
          <AIAssistantPanel
            context={{
              title,
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
        <div className="sticky top-6 shrink-0 h-[500px]">
          <AIAuditPanel
            projectFields={{
              title,
              year,
              description,
              overview,
              technologies,
              tags,
              coverImage: coverUrl,
              galleryImages: galleryUrls.join(","),
            }}
            onClose={() => setAuditOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
