"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function AmbientEnvironment({
  noiseIntensity = 0.015,
  glowIntensity = 0.1,
  motionPersonality = "smooth",
}: {
  noiseIntensity?: number;
  glowIntensity?: number;
  motionPersonality?: "smooth" | "mechanical" | "snappy";
}) {
  const { scrollYProgress } = useScroll();
  
  // Subtle background shift based on scroll
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Noise */}
      <div 
        className="absolute inset-0 opacity-[var(--noise-opacity)] mix-blend-overlay"
        style={{
          "--noise-opacity": noiseIntensity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        } as React.CSSProperties}
      />
      
      {/* Blueprint/Grid for Mechanical */}
      {motionPersonality === "mechanical" && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      )}

      {/* Floating Glows */}
      <motion.div
        style={{ y: backgroundY, opacity: glowIntensity }}
        className="absolute top-0 left-[20%] w-[60vw] h-[60vw] rounded-full bg-[var(--project-accent)] blur-[120px] mix-blend-screen transition-opacity duration-1000"
      />
    </div>
  );
}
