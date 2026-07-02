"use client";

import React from "react";
import { Edit2, History } from "lucide-react";

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
}

export default function ProjectRow({ project, onEdit, onHistory }: ProjectRowProps) {
  const isDraft = project.status.toLowerCase() === "draft";
  const isReview = project.status.toLowerCase() === "review";
  const isScheduled = project.status.toLowerCase() === "scheduled";
  const isArchived = project.status.toLowerCase() === "archived";

  let badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (isDraft) badgeColor = "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  if (isReview) badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  if (isScheduled) badgeColor = "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  if (isArchived) badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20";

  return (
    <li className="flex flex-col sm:flex-row justify-between sm:items-center py-4 border-b border-white/5 last:border-0 gap-4 font-mono text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-slate-200 font-bold">{project.title}</span>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
            {project.status}
          </span>
        </div>
        <p className="text-[10px] text-[var(--muted)]">Release Year: {project.year} · Slug: {project.slug}</p>
      </div>

      <div className="flex gap-2 self-end sm:self-auto">
        <button
          onClick={() => onHistory(project.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-slate-300 transition-all"
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
        <button
          onClick={() => onEdit(project.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-slate-300 transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </li>
  );
}
