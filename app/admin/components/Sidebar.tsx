import React from "react";
import { LayoutDashboard, FolderGit2, Image, Cpu, Settings, LogOut, Terminal as TerminalIcon } from "lucide-react";
import { logoutAction } from "../../auth/actions";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  displayName: string;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  displayName,
  terminalOpen,
  setTerminalOpen
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "media", label: "Media Library", icon: Image },
    { id: "ai", label: "AI Workspace", icon: Cpu },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#08090b] flex flex-col justify-between font-mono select-none h-screen">
      {/* Top Header */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 className="text-sm font-bold text-white tracking-wider">SAUMYA.OS</h1>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">v0.6 · ONLINE</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                  isActive
                    ? "bg-white/5 text-white font-medium border border-white/5"
                    : "text-[var(--muted)] hover:text-slate-200 hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent-blue)]" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Controls */}
      <div className="p-6 border-t border-white/5 space-y-4">
        {/* Terminal Toggle Helper */}
        <button
          onClick={() => setTerminalOpen(!terminalOpen)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs border transition-all duration-150 ${
            terminalOpen 
              ? "bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border-[var(--accent-purple)]/20" 
              : "text-[var(--muted)] hover:text-slate-200 bg-white/[0.01] hover:bg-white/[0.02] border-white/5"
          }`}
        >
          <span className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5" />
            Console
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 uppercase border border-white/5">
            {terminalOpen ? "Open" : "Close"}
          </span>
        </button>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-white truncate max-w-[120px]">{displayName}</p>
            <p className="text-[9px] text-[var(--muted)] uppercase">Operator</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
