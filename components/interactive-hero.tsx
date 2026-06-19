"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const SPOTLIGHT_R = 250;

const NODES = [
  { x: 0.15, y: 0.25, label: "GEOTECH_SENS_01", val: "4.8 kPa" },
  { x: 0.28, y: 0.42, label: "STRUCT_PIER_04", val: "220 kN" },
  { x: 0.35, y: 0.18, label: "INFRA_NODE_10", val: "94.2%" },
  { x: 0.45, y: 0.68, label: "SYS_BRIDGE_A", val: "ACTIVE" },
  { x: 0.52, y: 0.32, label: "GEOTECH_BORE_02", val: "STABLE" },
  { x: 0.68, y: 0.82, label: "INFRA_VALVE_08", val: "OK" },
  { x: 0.74, y: 0.22, label: "STRUCT_TRUSS_12", val: "0.08 strain" },
  { x: 0.88, y: 0.52, label: "DATA_CORE_LINK", val: "10.4 Gbps" },
  { x: 0.92, y: 0.18, label: "SENS_PIEZO_07", val: "12.4 m" },
  { x: 0.22, y: 0.78, label: "COMPACTION_SYS_3", val: "98.4%" },
  { x: 0.78, y: 0.62, label: "ANALYTIC_ENG_09", val: "CALIBRATED" },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [1, 2], [1, 3], [1, 9], [2, 4], [3, 4], [3, 9],
  [4, 7], [4, 10], [5, 10], [6, 7], [6, 8], [7, 8], [7, 10]
];

export function InteractiveHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const timeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Resize canvas to cover viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouse.current = { x, y };
      }
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -999, y: -999 };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (rect && e.touches.length > 0) {
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        mouse.current = { x, y };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      timeRef.current += 16.67; // approx 60fps increment
      const time = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Handle spotlight positioning with damping
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;

      if (mouse.current.x === -999) {
        // Idle ambient orbit when mouse is off-screen
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.2;
        targetX = centerX + Math.sin(time * 0.001) * radius;
        targetY = centerY + Math.cos(time * 0.0007) * radius;
      }

      if (smooth.current.x === -999) {
        smooth.current = { x: targetX, y: targetY };
      } else {
        smooth.current.x += (targetX - smooth.current.x) * 0.08;
        smooth.current.y += (targetY - smooth.current.y) * 0.08;
      }

      const cursor = smooth.current;

      // 1. Draw Background
      ctx.fillStyle = "#080a0d";
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Terrain / Topographic Contours (Base Layer)
      ctx.strokeStyle = "rgba(100, 116, 139, 0.04)";
      ctx.lineWidth = 1;
      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        ctx.beginPath();
        const yBase = (height / (numLines + 1)) * (i + 1);
        for (let x = 0; x <= width; x += 20) {
          const wave1 = Math.sin(x * 0.0035 + yBase * 0.006) * 50;
          const wave2 = Math.cos(x * 0.0075 - yBase * 0.003) * 15;
          const y = yBase + wave1 + wave2;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw faint terrain mesh grid points
      ctx.fillStyle = "rgba(148, 163, 184, 0.02)";
      for (let x = 30; x < width; x += 60) {
        for (let y = 30; y < height; y += 60) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // 3. Draw Spotlight glow mask
      const spotlightGrad = ctx.createRadialGradient(
        cursor.x,
        cursor.y,
        0,
        cursor.x,
        cursor.y,
        SPOTLIGHT_R
      );
      spotlightGrad.addColorStop(0, "rgba(14, 116, 144, 0.35)"); // cyan-700 glow
      spotlightGrad.addColorStop(0.5, "rgba(14, 116, 144, 0.15)");
      spotlightGrad.addColorStop(1, "rgba(14, 116, 144, 0)");
      ctx.fillStyle = spotlightGrad;
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Infrastructure Blueprint (Clipped Reveal Layer)
      ctx.save();
      // Masking region
      ctx.beginPath();
      ctx.arc(cursor.x, cursor.y, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.clip();

      // Cyan Blueprint Grid lines
      const gridGrad = ctx.createRadialGradient(
        cursor.x,
        cursor.y,
        0,
        cursor.x,
        cursor.y,
        SPOTLIGHT_R
      );
      gridGrad.addColorStop(0, "rgba(34, 211, 238, 0.35)"); // cyan-400
      gridGrad.addColorStop(0.6, "rgba(34, 211, 238, 0.15)");
      gridGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.strokeStyle = gridGrad;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Connections / Pipelines
      CONNECTIONS.forEach(([i1, i2]) => {
        const n1 = NODES[i1];
        const n2 = NODES[i2];
        const x1 = n1.x * width;
        const y1 = n1.y * height;
        const x2 = n2.x * width;
        const y2 = n2.y * height;

        const d1 = Math.hypot(x1 - cursor.x, y1 - cursor.y);
        const d2 = Math.hypot(x2 - cursor.x, y2 - cursor.y);
        const avgD = (d1 + d2) / 2;
        const opacity = Math.max(0, 1 - avgD / SPOTLIGHT_R);

        if (opacity > 0) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.65})`;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Flow pulses along the infrastructure pipelines
          const tFlow = ((time * 0.001) + (i1 * 0.1)) % 1;
          const fx = x1 + (x2 - x1) * tFlow;
          const fy = y1 + (y2 - y1) * tFlow;
          const fDist = Math.hypot(fx - cursor.x, fy - cursor.y);
          const flowOpacity = Math.max(0, 1 - fDist / SPOTLIGHT_R);

          if (flowOpacity > 0) {
            ctx.fillStyle = `rgba(34, 211, 238, ${flowOpacity * 0.95})`;
            ctx.beginPath();
            ctx.arc(fx, fy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Nodes & Labels
      NODES.forEach((node, i) => {
        const nx = node.x * width;
        const ny = node.y * height;
        const dist = Math.hypot(nx - cursor.x, ny - cursor.y);
        const opacity = Math.max(0, 1 - dist / SPOTLIGHT_R);

        if (opacity > 0) {
          // Pulse effect
          const pulse = Math.sin(time * 0.004 + i) * 3;

          // Connecting ring
          ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.65})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(nx, ny, 8 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // Node core
          ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 1.0})`;
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Label info
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 1.0})`;
          ctx.font = "8.5px monospace";
          ctx.fillText(`${node.label}`, nx + 12, ny - 2);

          ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 0.95})`;
          ctx.fillText(`VAL: ${node.val}`, nx + 12, ny + 7);
        }
      });

      ctx.restore();

      // 5. Draw light-beam cursor ring
      if (mouse.current.x !== -999) {
        ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cursor.x, cursor.y, SPOTLIGHT_R, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden h-screen"
      style={{ height: "100dvh" }}
    >
      {/* Background Vector Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 bg-[#080A0D]"
      />

      {/* Vignette Gradients */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#080A0D] via-[#080A0D]/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#080A0D]/50 via-transparent to-transparent pointer-events-none" />

      {/* CONTENT OVERLAY */}
      <div className="absolute inset-0 flex flex-col justify-end items-start px-6 sm:px-12 lg:px-20 pb-16 sm:pb-24 max-w-7xl mx-auto w-full h-[100vh] pointer-events-none z-30 select-none">
        {/* Tag */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-4 block"
        >
          Portfolio Operating System
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white font-semibold tracking-tight text-3xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.04] mb-6"
        >
          <span className="block font-playfair italic font-normal text-cyan-400">
            Engineering systems.
          </span>
          <span className="block font-sans font-bold text-white">
            Building infrastructure.
          </span>
          <span className="block font-playfair italic font-normal text-slate-400">
            Studying complexity.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-slate-400 text-sm sm:text-[15px] leading-relaxed max-w-2xl mb-10 pointer-events-auto"
        >
          Civil Engineering student focused on geotechnical systems,
          infrastructure innovation, portfolio management, and digital
          storytelling. Currently exploring how engineering, data, and human
          decision-making intersect.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap gap-4 pointer-events-auto"
        >
          <button
            onClick={() => scrollToSection("projects")}
            className="bg-white text-gray-900 text-sm font-semibold px-8 py-3 rounded-full hover:bg-gray-100 hover:scale-[1.03] active:scale-95 transition-all shadow-lg"
          >
            View Projects
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="bg-white/5 backdrop-blur-md border border-white/10 text-white text-sm font-semibold px-8 py-3 rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
          >
            About Me
          </button>
        </motion.div>

        {/* Metrics/Anchors Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="pointer-events-auto mt-8 sm:mt-12 w-full sm:max-w-xl border border-white/5 bg-white/[0.02] backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-glass"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-6 text-slate-400 font-mono text-[9px] sm:text-[10px] tracking-wider uppercase">
            
            <div className="flex items-center gap-2 px-3 py-1 justify-center sm:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-white font-semibold text-[10px]">
                NHAI Innovation Project
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 px-3 py-1 justify-center sm:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span className="text-white font-semibold text-[10px]">
                Civil Engineering @ PDEU
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 px-3 py-1 justify-center sm:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
              <span className="text-white font-semibold text-[10px]">
                Infrastructure Systems
              </span>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-mono">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
