"use client";

import { useOS } from "@/lib/os-context";

export function PersonalOSHUD() {
  const { theme } = useOS();

  return (
    <div className="fixed top-[64px] xl:top-[80px] left-0 right-0 z-30 bg-[#08090b]/85 border-b border-white/5 backdrop-blur-md px-4 sm:px-6 py-2 select-none flex flex-wrap justify-between items-center w-full font-mono text-[9px] sm:text-[10px] gap-2">
      {/* Left side details */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
        <span className="font-bold text-white tracking-wider">PDEU // CIVIL ENGINEERING</span>
        <span className="text-slate-700">|</span>
        <span className="text-slate-400">AHMEDABAD, GUJARAT</span>
      </div>

      {/* Right side details */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400">FOCUS: <span className="text-white font-bold">SYSTEMS BUILDER</span></span>
        <span className="text-slate-700">|</span>
        <span className="text-slate-400 tracking-wider">INFRASTRUCTURE + RESEARCH + RIDING</span>
      </div>
    </div>
  );
}
