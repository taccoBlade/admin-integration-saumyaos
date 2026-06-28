"use client";

import React, { useState, forwardRef } from "react";
import { motion } from "framer-motion";

/* ─── Shared animation variants ─── */
const revealUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
}

/* ─── Spotlight Card Component ─── */
const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ children, className = "", glowColor = "rgba(212, 175, 55, 0.08)", ...props }, ref) => {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative overflow-hidden transition-all duration-500 bg-neutral-950/20 hover:bg-neutral-900/30 ${className}`}
        {...props}
      >
        {/* Interactive Spotlight Glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-0"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`,
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between">
          {children}
        </div>
      </div>
    );
  }
);
SpotlightCard.displayName = "SpotlightCard";

const MotionSpotlightCard = motion(SpotlightCard);

export function HobbiesGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Beyond Engineering
        </h2>
        <p className="mt-2 text-sm text-slate-400">Things that keep me going</p>
      </motion.div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-neutral-800 lg:grid-cols-6 bg-neutral-950/40 backdrop-blur-sm">
        {/* ─── 1. Running & Fitness ─── */}
        <MotionSpotlightCard
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          glowColor="rgba(212, 175, 55, 0.08)"
          className="col-span-1 h-[350px] border-b border-neutral-800 p-6 sm:p-8 lg:col-span-4 lg:h-[calc(100vh-400px)] lg:max-h-[600px] lg:border-r"
        >
          {/* Internal structure */}
          <div>
            <span className="mb-2 inline-block rounded-full border border-attention-500/30 bg-attention-500/10 px-3 py-1 text-xs font-medium text-attention-400 tracking-wider">
              01 — FITNESS
            </span>
            <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl tracking-tight transition-colors duration-300 group-hover:text-attention-400">
              Running &amp; Fitness
            </h3>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300 sm:text-base">
              Running isn&apos;t just cardio — it&apos;s the daily discipline that sharpens everything else.
              I enjoy running and hitting the gym as a way to maintain discipline, build endurance, and keep a focused mind.
              The road doesn&apos;t care about your excuses, and consistency is the only way forward.
            </p>
          </div>

          {/* Detailed Smartwatch/Fitness Tracker Blueprint Overlay */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-35 group-hover:opacity-65 transition-opacity duration-500 pointer-events-none z-0">
            <svg viewBox="0 0 240 140" className="w-full h-auto max-w-[220px] text-attention-500/40 stroke-current fill-none transition-transform duration-550 group-hover:scale-105">
              {/* Straps */}
              <path d="M 95 10 L 95 30 M 145 10 L 145 30" strokeWidth="1" className="stroke-attention-500/30" />
              <path d="M 95 110 L 95 130 M 145 110 L 145 130" strokeWidth="1" className="stroke-attention-500/30" />
              
              <rect x="95" y="10" width="50" height="20" rx="2" strokeWidth="0.8" className="stroke-attention-500/25" />
              <rect x="95" y="110" width="50" height="20" rx="2" strokeWidth="0.8" className="stroke-attention-500/25" />
              {/* Strap adjustment pinholes */}
              <circle cx="120" cy="15" r="1.5" strokeWidth="0.5" className="stroke-attention-500/20" />
              <circle cx="120" cy="125" r="1.5" strokeWidth="0.5" className="stroke-attention-500/20" />

              {/* Watch Outer Bezel casing */}
              <circle cx="120" cy="70" r="42" strokeWidth="2.0" className="stroke-attention-400/65 group-hover:stroke-attention-400 transition-colors" />
              <circle cx="120" cy="70" r="45" strokeWidth="0.5" strokeDasharray="3 3" className="stroke-attention-500/20" />
              
              {/* Tick Marks on Bezel */}
              <line x1="120" y1="28" x2="120" y2="33" strokeWidth="1" />
              <line x1="120" y1="107" x2="120" y2="112" strokeWidth="1" />
              <line x1="78" y1="70" x2="83" y2="70" strokeWidth="1" />
              <line x1="157" y1="70" x2="162" y2="70" strokeWidth="1" />
              
              {/* Control Buttons */}
              <rect x="162" y="55" width="4" height="8" rx="1" className="fill-attention-500/10 stroke-attention-500/50" />
              <rect x="162" y="77" width="4" height="8" rx="1" className="fill-attention-500/10 stroke-attention-500/50" />

              {/* Dial Display Grid & UI Elements */}
              {/* Central ECG heartbeat wave */}
              <path d="M 85 75 L 105 75 L 110 65 L 115 88 L 120 70 L 125 75 L 130 75 L 135 60 L 140 82 L 145 75 L 155 75" strokeWidth="1.2" className="stroke-attention-500 group-hover:stroke-attention-400 group-hover:drop-shadow-[0_0_4px_rgba(212, 175, 55,0.4)] transition-all duration-500" />
              
              {/* Digital data printouts */}
              <text x="120" y="52" className="fill-attention-400 font-mono text-[7px] font-bold" textAnchor="middle">145 BPM</text>
              <text x="120" y="93" className="fill-slate-500 font-mono text-[5px] tracking-wide" textAnchor="middle">8.2 KM | 38:45</text>
              
              {/* Radial battery/progress ring inside display */}
              <path d="M 120 38 A 32 32 0 0 1 152 70" strokeWidth="1.5" className="stroke-attention-500/80" />
              <path d="M 120 38 A 32 32 0 1 0 88 70" strokeWidth="1.5" className="stroke-attention-500/10" strokeDasharray="1.5 1.5" />
              <circle cx="152" cy="70" r="1.5" className="fill-attention-400 stroke-none" />

              {/* Technical specs labelling */}
              <text x="20" y="73" className="fill-attention-500/30 font-mono text-[5.5px] rotate-90 origin-center">SMART_FIT_SYS_v2.0</text>
            </svg>
          </div>

          {/* Decorative graphic (since stats numbers are removed) */}
          <div className="w-full">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-attention-400 animate-ping" />
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest transition-colors duration-300 group-hover:text-attention-400/70">
                Discipline Over Motivation
              </span>
            </div>
            <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-attention-500/30 via-neutral-800 to-transparent transition-all duration-500 group-hover:from-attention-400/60" />
          </div>
        </MotionSpotlightCard>

        {/* ─── 2. Motorcycle Riding ─── */}
        <MotionSpotlightCard
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          glowColor="rgba(212, 175, 55, 0.08)"
          className="col-span-1 h-[350px] border-b border-neutral-800 p-6 sm:p-8 lg:col-span-2 lg:h-[calc(100vh-400px)] lg:max-h-[600px]"
        >
          <div>
            <span className="mb-2 inline-block rounded-full border border-attention-500/30 bg-attention-500/10 px-3 py-1 text-xs font-medium text-attention-400 tracking-wider">
              02 — RIDING
            </span>
            <h3 className="mt-3 text-2xl font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-attention-400">
              Motorcycle Riding
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
              Cruising on the open road. I have a deep appreciation for the mechanical connection, the steady rhythm of a parallel-twin, and the pure freedom of riding. There&apos;s nothing like taking a long ride to experience the environment first-hand.
            </p>
          </div>

          {/* Super Meteor 650 SVG Schematic Overlay */}
          <div className="flex justify-center opacity-65 group-hover:opacity-90 transition-opacity duration-500 mb-2">
            <svg viewBox="0 0 240 140" className="w-full h-auto max-w-[210px] text-attention-400/60 stroke-current fill-none transition-transform duration-500 group-hover:scale-105">
              {/* Wheels */}
              <circle cx="50" cy="90" r="22" className="stroke-attention-500/40 group-hover:stroke-attention-400 transition-colors duration-500" strokeWidth="1.5" />
              <circle cx="50" cy="90" r="25" className="stroke-attention-500/10" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="50" cy="90" r="3" className="fill-attention-500/40" />

              <circle cx="190" cy="92" r="20" className="stroke-attention-500/40 group-hover:stroke-attention-400 transition-colors duration-500" strokeWidth="1.5" />
              <circle cx="190" cy="92" r="23" className="stroke-attention-500/10" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="190" cy="92" r="3" className="fill-attention-500/40" />

              {/* Front Fork & Suspension */}
              <line x1="50" y1="90" x2="90" y2="30" className="stroke-attention-400/40 group-hover:stroke-attention-300 transition-colors duration-500" strokeWidth="1.5" />
              <line x1="48" y1="88" x2="88" y2="28" className="stroke-attention-400/10" strokeWidth="0.5" />
              
              {/* Headlight */}
              <path d="M 85 37 L 95 42" className="stroke-attention-500/40" strokeWidth="1" />
              <circle cx="97" cy="43" r="4" className="stroke-attention-400/50 fill-attention-400/10 group-hover:fill-attention-400/20 transition-all duration-500" />

              {/* Handlebars */}
              <path d="M 90 30 Q 82 25 76 26" className="stroke-attention-400/60" strokeWidth="1.5" />
              <path d="M 90 30 Q 94 28 98 32" className="stroke-attention-400/40" strokeWidth="1.5" />

              {/* Main Frame & Engine Area */}
              {/* Teardrop Tank */}
              <path d="M 90 30 Q 120 20 145 48" className="stroke-attention-400/60 group-hover:stroke-attention-300 transition-colors duration-550" strokeWidth="1.5" />
              {/* Engine Block */}
              <rect x="100" y="60" width="38" height="32" rx="4" className="stroke-attention-400/40 fill-attention-950/20 group-hover:stroke-attention-400/70 transition-colors duration-500" strokeWidth="1" />
              {/* Cooling fins */}
              <line x1="103" y1="66" x2="135" y2="66" className="stroke-attention-400/20" />
              <line x1="103" y1="71" x2="135" y2="71" className="stroke-attention-400/20" />
              <line x1="103" y1="76" x2="135" y2="76" className="stroke-attention-400/20" />
              <line x1="103" y1="81" x2="135" y2="81" className="stroke-attention-400/20" />
              <line x1="103" y1="86" x2="135" y2="86" className="stroke-attention-400/20" />
              
              {/* Cylinder head details */}
              <circle cx="112" cy="56" r="4" className="stroke-attention-400/40" />
              <circle cx="128" cy="56" r="4" className="stroke-attention-400/40" />

              {/* Exhaust Pipe */}
              <path d="M 115 85 L 140 98 L 195 98" className="stroke-attention-500/50 group-hover:stroke-attention-400 group-hover:drop-shadow-[0_0_4px_rgba(212, 175, 55,0.4)] transition-all duration-550" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 125 85 L 142 101 L 195 101" className="stroke-attention-500/20" strokeWidth="1.5" strokeLinecap="round" />

              {/* Seat (Cruiser Low Seat) */}
              <path d="M 145 48 Q 155 63 172 62 Q 178 62 181 54" className="stroke-attention-400/60" strokeWidth="1.5" />

              {/* Swingarm / Rear Fork */}
              <line x1="120" y1="85" x2="190" y2="92" className="stroke-attention-400/30" strokeWidth="2" />

              {/* Rear Fender */}
              <path d="M 172 62 Q 185 62 195 75 Q 202 85 204 92" className="stroke-attention-400/40" strokeWidth="1.5" />

              {/* Technical labels / Blueprint lines */}
              <line x1="20" y1="120" x2="220" y2="120" className="stroke-white/10" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="20" y1="117" x2="20" y2="123" className="stroke-white/30" strokeWidth="0.5" />
              <line x1="220" y1="117" x2="220" y2="123" className="stroke-white/30" strokeWidth="0.5" />
              <text x="120" y="130" className="fill-slate-500 font-mono text-[7px] tracking-wide" textAnchor="middle">SUPER METEOR 650 SCHEMATIC</text>
            </svg>
          </div>
        </MotionSpotlightCard>

        {/* ─── 3. Video & Storytelling ─── */}
        <MotionSpotlightCard
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          glowColor="rgba(212, 175, 55, 0.08)"
          className="col-span-1 h-[350px] border-b border-neutral-800 p-6 sm:p-8 lg:col-span-3 lg:h-[calc(100vh-400px)] lg:max-h-[600px] lg:border-b-0 lg:border-r"
        >
          <div>
            <span className="mb-2 inline-block rounded-full border border-attention-500/30 bg-attention-500/10 px-3 py-1 text-xs font-medium text-attention-400 tracking-wider">
              03 — VISUAL
            </span>
            <h3 className="mt-3 text-2xl font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-attention-400">
              Video &amp; Storytelling
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
              Stitching narratives together. I love the creative flow of video editing — pacing, timing transitions, sound design, and crafting engaging stories from raw footage.
            </p>
          </div>

          {/* Detailed Cinematic Camera/Lens Blueprint Overlay */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none z-0">
            <svg viewBox="0 0 240 140" className="w-full h-auto max-w-[210px] text-attention-500/40 stroke-current fill-none transition-transform duration-550 group-hover:scale-105">
              {/* Camera Body Frame */}
              <rect x="50" y="30" width="140" height="80" rx="8" strokeWidth="1.2" className="stroke-attention-500/40 group-hover:stroke-attention-400 transition-colors" />
              <rect x="65" y="18" width="45" height="12" rx="2" strokeWidth="0.8" className="stroke-attention-500/30" /> {/* Pentaprism top hump */}
              <circle cx="160" cy="22" r="4" strokeWidth="0.8" className="stroke-attention-500/30" /> {/* Mode Dial */}
              <rect x="75" y="23" width="25" height="4" className="fill-attention-500/10 stroke-attention-500/30" /> {/* Hot shoe */}

              {/* Large Camera Lens Assembly (Concentric Rings) */}
              <circle cx="120" cy="70" r="32" strokeWidth="1.8" className="stroke-attention-500/70 group-hover:stroke-attention-400 transition-colors" />
              <circle cx="120" cy="70" r="28" strokeWidth="0.8" strokeDasharray="3 2" className="stroke-attention-500/30" />
              <circle cx="120" cy="70" r="24" strokeWidth="0.8" className="stroke-attention-500/20" />
              <circle cx="120" cy="70" r="16" strokeWidth="1.2" className="stroke-attention-400 fill-attention-950/20" />
              <circle cx="120" cy="70" r="8" strokeWidth="0.8" className="stroke-attention-500/30" />
              
              {/* Lens Reflection Specular highlight arc */}
              <path d="M 108 58 A 16 16 0 0 1 132 58" strokeWidth="1.2" strokeLinecap="round" className="stroke-white/30" />

              {/* Grip lines on right side */}
              <line x1="60" y1="42" x2="60" y2="98" strokeWidth="0.8" strokeDasharray="2 2" className="stroke-attention-500/25" />
              <line x1="64" y1="42" x2="64" y2="98" strokeWidth="0.8" strokeDasharray="2 2" className="stroke-attention-500/25" />

              {/* Viewfinder display screen lines at back (dashed outline) */}
              <rect x="62" y="42" width="116" height="56" rx="2" strokeWidth="0.5" strokeDasharray="1.5 1.5" className="stroke-attention-500/10" />

              {/* Technical labels / Blueprint lines */}
              <text x="120" y="122" className="fill-slate-500 font-mono text-[7px] tracking-wide" textAnchor="middle">DSLR_CAM_LENS_SYS_50MM</text>
              <text x="120" y="132" className="fill-attention-500/40 font-mono text-[5.5px]" textAnchor="middle">REF: OPTICAL_AXIS_L_01</text>
            </svg>
          </div>

          {/* YouTube play button overlay */}
          <div className="flex items-center justify-end pr-2 mb-2 z-20">
            <a
              href="https://youtu.be/dQw4w9WgXcQ?si=9QUa5-cPZB3Vj-ao"
              target="_blank"
              rel="noreferrer"
              className="relative flex items-center justify-center cursor-pointer group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-attention-600/90 shadow-lg shadow-attention-600/20 transition-all duration-550 group-hover:scale-115 group-hover:bg-attention-500 group-hover:shadow-attention-500/40 sm:h-20 sm:w-20">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="ml-1 h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-500 group-hover:scale-110"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              {/* Pulsing rings */}
              <div className="absolute h-24 w-24 animate-ping rounded-full border border-attention-500/20 sm:h-28 sm:w-28 group-hover:border-attention-500/40 duration-1000" />
            </a>
          </div>
        </MotionSpotlightCard>

        {/* ─── 4. Learning & AI ─── */}
        <MotionSpotlightCard
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          glowColor="rgba(212, 175, 55, 0.08)"
          className="col-span-1 h-[350px] p-6 sm:p-8 lg:col-span-3 lg:h-[calc(100vh-400px)] lg:max-h-[600px]"
        >
          <div>
            <span className="mb-2 inline-block rounded-full border border-attention-500/30 bg-attention-500/10 px-3 py-1 text-xs font-medium text-attention-400 tracking-wider">
              04 — CURIOSITY
            </span>
            <h3 className="mt-3 text-2xl font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-attention-500">
              Learning &amp; AI
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
              Curiosity-driven building. I love diving into new fields, exploring artificial intelligence, and experimenting with LLMs to build smart workflows and automations. Always learning, always iterating.
            </p>
          </div>

          {/* Detailed Microprocessor/AI Chip Schematic Overlay */}
          <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none z-0">
            <svg viewBox="0 0 240 140" className="w-full h-auto max-w-[210px] text-attention-500/40 stroke-current fill-none transition-transform duration-550 group-hover:scale-105">
              {/* Outer package substrate */}
              <rect x="60" y="15" width="120" height="110" rx="4" strokeWidth="1.5" className="stroke-attention-500/50 group-hover:stroke-attention-400 transition-colors" />
              <rect x="56" y="11" width="128" height="118" rx="6" strokeWidth="0.5" strokeDasharray="3 3" className="stroke-attention-500/10" />

              {/* Silicon Die (Central Core) */}
              <rect x="85" y="40" width="70" height="60" rx="2" strokeWidth="1.2" className="stroke-attention-400 fill-attention-950/15" />
              
              {/* Silicon Die Sections (Cores, Cache, Memory controller) */}
              <line x1="120" y1="40" x2="120" y2="100" strokeWidth="0.6" className="stroke-attention-500/30" />
              <line x1="85" y1="70" x2="155" y2="70" strokeWidth="0.6" className="stroke-attention-500/30" />
              <rect x="90" y="45" width="25" height="20" rx="1" strokeWidth="0.5" className="stroke-attention-500/20 fill-attention-500/5" />
              <rect x="125" y="45" width="25" height="20" rx="1" strokeWidth="0.5" className="stroke-attention-500/20 fill-attention-500/5" />
              <rect x="90" y="75" width="25" height="20" rx="1" strokeWidth="0.5" className="stroke-attention-500/20 fill-attention-500/5" />
              <rect x="125" y="75" width="25" height="20" rx="1" strokeWidth="0.5" className="stroke-attention-500/20 fill-attention-500/5" />

              {/* Connection Pins (Traces leading away from package edge) */}
              {/* Left pins */}
              <line x1="60" y1="30" x2="45" y2="30" strokeWidth="0.8" />
              <line x1="60" y1="45" x2="45" y2="45" strokeWidth="0.8" />
              <line x1="60" y1="60" x2="45" y2="60" strokeWidth="0.8" />
              <line x1="60" y1="75" x2="45" y2="75" strokeWidth="0.8" />
              <line x1="60" y1="90" x2="45" y2="90" strokeWidth="0.8" />
              <line x1="60" y1="105" x2="45" y2="105" strokeWidth="0.8" />
              
              {/* Right pins */}
              <line x1="180" y1="30" x2="195" y2="30" strokeWidth="0.8" />
              <line x1="180" y1="45" x2="195" y2="45" strokeWidth="0.8" />
              <line x1="180" y1="60" x2="195" y2="60" strokeWidth="0.8" />
              <line x1="180" y1="75" x2="195" y2="75" strokeWidth="0.8" />
              <line x1="180" y1="90" x2="195" y2="90" strokeWidth="0.8" />
              <line x1="180" y1="105" x2="195" y2="105" strokeWidth="0.8" />

              {/* Data bus lines flowing around die */}
              <path d="M 68 25 L 85 45 L 85 95 L 68 115" strokeWidth="0.6" className="stroke-attention-500/20" />
              <path d="M 172 25 L 155 45 L 155 95 L 172 115" strokeWidth="0.6" className="stroke-attention-500/20" />

              {/* Technical annotations */}
              <text x="120" y="32" className="fill-slate-500 font-mono text-[6px] tracking-widest text-center" textAnchor="middle">AI_NEURAL_ACCELERATOR</text>
              <text x="120" y="109" className="fill-attention-500/40 font-mono text-[5px]" textAnchor="middle">CORES: 128_NPU | PROCESS: 3nm</text>
            </svg>
          </div>

          {/* Technology badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { label: "Generative AI", icon: "🤖" },
              { label: "Automation", icon: "⚙️" },
              { label: "Prompt Eng.", icon: "⚡" },
              { label: "LLMs", icon: "🧠" },
              { label: "Emerging Tech", icon: "🚀" },
            ].map((t, idx) => (
              <span
                key={t.label}
                className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all duration-300 group-hover:border-attention-500/40 group-hover:bg-neutral-800 hover:text-white"
                style={{
                  transitionDelay: `${idx * 40}ms`
                }}
              >
                <span className="text-sm">{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>
        </MotionSpotlightCard>
      </div>
    </section>
  );
}
