import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface MissingChecklistProps {
  missing: string[];
}

export default function MissingChecklist({ missing }: MissingChecklistProps) {
  return (
    <div className="border border-white/5 bg-[#0a0b0f] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">Missing Items Checklist</h4>
      {missing.length === 0 ? (
        <div className="flex items-center gap-2 text-white bg-white/[0.02] border border-white/5 p-3 rounded-xl font-mono">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All critical properties and assets are present.</span>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {missing.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-white/[0.01] border border-white/5 p-2 rounded-lg text-slate-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[10px] leading-tight">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
