"use client";

import React, { useState } from "react";
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
    <div className="space-y-8 max-w-4xl font-mono select-none">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-mono text-white">Projects</h1>
          <p className="text-xs font-mono text-[var(--muted)]">WORKSPACE REGISTRY</p>
        </div>
        <button
          onClick={() => setViewState("create")}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/90 text-black font-semibold rounded-xl text-xs transition-all font-mono"
        >
          + New Project
        </button>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-6">
        <div className="text-xs font-mono text-[var(--muted)] border-b border-white/5 pb-2">
          ──────────────────────────────────────────────────────────────────────────
        </div>

        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--muted)]">
            No projects found in the system registry. Run seed script or accept an AI draft.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
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

        <div className="text-xs font-mono text-[var(--muted)] border-t border-white/5 pt-2">
          ──────────────────────────────────────────────────────────────────────────
        </div>

        <p className="text-xs font-mono text-[var(--muted)] italic">
          Editing will be available in Phase 8.
        </p>
      </div>
    </div>
  );
}
