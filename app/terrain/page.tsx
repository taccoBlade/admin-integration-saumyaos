"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TerrainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/personal");
  }, [router]);

  return (
    <main className="relative min-h-screen bg-[#060709] text-white flex items-center justify-center font-mono">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          Redirecting to Integrated Topography...
        </p>
      </div>
    </main>
  );
}
