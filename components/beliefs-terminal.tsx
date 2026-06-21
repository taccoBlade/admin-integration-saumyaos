"use client";

import { useState, useEffect, useRef } from "react";
import { useOS } from "@/lib/os-context";
import { sysAudio } from "@/lib/audio-engine";
import { motion, AnimatePresence } from "framer-motion";

interface BeliefFile {
  filename: string;
  title: string;
  origin: string;
  application: string;
  whyItMatters: string;
  memories: string;
}

const BELIEF_ARCHIVES: Record<string, BeliefFile> = {
  "DISCIPLINE_BEATS_MOTIVATION.LOG": {
    filename: "DISCIPLINE_BEATS_MOTIVATION.LOG",
    title: "Discipline Beats Motivation",
    origin: "Daily running routines at PDEU and fitness goals in high-heat climates.",
    application: "Waking up at 06:00 AM regardless of sleep schedules to log running distance.",
    whyItMatters: "Motivation is an emotional spike that vanishes under stress. Discipline is a structural baseline that carries you through consolidation periods.",
    memories: "Logging 450+ kilometers on Indian highway bypass paths while managing geotechnical coursework."
  },
  "SYSTEMS_UNDER_CONSTRAINTS.LOG": {
    filename: "SYSTEMS_UNDER_CONSTRAINTS.LOG",
    title: "Systems Under Constraints",
    origin: "Observations of soil settlement profiles and high-stress structural compaction.",
    application: "Optimizing concrete binders and monitoring stress deflections using telemetry.",
    whyItMatters: "Constraints are not blockers; they are the boundary parameters that define optimized performance. Redesigning under friction forces creativity.",
    memories: "Working in the geotech lab analyzing particle packing density profiles under high pressure."
  },
  "EXPERIENCE_FIRST.LOG": {
    filename: "EXPERIENCE_FIRST.LOG",
    title: "Experience First Philosophy",
    origin: "Royal Enfield Meteor cruises through remote regions and documentary style storytelling.",
    application: "Building personal site interfaces as mock operating systems rather than simple lists.",
    whyItMatters: "A resume lists features; an experience builds immersion. Visitors shouldn't just read about you; they should enter your mind.",
    memories: "Drafting the first Super Meteor route documentation while editing cinematic footage late at night."
  }
};

export function BeliefsTerminal() {
  const { addLog, theme } = useOS();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const fileData = selectedFile ? BELIEF_ARCHIVES[selectedFile] : null;

  // Typing effect simulation
  useEffect(() => {
    if (!fileData) {
      setTypedText("");
      return;
    }

    const fullText = `
[SYSTEM FILE: ${fileData.filename}]
----------------------------------------
TITLE: ${fileData.title}
----------------------------------------

ORIGIN:
> ${fileData.origin}

APPLICATION:
> ${fileData.application}

WHY IT MATTERS:
> ${fileData.whyItMatters}

ASSOCIATED MEMORY:
> ${fileData.memories}

[EOF - FILE CLOSED]
    `.trim();

    let idx = 0;
    setTypedText("");
    if (typingTimer.current) clearInterval(typingTimer.current);

    typingTimer.current = setInterval(() => {
      setTypedText((prev) => prev + fullText[idx]);
      idx++;
      if (idx >= fullText.length) {
        if (typingTimer.current) clearInterval(typingTimer.current);
      }
    }, 12); // fast typing speed

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [selectedFile, fileData]);

  const selectLogFile = (filename: string) => {
    sysAudio.playSwitch();
    setSelectedFile(filename);
    addLog("filesystem", `Accessing log file: ${filename}`);
  };

  const closeLogFile = () => {
    sysAudio.playClick();
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-950/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">FILESYSTEM // ARCHIVES</span>
          <h3 className="text-xl font-bold tracking-tight text-white mt-1">Living Belief Archives</h3>
        </div>
        {selectedFile && (
          <button
            onClick={closeLogFile}
            className="px-3 py-1 text-[10px] uppercase tracking-widest border border-white/10 hover:border-red-500 hover:text-red-400 rounded transition-all font-semibold"
          >
            Close file
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[300px]">
        {/* Left Side: Directory Structure */}
        <div className="md:col-span-2 flex flex-col gap-2 font-mono text-[10px] sm:text-xs">
          <span className="text-slate-500 uppercase tracking-widest font-bold pb-2">Filesystem root:</span>
          {Object.keys(BELIEF_ARCHIVES).map((filename) => {
            const isSelected = selectedFile === filename;
            return (
              <div
                key={filename}
                onClick={() => selectLogFile(filename)}
                className={`cursor-pointer px-3 py-2.5 rounded border transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-white/5 border-white/20 text-white"
                    : "border-white/5 text-slate-450 hover:bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <span className="text-slate-600">file_</span>
                <span className="truncate" style={isSelected ? { color: theme.accent } : undefined}>
                  {filename}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Log Reader screen */}
        <div className="md:col-span-3 h-72 md:h-auto bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-300 overflow-y-auto relative select-none">
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key={selectedFile}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap leading-relaxed pb-6 h-full font-mono text-[10px] select-text selection:bg-cyan-500/20"
              >
                {typedText}
                {typedText.length < (typedText.length + 1) && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse" style={{ backgroundColor: theme.accent }} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-550 space-y-2"
              >
                <div className="text-xl">📁</div>
                <div className="text-[10px] uppercase tracking-widest font-bold">Filesystem Idle</div>
                <div className="text-[9px] max-w-[200px]">Select a system log from the directory to mount file telemetry contents.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
