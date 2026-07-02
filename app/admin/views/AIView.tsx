import React from "react";

export default function AIView() {
  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-xl font-mono text-white">AI Workspace</h1>
        <p className="text-xs font-mono text-[var(--muted)]">SYSTEM COMPONENT</p>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-4 font-mono text-sm">
        <div className="space-y-1">
          <span className="text-[var(--muted)]">Module Name:</span>
          <p className="text-slate-200">AI Assistant Engine</p>
        </div>

        <div className="space-y-1">
          <span className="text-[var(--muted)]">Short description:</span>
          <p className="text-slate-300">
            Generate and refine draft descriptions, tags, alt text, and timeline layouts with AI.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[var(--muted)]">Status:</span>
          <p className="text-amber-400">Planned</p>
        </div>

        <div className="space-y-1 pt-2 border-t border-white/5">
          <p className="text-xs text-[var(--muted)]">Coming in Phase 8</p>
        </div>
      </div>
    </div>
  );
}
