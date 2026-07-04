import React from "react";
import { Hammer } from "lucide-react";

interface EngineeringReviewCardProps {
  score: number;
  critique: string;
  suggestions: string[];
}

export default function EngineeringReviewCard({ score, critique, suggestions }: EngineeringReviewCardProps) {
  return (
    <div className="border border-white/5 bg-[#0a0b0f] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
          <Hammer className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
          Engineering Critique
        </h4>
        <span className="text-[10px] text-slate-400 font-bold">{score}/100</span>
      </div>

      <div className="space-y-3">
        {critique && (
          <div className="text-[10px] text-slate-300 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl whitespace-pre-wrap">
            {critique}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Suggestions</span>
            <ul className="space-y-1.5 pl-3 list-disc text-slate-400 text-[10px]">
              {suggestions.map((s, idx) => (
                <li key={idx} className="leading-tight">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
