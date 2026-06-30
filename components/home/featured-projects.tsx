"use client";

import { Project } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal, ScrollRevealStagger, RevealItem } from "@/components/ui/scroll-reveal";
import { hoverLift } from "@/lib/motion";
import { DashboardEmbed } from "@/components/projects/dashboard-embed";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12">
      <ScrollReveal variant="fadeUp" className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">Portfolio Intelligence</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Featured Projects</h3>
      </ScrollReveal>

      <ScrollRevealStagger stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <RevealItem key={project.id}>
            <Link href={`/projects/terminal-vault?project=${project.id}`} className="block group h-full">
              <motion.div
                variants={hoverLift}
                initial="rest"
                whileHover="hover"
                className="relative flex items-center justify-between p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] group-hover:border-attention-500/30 group-hover:bg-white/[0.04] transition-colors overflow-hidden cursor-pointer h-full"
              >
                {/* Blueprint grid effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(rgba(212, 175, 55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212, 175, 55,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-1 pr-4">
                  <span className="text-xs font-mono text-attention-400">{project.year} // {project.domain}</span>
                  <h4 className="text-lg font-semibold text-white group-hover:text-attention-400 transition-colors">{project.title}</h4>
                </div>
                
                <div className="relative z-10 shrink-0 text-[10px] sm:text-xs font-mono text-neutral-500 group-hover:text-attention-400 transition-colors flex items-center gap-2 uppercase tracking-wider">
                  Launch Console &rarr;
                </div>
              </motion.div>
            </Link>
          </RevealItem>
        ))}
      </ScrollRevealStagger>
    </section>
  );
}
