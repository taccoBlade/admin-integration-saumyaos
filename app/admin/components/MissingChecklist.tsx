import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface MissingChecklistProps {
  missing: string[];
  onFixField?: (field: string) => void;
  fixingField?: string | null;
}

export default function MissingChecklist({ missing, onFixField, fixingField }: MissingChecklistProps) {
  return (
    <div className="border border-purple-500/15 bg-[#100824] p-4 rounded-2xl space-y-3 font-mono text-xs select-none">
      <h4 className="text-[10px] text-purple-400/80 uppercase font-bold tracking-wider font-mono">Missing Items Checklist</h4>
      {missing.length === 0 ? (
        <div className="flex items-center gap-2 text-white bg-white/[0.02] border border-purple-500/15 p-3 rounded-xl font-mono">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All critical properties and assets are present.</span>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {missing.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white/[0.01] border border-purple-500/15 p-2 rounded-lg text-slate-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-[10px] leading-tight capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
                {onFixField && ["slug", "technologies", "tags", "description", "overview", "Title", "slug", "overview", "short description", "technologies", "tags", "cover image", "gallery images"].some(f => item.toLowerCase().includes(f)) && (
                  <button
                    type="button"
                    disabled={fixingField === item}
                    onClick={() => onFixField(item)}
                    className="py-0.5 px-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold rounded-lg text-[9px] font-mono leading-none transition-all disabled:opacity-50"
                  >
                    {fixingField === item ? "Fixing..." : "Fix"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
