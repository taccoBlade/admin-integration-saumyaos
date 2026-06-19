"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Compass, Video, Layers, Cpu } from "lucide-react";

const BENTO_NODES = [
  { x: 0.2, y: 0.3, label: "SENS_A1", val: "94% density" },
  { x: 0.5, y: 0.25, label: "SENS_A2", val: "97% compaction" },
  { x: 0.8, y: 0.4, label: "SENS_B1", val: "88% saturation" },
  { x: 0.35, y: 0.65, label: "SENS_B2", val: "95% density" },
  { x: 0.65, y: 0.75, label: "SENS_C1", val: "91% stable" },
];

const BENTO_CONNECTIONS = [
  [0, 1], [0, 3], [1, 2], [1, 4], [3, 4], [2, 4]
];

const SPOTLIGHT_R = 150;

export function BentoGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const timeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Resize canvas to match card dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    const card = sectionRef.current;
    if (!canvas || !card) return;

    const handleResize = () => {
      canvas.width = card.clientWidth;
      canvas.height = card.clientHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track mouse movements relative to the card container
  useEffect(() => {
    const card = sectionRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.current = { x, y };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -999, y: -999 };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = card.getBoundingClientRect();
      if (rect && e.touches.length > 0) {
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        mouse.current = { x, y };
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("touchmove", handleTouchMove);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Procedural Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      timeRef.current += 16.67;
      const time = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Handle spotlight positioning with damping
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      if (mouse.current.x === -999) {
        // Idle animation: drift gently at the center of the card
        const centerX = width / 2;
        const centerY = height / 2;
        targetX = centerX + Math.sin(time * 0.0015) * 60;
        targetY = centerY + Math.cos(time * 0.001) * 40;
      }

      if (smooth.current.x === -999) {
        smooth.current = { x: targetX, y: targetY };
      } else {
        smooth.current.x += (targetX - smooth.current.x) * 0.08;
        smooth.current.y += (targetY - smooth.current.y) * 0.08;
      }

      const cursor = smooth.current;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // 1. Draw soil strata topographic lines (Base Layer)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
      ctx.lineWidth = 1;
      const numStrata = 6;
      for (let i = 0; i < numStrata; i++) {
        ctx.beginPath();
        const yBase = (height / (numStrata + 1)) * (i + 1);
        for (let x = 0; x <= width; x += 15) {
          const wave = Math.sin(x * 0.01 + yBase * 0.02) * 20;
          const y = yBase + wave;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 2. Draw Spotlight flashlight beam tint ( cyan-700 glow )
      const spotlightGrad = ctx.createRadialGradient(
        cursor.x,
        cursor.y,
        0,
        cursor.x,
        cursor.y,
        SPOTLIGHT_R
      );
      spotlightGrad.addColorStop(0, "rgba(14, 116, 144, 0.45)");
      spotlightGrad.addColorStop(0.6, "rgba(14, 116, 144, 0.18)");
      spotlightGrad.addColorStop(1, "rgba(14, 116, 144, 0)");
      ctx.fillStyle = spotlightGrad;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Telemetry Blueprint Network (Clipped to spotlight)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.clip();

      // Cyan grid (brighter)
      const gridGrad = ctx.createRadialGradient(
        cursor.x,
        cursor.y,
        0,
        cursor.x,
        cursor.y,
        SPOTLIGHT_R
      );
      gridGrad.addColorStop(0, "rgba(34, 211, 238, 0.45)");
      gridGrad.addColorStop(0.7, "rgba(34, 211, 238, 0.2)");
      gridGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.strokeStyle = gridGrad;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Connections / Pipeline networks (brighter & slightly thicker)
      BENTO_CONNECTIONS.forEach(([i1, i2]) => {
        const n1 = BENTO_NODES[i1];
        const n2 = BENTO_NODES[i2];
        const x1 = n1.x * width;
        const y1 = n1.y * height;
        const x2 = n2.x * width;
        const y2 = n2.y * height;

        const d1 = Math.hypot(x1 - cursor.x, y1 - cursor.y);
        const d2 = Math.hypot(x2 - cursor.x, y2 - cursor.y);
        const avgD = (d1 + d2) / 2;
        const opacity = Math.max(0, 1 - avgD / SPOTLIGHT_R);

        if (opacity > 0) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.7})`;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Flow energy pulses along lines
          const tFlow = ((time * 0.0015) + (i1 * 0.2)) % 1;
          const fx = x1 + (x2 - x1) * tFlow;
          const fy = y1 + (y2 - y1) * tFlow;
          const fDist = Math.hypot(fx - cursor.x, fy - cursor.y);
          const flowOpacity = Math.max(0, 1 - fDist / SPOTLIGHT_R);

          if (flowOpacity > 0) {
            ctx.fillStyle = `rgba(34, 211, 238, ${flowOpacity * 0.95})`;
            ctx.beginPath();
            ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Nodes & Telemetry labels (brighter core/rings & text)
      BENTO_NODES.forEach((node, i) => {
        const nx = node.x * width;
        const ny = node.y * height;
        const dist = Math.hypot(nx - cursor.x, ny - cursor.y);
        const opacity = Math.max(0, 1 - dist / SPOTLIGHT_R);

        if (opacity > 0) {
          const pulse = Math.sin(time * 0.005 + i) * 2;

          ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.65})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(nx, ny, 6 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 1.0})`;
          ctx.beginPath();
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 1.0})`;
          ctx.font = "8px monospace";
          ctx.fillText(node.label, nx + 10, ny - 1);

          ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 0.95})`;
          ctx.fillText(node.val, nx + 10, ny + 7);
        }
      });

      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section id="about" className="relative w-full max-w-7xl mx-auto px-5 py-16 sm:px-8 lg:px-12">
      <div className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400 mb-3">Focus</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">Components of Life</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[270px]">
        {/* Card 1: Geotechnical Engineering (Bento Spotlight Reveal) */}
        <div
          ref={sectionRef}
          className="bento-card md:col-span-2 md:row-span-2 overflow-hidden relative group border border-transparent select-none cursor-pointer flex flex-col justify-end p-8"
        >
          {/* Procedural background canvas (replacing image layers) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-[23px] bg-[#090b0e]"
          />

          {/* Border glowing hover indicator */}
          <div className="absolute inset-0 border border-transparent group-hover:border-cyan-500/20 rounded-[23px] transition-all duration-300 pointer-events-none z-20" />

          {/* Text Content overlay */}
          <div className="relative z-30 max-w-lg mt-auto bg-[#08090b]/80 backdrop-blur-md p-5 rounded-2xl border border-white/5 pointer-events-none">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2 block">Interactive Laboratory</span>
            <h4 className="text-2xl font-bold text-white mb-2 leading-tight">Geotechnical Engineering</h4>
            <p className="text-sm text-slate-300">
              Hover over this card to activate the spotlight reveal. Move your cursor around to peer into the sub-strata blueprint analysis and compaction sensor networks.
            </p>
          </div>
        </div>

        {/* Card 2: Markets & Investing */}
        <div className="bento-card p-6 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
            <TrendingUp className="w-40 h-40 text-white" />
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">Markets & Portfolios</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Managing active equity portfolios and mutual funds with a rigorous approach to compounding.
            </p>
          </div>

          {/* SVG Animated Mini Trend-line */}
          <div className="h-14 w-full mt-4 flex items-end">
            <svg className="w-full h-full overflow-visible" fill="none">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                d="M 0 50 C 40 45, 60 15, 100 25 C 140 35, 180 5, 220 12 C 260 20, 300 0, 340 5"
                stroke="#a78bfa"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="340" cy="5" r="4.5" className="fill-violet-400 animate-ping" />
              <circle cx="340" cy="5" r="3.5" className="fill-violet-400" />
            </svg>
          </div>
        </div>

        {/* Card 3: Concrete Technology (New Professional Card) */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Concrete Technology</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Formulating sustainable concrete mix designs (IS 10262), fly ash/GGBS proportioning, and self-healing concrete research.
            </p>
          </div>

          {/* Minimal components bar visualization */}
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>MIX_RATIO (Binder/Agg)</span>
              <span className="text-cyan-400">IS 10262</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
              <div className="w-[30%] h-full bg-cyan-500" title="Cement" />
              <div className="w-[20%] h-full bg-cyan-400 opacity-85" title="Fly Ash / GGBS" />
              <div className="w-[40%] h-full bg-slate-600" title="Aggregates" />
              <div className="w-[10%] h-full bg-blue-500" title="Water" />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-600">
              <span>Cement/Ash (50%)</span>
              <span>Aggregate (40%)</span>
              <span>Water (10%)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Infrastructure Automation (New Professional Card) */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Infrastructure Automation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrating IoT sensor arrays, machine vision, and real-time telemetry on heavy construction machinery for intelligent compaction.
            </p>
          </div>

          {/* Pulsing signal status */}
          <div className="flex items-center gap-3 border border-white/5 bg-white/[0.01] p-2 rounded-xl">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between font-mono text-[9px] text-slate-400">
                <span>TELEMETRY_LINK</span>
                <span className="text-cyan-400">CONNECTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 5: Digital Media & Storytelling (Adjusted to span 2 columns) */}
        <div className="bento-card p-6 flex flex-col justify-between group overflow-hidden relative md:col-span-2">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
            <Video className="w-40 h-40 text-white" />
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Video className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">Digital Storytelling</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Clipping high-pace digital video, motion graphics, and rendering geotechnical structure walkthroughs for technical communication and project learning.
            </p>
          </div>

          <div className="flex gap-2 items-center text-xs font-medium text-amber-400 group-hover:underline mt-2">
            <span>Explore Logbook Media</span>
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
