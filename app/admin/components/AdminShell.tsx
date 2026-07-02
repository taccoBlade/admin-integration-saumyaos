"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import Terminal from "./Terminal";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  overview: string;
  status: string;
}

interface AdminShellProps {
  profile: {
    display_name: string;
    email: string;
  };
  projects: ProjectItem[];
}

export function AdminShell({ profile, projects }: AdminShellProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [terminalOpen, setTerminalOpen] = useState(true);

  return (
    <div className="min-h-screen w-full flex bg-[#050608] text-slate-200 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayName={profile.display_name}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
      />

      {/* Main Body (Workspace + Terminal stack) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Indicator */}
        <header className="px-8 py-4 border-b border-white/5 bg-[#08090b] flex items-center justify-between font-mono select-none">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[var(--muted)]">Release ID</span>
            <span className="text-slate-300 font-semibold">SAUMYA.OS_BUILD_0.6</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span>Terminal status: <span className={terminalOpen ? "text-[var(--accent-purple)]" : "text-slate-400"}>
              {terminalOpen ? "Attached" : "Detached"}
            </span></span>
          </div>
        </header>

        {/* Dynamic Workspace */}
        <Workspace activeTab={activeTab} profile={profile} projects={projects} />

        {/* Collapsible CLI Console */}
        <Terminal
          isOpen={terminalOpen}
          onClose={() => setTerminalOpen(false)}
          email={profile.email}
        />
      </div>
    </div>
  );
}
export default AdminShell;
