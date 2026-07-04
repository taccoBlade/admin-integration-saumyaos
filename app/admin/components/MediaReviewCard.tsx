import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface MediaReviewCardProps {
  score: number;
  critique: string;
  suggestions: string[];
}

export default function MediaReviewCard({ score, critique, suggestions }: MediaReviewCardProps) {
  return (
    <div className="border border-white/5 bg-[#0a0b0f] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5 font-mono">
          <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
          Media Audit
        </h4>
        <span className="text-[10px] text-slate-400 font-bold">{score}/100</span>
      </div>

      <div className="space-y-3">
        {critique && <p className="text-[10px] text-slate-400 leading-relaxed font-mono">{critique}</p>}

        {suggestions.length > 0 && (
          <div className="space-y-1.5 font-mono">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Suggestions</span>
            <ul className="space-y-1 pl-3 list-disc text-slate-400 text-[10px]">
              {suggestions.map((s, idx) => (
                <li key={idx} className="leading-tight font-mono">
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
