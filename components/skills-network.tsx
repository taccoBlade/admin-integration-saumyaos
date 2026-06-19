"use client";

import { Skill } from "@/lib/types";
import { motion } from "framer-motion";

export function SkillsNetwork({ skills }: { skills: Skill[] }) {

  return (
    <section id="research" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 overflow-hidden">
      <div className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400 mb-3">Intelligence Graph</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Skills Network</h3>
      </div>

      <div className="relative w-full min-h-[350px] md:h-[450px] border border-white/10 rounded-3xl bg-[#08090b]/50 backdrop-blur-sm overflow-hidden flex flex-wrap gap-2.5 sm:gap-4 p-6 sm:p-8 items-center justify-center pb-16">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        
        {skills.map((skill, index) => {
          let colorClass = "border-neutral-500/40 bg-neutral-500/10 text-neutral-300 hover:bg-neutral-500/20 hover:border-neutral-500/60";
          if (skill.category === "Engineering") {
            colorClass = "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/60";
          } else if (skill.category === "Technology") {
            colorClass = "border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/60";
          } else if (skill.category === "Markets") {
            colorClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/60";
          } else if (skill.category === "Creative") {
            colorClass = "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60";
          }

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`relative cursor-pointer flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border backdrop-blur-md transition-colors ${colorClass}`}
              style={{
                fontSize: `calc(${Math.max(0.72, skill.strength * 0.1)}rem + 0.1vw)`,
              }}
            >
              {skill.name}
            </motion.div>
          );
        })}

        {/* Overlay instructions */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>{skills.length} Nodes</span>
          <span>Hover to isolate</span>
        </div>
      </div>
    </section>
  );
}
