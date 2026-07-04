import React from "react";
import { Globe } from "lucide-react";

interface SEOReviewCardProps {
  score: number;
  seoTitle: string;
  metaDescription: string;
  critique: string;
  suggestions: string[];
}

export default function SEOReviewCard({ score, seoTitle, metaDescription, critique, suggestions }: SEOReviewCardProps) {
  return (
    <div className="border border-white/5 bg-[#0a0b0f] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5 font-mono">
          <Globe className="w-3.5 h-3.5 text-slate-300" />
          SEO Audit
        </h4>
        <span className="text-[10px] text-slate-400 font-bold">{score}/100</span>
      </div>

      <div className="space-y-3">
        {(seoTitle || metaDescription) && (
          <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-2 text-[10px] text-slate-300 font-mono">
            {seoTitle && (
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Suggested Title</span>
                <span className="text-white font-bold">{seoTitle}</span>
              </div>
            )}
            {metaDescription && (
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Suggested Description</span>
                <span className="leading-tight block">{metaDescription}</span>
              </div>
            )}
          </div>
        )}

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
