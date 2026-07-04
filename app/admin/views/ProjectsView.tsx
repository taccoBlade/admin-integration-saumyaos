"use client";

import React, { useState } from "react";
import { FolderGit2, Plus } from "lucide-react";
import ProjectRow from "./ProjectRow";
import ProjectEditor from "./ProjectEditor";
import ProjectHistoryView from "./ProjectHistoryView";
import ProjectWizard from "./ProjectWizard";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  overview: string;
  status: string;
}

interface ProjectsViewProps {
  projects: ProjectItem[];
}

export default function ProjectsView({ projects }: ProjectsViewProps) {
  const [viewState, setViewState] = useState<"list" | "edit" | "history" | "create">("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleEdit = (id: string) => {
    setSelectedProjectId(id);
    setViewState("edit");
  };

  const handleHistory = (id: string) => {
    setSelectedProjectId(id);
    setViewState("history");
  };

  const handleBack = () => {
    setViewState("list");
    setSelectedProjectId(null);
  };

  if (viewState === "create") {
    return <ProjectWizard onBack={handleBack} />;
  }

  if (viewState === "edit" && selectedProject) {
    return <ProjectEditor project={selectedProject} onBack={handleBack} />;
  }

  if (viewState === "history" && selectedProject) {
    return (
      <ProjectHistoryView
        projectId={selectedProject.id}
        projectTitle={selectedProject.title}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-8 font-mono select-none">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="admin-section-title">Workspace registry</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Projects</h1>
        </div>
        <button
          onClick={() => setViewState("create")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-200"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Project index</span>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
            {projects.length} total
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <FolderGit2 className="h-5 w-5 text-slate-500" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-slate-500">
              No projects found in the system registry. Run seed script or accept an AI draft.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {projects.map((proj) => (
              <ProjectRow
                key={proj.id}
                project={proj}
                onEdit={handleEdit}
                onHistory={handleHistory}
              />
            ))}
          </ul>
        )}

        <p className="border-t border-white/[0.08] px-5 py-4 text-[11px] leading-relaxed text-slate-500">
          Click Edit next to any project to modify details, manage cover images, or run AI quality audits.
        </p>
      </div>
    </div>
  );
}
