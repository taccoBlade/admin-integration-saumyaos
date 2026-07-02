import React from "react";
import { CheckCircle2 } from "lucide-react";

interface DashboardViewProps {
  displayName: string;
}

export default function DashboardView({ displayName }: DashboardViewProps) {
  const statuses = [
    { label: "Database Connected", checked: true },
    { label: "Authentication Active", checked: true },
    { label: "Content Service Online", checked: true },
    { label: "Storage Connected", checked: true },
  ];

  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-xl font-mono text-white">Welcome, {displayName}</h1>
        <p className="text-xs font-mono text-[var(--muted)]">SYSTEM OPERATION DASHBOARD</p>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-6">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--muted)] border-b border-white/5 pb-3">
          System Status
        </h2>
        
        <ul className="space-y-4 font-mono text-sm">
          {statuses.map((status, index) => (
            <li key={index} className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{status.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
