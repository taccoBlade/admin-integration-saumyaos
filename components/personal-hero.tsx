"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Word Cycling Data ─── */
const WORDS = ["Curious", "Driven", "Disciplined", "Creative", "Engineering-Minded"];
const CYCLE_INTERVAL = 3000; // ms

export function PersonalHero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, CYCLE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[340px] pt-32 pb-12 flex-col items-center justify-center px-4 text-center">
      {/* ── Subtle radial glow behind content ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[420px] w-[420px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* ── Main Heading ── */}
      <h1 className="relative z-10 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        <span className="bg-gradient-to-b from-neutral-800 via-white to-white bg-clip-text text-transparent">
          Hello again?
        </span>
        <br />
        <span className="bg-gradient-to-b from-neutral-800 via-white to-white bg-clip-text text-transparent">
          My nickname is
        </span>{" "}
        {/* ── SP Monogram Box ── */}
        <span className="relative mx-2 inline-flex items-center justify-center">
          <span className="relative inline-block rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-4 py-1 text-cyan-400 backdrop-blur-sm sm:px-5 sm:py-2">
            {/* Corner dots — pulsing */}
            <CornerDot position="top-left" />
            <CornerDot position="top-right" />
            <CornerDot position="bottom-left" />
            <CornerDot position="bottom-right" />
            sam
          </span>
        </span>
      </h1>

      {/* ── Animated Word Cycling ── */}
      <div className="relative z-10 mt-6 h-10 overflow-hidden sm:mt-8 sm:h-12">
        <AnimatePresence mode="wait">
          <motion.p
            key={WORDS[wordIndex]}
            initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -12 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-xl font-semibold tracking-wide text-cyan-400 sm:text-2xl md:text-3xl"
          >
            {WORDS[wordIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Corner Dot Component ─── */
function CornerDot({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const positionClasses: Record<string, string> = {
    "top-left": "-top-1 -left-1",
    "top-right": "-top-1 -right-1",
    "bottom-left": "-bottom-1 -left-1",
    "bottom-right": "-bottom-1 -right-1",
  };

  return (
    <span className={`absolute ${positionClasses[position]}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
      </span>
    </span>
  );
}
