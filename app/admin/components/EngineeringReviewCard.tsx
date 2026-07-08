import React from "react";
import { Hammer, Wand2, RefreshCw } from "lucide-react";

interface EngineeringReviewCardProps {
  score: number;
  critique: string;
  suggestions: string[];
  onFixOverview?: () => void;
  isFixing?: boolean;
}

export default function EngineeringReviewCard({ score, critique, suggestions, onFixOverview, isFixing }: EngineeringReviewCardProps) {
  return (
    <div className="border border-purple-500/15 bg-[#100824] p-4 rounded-2xl space-y-3 font-mono text-xs select-none relative group">
      <div className="flex items-center justify-between border-b border-purple-500/15 pb-2">
        <h4 className="text-[10px] text-purple-400/80 uppercase font-bold tracking-wider flex items-center gap-1.5">
          <Hammer className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          Engineering Critique
        </h4>
        <span className="text-[10px] text-purple-300 font-bold">{score}/100</span>
      </div>

      <div className="space-y-3">
        {critique && (
          <div className="text-[10px] text-slate-300 leading-relaxed bg-white/[0.01] border border-purple-500/15 p-3 rounded-xl whitespace-pre-wrap">
            {critique}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <span className="text-[9px] text-purple-400/80 uppercase tracking-wider block">Suggestions</span>
            <ul className="space-y-1.5 pl-3 list-disc text-purple-300 text-[10px]">
              {suggestions.map((s, idx) => (
                <li key={idx} className="leading-tight">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {onFixOverview && (critique || suggestions.length > 0) && (
          <button
            onClick={onFixOverview}
            disabled={isFixing}
            className="w-full py-2 bg-[var(--accent-blue)]/10 hover:bg-[var(--accent-blue)]/20 border border-[var(--accent-blue)]/20 text-[var(--accent-blue)] font-bold rounded-xl text-[10px] transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
          >
            {isFixing ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Wand2 className="w-3 h-3" />
            )}
            {isFixing ? "Applying Fixes..." : "Apply AI Fix for Overview"}
          </button>
        )}
      </div>
    </div>
  );
}
