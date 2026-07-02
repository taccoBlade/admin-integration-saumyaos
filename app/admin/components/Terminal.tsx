"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, X, ChevronRight } from "lucide-react";
import { logoutAction } from "../../auth/actions";

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

interface LogLine {
  text: string;
  type: "system" | "input" | "output" | "error";
}

export default function Terminal({ isOpen, onClose, email }: TerminalProps) {
  const [history, setHistory] = useState<LogLine[]>([
    { text: "SAUMYA.OS [Version 0.6]", type: "system" },
    { text: "(c) 2026 Saumya Parekh. All rights reserved.", type: "system" },
    { text: "", type: "system" },
    { text: "os: initializing content service... OK", type: "system" },
    { text: "db: checking supabase connection... OK", type: "system" },
    { text: `auth: session verified for ${email}`, type: "system" },
    { text: "type 'help' for a list of available commands.", type: "system" },
  ]);

  const [inputVal, setInputVal] = useState("");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isOpen]);

  if (!isOpen) return null;

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newHistory = [...history, { text: `saumya@os:~$ ${trimmed}`, type: "input" as const }];

    const args = trimmed.split(" ");
    const command = args[0].toLowerCase();

    switch (command) {
      case "help":
        newHistory.push({
          text: `Available commands:\n  help    - show this reference manual\n  status  - output current database and environment parameters\n  roadmap - output the system implementation milestone tracker\n  version - output release version and system phase details\n  clear   - clear console screen\n  logout  - securely sign out of current session`,
          type: "output",
        });
        break;

      case "status":
        newHistory.push({
          text: `[system status]\n  db: connected\n  auth: active\n  content: online\n  storage: connected`,
          type: "output",
        });
        break;

      case "roadmap":
        newHistory.push({
          text: `SAUMYA.OS Roadmap\n\n  ✓ Technical Design\n  ✓ Database\n  ✓ Supabase\n  ✓ Migration\n  ✓ Authentication\n\n  ▶ Admin Shell\n\n  Upcoming\n\n  Media\n  AI\n  Content Modules\n  Deployment`,
          type: "output",
        });
        break;

      case "version":
        newHistory.push({
          text: `SAUMYA.OS\n  v0.6\n  Current Phase: Admin Shell`,
          type: "output",
        });
        break;

      case "clear":
        setHistory([]);
        return;

      case "logout":
        newHistory.push({ text: "Terminating session...", type: "system" });
        setHistory(newHistory);
        await logoutAction();
        return;

      default:
        newHistory.push({
          text: `sh: command not found: ${command}. Type 'help' to see list of valid instructions.`,
          type: "error",
        });
        break;
    }

    setHistory(newHistory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      handleCommand(inputVal);
      setInputVal("");
    }
  };

  return (
    <div className="h-64 border-t border-white/5 bg-[#08090b] flex flex-col font-mono text-xs select-none">
      {/* Top Header / Titlebar */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[var(--muted)] bg-[#0c0d12]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-[var(--accent-purple)]" />
          <span>Console Panel (saumya@os: ~)</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* History Output Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin">
        {history.map((line, idx) => {
          let color = "text-slate-300";
          if (line.type === "system") color = "text-[var(--muted)]";
          if (line.type === "input") color = "text-white font-semibold";
          if (line.type === "error") color = "text-red-400";
          if (line.type === "output") color = "text-slate-300";

          return (
            <pre key={idx} className={`whitespace-pre-wrap ${color}`}>
              {line.text}
            </pre>
          );
        })}
        <div ref={consoleEndRef} />
      </div>

      {/* CLI Input Form */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-2 border-t border-white/5 flex items-center bg-[#0c0d12]/50 text-white"
      >
        <span className="flex items-center text-[var(--accent-blue)] mr-2 select-none">
          <span>saumya@os</span>
          <span className="text-white mx-0.5">:</span>
          <span className="text-[var(--accent-purple)]">~</span>
          <ChevronRight className="w-3 h-3 text-[var(--accent-blue)] ml-1" />
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent border-0 outline-none focus:ring-0 p-0 text-xs text-white"
          placeholder="Type 'help'..."
          autoFocus
        />
      </form>
    </div>
  );
}
