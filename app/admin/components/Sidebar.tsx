import React from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Camera,
  ChevronRight,
  Cpu,
  FileText,
  FolderGit2,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  Terminal as TerminalIcon,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { logoutAction } from "../../auth/actions";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  displayName: string;
  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  releaseVersion?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  displayName,
  terminalOpen,
  setTerminalOpen,
  releaseVersion,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "hero", label: "Hero Section", icon: Home },
    { id: "about", label: "About Section", icon: FileText },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "vault", label: "Code Vault", icon: TerminalIcon },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "research", label: "Research Archive", icon: BookOpen },
    { id: "photography", label: "Photo Spreads", icon: Camera },
    { id: "resume", label: "Resume", icon: Award },
    { id: "skills", label: "Skills Network", icon: Cpu },
    { id: "media", label: "Media Library", icon: Image },
    { id: "ai", label: "AI Workspace", icon: Cpu },
    { id: "growth", label: "Growth Engine", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed inset-x-0 top-0 z-30 flex max-h-screen flex-col border-b border-purple-500/20 bg-[#0e0721]/95 font-mono backdrop-blur-xl lg:inset-y-0 lg:left-0 lg:right-auto lg:w-[17rem] lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-4 py-3 lg:block lg:p-5 lg:pb-3">
        <div className="flex items-center justify-between lg:border-b lg:border-purple-500/20 lg:pb-5">
          <div>
            <h1 className="text-sm font-semibold tracking-[0.18em] text-white">SAUMYA.OS</h1>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              v{releaseVersion || "0.1.0"} / Online
            </span>
          </div>
          <div className="hidden h-9 w-px bg-gradient-to-b from-emerald-300 via-cyan-300 to-violet-300 lg:block" />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-4 pb-3 lg:overflow-y-auto lg:px-5">
        <nav className="flex gap-2 lg:flex-col lg:gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: isActive ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex min-w-max items-center gap-3 rounded-lg border px-3.5 py-2.5 text-[11px] transition-all duration-200 lg:w-full lg:min-w-0 ${
                  isActive
                    ? "border-white/10 bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "border-transparent text-purple-400/80 hover:border-white/[0.06] hover:bg-white/[0.035] hover:text-purple-50"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="admin-active-rail"
                    className="absolute left-0 top-1/2 hidden h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan-300 lg:block"
                  />
                )}
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-300" : ""}`} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="ml-auto hidden h-3.5 w-3.5 text-purple-400/80 lg:block" />}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="hidden border-t border-purple-500/20 p-5 lg:block">
        <div className="space-y-4">
          <button
            onClick={() => setTerminalOpen(!terminalOpen)}
            className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-[11px] transition-all duration-200 ${
              terminalOpen
                ? "border-violet-300/25 bg-violet-300/10 text-violet-200"
                : "border-purple-500/20 bg-white/[0.02] text-purple-400/80 hover:bg-white/[0.04] hover:text-purple-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <TerminalIcon className="h-3.5 w-3.5" />
              Console
            </span>
            <span className="rounded border border-purple-500/20 bg-white/[0.04] px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
              {terminalOpen ? "Open" : "Closed"}
            </span>
          </button>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="max-w-[130px] truncate text-xs text-white">{displayName}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-purple-400/80">Operator</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-transparent p-2 text-purple-400/80 transition-all hover:border-purple-500/20 hover:bg-white/[0.04] hover:text-white"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
