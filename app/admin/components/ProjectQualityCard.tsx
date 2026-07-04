import React from "react";

interface ProjectQualityCardProps {
  overall: number;
  engineering: number;
  seo: number;
  media: number;
}

export default function ProjectQualityCard({ overall, engineering, seo, media }: ProjectQualityCardProps) {
  const scores = [
    { label: "Overall Score", val: overall, color: "text-[var(--accent-purple)]" },
    { label: "Engineering Rigor", val: engineering, color: "text-[var(--accent-blue)]" },
    { label: "SEO Integrity", val: seo, color: "text-white" },
    { label: "Media Assets", val: media, color: "text-slate-300" },
  ];

  return (
    <div className="border border-white/5 bg-[#0a0b0f] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Audit Metrics</h4>
      <div className="grid grid-cols-2 gap-3">
        {scores.map((s) => (
          <div key={s.label} className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] text-slate-400 truncate">{s.label}</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className={`text-lg font-bold ${s.color}`}>{s.val}</span>
              <span className="text-[9px] text-slate-600">/100</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2">
              <div
                className="bg-white h-full opacity-40 transition-all duration-500"
                style={{ width: `${s.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
