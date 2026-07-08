"use client";

import React from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface AboutVersion {
  id: string;
  version_number: number;
  change_source: string;
  change_summary: string;
  created_at: string;
}

interface AboutHistoryViewProps {
  versions: AboutVersion[];
  loading: boolean;
  isPending: boolean;
  onBack: () => void;
  onRollback: (ver: AboutVersion) => void;
}

export default function AboutHistoryView({
  versions,
  loading,
  isPending,
  onBack,
  onRollback,
}: AboutHistoryViewProps) {
  return (
    <div className="space-y-6 max-w-xl font-mono text-xs select-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-purple-500/15 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">About History Registry</h1>
          <p className="text-[10px] text-[var(--muted)]">ABOUT REVISION HISTORY</p>
        </div>
      </div>

      <div className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl">
        {loading ? (
          <div className="py-8 text-center text-[var(--muted)]">Loading snapshots...</div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)]">No snapshot history found.</div>
        ) : (
          <ul className="space-y-4">
            {versions.map((ver) => (
              <li key={ver.id} className="flex justify-between items-center py-3 border-b border-purple-500/15 last:border-0 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">v{ver.version_number}</span>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-purple-500/15 text-purple-300">
                      {ver.change_source}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-relaxed">{ver.change_summary}</p>
                  <p className="text-[9px] text-[var(--muted)]">{new Date(ver.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => onRollback(ver)}
                  disabled={isPending}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-purple-500/15 rounded-lg text-slate-300 transition-all disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
