"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import Terminal from "./Terminal";
import packageJson from "../../../package.json";

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
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="admin-os min-h-screen w-full bg-[#050608] text-slate-200 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 admin-grid" />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayName={profile.display_name}
        terminalOpen={terminalOpen}
        setTerminalOpen={setTerminalOpen}
      />

      <div className="relative z-10 flex min-h-screen flex-col lg:pl-[17rem]">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#07080b]/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 uppercase tracking-[0.18em] text-slate-500">
                Release
              </span>
              <span className="font-semibold tracking-wide text-slate-200">SAUMYA.OS_BUILD_{packageJson.version}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
              <span className="hidden h-px w-10 bg-white/10 sm:block" />
              <span>
                Terminal:
                <span className={terminalOpen ? "ml-1 text-violet-300" : "ml-1 text-slate-400"}>
                  {terminalOpen ? "attached" : "collapsed"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setTerminalOpen(!terminalOpen)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-slate-300 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
              >
                <TerminalIcon className="h-3.5 w-3.5" />
                Console
              </button>
            </div>
          </div>
        </motion.header>

        <Workspace activeTab={activeTab} profile={profile} projects={projects} />

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
