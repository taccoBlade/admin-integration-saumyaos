"use client";

import { useState, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, ShieldAlert, Cpu, Landmark, Film } from "lucide-react";

interface RoutineItem {
  time: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const routineData: RoutineItem[] = [
  {
    time: "06:00 AM",
    title: "Field Exploration & Run",
    icon: Sun,
    color: "text-attention-500 bg-attention-500/10 border-attention-500/20",
    description: "Starting the day auditing excavations or going for an outdoor run to track pace metrics."
  },
  {
    time: "09:00 AM",
    title: "Geotechnical Labs & University",
    icon: ShieldAlert,
    color: "text-attention-500 bg-attention-500/10 border-attention-500/20",
    description: "Deep diving into soil mechanics lectures, concrete compressive testing labs, and structural design tutorials."
  },
  {
    time: "02:00 PM",
    title: "System Coding & RAG pipelines",
    icon: Cpu,
    color: "text-attention-500 bg-attention-500/10 border-attention-500/20",
    description: "Developing code solutions, testing ZIP ingestion scripts, and building intelligent personal OS platforms."
  },
  {
    time: "05:00 PM",
    title: "Market Review & Portfolio Allocation",
    icon: Landmark,
    color: "text-attention-500 bg-attention-500/10 border-attention-500/20",
    description: "Auditing closing market numbers, tracking equities, checking risk allocations, and drafting investment reports."
  },
  {
    time: "08:00 PM",
    title: "Creative Video Clipping & Curation",
    icon: Film,
    color: "text-attention-600 bg-attention-600/10 border-attention-600/20",
    description: "Refining video edits, applying audio overlays, and documenting engineering logbooks in markdown."
  }
];

export function RoutineTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeRoutine = routineData[activeIndex];

  return (
    <section id="timeline" className="relative w-full max-w-7xl mx-auto px-5 py-20 sm:px-8 lg:px-12">
      <div className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-attention-400 mb-3">Routines</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-[var(--foreground)] tracking-tight">Daily Trajectory</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
        {/* Left Side: Time Selectors */}
        <div className="flex flex-col gap-3">
          {routineData.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;

            return (
              <button
                key={item.time}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center justify-between p-4.5 rounded-2xl border text-left transition-all ${
                  isActive
                    ? "bg-[var(--card-bg)] border-attention-400 shadow-md translate-x-2"
                    : "bg-transparent border-[var(--card-border)] hover:bg-[var(--card-bg)]/40 hover:border-slate-500/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-mono text-[var(--muted)]">{item.time}</span>
                    <span className={`text-sm font-medium ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                      {item.title}
                    </span>
                  </div>
                </div>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div 
                    layoutId="activeDot"
                    className="w-2 h-2 rounded-full bg-attention-400 mr-2"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Routine Slide Detail */}
        <div className="bento-card p-8 sm:p-12 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Grid overlay background */}
          <div className="absolute inset-0 bento-bg-grid opacity-[0.4] pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
              exit={{ opacity: 0, x: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
              className="relative z-10 flex flex-col justify-between h-full min-h-[200px]"
            >
              <div>
                <span className="text-sm font-mono font-semibold uppercase tracking-widest text-attention-400 block mb-3">
                  Schedule // {activeRoutine.time}
                </span>
                <h4 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-4">
                  {activeRoutine.title}
                </h4>
                <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-xl">
                  {activeRoutine.description}
                </p>
              </div>

              {/* Progress meter bar */}
              <div className="mt-8">
                <div className="flex justify-between items-center text-xs text-[var(--muted)] font-mono mb-2">
                  <span>Day Completion Progress</span>
                  <span>{((activeIndex + 1) / routineData.length) * 100}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--card-border)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-attention-400 to-attention-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeIndex + 1) / routineData.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
