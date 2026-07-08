"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxSection({
  children,
  title,
  subtitle,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], ["10px", "0px", "0px", "10px"]);

  return (
    <section ref={ref} className={`relative min-h-[70vh] py-24 flex items-center ${className}`}>
      <motion.div
        style={{ y, opacity, filter: blur }}
        className="max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-12 relative z-10"
      >
        <div className="mb-12">
          {subtitle && (
            <h3 className="text-[var(--project-accent)] font-mono text-sm font-bold uppercase tracking-widest mb-3">
              {subtitle}
            </h3>
          )}
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            {title}
          </h2>
        </div>
        <div className="prose prose-invert prose-lg max-w-4xl text-slate-300 leading-relaxed">
          {children}
        </div>
      </motion.div>
    </section>
  );
}
