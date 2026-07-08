"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const ComputationalCanvas = dynamic(
  () => import("./computational-canvas").then((m) => ({ default: m.ComputationalCanvas })),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#08090b]" /> }
);

interface InteractiveHeroProps {
  title?: string;
  tagline?: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  cta_text?: string;
  cta_url?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
}

export function InteractiveHero({
  title = "Saumya Parekh",
  tagline = "Civil Engineering & Infrastructure Systems",
  subtitle = "Computational Infrastructure Engineer",
  description = "Building intelligent infrastructure systems through civil engineering, data analysis, automation, and computational design. Specializing in concrete mix proportioning compliance and geotechnical site telemetry.",
  cover_image = "",
  cta_text = "View Projects",
  cta_url = "#projects",
  secondary_cta_text = "Resume",
  secondary_cta_url = "/saumya-resume.pdf",
}: InteractiveHeroProps) {
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

  const nameWords = title.split(" ");

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden h-screen animate-fade-in"
      style={{ height: "100dvh" }}
    >
      {/* ── 3D CANVAS BACKGROUND OR COVER IMAGE ── */}
      {cover_image ? (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src={cover_image}
            alt={title}
            fill
            sizes="100vw"
            priority
            className="object-cover pointer-events-none"
          />
        </div>
      ) : (
        isDesktop && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <ComputationalCanvas />
          </div>
        )
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
          <span className="animate-hero-tag text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-attention-500 mb-4 block">
            {tagline}
          </span>

          {/* Headline */}
          <h1 className="animate-hero-title no-dossier-reveal text-white font-bigger-scape text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] leading-[0.95] mb-5 font-normal tracking-wide uppercase">
            <span className="block text-white">
              {nameWords.map((word, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && " "}
                  <span className="inline-block">
                    <span className="text-attention-500">{word.charAt(0)}</span>
                    {word.slice(1)}
                  </span>
                </React.Fragment>
              ))}
            </span>
          </h1>

          <span className="animate-hero-subtitle block text-slate-300 font-mono text-[11px] sm:text-xs lg:text-sm tracking-[0.25em] uppercase mb-6">
            {subtitle}
          </span>

          {/* Subheading */}
          <p className="animate-hero-paragraph text-slate-300 font-cormorant italic text-lg sm:text-xl md:text-2xl leading-relaxed max-w-lg mb-8 pointer-events-auto font-light">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="animate-hero-ctas flex flex-wrap gap-4 pointer-events-auto">
            {cta_text && cta_url && (
              cta_url.startsWith("#") ? (
                <button
                  onClick={() => scrollToSection(cta_url.slice(1))}
                  className="bg-white text-gray-900 text-xs sm:text-sm font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-full hover:bg-gray-100 hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  {cta_text}
                </button>
              ) : (
                <a
                  href={cta_url}
                  className="flex items-center justify-center bg-white text-gray-900 text-xs sm:text-sm font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-full hover:bg-gray-100 hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer animate-fade-in"
                >
                  {cta_text}
                </a>
              )
            )}
            {secondary_cta_text && secondary_cta_url && (
              <a
                href={secondary_cta_url}
                target={secondary_cta_url.startsWith("http") || secondary_cta_url.endsWith(".pdf") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-center bg-transparent border border-white/20 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-full hover:bg-white/10 hover:border-white/40 hover:scale-[1.03] active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                {secondary_cta_text}
              </a>
            )}
          </div>
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
