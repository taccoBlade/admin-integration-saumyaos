"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArchitectureVisualizer, TreeNode } from "@/components/home/architecture-visualizer";

export function ArchitectureReveal({ tree }: { tree: TreeNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  return (
    <div ref={containerRef} className="w-full py-24">
      <motion.div 
        style={{ scale, opacity }}
        className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12"
      >
        <div className="bg-[var(--project-surface)] rounded-[var(--project-radius)] border border-white/5 p-8 sm:p-12 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--project-accent)]/10 to-transparent pointer-events-none mix-blend-screen" />
          
          <div className="mb-12 relative z-10">
            <h3 className="text-[var(--project-accent)] font-mono text-sm font-bold uppercase tracking-widest mb-2">
              System Design
            </h3>
            <h2 className="text-2xl sm:text-4xl font-bold text-white">
              Architecture Overview
            </h2>
          </div>

          <div className="relative z-10 min-h-[400px]">
            <ArchitectureVisualizer tree={tree} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
