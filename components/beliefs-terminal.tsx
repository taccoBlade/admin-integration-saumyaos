"use client";

import { useState, useEffect, useRef } from "react";
import { useOS } from "@/lib/os-context";
import { sysAudio } from "@/lib/audio-engine";
import { motion, AnimatePresence } from "framer-motion";

interface BeliefFile {
  id: string;
  title: string;
  origin: string;
  application: string;
  reflection: string;
  story: string;
}

const BELIEF_ARCHIVES: Record<string, BeliefFile> = {
  "discipline-motivation": {
    id: "discipline-motivation",
    title: "Discipline over Motivation",
    origin: "Daily running routines at PDEU Gandhinagar and fitness goals in high-heat climates.",
    application: "Waking up at 06:00 AM regardless of sleep schedules to log running distance.",
    reflection: "Motivation is an emotional spike that vanishes under stress. Discipline is a structural baseline that carries you through difficult compaction periods.",
    story: "Logging 450+ kilometers on Indian highway bypass paths while managing geotechnical coursework."
  },
  "systems-constraints": {
    id: "systems-constraints",
    title: "Systems Under Constraints",
    origin: "Observations of soil settlement profiles and high-stress structural compaction.",
    application: "Optimizing concrete binders and monitoring stress deflections using custom sensor matrices.",
    reflection: "Constraints are not blockers; they are the boundary parameters that define optimized performance. Redesigning under friction forces creative systems engineering.",
    story: "Working in the geotechnical lab analyzing particle packing density profiles under high consolidation compactions."
  },
  "experience-first": {
    id: "experience-first",
    title: "Experience First Philosophy",
    origin: "Royal Enfield Meteor cruises through remote regions and documentary-style cinematography.",
    application: "Building personal website interfaces as immersive visual stories rather than simple lists.",
    reflection: "A resume lists technical features; an experience builds true immersion. Visitors shouldn't just read about work—they should enter the builder's mindset.",
    story: "Drafting the first Super Meteor route documentation while editing cinematic footage late at night."
  }
};

export function BeliefsTerminal() {
  const { theme } = useOS();
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
JOURNAL ENTRY: ${fileData.title}
----------------------------------------

CONTEXT:
${fileData.origin}

APPLICATION:
${fileData.application}

REFLECTION:
${fileData.reflection}

PERSONAL STORY:
${fileData.story}
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
    }, 10); // fast typing speed

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current);
    };
  }, [selectedFile, fileData]);

  const selectLogFile = (filename: string) => {
    sysAudio.playSwitch();
    setSelectedFile(filename);
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
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">PERSONAL REFLECTIONS</span>
          <h3 className="text-xl font-bold tracking-tight text-white mt-1 font-mono">Philosophy & Principles</h3>
        </div>
        {selectedFile && (
          <button
            onClick={closeLogFile}
            className="px-3 py-1 text-[10px] uppercase tracking-widest border border-white/10 hover:border-attention-500 hover:text-attention-400 rounded transition-all font-semibold"
          >
            Close Journal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 min-h-[300px]">
        {/* Left Side: Journal Entries Selector */}
        <div className="md:col-span-2 flex flex-col gap-2 font-mono text-[10px] sm:text-xs">
          <span className="text-slate-500 uppercase tracking-widest font-bold pb-2">Journal Entries:</span>
          {Object.keys(BELIEF_ARCHIVES).map((filename, idx) => {
            const isSelected = selectedFile === filename;
            return (
              <div
                key={filename}
                onClick={() => selectLogFile(filename)}
                className={`cursor-pointer px-3 py-2.5 rounded border transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-white/5 border-white/20 text-white"
                    : "border-white/5 text-slate-400 hover:bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <span className="text-slate-600">entry_0{idx + 1}</span>
                <span className="truncate" style={isSelected ? { color: theme.accent } : undefined}>
                  {BELIEF_ARCHIVES[filename].title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Log Reader screen */}
        <div className="md:col-span-3 h-72 md:h-auto bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-350 overflow-y-auto relative select-none">
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key={selectedFile}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap leading-relaxed pb-6 h-full font-mono text-[10px] select-text selection:bg-attention-500/20"
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
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 text-slate-500 space-y-2"
              >
                <div className="text-xl">📓</div>
                <div className="text-[10px] uppercase tracking-widest font-bold">Journal Closed</div>
                <div className="text-[9px] max-w-[200px]">Select a journal entry to read Saumya&apos;s personal philosophy and stories.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
