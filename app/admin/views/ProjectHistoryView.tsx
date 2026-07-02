"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { getProjectVersionsAction, rollbackProjectAction } from "../project-actions";

interface ProjectVersion {
  id: string;
  version_number: number;
  change_source: string;
  change_summary: string;
  created_at: string;
}

interface ProjectHistoryViewProps {
  projectId: string;
  projectTitle: string;
  onBack: () => void;
}

export default function ProjectHistoryView({ projectId, projectTitle, onBack }: ProjectHistoryViewProps) {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    const res = await getProjectVersionsAction(projectId);
    if (res.versions) {
      setVersions(res.versions);
    } else if (res.error) {
      alert(res.error);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleRollback = (versionId: string, versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback this project to version ${versionNumber}?`)) {
      return;
    }
    startTransition(async () => {
      const res = await rollbackProjectAction(projectId, versionId);
      if (res.error) {
        alert(res.error);
      } else {
        alert(`Successfully rolled back to version ${versionNumber}!`);
        loadVersions();
      }
    });
  };

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
          <h1 className="text-lg font-bold text-white">Version History</h1>
          <p className="text-[10px] text-[var(--muted)]">SNAPSHOT REGISTRY · {projectTitle}</p>
        </div>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-[var(--muted)]">Loading snapshots...</div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)]">No snapshot history found for this project.</div>
        ) : (
          <ul className="space-y-4">
            {versions.map((ver) => (
              <li
                key={ver.id}
                className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">v{ver.version_number}</span>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                      {ver.change_source}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-relaxed">{ver.change_summary}</p>
                  <p className="text-[9px] text-[var(--muted)]">
                    {new Date(ver.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleRollback(ver.id, ver.version_number)}
                  disabled={isPending}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-slate-300 transition-all disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
