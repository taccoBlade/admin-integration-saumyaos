"use client";

import React, { useState, useTransition } from "react";
import { FolderGit2, Plus, AlertTriangle, X } from "lucide-react";
import ProjectRow from "./ProjectRow";
import ProjectEditor from "./ProjectEditor";
import ProjectHistoryView from "./ProjectHistoryView";
import ProjectWizard from "./ProjectWizard";
import { deleteProjectAction } from "../project-actions";

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
  const [isPending, startTransition] = useTransition();

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteClick = (id: string) => {
    setProjectToDelete(id);
    setAdminPassword("");
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToDelete || !adminPassword) return;

    startTransition(async () => {
      const res = await deleteProjectAction(projectToDelete, adminPassword);
      if (res.error) {
        setDeleteError(res.error);
      } else {
        setDeleteModalOpen(false);
        setProjectToDelete(null);
        setAdminPassword("");
      }
    });
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
      <div className="flex flex-col gap-4 border-b border-purple-500/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
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
        <div className="flex items-center justify-between border-b border-purple-500/20 px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-cyan-300" />
            <span className="admin-section-title">Project index</span>
          </div>
          <span className="rounded-full border border-purple-500/20 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
            {projects.length} total
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025]">
              <FolderGit2 className="h-5 w-5 text-purple-400/80" />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-purple-400/80">
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
                onDelete={handleDeleteClick}
              />
            ))}
          </ul>
        )}

        <p className="border-t border-purple-500/20 px-5 py-4 text-[11px] leading-relaxed text-purple-400/80">
          Click Edit next to any project to modify details, manage cover images, or run AI quality audits.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red-500/30 bg-[#130a2a] rounded-3xl p-6 flex flex-col justify-between font-mono text-xs text-slate-350 select-none shadow-2xl">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-4 mb-4">
              <h3 className="text-sm font-bold text-red-400 uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Confirm Deletion
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-purple-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-purple-300 mb-6 leading-relaxed">
              You are about to delete this project. This action cannot be undone.
              Please enter your admin password to confirm.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-[0.16em] text-purple-400/80">
                  Admin Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-lg border border-purple-500/20 bg-black/40 px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none transition-all focus:border-cyan-500/50 focus:bg-black/60 focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="Enter password..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-purple-500/15 mt-4">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-purple-500/15 hover:bg-white/5 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !adminPassword}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
