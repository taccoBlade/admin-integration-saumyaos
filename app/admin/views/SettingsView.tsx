import React from "react";

interface SettingsViewProps {
  displayName: string;
  email: string;
}

export default function SettingsView({ displayName, email }: SettingsViewProps) {
  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-1">
        <h1 className="text-xl font-mono text-white">Settings</h1>
        <p className="text-xs font-mono text-[var(--muted)]">SYSTEM & PROFILE PARAMETERS</p>
      </div>

      <div className="border border-white/5 bg-[#0c0d12]/50 p-6 rounded-2xl space-y-6 font-mono text-sm">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-[var(--muted)]">Display Name</span>
            <span className="text-slate-200">{displayName}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-[var(--muted)]">Email</span>
            <span className="text-slate-200">{email}</span>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[var(--muted)]">System Release</span>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1 text-xs">
              <p className="text-slate-200 font-semibold">SAUMYA.OS</p>
              <p className="text-emerald-400">v0.6</p>
              <p className="text-[var(--muted)] mt-1">Current Phase: Admin Shell</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
