import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="admin-os min-h-screen w-full bg-[#0a0514] text-purple-50 flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 admin-grid" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-400/80">
          Loading Admin Environment...
        </p>
      </div>
    </div>
  );
}
