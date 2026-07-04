"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Database,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { runDiagnosticsAction } from "../settings-actions";

interface DashboardViewProps {
  displayName: string;
}

interface DiagChecks {
  database: boolean;
  auth: boolean;
  storage: boolean;
  latencyMs: number;
  details: string;
}

export default function DashboardView({ displayName }: DashboardViewProps) {
  const [checks, setChecks] = useState<DiagChecks | null>(null);
  const [isPending, startTransition] = useTransition();

  const runCheck = () => {
    startTransition(async () => {
      const res = await runDiagnosticsAction();
      if (res.checks) {
        setChecks(res.checks as DiagChecks);
      }
    });
  };

  const serviceCards = [
    { label: "Database", key: "database" as const, icon: Database },
    { label: "Auth", key: "auth" as const, icon: ShieldCheck },
    { label: "Storage", key: "storage" as const, icon: UploadCloud },
  ];

  const statusItems = [
    { label: "Database Connected", key: "database" as const },
    { label: "Authentication Active", key: "auth" as const },
    { label: "Content Service Online", key: "database" as const },
    { label: "Storage Connected", key: "storage" as const },
  ];

  const getCardValue = (key: keyof DiagChecks) => {
    if (!checks) return "Unchecked";
    if (key === "latencyMs" || key === "details") return "";
    return checks[key] ? "Online" : "Offline";
  };

  const allOnline = checks ? checks.database && checks.auth && checks.storage : null;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="admin-section-title">System operation dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Welcome, {displayName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {checks !== null && (
            <span className="admin-status-pill">
              <span className={`h-1.5 w-1.5 rounded-full ${allOnline ? "bg-emerald-300" : "bg-red-400"}`} />
              {allOnline ? "All services online" : "Check failed"}
            </span>
          )}
          <button
            onClick={runCheck}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {isPending ? "Checking…" : "Run Check"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {serviceCards.map((item, index) => {
          const Icon = item.icon;
          const isOnline = checks ? checks[item.key] : null;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28 }}
              className="admin-card p-4"
            >
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                <Icon
                  className={`h-4 w-4 ${
                    isOnline === null
                      ? "text-slate-500"
                      : isOnline
                      ? "text-cyan-300"
                      : "text-red-400"
                  }`}
                />
              </div>
              <p className="admin-section-title">{item.label}</p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  isOnline === null
                    ? "text-slate-500"
                    : isOnline
                    ? "text-white"
                    : "text-red-400"
                }`}
              >
                {getCardValue(item.key)}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="admin-card space-y-6 p-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <h2 className="admin-section-title">System Status</h2>
          <div className="flex items-center gap-2">
            {checks && (
              <span className="font-mono text-[10px] text-slate-500">
                {checks.latencyMs}ms
              </span>
            )}
            <Sparkles className="h-4 w-4 text-violet-300" />
          </div>
        </div>

        <ul className="grid gap-3 font-mono text-sm sm:grid-cols-2">
          {statusItems.map((status, index) => {
            const isOnline = checks ? checks[status.key] : null;
            return (
              <li
                key={index}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-slate-300"
              >
                {isOnline === null ? (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-white/20 bg-white/5" />
                ) : isOnline ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                )}
                <span className={isOnline === false ? "text-red-300" : ""}>
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>

        {checks && (
          <p className="font-mono text-[11px] text-slate-500 border-t border-white/5 pt-3">
            {checks.details}
          </p>
        )}

        {!checks && (
          <p className="font-mono text-[11px] text-slate-600">
            Click <span className="text-slate-400">Run Check</span> to verify system health.
          </p>
        )}
      </div>
    </div>
  );
}
