"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Card Data ─── */
const CARDS = [
  {
    category: "Academic",
    title: "Engineering",
    description: "Civil engineering, geotechnical research, fiber-optic sensor design.",
    gradient: "from-cyan-900/80 to-slate-950",
    accent: "bg-cyan-600",
  },
  {
    category: "Finance",
    title: "Markets & Investing",
    description: "Swing trading, data-driven market analysis, building wealth systems.",
    gradient: "from-emerald-900/80 to-slate-950",
    accent: "bg-emerald-600",
  },
  {
    category: "Creative",
    title: "Content Creation",
    description: "Editing video content, narrative pacing, sound design, and storytelling.",
    gradient: "from-rose-900/80 to-slate-950",
    accent: "bg-rose-600",
  },
  {
    category: "Physical",
    title: "Fitness",
    description: "Daily running discipline, strength training, and focus cycles.",
    gradient: "from-amber-900/80 to-slate-950",
    accent: "bg-amber-600",
  },
  {
    category: "Curiosity",
    title: "Learning & AI",
    description: "Exploring artificial intelligence, building automation, and learning emerging tech.",
    gradient: "from-violet-900/80 to-slate-950",
    accent: "bg-violet-600",
  },
];

/* ─── Card Background SVG Schematic Overlay ─── */
function CardBackground({ title }: { title: string }) {
  if (title === "Engineering") {
    return (
      <svg viewBox="0 0 384 640" className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-85 stroke-cyan-400 fill-none pointer-events-none transition-all duration-500">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.12)" />
          </pattern>
          <filter id="cyan-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        
        {/* Truss bridge outline with glow */}
        <g filter="url(#cyan-glow)">
          <path d="M 40 250 L 120 170 L 200 250 L 280 170 L 344 250" strokeWidth="2.5" />
          <path d="M 40 250 L 344 250 M 120 170 L 280 170" strokeWidth="1.5" />
          <line x1="120" y1="170" x2="120" y2="250" strokeWidth="1.5" />
          <line x1="200" y1="250" x2="200" y2="170" strokeWidth="1.5" />
          <line x1="280" y1="170" x2="280" y2="250" strokeWidth="1.5" />
        </g>

        {/* Height dimension line */}
        <line x1="100" y1="170" x2="100" y2="250" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="97" y1="170" x2="103" y2="170" strokeWidth="0.8" />
        <line x1="97" y1="250" x2="103" y2="250" strokeWidth="0.8" />
        <text x="92" y="215" className="fill-cyan-400/55 font-mono text-[7px]" textAnchor="end">H = 15.4m</text>

        {/* HUD elements */}
        <circle cx="120" cy="170" r="3.5" className="fill-cyan-400" />
        <circle cx="200" cy="170" r="3.5" className="fill-cyan-400" />
        <circle cx="280" cy="170" r="3.5" className="fill-cyan-400" />
        
        {/* Measurement labels */}
        <line x1="40" y1="270" x2="344" y2="270" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="40" y1="266" x2="40" y2="274" strokeWidth="0.8" />
        <line x1="344" y1="266" x2="344" y2="274" strokeWidth="0.8" />
        
        <text x="192" y="286" className="fill-cyan-400/70 font-mono text-[9px] tracking-widest" textAnchor="middle">SPAN: L = 304.2m</text>
        <text x="192" y="298" className="fill-slate-500 font-mono text-[7px] tracking-wider" textAnchor="middle">LOAD CAP: 4500 kN/m</text>
        
        {/* Top Right Radar Scanning Ring */}
        <circle cx="310" cy="90" r="30" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.15)" />
        <circle cx="310" cy="90" r="18" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.1)" strokeDasharray="2 2" />
        <line x1="310" y1="55" x2="310" y2="125" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.15)" />
        <line x1="275" y1="90" x2="345" y2="90" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.15)" />
        <line x1="310" y1="90" x2="331" y2="69" strokeWidth="1" strokeLinecap="round" />
        <circle cx="331" cy="69" r="1.5" className="fill-cyan-400" />
        <text x="310" y="132" className="fill-cyan-500/40 font-mono text-[5px]" textAnchor="middle">AZIMUTH_SEC_04</text>

        {/* Bottom Stress-Strain Plot */}
        <g className="opacity-60">
          <line x1="60" y1="510" x2="160" y2="510" strokeWidth="0.8" stroke="rgba(34, 211, 238, 0.3)" />
          <line x1="60" y1="450" x2="60" y2="510" strokeWidth="0.8" stroke="rgba(34, 211, 238, 0.3)" />
          <path d="M 60 510 Q 80 500 110 470 T 150 460" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="110" y1="470" x2="110" y2="510" strokeWidth="0.5" strokeDasharray="2 2" stroke="rgba(34, 211, 238, 0.2)" />
          <circle cx="110" cy="470" r="2" className="fill-cyan-400" />
          <text x="63" y="445" className="fill-slate-500 font-mono text-[5px]">STRESS (σ)</text>
          <text x="162" y="513" className="fill-slate-500 font-mono text-[5px]">STRAIN (ε)</text>
          <text x="110" y="465" className="fill-cyan-400/80 font-mono text-[5px]" textAnchor="middle">YIELD_PT</text>
        </g>
        
        {/* Side rulers */}
        <line x1="20" y1="50" x2="20" y2="590" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.2)" />
        <line x1="20" y1="100" x2="26" y2="100" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.3)" />
        <line x1="20" y1="200" x2="26" y2="200" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.3)" />
        <line x1="20" y1="300" x2="26" y2="300" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.3)" />
        <line x1="20" y1="400" x2="26" y2="400" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.3)" />
        <line x1="20" y1="500" x2="26" y2="500" strokeWidth="0.5" stroke="rgba(34, 211, 238, 0.3)" />
        
        <text x="35" y="45" className="fill-cyan-500/40 font-mono text-[6px]">REF: GEOTECH_SYS_01</text>
      </svg>
    );
  }
  
  if (title === "Markets & Investing") {
    return (
      <svg viewBox="0 0 384 640" className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-85 stroke-emerald-400 fill-none pointer-events-none transition-all duration-500">
        <defs>
          <filter id="emerald-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Trading grid */}
        <line x1="40" y1="100" x2="344" y2="100" strokeWidth="0.5" stroke="rgba(52, 211, 153, 0.08)" />
        <line x1="40" y1="200" x2="344" y2="200" strokeWidth="0.5" stroke="rgba(52, 211, 153, 0.08)" />
        <line x1="40" y1="300" x2="344" y2="300" strokeWidth="0.5" stroke="rgba(52, 211, 153, 0.08)" />
        <line x1="40" y1="400" x2="344" y2="400" strokeWidth="0.5" stroke="rgba(52, 211, 153, 0.08)" />
        
        {/* Trendline with glow */}
        <g filter="url(#emerald-glow)">
          <path d="M 40 430 Q 150 380 200 250 T 344 120" strokeWidth="2.5" />
        </g>

        {/* Fibonacci Retracement Levels */}
        <line x1="40" y1="120" x2="344" y2="120" strokeWidth="0.7" strokeDasharray="4 4" stroke="rgba(52, 211, 153, 0.3)" />
        <text x="344" y="116" className="fill-emerald-400/50 font-mono text-[6px]" textAnchor="end">FIB 100.0% (5240.50)</text>

        <line x1="40" y1="180" x2="344" y2="180" strokeWidth="0.7" strokeDasharray="4 4" stroke="rgba(52, 211, 153, 0.2)" />
        <text x="344" y="176" className="fill-emerald-400/40 font-mono text-[6px]" textAnchor="end">FIB 61.8% (5182.20)</text>

        <line x1="40" y1="240" x2="344" y2="240" strokeWidth="0.7" strokeDasharray="4 4" stroke="rgba(52, 211, 153, 0.2)" />
        <text x="344" y="236" className="fill-emerald-400/40 font-mono text-[6px]" textAnchor="end">FIB 50.0% (5148.00)</text>

        <line x1="40" y1="300" x2="344" y2="300" strokeWidth="0.7" strokeDasharray="4 4" stroke="rgba(52, 211, 153, 0.2)" />
        <text x="344" y="296" className="fill-emerald-400/40 font-mono text-[6px]" textAnchor="end">FIB 38.2% (5113.80)</text>

        <line x1="40" y1="430" x2="344" y2="430" strokeWidth="0.7" strokeDasharray="4 4" stroke="rgba(52, 211, 153, 0.3)" />
        <text x="344" y="426" className="fill-emerald-400/50 font-mono text-[6px]" textAnchor="end">FIB 0.0% (5024.10)</text>

        {/* Candlesticks */}
        <line x1="80" y1="360" x2="80" y2="420" strokeWidth="1" stroke="rgba(52, 211, 153, 0.4)" />
        <rect x="73" y="375" width="14" height="30" className="fill-emerald-950/60" strokeWidth="1" />
        
        <line x1="140" y1="300" x2="140" y2="380" strokeWidth="1" stroke="rgba(52, 211, 153, 0.4)" />
        <rect x="133" y="315" width="14" height="40" className="fill-emerald-950/60" strokeWidth="1" />
        
        <line x1="200" y1="220" x2="200" y2="300" strokeWidth="1" stroke="rgba(52, 211, 153, 0.4)" />
        <rect x="193" y="235" width="14" height="45" className="fill-emerald-950/60" strokeWidth="1" />

        <line x1="260" y1="170" x2="260" y2="250" strokeWidth="1" stroke="rgba(52, 211, 153, 0.4)" />
        <rect x="253" y="185" width="14" height="40" className="fill-emerald-950/60" strokeWidth="1" />

        {/* Buy limit marker box */}
        <g className="opacity-70">
          <rect x="40" y="335" width="80" height="15" rx="3" className="fill-emerald-500/10 stroke-emerald-500/30" />
          <text x="80" y="345" className="fill-emerald-400 font-mono text-[6px] font-bold" textAnchor="middle">BUY LIMIT @ 5120.0</text>
          <line x1="120" y1="342" x2="260" y2="342" strokeWidth="0.5" strokeDasharray="2 1" />
        </g>

        {/* Dashboard parameters */}
        <text x="45" y="55" className="fill-emerald-450/70 font-mono text-[9px] tracking-wider">$SPX: 5240.50 (+1.24%)</text>
        <text x="45" y="70" className="fill-slate-500 font-mono text-[7px]">VOL: 42.58M  |  MA(50): 5104.2</text>

        {/* Volume Bars at Bottom */}
        <g className="opacity-40 fill-emerald-500/20">
          <rect x="60" y="470" width="8" height="20" />
          <rect x="75" y="465" width="8" height="25" />
          <rect x="90" y="475" width="8" height="15" />
          <rect x="105" y="460" width="8" height="30" />
          <rect x="120" y="450" width="8" height="40" />
          <rect x="135" y="455" width="8" height="35" />
          <rect x="150" y="445" width="8" height="45" />
          <rect x="165" y="440" width="8" height="50" />
        </g>

        {/* MACD Oscillator at bottom */}
        <path d="M 40 510 Q 100 490 150 510 T 260 510 T 344 490" strokeWidth="1" stroke="rgba(52, 211, 153, 0.3)" />
        <path d="M 40 520 Q 100 500 150 520 T 260 520 T 344 500" strokeWidth="1" stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="2 2" />
        <text x="192" y="540" className="fill-emerald-400/40 font-mono text-[7px] tracking-widest" textAnchor="middle">MACD HISTOGRAM OSCILLATOR</text>
      </svg>
    );
  }
  
  if (title === "Content Creation") {
    return (
      <svg viewBox="0 0 384 640" className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-85 stroke-rose-500 fill-none pointer-events-none transition-all duration-500">
        <defs>
          <filter id="rose-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* HUD Viewfinder brackets */}
        <g filter="url(#rose-glow)">
          <path d="M 30 60 L 30 30 L 60 30" strokeWidth="2.5" />
          <path d="M 324 30 L 354 30 L 354 60" strokeWidth="2.5" />
          <path d="M 30 540 L 30 570 L 60 570" strokeWidth="2.5" />
          <path d="M 324 570 L 354 570 L 354 540" strokeWidth="2.5" />
        </g>

        {/* Viewfinder crosshair */}
        <circle cx="192" cy="300" r="22" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="192" cy="300" r="4" className="fill-rose-500" stroke="none" />
        <line x1="192" y1="270" x2="192" y2="330" strokeWidth="1" />
        <line x1="162" y1="300" x2="222" y2="300" strokeWidth="1" />

        {/* Focus telemetry ring */}
        <circle cx="192" cy="300" r="80" strokeWidth="0.5" stroke="rgba(244, 63, 94, 0.15)" />
        <path d="M 192 220 A 80 80 0 0 1 272 300" strokeWidth="1" stroke="rgba(244, 63, 94, 0.4)" strokeDasharray="2 3" />
        <text x="280" y="295" className="fill-rose-500/60 font-mono text-[6px]">FOCUS: PEAKING 94%</text>

        {/* Film reel overlays */}
        <circle cx="80" cy="140" r="30" strokeWidth="0.8" strokeDasharray="4 4" className="opacity-40" />
        <circle cx="304" cy="460" r="30" strokeWidth="0.8" strokeDasharray="4 4" className="opacity-40" />

        {/* Cinematic Telemetry HUD */}
        <text x="45" y="500" className="fill-rose-500/70 font-mono text-[9px] tracking-wider">F/2.8  |  ISO 800  |  1/60s</text>
        <text x="45" y="515" className="fill-slate-500 font-mono text-[7px]">4K ProRes 422 HQ  |  60 FPS</text>

        {/* Audio VU meter */}
        <g className="fill-rose-500/25">
          <rect x="330" y="240" width="8" height="4" />
          <rect x="330" y="248" width="8" height="4" />
          <rect x="330" y="256" width="8" height="4" />
          <rect x="330" y="264" width="8" height="4" />
          <rect x="330" y="272" width="8" height="4" className="fill-rose-500" />
          <rect x="330" y="280" width="8" height="4" className="fill-rose-500" />
          <rect x="330" y="288" width="8" height="4" className="fill-rose-500" />
        </g>
        <text x="334" y="230" className="fill-rose-500/60 font-mono text-[6px] rotate-90 origin-left">CH1 VU</text>

        {/* Video Audio Waveform timeline at bottom */}
        <g className="opacity-30">
          <text x="45" y="405" className="fill-rose-500/50 font-mono text-[6px]">A1_DIALOGUE.wav</text>
          <path d="M 45 420 L 60 420 L 65 410 L 70 430 L 75 420 L 100 420 L 105 405 L 110 435 L 115 420 L 140 420" strokeWidth="0.8" />
          <text x="175" y="405" className="fill-rose-500/50 font-mono text-[6px]">A2_SFX.wav</text>
          <path d="M 175 420 L 185 420 L 190 415 L 195 425 L 200 420 L 220 420 L 225 410 L 230 430 L 235 420" strokeWidth="0.8" />
        </g>
        
        {/* REC dot & Battery & Timecode */}
        <g>
          <circle cx="330" cy="50" r="5" className="fill-red-600 stroke-none" />
          <text x="318" y="53" className="fill-red-500 font-mono text-[8px] tracking-wide text-right stroke-none" textAnchor="end">REC</text>

          {/* Timecode */}
          <text x="192" y="53" className="fill-rose-500 font-mono text-[9px] tracking-widest" textAnchor="middle">00:04:12:15</text>

          {/* Battery */}
          <rect x="45" y="45" width="18" height="9" rx="1.5" strokeWidth="1" />
          <rect x="63" y="47" width="2" height="5" className="fill-rose-500 stroke-none" />
          <rect x="48" y="48" width="10" height="3" className="fill-rose-500 stroke-none" />
          <text x="70" y="52" className="fill-rose-500/60 font-mono text-[6px]">84%</text>
        </g>
      </svg>
    );
  }
  
  if (title === "Fitness") {
    return (
      <svg viewBox="0 0 384 640" className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-85 stroke-amber-400 fill-none pointer-events-none transition-all duration-500">
        <defs>
          <filter id="amber-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Heartbeat ECG line */}
        <g filter="url(#amber-glow)">
          <path d="M 40 300 L 120 300 L 135 260 L 150 370 L 165 280 L 180 300 L 240 300 L 255 240 L 270 410 L 285 280 L 300 300 M 300 300 L 344 300" strokeWidth="2.5" />
        </g>

        {/* Telemetry labels */}
        <text x="45" y="90" className="fill-amber-450/70 font-mono text-[9px] tracking-wider">HR: 145 BPM  |  ZONE 4</text>
        <text x="45" y="105" className="fill-slate-500 font-mono text-[7px]">PACE: 4&apos;45&quot; /KM  |  CAL: 650 KCAL</text>

        {/* Circular radial progress gauge */}
        <circle cx="192" cy="180" r="40" className="stroke-amber-500/10" strokeWidth="3" />
        <path d="M 192 140 A 40 40 0 1 1 152 180" className="stroke-amber-500" strokeWidth="3" strokeLinecap="round" filter="url(#amber-glow)" />
        <text x="192" y="183" className="fill-amber-400 font-mono text-[9px] font-bold" textAnchor="middle">84%</text>
        <text x="192" y="195" className="fill-slate-500 font-mono text-[6px]" textAnchor="middle">DAILY GOAL</text>

        {/* GPX run route path overlay */}
        <g className="opacity-30">
          <path d="M 70 420 L 110 400 L 130 430 L 180 395 L 220 420 L 270 410" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="70" cy="420" r="2" className="fill-amber-400" />
          <circle cx="270" cy="410" r="2.5" className="fill-red-500" />
          <text x="65" y="420" className="fill-slate-550 font-mono text-[5px]" textAnchor="end">START</text>
          <text x="275" y="410" className="fill-slate-550 font-mono text-[5px]">FINISH (8.2 KM)</text>
        </g>

        {/* Running track lane curves */}
        <path d="M 40 560 C 40 460, 344 460, 344 560" strokeWidth="1" stroke="rgba(245, 158, 11, 0.12)" />
        <path d="M 80 560 C 80 490, 304 490, 304 560" strokeWidth="1" stroke="rgba(245, 158, 11, 0.12)" />

        {/* Elevation Mountain Profile */}
        <g className="opacity-20 fill-amber-500/10">
          <path d="M 60 510 L 80 495 L 110 500 L 140 480 L 170 490 L 200 470 L 230 485 L 260 510 Z" strokeWidth="0.8" stroke="rgba(245, 158, 11, 0.3)" />
          <text x="140" y="475" className="fill-slate-500 font-mono text-[5px]" textAnchor="middle">ELEVATION GAIN: +120m</text>
        </g>
      </svg>
    );
  }
  
  if (title === "Learning & AI") {
    return (
      <svg viewBox="0 0 384 640" className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-85 stroke-violet-400 fill-none pointer-events-none transition-all duration-500">
        <defs>
          <filter id="violet-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Silicon Wafer/Processor die grid block */}
        <g className="opacity-20 stroke-violet-500/30">
          <rect x="50" y="110" width="80" height="80" strokeWidth="0.8" />
          <rect x="60" y="120" width="25" height="25" strokeWidth="0.6" />
          <rect x="95" y="120" width="25" height="25" strokeWidth="0.6" />
          <rect x="60" y="155" width="25" height="25" strokeWidth="0.6" />
          <rect x="95" y="155" width="25" height="25" strokeWidth="0.6" />
          {/* Pins */}
          <line x1="50" y1="130" x2="40" y2="130" strokeWidth="0.6" />
          <line x1="50" y1="150" x2="40" y2="150" strokeWidth="0.6" />
          <line x1="50" y1="170" x2="40" y2="170" strokeWidth="0.6" />
          <line x1="130" y1="130" x2="140" y2="130" strokeWidth="0.6" />
          <line x1="130" y1="150" x2="140" y2="150" strokeWidth="0.6" />
          <line x1="130" y1="170" x2="140" y2="170" strokeWidth="0.6" />
          <text x="90" y="202" className="fill-violet-400/40 font-mono text-[5px]" textAnchor="middle">AI_COPROC_CORE</text>
        </g>

        {/* Neural Network Nodes Layer web */}
        <g filter="url(#violet-glow)">
          <circle cx="100" cy="300" r="5" className="fill-violet-500" strokeWidth="1" />
          <circle cx="100" cy="360" r="5" className="fill-violet-500" strokeWidth="1" />
          <circle cx="100" cy="420" r="5" className="fill-violet-500" strokeWidth="1" />
          
          <circle cx="192" cy="250" r="5" className="fill-violet-500" strokeWidth="1" />
          <circle cx="192" cy="330" r="5" className="fill-violet-500" strokeWidth="1" />
          <circle cx="192" cy="410" r="5" className="fill-violet-500" strokeWidth="1" />
          <circle cx="192" cy="490" r="5" className="fill-violet-500" strokeWidth="1" />

          <circle cx="284" cy="330" r="5" className="fill-violet-500" strokeWidth="1" />
          <circle cx="284" cy="410" r="5" className="fill-violet-500" strokeWidth="1" />
        </g>

        {/* Connections */}
        <g className="stroke-violet-400/30">
          <line x1="105" y1="300" x2="187" y2="250" strokeWidth="1" />
          <line x1="105" y1="300" x2="187" y2="330" strokeWidth="1" />
          <line x1="105" y1="360" x2="187" y2="330" strokeWidth="1" />
          <line x1="105" y1="360" x2="187" y2="410" strokeWidth="1" />
          <line x1="105" y1="420" x2="187" y2="410" strokeWidth="1" />
          <line x1="105" y1="420" x2="187" y2="490" strokeWidth="1" />

          <line x1="197" y1="250" x2="279" y2="330" strokeWidth="1" />
          <line x1="197" y1="330" x2="279" y2="330" strokeWidth="1" />
          <line x1="197" y1="410" x2="279" y2="410" strokeWidth="1" />
          <line x1="197" y1="490" x2="279" y2="410" strokeWidth="1" />
        </g>

        {/* Sigmoid Activation Function Plot */}
        <g className="opacity-50">
          <line x1="220" y1="150" x2="300" y2="150" strokeWidth="0.6" stroke="rgba(167, 139, 250, 0.3)" />
          <line x1="260" y1="110" x2="260" y2="190" strokeWidth="0.6" stroke="rgba(167, 139, 250, 0.3)" strokeDasharray="1 1" />
          {/* S-curve */}
          <path d="M 220 180 Q 250 180 260 150 T 300 120" strokeWidth="1" strokeLinecap="round" />
          <text x="260" y="200" className="fill-violet-400/70 font-mono text-[5px]" textAnchor="middle">y = 1 / (1 + e^-x)</text>
        </g>

        {/* AI Processing Parameter HUD */}
        <text x="45" y="80" className="fill-violet-450/70 font-mono text-[9px] tracking-wider">MODEL: LLM_PROCESSOR_v4</text>
        <text x="45" y="95" className="fill-slate-500 font-mono text-[7px]">EPOCHS: 150/150  |  LOSS: 0.0423</text>
        <text x="45" y="107" className="fill-slate-550 font-mono text-[6px] tracking-widest">FUNC: w&apos; = w - η * ∇L</text>

        {/* Floating binary code text */}
        <text x="70" y="240" className="fill-violet-500/20 font-mono text-[8px]">010110</text>
        <text x="310" y="270" className="fill-violet-500/20 font-mono text-[8px]">110101</text>
        <text x="60" y="520" className="fill-violet-500/20 font-mono text-[8px]">001101</text>
      </svg>
    );
  }
  return null;
}

/* ─── Stagger animation ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function LifeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -360 : 360;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Components of Saumya&apos;s Life
        </h2>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          Each card represents a dimension — together they build the complete picture.
        </p>
      </motion.div>

      {/* ── Navigation Arrows ── */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-neutral-900 shadow-md transition-colors hover:bg-white active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-neutral-900 shadow-md transition-colors hover:bg-white active:scale-95"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Scrollable Container ── */}
      <div className="relative">
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex gap-4 overflow-x-scroll pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              className="group relative h-80 w-56 flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-neutral-900 md:h-[40rem] md:w-96"
            >
              {/* ── Background gradient fill ── */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${card.gradient} transition-all duration-500 group-hover:scale-105`}
              />

              {/* ── Card Graphic/Schematic Overlay ── */}
              <CardBackground title={card.title} />

              {/* ── Dark overlay from bottom ── */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

              {/* ── Accent stripe ── */}
              <div
                className={`absolute left-0 top-0 h-1 w-full ${card.accent} opacity-60 z-10`}
              />

              {/* ── Content ── */}
              <div className="relative z-20 flex h-full flex-col justify-end p-5 md:p-8">
                <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 md:text-xs">
                  {card.category}
                </span>
                <h3 className="text-lg font-bold text-white md:text-2xl">
                  {card.title}
                </h3>
                
                {/* Visual upgrade: show a brief preview of description in default state, expand fully on hover */}
                <p className="mt-2 text-xs leading-relaxed text-slate-300 md:text-sm transition-all duration-500 line-clamp-1 group-hover:line-clamp-none">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Right-side gradient fade ── */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#08090b] to-transparent sm:w-32" />
      </div>
    </section>
  );
}
