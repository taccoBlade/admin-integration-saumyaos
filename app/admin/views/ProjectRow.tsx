"use client";

import React from "react";
import { Edit2, History, Trash2 } from "lucide-react";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  status: string;
}

interface ProjectRowProps {
  project: ProjectItem;
  onEdit: (id: string) => void;
  onHistory: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectRow({ project, onEdit, onHistory, onDelete }: ProjectRowProps) {
  const normalizedStatus = project.status.toLowerCase();
  const isDraft = normalizedStatus === "draft";
  const isReview = normalizedStatus === "review";
  const isScheduled = normalizedStatus === "scheduled";
  const isArchived = normalizedStatus === "archived";

  let badgeColor = "border-emerald-300/20 bg-emerald-300/10 text-emerald-300";
  if (isDraft) badgeColor = "border-slate-400/20 bg-slate-400/10 text-purple-300";
  if (isReview) badgeColor = "border-amber-300/20 bg-amber-300/10 text-amber-300";
  if (isScheduled) badgeColor = "border-cyan-300/20 bg-cyan-300/10 text-cyan-300";
  if (isArchived) badgeColor = "border-red-300/20 bg-red-300/10 text-red-300";

  return (
    <li className="flex flex-col gap-4 px-5 py-4 font-mono text-xs transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-100">{project.title}</span>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${badgeColor}`}>
            {project.status}
          </span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-purple-400/80">
          Release Year: {project.year} / Slug: {project.slug}
        </p>
      </div>

      <div className="flex gap-2 self-end sm:self-auto">
        <button
          onClick={() => onHistory(project.id)}
          className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-white/[0.035] px-3 py-1.5 text-slate-300 transition-all hover:bg-white/[0.07] hover:text-white"
        >
          <History className="h-3.5 w-3.5" />
          History
        </button>
        <button
          onClick={() => onEdit(project.id)}
          className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-white/[0.035] px-3 py-1.5 text-slate-300 transition-all hover:bg-white/[0.07] hover:text-white"
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-red-300 transition-all hover:bg-red-500/20 hover:text-red-200 ml-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </li>
  );
}
