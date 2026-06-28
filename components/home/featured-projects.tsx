"use client";

import { Project } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollReveal, ScrollRevealStagger, RevealItem } from "@/components/ui/scroll-reveal";
import { hoverLift } from "@/lib/motion";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12">
      <ScrollReveal variant="fadeUp" className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">Portfolio Intelligence</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Featured Projects</h3>
      </ScrollReveal>

      <ScrollRevealStagger stagger={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </section>
  );
}
