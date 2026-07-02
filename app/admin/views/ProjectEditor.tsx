"use client";

import React, { useTransition } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { updateProjectAction } from "../project-actions";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  overview: string;
  status: string;
}

interface ProjectEditorProps {
  project: ProjectItem;
  onBack: () => void;
}

export default function ProjectEditor({ project, onBack }: ProjectEditorProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
    <div className="space-y-6 max-w-xl font-mono text-xs select-none">
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

      <form onSubmit={handleSubmit} className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-4">
        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Project Title</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={project.title}
            className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Release Year</label>
            <input
              type="number"
              name="year"
              required
              defaultValue={project.year}
              className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Workflow Status</label>
            <select
              name="status"
              defaultValue={project.status}
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

        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Short Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={project.description}
            className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase text-[var(--muted)] mb-1.5">Detailed Overview</label>
          <textarea
            name="overview"
            rows={4}
            defaultValue={project.overview}
            className="block w-full py-2.5 px-3 bg-[#0c0d12] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-purple)]/50"
          />
        </div>

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
  );
}
