import React from "react";
import { Globe, Check } from "lucide-react";

interface SEOReviewCardProps {
  score: number;
  seoTitle: string;
  metaDescription: string;
  critique: string;
  suggestions: string[];
  onApplyField?: (field: string, value: string) => void;
}

export default function SEOReviewCard({
  score,
  seoTitle,
  metaDescription,
  critique,
  suggestions,
  onApplyField,
}: SEOReviewCardProps) {
  return (
    <div className="border border-purple-500/15 bg-[#100824] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-purple-500/15 pb-2">
        <h4 className="text-[10px] text-purple-400/80 uppercase font-bold tracking-wider flex items-center gap-1.5 font-mono">
          <Globe className="w-3.5 h-3.5 text-slate-300" />
          SEO Audit
        </h4>
        <span className="text-[10px] text-purple-300 font-bold">{score}/100</span>
      </div>

      <div className="space-y-3">
        {(seoTitle || metaDescription) && (
          <div className="bg-white/[0.01] border border-purple-500/15 p-3 rounded-xl space-y-2 text-[10px] text-slate-300 font-mono">
            {seoTitle && (
              <div>
                <span className="text-[9px] text-purple-400/80 uppercase block">Suggested Title</span>
                <span className="text-white font-bold">{seoTitle}</span>
              </div>
            )}
            {metaDescription && (
              <div>
                <span className="text-[9px] text-purple-400/80 uppercase block">Suggested Description</span>
                <span className="leading-tight block">{metaDescription}</span>
              </div>
            )}

            {onApplyField && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to apply the suggested SEO title and description to this project?"
                    )
                  ) {
                    if (seoTitle) onApplyField("title", seoTitle);
                    if (metaDescription) onApplyField("description", metaDescription);
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 font-bold hover:bg-purple-500/20 transition-all text-[9px] font-mono mt-2"
              >
                <Check className="w-3 h-3" />
                Apply SEO Fixes
              </button>
            )}
          </div>
        )}

        {critique && <p className="text-[10px] text-purple-300 leading-relaxed font-mono">{critique}</p>}

        {suggestions.length > 0 && (
          <div className="space-y-1.5 font-mono">
            <span className="text-[9px] text-purple-400/80 uppercase tracking-wider block">Suggestions</span>
            <ul className="space-y-1 pl-3 list-disc text-purple-300 text-[10px]">
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
