"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, HardHat, Terminal } from "lucide-react";

export function PersonalBuilds() {
  const builds = [
    {
      icon: <HardHat className="w-5 h-5 text-cyan-400" />,
      title: "Pro-Mix Compliance Engine",
      subtitle: "CONCRETE TECHNOLOGY // COMPILER",
      description: "An industrial concrete design compliance engine. Statically compiles and validates Indian Standard (IS:10262) target strength parameters, adjusting binder packing density curves under compression constraints.",
      tech: ["Next.js", "Python", "Concrete Physics"],
      id: "pro-mix"
    },
    {
      icon: <Terminal className="w-5 h-5 text-cyan-400" />,
      title: "Soil Consolidation Pipeline",
      subtitle: "GEOTECHNICAL // AUTOMATION",
      description: "A Python-based data ingestion and analysis pipeline for borehole settlement logs. Automates index property calculations to predict clay layer consolidation rates and ultimate primary settlement.",
      tech: ["Python", "Pandas", "Matplotlib"],
      id: "soil-consolidation"
    },
    {
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      title: "Real-time Strain Telemetry Network",
      subtitle: "INFRASTRUCTURE // HARDWARE INTEGRATION",
      description: "ESP32-based hardware strain sensor integration. Transmits real-time material strain data over low-power telemetry protocols, rendering dynamic stress deflection charts on a centralized monitor dashboard.",
      tech: ["ESP32", "C++", "WebSockets"],
      id: "strain-telemetry"
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
        <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
          03 — ENGINEERING PORTFOLIO
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mt-2 font-mono">
          What I Build
        </h2>
        <p className="mt-2 text-sm text-slate-400">Custom systems, algorithms, and structural integrations</p>
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
      className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-neutral-950/40 border border-white/5 backdrop-blur-md hover:border-cyan-500/35 transition-all overflow-hidden h-[360px] md:h-[400px]"
    >
      {/* Blueprint grid effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="relative z-10 space-y-4 w-full flex-grow flex flex-col">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-cyan-500/20 group-hover:bg-cyan-500/5 transition-all">
            {build.icon}
          </div>
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            {isHovered ? "SIMULATOR ACTIVE" : "Active Build"}
          </span>
        </div>

        <div>
          <span className="text-[8px] uppercase font-mono tracking-widest text-slate-500 font-semibold block">
            {build.subtitle}
          </span>
          <h4 className="text-lg font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors font-mono">
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
            {build.id === "pro-mix" && <ProMixSimulator isHovered={isHovered} />}
            {build.id === "soil-consolidation" && <SoilSimulator isHovered={isHovered} />}
            {build.id === "strain-telemetry" && <StrainSimulator isHovered={isHovered} />}
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

/* ─── 1. PRO-MIX SIMULATOR ─── */
function ProMixSimulator({ isHovered }: { isHovered: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setLines([]);
      setVerified(false);
      return;
    }

    // Explicit timer steps to simulate the output exactly as requested
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    
    // Step 0: COMPILING...
    stepTimers.push(setTimeout(() => setLines(["COMPILING..."]), 100));
    
    // Step 1: Checking IS 10262
    stepTimers.push(setTimeout(() => setLines(["COMPILING...", "Checking IS 10262"]), 400));
    
    // Step 2: 12% progress bar
    stepTimers.push(setTimeout(() => setLines(["COMPILING...", "Checking IS 10262", "█░░░░░░░░░░ 12%"]), 700));

    // Step 3: 35% progress bar
    stepTimers.push(setTimeout(() => setLines(["COMPILING...", "Checking IS 10262", "███░░░░░░░░ 35%"]), 1000));

    // Step 4: 68% progress bar
    stepTimers.push(setTimeout(() => setLines(["COMPILING...", "Checking IS 10262", "██████░░░░░ 68%"]), 1300));

    // Step 5: 100% progress bar
    stepTimers.push(setTimeout(() => setLines(["COMPILING...", "Checking IS 10262", "██████████ 100%"]), 1600));

    // Step 6: Verified reveal
    const verifyTimer = setTimeout(() => {
      setVerified(true);
    }, 2000);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearTimeout(verifyTimer);
    };
  }, [isHovered]);

  return (
    <div className="font-mono text-[10px] text-cyan-400 bg-black/60 border border-cyan-500/20 rounded-2xl p-4 h-[125px] flex flex-col justify-between shadow-[inset_0_0_12px_rgba(6,182,212,0.05)]">
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
          className="text-center bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 py-1.5 rounded-lg text-[9px] font-bold tracking-widest animate-pulse"
        >
          STATUS: VERIFIED
        </motion.div>
      )}
    </div>
  );
}

/* ─── 2. SOIL PIPELINE SIMULATOR ─── */
function SoilSimulator({ isHovered }: { isHovered: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isHovered) {
      setProgress(0);
      return;
    }

    const start = Date.now();
    const duration = 1800; // 1.8s duration
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [isHovered]);

  const tVal = (progress * 180).toFixed(1);
  const sVal = (progress * 24.8).toFixed(1);
  const uVal = (progress * 94.2).toFixed(1);

  // Math curve coordinates matching SVG curve
  // x goes from 20 to 180 (span of 160)
  // y goes from 15 to 80 (rise of 65)
  const dotX = 20 + 160 * progress;
  const dotY = 15 + 65 * Math.sin(progress * Math.PI / 2);

  return (
    <div className="font-mono text-[9px] text-cyan-400 bg-black/60 border border-cyan-500/20 rounded-2xl p-3 h-[130px] flex flex-col justify-between">
      {/* Mini Plot */}
      <div className="relative flex-grow h-[65px] border-b border-l border-cyan-500/15">
        {/* Y Axis Label */}
        <span className="absolute left-1.5 top-0.5 text-slate-500 text-[7px] rotate-90 origin-top-left">S (mm)</span>
        {/* X Axis Label */}
        <span className="absolute right-1 bottom-1 text-slate-500 text-[7px]">t (days)</span>

        {/* SVG Drawing Curve */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 90">
          {/* Grid lines */}
          <line x1="20" y1="35" x2="190" y2="35" stroke="rgba(34, 211, 238, 0.05)" strokeDasharray="2 2" />
          <line x1="20" y1="60" x2="190" y2="60" stroke="rgba(34, 211, 238, 0.05)" strokeDasharray="2 2" />
          <line x1="75" y1="10" x2="75" y2="85" stroke="rgba(34, 211, 238, 0.05)" strokeDasharray="2 2" />
          <line x1="130" y1="10" x2="130" y2="85" stroke="rgba(34, 211, 238, 0.05)" strokeDasharray="2 2" />

          {/* Consolidation curve */}
          <motion.path
            d="M 20,15 C 70,15 110,80 180,80"
            fill="none"
            stroke="rgb(6, 182, 212)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress }}
            transition={{ duration: 0.1 }}
          />

          {/* Flashing tracker point */}
          {progress > 0 && (
            <circle
              cx={dotX}
              cy={dotY}
              r="2.5"
              className="fill-cyan-400 stroke-cyan-500/40 stroke-[3px] animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Telemetry data fields */}
      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5 text-center text-slate-400">
        <div>
          <span className="text-[7px] text-slate-500 uppercase block">TIME</span>
          <span className="font-bold text-white text-[9px]">{tVal}d</span>
        </div>
        <div>
          <span className="text-[7px] text-slate-500 uppercase block">SETTLE</span>
          <span className="font-bold text-white text-[9px]">{sVal}mm</span>
        </div>
        <div>
          <span className="text-[7px] text-slate-500 uppercase block">DEG (U)</span>
          <span className="font-bold text-white text-[9px]">{uVal}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── 3. STRAIN TELEMETRY SIMULATOR ─── */
function StrainSimulator({ isHovered }: { isHovered: boolean }) {
  const [points, setPoints] = useState<number[]>([]);
  const [liveStrain, setLiveStrain] = useState(242.0);

  useEffect(() => {
    // Generate initial flat points
    const initialPoints = Array(26).fill(35);
    setPoints(initialPoints);

    if (!isHovered) {
      setLiveStrain(242.0);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      setPoints((prev) => {
        const next = [...prev.slice(1)];
        // Create an oscillating baseline (representing loaded cycles) + random micro-noise
        const base = 35 + Math.sin(count / 3.5) * 18;
        const noise = (Math.random() - 0.5) * 5;
        next.push(base + noise);
        return next;
      });

      // Fluctuate real-time strain label (around 240.0 με)
      setLiveStrain(240.0 + Math.sin(count / 3.5) * 22 + (Math.random() - 0.5) * 6);

      count++;
    }, 60);

    return () => clearInterval(interval);
  }, [isHovered]);

  // Construct SVG drawing path string from the points history
  const svgPath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${10 + i * (180 / (points.length - 1))}, ${p}`).join(" ")
    : "M 10 35 L 190 35";

  return (
    <div className="font-mono text-[9px] text-cyan-400 bg-black/60 border border-cyan-500/20 rounded-2xl p-3 h-[130px] flex flex-col justify-between">
      {/* Telemetry metadata header */}
      <div className="flex justify-between items-center pb-1 border-b border-white/5 text-slate-500 text-[7px]">
        <span>CH_04 // STRAIN</span>
        <span className="text-cyan-400 font-bold tracking-widest animate-pulse">● LIVE STREAM</span>
      </div>

      {/* Grid Canvas */}
      <div className="relative flex-grow h-[55px] my-1 border border-cyan-500/10 bg-neutral-950/20 overflow-hidden">
        {/* Oscilloscope Grid Layout overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

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
          <span className="text-slate-500">VALUE: </span>
          <span className="text-white font-bold text-[9.5px]">{liveStrain.toFixed(2)} με</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">SAMPLING: </span>
          <span className="text-white font-bold">100 Hz</span>
        </div>
      </div>
    </div>
  );
}
