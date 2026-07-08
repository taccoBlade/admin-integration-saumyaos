"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
          text: `SAUMYA.OS Roadmap\n\n  ✓ Technical Design\n  ✓ Database\n  ✓ Supabase\n  ✓ Migration\n  ✓ Authentication\n  ✓ Admin Shell (Phase 6)\n  ✓ Media Library (Phase 7)\n  ✓ AI Assistant & Reviewer (Phase 9A/9B)\n  ✓ Content Modules (Phase 10: Hero Section)\n\n  ▶ Upcoming: Additional CMS Modules & Deployment`,
          type: "output",
        });
        break;

      case "version":
        newHistory.push({
          text: `SAUMYA.OS\n  v1.0\n  Current Phase: Content Modules (Hero Section)`,
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 264, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col overflow-hidden border-t border-purple-500/20 bg-[#0e0721]/95 font-mono text-xs shadow-[0_-24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:left-[17rem]"
        >
          <div className="flex items-center justify-between border-b border-purple-500/20 bg-white/[0.025] px-4 py-2 text-purple-400/80">
            <div className="flex items-center gap-2">
              <TerminalIcon className="h-3.5 w-3.5 text-violet-300" />
              <span>Console Panel</span>
              <span className="hidden text-slate-600 sm:inline">(saumya@os: ~)</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 transition-all hover:bg-white/[0.06] hover:text-white"
              aria-label="Close console"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
            {history.map((line, idx) => {
              let color = "text-slate-300";
              if (line.type === "system") color = "text-purple-400/80";
              if (line.type === "input") color = "text-white font-semibold";
              if (line.type === "error") color = "text-red-300";
              if (line.type === "output") color = "text-slate-300";

              return (
                <pre key={idx} className={`whitespace-pre-wrap leading-relaxed ${color}`}>
                  {line.text}
                </pre>
              );
            })}
            <div ref={consoleEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center border-t border-purple-500/20 bg-white/[0.025] px-4 py-2 text-white"
          >
            <span className="mr-2 flex items-center text-cyan-300 select-none">
              <span>saumya@os</span>
              <span className="mx-0.5 text-white">:</span>
              <span className="text-violet-300">~</span>
              <ChevronRight className="ml-1 h-3 w-3 text-cyan-300" />
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 border-0 bg-transparent p-0 text-xs text-white outline-none placeholder:text-slate-600 focus:ring-0"
              placeholder="Type 'help'..."
              autoFocus
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
