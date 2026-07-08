"use client";

import React, { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import { motion } from "framer-motion";

export function ProjectThemeProvider({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const id = project.identity;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!id) return <>{children}</>;

  const typographyMap = {
    sans: "var(--font-sans)",
    serif: "var(--font-serif, ui-serif, Georgia, serif)",
    mono: "var(--font-mono)",
  };

  const style = {
    "--project-accent": id.accent,
    "--project-bg": id.background,
    "--project-surface": id.surface,
    "--project-font": typographyMap[id.typography] || typographyMap.sans,
    "--project-radius": id.radius,
    "--project-glow": id.glowIntensity,
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: id.motionPersonality === "snappy" ? 0.3 : id.motionPersonality === "mechanical" ? 0.8 : 0.6 }}
      style={style}
      className={`min-h-screen transition-colors duration-1000 bg-[var(--project-bg)] text-white font-[var(--project-font)]`}
    >
      {children}
    </motion.div>
  );
}
