"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ComputationalCanvas = dynamic(
  () => import("./computational-canvas").then((m) => ({ default: m.ComputationalCanvas })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#08090b]" /> }
);

export function InteractiveHero() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden h-screen"
      style={{ height: "100dvh" }}
    >
      {/* ── 3D CANVAS BACKGROUND ── */}
      {isDesktop && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ComputationalCanvas />
        </div>
      )}

      {/* ── Vignette overlays for text readability ── */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#08090b] via-[#08090b]/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#08090b]/60 via-transparent to-transparent pointer-events-none" />
      {/* Left-side darkening — reveals 3D on the right, keeps text crisp on the left */}
      <div
        className="hidden md:block absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, #08090b 12%, rgba(8,9,11,0.75) 35%, rgba(8,9,11,0.15) 60%, transparent 80%)",
        }}
      />
      {/* Mobile-specific overlay to ensure text is legible against the mesh */}
      <div className="block md:hidden absolute inset-0 z-20 pointer-events-none bg-[#08090b]/50 backdrop-blur-[3px]" />


      {/* ── CONTENT OVERLAY ── */}
      <div className="absolute inset-0 flex flex-col md:flex-row items-center px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto w-full h-[100vh] pointer-events-none z-30 select-none">
        {/* Left Column (Content) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start mt-20 md:mt-0">
          {/* Tag */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-attention-500 mb-4 block"
          >
            Civil Engineering &amp; Infrastructure Systems
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="no-dossier-reveal text-white font-bigger-scape text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-[0.95] mb-5 font-normal tracking-wide uppercase"
          >
            <span className="block text-white">
              <span className="text-attention-500">S</span>aumya{" "}
              <span className="text-attention-500">P</span>arekh
            </span>
          </motion.h1>



          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="block text-slate-300 font-mono text-[11px] sm:text-xs lg:text-sm tracking-[0.25em] uppercase mb-6"
          >
            Computational Infrastructure Engineer
          </motion.span>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-slate-300 font-cormorant italic text-lg sm:text-xl md:text-2xl leading-relaxed max-w-lg mb-8 pointer-events-auto font-light"
          >
            Building intelligent infrastructure systems through civil
            engineering, data analysis, automation, and computational design.
            Specializing in concrete mix proportioning compliance and
            geotechnical site telemetry.
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
              className="bg-white text-gray-900 text-xs sm:text-sm font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-full hover:bg-gray-100 hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              View Projects
            </button>
            <a
              href="/saumya-resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-transparent border border-white/20 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-full hover:bg-white/10 hover:border-white/40 hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Resume
            </a>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="hidden md:flex absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-mono">
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
