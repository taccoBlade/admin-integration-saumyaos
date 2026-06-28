"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Camera } from "lucide-react";

export function PersonalBuilds() {
  const builds = [
    {
      icon: <Activity className="w-5 h-5 text-attention-400" />,
      title: "Endurance Running",
      subtitle: "PHYSICAL RESILIENCE // Ahmedabad Loops",
      description: "Maintaining a daily discipline of road running, logging endurance targets, and clearing the mind under Ahmedabad's high-temperature constraints.",
      tech: ["Endurance", "Cardio Pacing", "Ahmedabad Heat"],
      id: "endurance-running"
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-attention-400" />,
      title: "Swing Trading & Markets",
      subtitle: "QUANTITATIVE FINANCE // RISK MANAGEMENT",
      description: "Developing structured risk control systems and tracking market velocity indicators. A data-driven approach to capital allocation outside of structural design.",
      tech: ["Risk Control", "Swing Trading", "Technical Analysis"],
      id: "swing-trading"
    },
    {
      icon: <Camera className="w-5 h-5 text-attention-400" />,
      title: "Cinematography & Photography",
      subtitle: "NARRATIVE PACING // VISUAL JOURNEYS",
      description: "Documenting highway routes on the Royal Enfield Super Meteor 650. Framing landscape geometry, capturing light gradients, and editing story pacing.",
      tech: ["Aperture Control", "Story Pacing", "Premiere Pro"],
      id: "cinematography"
    }
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <span className="text-[10px] uppercase font-mono tracking-widest text-attention-400 font-bold">
          02 — LIFE OUTSIDE ENGINEERING
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mt-2 font-mono">
          Life Outside Engineering
        </h2>
        <p className="mt-2 text-sm text-slate-400">Daily disciplines, creative exploration, and personal resilience</p>
      </motion.div>

      {/* Builds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {builds.map((build, idx) => (
          <BuildCard key={build.id} build={build} idx={idx} />
        ))}
      </div>
    </section>
  );
}

interface BuildItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  id: string;
}

function BuildCard({ build, idx }: { build: BuildItem; idx: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.15 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-neutral-950/40 border border-white/5 backdrop-blur-md hover:border-attention-500/35 transition-all overflow-hidden h-[360px] md:h-[400px]"
    >
      {/* Blueprint grid effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(rgba(212, 175, 55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212, 175, 55,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="relative z-10 space-y-4 w-full flex-grow flex flex-col">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-attention-500/20 group-hover:bg-attention-500/5 transition-all">
            {build.icon}
          </div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            {isHovered ? "DETAILS ACTIVE" : "Personal Pursuit"}
          </span>
        </div>

        <div>
          <span className="text-[8px] uppercase font-mono tracking-widest text-slate-500 font-semibold block">
            {build.subtitle}
          </span>
          <h4 className="text-lg font-bold text-white mt-1 group-hover:text-attention-400 transition-colors font-mono">
            {build.title}
          </h4>
        </div>

        {/* Dynamic Display Area */}
        <div className="relative flex-grow mt-3 overflow-hidden">
          {/* Default state: Description */}
          <div className={`transition-all duration-300 ${isHovered ? "opacity-0 pointer-events-none translate-y-2 absolute inset-0" : "opacity-100 translate-y-0"}`}>
            <p className="text-slate-400 text-xs leading-relaxed">
              {build.description}
            </p>
          </div>

          {/* Hover state: Simulation */}
          <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none -translate-y-2 absolute inset-0"}`}>
            {build.id === "cinematography" && <CinemaRenderer isHovered={isHovered} />}
            {build.id === "endurance-running" && <RunningSimulator isHovered={isHovered} />}
            {build.id === "swing-trading" && <MarketsSimulator isHovered={isHovered} />}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-white/5">
        {build.tech.map((t: string) => (
          <span key={t} className="text-[9px] font-mono text-slate-350 px-2 py-0.5 rounded bg-black/40 border border-white/5">
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── 1. CINEMA RENDERER SIMULATOR (Formerly Pro-Mix Concrete Compiler) ─── */
function CinemaRenderer({ isHovered }: { isHovered: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setLines([]);
      setVerified(false);
      return;
    }

    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    
    stepTimers.push(setTimeout(() => setLines(["RENDERING STORYBOARD CLIPS..."]), 100));
    stepTimers.push(setTimeout(() => setLines(["RENDERING STORYBOARD CLIPS...", "Applying color grading (Warm Chrome LUT)"]), 400));
    stepTimers.push(setTimeout(() => setLines(["RENDERING STORYBOARD CLIPS...", "Applying color grading (Warm Chrome LUT)", "█░░░░░░░░░░ 12%"]), 700));
    stepTimers.push(setTimeout(() => setLines(["RENDERING STORYBOARD CLIPS...", "Applying color grading (Warm Chrome LUT)", "███░░░░░░░░ 35%"]), 1000));
    stepTimers.push(setTimeout(() => setLines(["RENDERING STORYBOARD CLIPS...", "Stabilizing camera shake (Super Meteor mount)", "██████░░░░░ 68%"]), 1300));
    stepTimers.push(setTimeout(() => setLines(["RENDERING STORYBOARD CLIPS...", "Stabilizing camera shake (Super Meteor mount)", "██████████ 100%"]), 1600));

    const verifyTimer = setTimeout(() => {
      setVerified(true);
    }, 2000);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearTimeout(verifyTimer);
    };
  }, [isHovered]);

  return (
    <div className="font-mono text-[9px] text-attention-400 bg-black/60 border border-attention-500/20 rounded-2xl p-4 h-[125px] flex flex-col justify-between shadow-[inset_0_0_12px_rgba(212, 175, 55,0.05)]">
      <div className="space-y-1">
        {lines.map((line, lIdx) => (
          <div key={lIdx} className="leading-tight tracking-wide whitespace-pre">
            {line}
          </div>
        ))}
      </div>
      {verified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-attention-500/10 border border-attention-500/35 text-attention-400 py-1.5 rounded-lg text-[9px] font-bold tracking-widest animate-pulse"
        >
          RENDER STATUS: COMPLETE
        </motion.div>
      )}
    </div>
  );
}

/* ─── 2. RUNNING SIMULATOR (Formerly Soil Consolidation Curve) ─── */
function RunningSimulator({ isHovered }: { isHovered: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isHovered) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const duration = 1800;
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [isHovered]);

  const kmVal = (progress * 10.0).toFixed(1);
  const paceMinutes = 5;
  const paceSeconds = Math.floor(12 + progress * 8); // 5:12 to 5:20 min/km
  const heartRate = Math.floor(135 + progress * 25); // 135 to 160 bpm

  const dotX = 20 + 160 * progress;
  // An undulating running pace profile graph
  const dotY = 50 - 25 * Math.sin(progress * Math.PI * 2) - 10 * Math.cos(progress * Math.PI * 4);

  return (
    <div className="font-mono text-[9px] text-attention-400 bg-black/60 border border-attention-500/20 rounded-2xl p-3 h-[130px] flex flex-col justify-between">
      {/* Running profile plot */}
      <div className="relative flex-grow h-[65px] border-b border-l border-attention-500/15">
        <span className="absolute left-1.5 top-0.5 text-slate-500 text-[6.5px] rotate-90 origin-top-left">PACE</span>
        <span className="absolute right-1 bottom-1 text-slate-500 text-[6.5px]">DIST</span>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 90">
          {/* Grid lines */}
          <line x1="20" y1="30" x2="190" y2="30" stroke="rgba(212, 175, 55, 0.05)" strokeDasharray="2 2" />
          <line x1="20" y1="60" x2="190" y2="60" stroke="rgba(212, 175, 55, 0.05)" strokeDasharray="2 2" />
          <line x1="75" y1="10" x2="75" y2="85" stroke="rgba(212, 175, 55, 0.05)" strokeDasharray="2 2" />
          <line x1="130" y1="10" x2="130" y2="85" stroke="rgba(212, 175, 55, 0.05)" strokeDasharray="2 2" />

          {/* Running pace curve */}
          <motion.path
            d="M 20,50 Q 60,10 100,50 T 180,50"
            fill="none"
            stroke="rgb(6, 182, 212)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 0.1 }}
          />

          {/* Dot tracker */}
          {progress > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r="2.5"
              className="fill-attention-400 stroke-attention-500/40 stroke-[3px] animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Stats readout */}
      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5 text-center text-slate-400">
        <div>
          <span className="text-[7px] text-slate-500 uppercase block">DISTANCE</span>
          <span className="font-bold text-white text-[9px]">{kmVal} km</span>
        </div>
        <div>
          <span className="text-[7px] text-slate-500 uppercase block">PACE</span>
          <span className="font-bold text-white text-[9px]">{paceMinutes}:{paceSeconds}</span>
        </div>
        <div>
          <span className="text-[7px] text-slate-500 uppercase block">HEART RATE</span>
          <span className="font-bold text-white text-[9px]">{heartRate} bpm</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. MARKETS SIMULATOR (Formerly Strain Oscilloscope) ─── */
function MarketsSimulator({ isHovered }: { isHovered: boolean }) {
  const [points, setPoints] = useState<number[]>([]);
  const [price, setPrice] = useState(5242.50);

  useEffect(() => {
    const initialPoints = Array(26).fill(35);
    setPoints(initialPoints);

    if (!isHovered) {
      setPrice(5242.50);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      setPoints((prev) => {
        const next = [...prev.slice(1)];
        const base = 35 + Math.sin(count / 2.5) * 15 + Math.cos(count / 4.0) * 10;
        const noise = (Math.random() - 0.5) * 4;
        next.push(base + noise);
        return next;
      });

      setPrice(5242.50 + Math.sin(count / 2.5) * 115 + (Math.random() - 0.5) * 12);
      count++;
    }, 80);

    return () => clearInterval(interval);
  }, [isHovered]);

  const svgPath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${10 + i * (180 / (points.length - 1))}, ${p}`).join(" ")
    : "M 10 35 L 190 35";

  return (
    <div className="font-mono text-[9px] text-attention-400 bg-black/60 border border-attention-500/20 rounded-2xl p-3 h-[130px] flex flex-col justify-between">
      {/* Ticker header */}
      <div className="flex justify-between items-center pb-1 border-b border-white/5 text-slate-500 text-[7px]">
        <span>INDEX // US500</span>
        <span className="text-attention-400 font-bold tracking-widest animate-pulse">● LIVE CHART</span>
      </div>

      {/* Chart Canvas */}
      <div className="relative flex-grow h-[55px] my-1 border border-attention-500/10 bg-neutral-950/20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212, 175, 55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212, 175, 55,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 70">
          <path
            d={svgPath}
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Numerical readouts */}
      <div className="flex justify-between items-center text-slate-400 text-[8px] pt-1 border-t border-white/5">
        <div>
          <span className="text-slate-500">TICKER: </span>
          <span className="text-white font-bold text-[9.5px]">${price.toFixed(2)}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">RISK: </span>
          <span className="text-attention-400 font-bold">1.0% MAX</span>
        </div>
      </div>
    </div>
  );
}
