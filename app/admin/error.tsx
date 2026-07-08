"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <div className="admin-os min-h-screen w-full bg-[#0a0514] text-purple-50 flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 admin-grid" />
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="space-y-1 pt-0.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400">
                SYSTEM ERROR
              </p>
              <h1 className="text-base font-semibold text-white">
                Admin panel encountered an error
              </h1>
            </div>
          </div>

          {/* Error message */}
          <div className="rounded-xl border border-purple-500/15 bg-black/30 p-4 font-mono text-xs text-red-300 leading-relaxed">
            <p className="text-[10px] text-purple-400/80 uppercase tracking-widest mb-2">
              Error Details
            </p>
            <p className="break-all">{error.message || "An unexpected error occurred."}</p>
            {error.digest && (
              <p className="text-[10px] text-slate-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-xs text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
            <a
              href="/admin"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-xs text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Admin
            </a>
          </div>

          <p className="font-mono text-[10px] text-slate-600 text-center">
            If this error persists, check Settings → Diagnostics for system health.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
