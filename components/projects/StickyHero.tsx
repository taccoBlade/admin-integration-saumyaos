"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Project } from "@/lib/types";

export function StickyHero({ project }: { project: Project }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Fade out hero content as user scrolls down
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div ref={containerRef} className="relative h-[120vh] w-full">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-end pb-24 px-5 sm:px-8 lg:px-12 z-10">
        <motion.div style={{ opacity, y, scale }} className="max-w-6xl mx-auto w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group text-sm font-mono text-slate-400 hover:text-[var(--project-accent)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portfolio</span>
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap gap-2.5 mb-5">
            <span className="text-[10px] font-bold font-mono px-3 py-1 bg-[var(--project-accent)]/10 border border-[var(--project-accent)]/20 text-[var(--project-accent)] rounded-md">
              {project.domain}
            </span>
            <span className="text-[10px] font-bold font-mono px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-md">
              {project.year}
            </span>
            <span className="text-[10px] font-bold font-mono px-3 py-1 bg-[var(--project-accent)]/10 border border-[var(--project-accent)]/20 text-[var(--project-accent)] rounded-md">
              {project.status.toUpperCase()}
            </span>
            {project.duration && (
              <span className="text-[10px] font-mono px-3 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-md flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {project.duration}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-5xl">
            {project.title}
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
