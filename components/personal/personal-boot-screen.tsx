"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useOS } from "@/lib/os-context";
import { sysAudio } from "@/lib/audio-engine";

const BOOT_LOGS = [
  { p: 0, text: "SYSTEM: INIT BOOT STRAP PROCESS v4.2..." },
  { p: 8, text: "IGNITION: Ignition switch key turned ON... [OK]" },
  { p: 15, text: "STARTER: Engaging parallel-twin starter motor... [CRANKING]" },
  { p: 22, text: "TELEMETRY: Binding cockpit dials (speed, RPM, clock)..." },
  { p: 30, text: "DIAGNOSTICS: Verifying warning indicators (ABS, Oil, Check)..." },
  { p: 40, text: "ENGINE: Combustion fired up. Stable idle (1200 RPM)... [OK]" },
  { p: 52, text: "THROTTLE: Sweep: 3500 RPM... Exhaust flow: 45 g/s" },
  { p: 64, text: "THROTTLE: Rev sweep: 5500 RPM... Compression stable" },
  { p: 76, text: "THROTTLE: REDLINE ENGAGED: 7500 RPM... Temp: 95°C [LIMITER]" },
  { p: 83, text: "EXHAUST: Ignition cut... Backfire pop #1! [FIRE]" },
  { p: 88, text: "EXHAUST: Ignition cut... Backfire pop #2! [FIRE]" },
  { p: 93, text: "EXHAUST: Ignition cut... Backfire pop #3! [FIRE]" },
  { p: 97, text: "OS: Deploying HUD modules and personal operating manual..." },
  { p: 100, text: "SYSTEM: Boot complete. Welcome, Saumya." },
];

export function PersonalBootScreen() {
  const { boot, theme } = useOS();
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(progress);
  const themeRef = useRef(theme);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Custom Progressive Timeline mapping for precise audio/visual coordination
  useEffect(() => {
    const startTime = Date.now();
    const totalDuration = 5200; // 5.2 seconds total boot time

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / totalDuration, 1.0);
      
      let p = 0;
      if (ratio < 0.12) {
        // Key switch click (0% - 12%)
        p = (ratio / 0.12) * 15;
      } else if (ratio < 0.35) {
        // Cranking (12% - 35%)
        const subRatio = (ratio - 0.12) / 0.23;
        p = 15 + subRatio * 23; // 15 to 38
      } else if (ratio < 0.72) {
        // Firing and revving up to redline (35% - 72%)
        const subRatio = (ratio - 0.35) / 0.37;
        p = 38 + subRatio * 42; // 38 to 80
      } else if (ratio < 0.92) {
        // Redline backfire pops (72% - 92%)
        const subRatio = (ratio - 0.72) / 0.20;
        p = 80 + subRatio * 15; // 80 to 95
      } else {
        // OS mount and boot completion (92% - 100%)
        const subRatio = (ratio - 0.92) / 0.08;
        p = 95 + subRatio * 5; // 95 to 100
      }

      const nextVal = Math.round(p);
      setProgress(nextVal);

      if (ratio >= 1.0) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Sync log printing and Web Audio with progress percentage
  useEffect(() => {
    sysAudio.updateBootAudio(progress);
    
    if (progress === 100) {
      const timeout = setTimeout(() => {
        boot();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [progress, boot]);

  // Exhaust particles canvas controller
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      size: number;
      maxLife: number;
      life: number;
      color: string;
      isFlame?: boolean;
    }

    const particles: Particle[] = [];
    
    let hasPopped1 = false;
    let hasPopped2 = false;
    let hasPopped3 = false;
    let flashIntensity = 0;

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentP = progressRef.current;
      const currentTheme = themeRef.current;

      // Tailpipe output is at coordinate 60, 165
      const emitterX = 60;
      const emitterY = 165;

      // Detect if a pop occurred in this frame
      let triggerPop = false;
      if (currentP >= 83 && currentP < 88 && !hasPopped1) {
        triggerPop = true;
        hasPopped1 = true;
      } else if (currentP >= 88 && currentP < 93 && !hasPopped2) {
        triggerPop = true;
        hasPopped2 = true;
      } else if (currentP >= 93 && currentP < 97 && !hasPopped3) {
        triggerPop = true;
        hasPopped3 = true;
      }

      // Reset pop flags if progress resets
      if (currentP < 5) {
        hasPopped1 = false;
        hasPopped2 = false;
        hasPopped3 = false;
      }

      // Handle Pop Flash & Flame Spawning
      if (triggerPop) {
        flashIntensity = 1.2;

        // Spawn 30 high-velocity fire particles
        for (let k = 0; k < 30; k++) {
          const angle = Math.PI + (Math.random() * 0.8 - 0.4); // Left with some spread
          const speed = 5 + Math.random() * 10;
          const colors = ["#ffffff", "#ffea00", "#ff6600", "#ff3300"];
          const chosenColor = colors[Math.floor(Math.random() * colors.length)];
          
          particles.push({
            x: emitterX,
            y: emitterY + (Math.random() * 4 - 2),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed + (Math.random() * 1.0 - 0.5),
            alpha: 1.0,
            size: 2 + Math.random() * 5,
            maxLife: 12 + Math.random() * 12,
            life: 0,
            color: chosenColor,
            isFlame: true
          });
        }
      }

      // Regular Exhaust Smoke (only when engine is running and not fully booted)
      if (currentP >= 40 && currentP < 100) {
        const spawnCount = currentP >= 80 ? 4 : 1;
        for (let i = 0; i < spawnCount; i++) {
          const isRedline = currentP >= 80;
          const sizeVal = isRedline ? (1.5 + Math.random() * 3.5) : (1 + Math.random() * 2);
          const colorVal = isRedline 
            ? (Math.random() > 0.6 ? "#ff5500" : currentTheme.accent) 
            : currentTheme.accent;

          particles.push({
            x: emitterX,
            y: emitterY + (Math.random() * 4 - 2),
            vx: -(2.5 + Math.random() * 3.5) * (currentP / 45),
            vy: (Math.random() * 2.0 - 1.0),
            alpha: 0.8,
            size: sizeVal,
            maxLife: 15 + Math.random() * 15,
            life: 0,
            color: colorVal
          });
        }
      }

      // Draw full-canvas flash overlay and local flame burst glow
      if (flashIntensity > 0.01) {
        ctx.fillStyle = `rgba(212, 175, 55, ${0.08 * flashIntensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const grad = ctx.createRadialGradient(
          emitterX, emitterY, 0,
          emitterX, emitterY, 40 * flashIntensity
        );
        grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        grad.addColorStop(0.15, "rgba(212, 175, 55, 0.9)");
        grad.addColorStop(0.5, "rgba(212, 175, 55, 0.5)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(emitterX, emitterY, 45 * flashIntensity, 0, Math.PI * 2);
        ctx.fill();

        flashIntensity *= 0.82; // Decay
      }

      // Draw and update all particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = (p.isFlame ? 1.0 : 0.8) * (1 - p.life / p.maxLife);
        p.size += p.isFlame ? 0.35 : 0.2;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (p.isFlame) {
          ctx.fillStyle = p.color;
        } else {
          ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        }
        ctx.fill();
      }

      animationId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Construct progress bar text like [████░░░░]
  const barLength = 20;
  const filledCount = Math.floor((progress / 100) * barLength);
  const barText = "█".repeat(filledCount) + "░".repeat(barLength - filledCount);

  // Active logs filter
  const activeLogs = BOOT_LOGS.filter((log) => progress >= log.p).map((log) => log.text);

  // Dynamic engine calculations
  const currentRPM = progress < 38 
    ? 0 
    : progress < 80 
      ? Math.round(1200 + ((progress - 38) / 42) * 6300)
      : progress < 95
        ? Math.round(7500 + (progress % 2 === 0 ? 300 : -200)) // Bouncing redline
        : 0;

  const rpmBarLength = 20;
  const rpmRatio = currentRPM / 8000;
  const rpmFilledCount = Math.floor(rpmRatio * rpmBarLength);
  const rpmBarText = "█".repeat(rpmFilledCount) + "░".repeat(rpmBarLength - rpmFilledCount);

  // Dynamic Engine Shake for high-fidelity schematic
  const shakeOffset = progress >= 38 && progress < 95 ? (0.5 + ((progress - 38) / 57) * 2.0) : 0;
  const shakeX = (Math.random() - 0.5) * shakeOffset;
  const shakeY = (Math.random() - 0.5) * shakeOffset;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.05,
        filter: "blur(12px)",
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 bg-[#030405] z-[999] flex flex-col justify-between p-6 sm:p-12 font-mono select-none overflow-hidden"
      style={{ color: theme.accent }}
    >
      {/* Scanline background matrix */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.02] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='4'%3E%3Cline x1='0' y1='0' x2='100%25' y2='0' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "100% 4px",
        }}
      />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030405]/40 to-[#030405] pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center text-[8px] sm:text-[10px] opacity-70 tracking-widest border-b border-white/5 pb-4">
        <span>SAUMYA_OS v4.2 // VEHICLE_BOOTSTRAP</span>
        <span>SYS_CLOCK: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Center Bike schematic rendering & Warning Panel */}
      <div className="flex flex-col items-center justify-center my-auto gap-4 relative w-full">
        
        {/* Wireframe schematic assembly container */}
        <div className="relative w-full max-w-sm sm:max-w-md aspect-[1.66] flex items-center justify-center">
          
          {/* Emitter Canvas overlay */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            width={400}
            height={240}
          />

          {/* Super Meteor 650 Wireframe SVG */}
          <svg 
            viewBox="0 0 400 240" 
            className="absolute inset-0 w-full h-full text-slate-400 select-none z-10 transition-all duration-300"
            style={{
              filter: `drop-shadow(0 0 ${progress >= 40 ? "8px" : "2px"} ${theme.accent}30)`
            }}
          >
            {/* Ground grid lines */}
            <line x1="20" y1="180" x2="380" y2="180" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            {progress >= 70 && (
              <polygon 
                points="300,150 380,120 380,220 300,150" 
                fill={`url(#headLightBeam)`} 
                opacity="0.25"
              />
            )}

            <defs>
              <linearGradient id="headLightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor={theme.accent} stopOpacity="0.4" />
                <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Rear Wheel (constructs at 25%) */}
            <g style={{ color: progress >= 25 ? theme.accent : "rgba(212, 175, 55, 0.05)" }}>
              <circle cx="100" cy="150" r="30" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="100" cy="150" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
              {/* Rotating spokes */}
              <circle 
                cx="100" 
                cy="150" 
                r="24" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                strokeDasharray="3 7" 
                className={progress >= 40 ? "animate-spin" : ""}
                style={{ 
                  transformOrigin: "100px 150px", 
                  animationDuration: progress >= 80 ? "0.15s" : progress >= 40 ? "0.6s" : "0s"
                }} 
              />
            </g>

            {/* Front Wheel (constructs at 25%) */}
            <g style={{ color: progress >= 25 ? theme.accent : "rgba(212, 175, 55, 0.05)" }}>
              <circle cx="300" cy="150" r="33" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="300" cy="150" r="2" stroke="currentColor" strokeWidth="1" fill="none" />
              {/* Rotating spokes */}
              <circle 
                cx="300" 
                cy="150" 
                r="27" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                strokeDasharray="3 7" 
                className={progress >= 40 ? "animate-spin" : ""}
                style={{ 
                  transformOrigin: "300px 150px", 
                  animationDuration: progress >= 80 ? "0.15s" : progress >= 40 ? "0.6s" : "0s"
                }} 
              />
            </g>

            {/* Frame / Chassis Skeleton (constructs at 10%) */}
            <path 
              d="M 300,90 L 260,82 L 205,125 L 140,150 L 100,150 M 260,82 L 180,105 L 140,118 L 100,150" 
              stroke={progress >= 10 ? theme.accent : "rgba(212, 175, 55, 0.05)"} 
              strokeWidth="1.8" 
              fill="none" 
            />

            {/* Front telescopic forks & Handlebars (constructs at 25%) */}
            <g stroke={progress >= 25 ? theme.accent : "rgba(212, 175, 55, 0.05)"} strokeWidth="1.5" fill="none">
              <line x1="300" y1="150" x2="260" y2="70" strokeWidth="2" />
              <path d="M 260,70 L 250,68 M 260,70 L 270,72" />
            </g>

            {/* Side covers and rear fender (constructs at 10%) */}
            <path 
              d="M 140,150 A 45 45 0 0 0 95,120 L 70,140 M 130,118 L 142,145 L 120,148 Z" 
              stroke={progress >= 10 ? theme.accent : "rgba(212, 175, 55, 0.05)"} 
              strokeWidth="1.2" 
              fill="none" 
            />

            {/* Teardrop fuel tank (constructs at 55%) */}
            <path 
              d="M 180,105 C 190,82 245,78 260,94 C 260,94 242,108 198,108 Z" 
              stroke={progress >= 55 ? theme.accent : "rgba(212, 175, 55, 0.05)"} 
              strokeWidth="1.5" 
              fill="none" 
            />

            {/* Dual seats - cruiser split setup (constructs at 55%) */}
            <path 
              d="M 115,124 C 125,116 142,116 155,124 M 155,124 C 165,112 185,110 196,112" 
              stroke={progress >= 55 ? theme.accent : "rgba(212, 175, 55, 0.05)"} 
              strokeWidth="1.2" 
              fill="none" 
            />

            {/* Vibrating Engine Block Assembly (constructs at 40%) */}
            <g style={{ transform: `translate3d(${shakeX}px, ${shakeY}px, 0)` }}>
              <rect 
                x="158" 
                y="116" 
                width="34" 
                height="32" 
                rx="3" 
                stroke={progress >= 40 ? theme.accent : "rgba(212, 175, 55, 0.05)"} 
                strokeWidth="1.5" 
                fill="none" 
              />
              <line 
                x1="158" y1="124" x2="192" y2="124" 
                stroke={progress >= 40 ? theme.accent : "rgba(212, 175, 55, 0.02)"} 
              />
              <line 
                x1="158" y1="132" x2="192" y2="132" 
                stroke={progress >= 40 ? theme.accent : "rgba(212, 175, 55, 0.02)"} 
              />
            </g>

            {/* Exhaust flow pipes (constructs at 40%) */}
            <path 
              d="M 180,142 L 205,152 L 105,152 L 60,165" 
              stroke={progress >= 40 ? theme.accent : "rgba(212, 175, 55, 0.05)"} 
              strokeWidth="1.8" 
              fill="none" 
            />
          </svg>

        </div>

        {/* Real-time Dashboard Warning Lights Panel */}
        <div className="flex gap-4 items-center justify-center my-1 text-[9px] font-mono font-bold tracking-wider">
          <div className="flex flex-col items-center gap-0.5">
            <span 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                progress >= 8 && progress < 40 
                  ? "bg-attention-500 shadow-[0_0_8px_#f59e0b]" 
                  : "bg-neutral-800"
              }`} 
            />
            <span className={progress >= 8 && progress < 40 ? "text-attention-500" : "text-neutral-600"}>ABS</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                progress >= 8 
                  ? "bg-attention-500 shadow-[0_0_8px_#22c55e]" 
                  : "bg-neutral-800"
              }`} 
            />
            <span className={progress >= 8 ? "text-attention-500" : "text-neutral-600"}>N</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                progress >= 8 && progress < 40 
                  ? "bg-attention-500 shadow-[0_0_8px_#ef4444]" 
                  : "bg-neutral-800"
              }`} 
            />
            <span className={progress >= 8 && progress < 40 ? "text-attention-500" : "text-neutral-600"}>OIL</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                progress >= 8 && progress < 40 
                  ? "bg-attention-500 shadow-[0_0_8px_#f59e0b]" 
                  : "bg-neutral-800"
              }`} 
            />
            <span className={progress >= 8 && progress < 40 ? "text-attention-500" : "text-neutral-600"}>CHECK</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                progress >= 8 && progress < 40 
                  ? "bg-attention-500 shadow-[0_0_8px_#ef4444]" 
                  : "bg-neutral-800"
              }`} 
            />
            <span className={progress >= 8 && progress < 40 ? "text-attention-500" : "text-neutral-600"}>BATT</span>
          </div>
        </div>

        {/* Live RPM Gauge display */}
        <div className="text-[10px] font-mono font-bold tracking-widest mt-2 flex flex-col items-center gap-1 w-full max-w-xs">
          <div className="flex justify-between w-full text-[9px] px-1 text-slate-500">
            <span>RPM: {currentRPM} / 8000</span>
            <span className={currentRPM >= 7000 ? "text-attention-500 animate-pulse font-extrabold" : "text-slate-400"}>
              {currentRPM >= 7000 ? "REDLINE" : currentRPM > 0 ? "STABLE" : "STANDBY"}
            </span>
          </div>
          <div className={`text-[10px] w-full text-center transition-colors duration-200 ${currentRPM >= 7000 ? "text-attention-500" : "text-attention-400"}`}>
            [{rpmBarText}]
          </div>
        </div>

        {/* Main loading details text */}
        <div className="text-center font-mono mt-4">
          <h2 className="text-xs sm:text-sm font-extrabold tracking-widest text-white uppercase mb-1">
            Mounting Personal OS
          </h2>
          <div className="text-[10px] sm:text-xs font-semibold tracking-wider font-mono opacity-80">
            [{barText}] {progress}%
          </div>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider block mt-2 text-slate-500 font-bold">
            Configuring mechanical parameters // Synchronizing exhausts
          </span>
        </div>

      </div>

      {/* Footer Log Stream Console */}
      <div className="bg-black/60 border border-white/5 p-4 rounded-xl h-36 flex flex-col justify-end text-left select-none relative">
        <div className="absolute top-2 left-4 text-[7px] uppercase tracking-widest text-slate-500 font-bold font-mono">
          Logs console buffer // 1024kb
        </div>
        <div className="overflow-y-auto flex flex-col gap-1 font-mono text-[8px] sm:text-[9.5px] text-slate-400 [scrollbar-width:none]">
          {activeLogs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span style={{ color: theme.accent }}>&gt;</span>
              <span className="truncate">{log}</span>
            </div>
          ))}
          {progress < 100 && (
            <div className="flex items-center gap-1">
              <span style={{ color: theme.accent }}>&gt;</span>
              <span className="w-1.5 h-3 ml-0.5 animate-pulse" style={{ backgroundColor: theme.accent }} />
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}
