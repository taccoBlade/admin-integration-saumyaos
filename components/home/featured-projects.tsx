"use client";

import { Project } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal, ScrollRevealStagger, RevealItem } from "@/components/ui/scroll-reveal";
import { hoverLift } from "@/lib/motion";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12">
      
      {/* Featured Projects Segment */}
      <ScrollReveal variant="fadeUp" className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">Portfolio Intelligence</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Featured Projects</h3>
      </ScrollReveal>

      <ScrollRevealStagger stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {projects.map((project) => (
          <RevealItem key={project.id}>
            <Link href={`/projects/${project.id}`} className="block group h-full">
              <motion.div
                variants={hoverLift}
                initial="rest"
                whileHover="hover"
                className="relative flex flex-col h-full p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] group-hover:border-attention-500/30 group-hover:bg-white/[0.05] transition-colors overflow-hidden cursor-pointer"
              >
                {/* Blueprint grid effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(rgba(212, 175, 55,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212, 175, 55,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono text-attention-400">{project.year}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded text-slate-300 border border-white/10">
                      {project.domain}
                    </span>
                  </div>

                  <h4 className="text-xl font-semibold text-white group-hover:text-attention-400 transition-colors mb-3">{project.title}</h4>
                  <p className="text-sm text-slate-400 mb-6 flex-grow">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.technologies.slice(0, 4).map(tech => (
                      <span key={tech} className="text-[10px] font-mono text-slate-300 px-2 py-1 bg-black/40 rounded border border-white/5">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-1">+{project.technologies.length - 4}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </Link>
          </RevealItem>
        ))}
      </ScrollRevealStagger>

      {/* Live Terminal Vault Segment */}
      <ScrollReveal variant="fadeUp" className="mb-10">
        <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Interactive Consoles</h3>
        <p className="text-slate-400 mt-3 text-sm max-w-2xl">Access the live simulation consoles and telemetry dashboards for selected projects.</p>
      </ScrollReveal>

      <ScrollRevealStagger stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <RevealItem key={`vault-${project.id}`}>
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
                  <span className="text-xs font-mono text-attention-400">{project.year} {"//"} {project.domain}</span>
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
