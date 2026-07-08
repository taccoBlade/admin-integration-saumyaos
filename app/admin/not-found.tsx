import React from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="admin-os min-h-screen w-full bg-[#0a0514] text-purple-50 flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 admin-grid" />
      <div className="relative z-10 w-full max-w-md text-center flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 mb-6">
          <AlertCircle className="h-6 w-6 text-yellow-400" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Page Not Found
        </h1>
        <p className="font-mono text-xs text-slate-400 mb-8 max-w-sm">
          The requested admin resource could not be found. It may have been moved, deleted, or you might not have access to it.
        </p>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-mono text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
