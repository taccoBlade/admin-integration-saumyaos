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

      <div className="relative w-full h-[400px] border border-white/10 rounded-3xl bg-[#08090b]/50 backdrop-blur-sm overflow-hidden flex flex-wrap gap-4 p-8 content-center justify-center">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
        
        {skills.map((skill, index) => {
          const isEngineering = skill.category === "Engineering";
          const isTech = skill.category === "Technology";
          const colorClass = isEngineering 
            ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" 
            : isTech 
              ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300";

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`relative cursor-pointer flex items-center px-4 py-2 rounded-full border backdrop-blur-md transition-colors hover:bg-white/10 ${colorClass}`}
              style={{
                fontSize: `${Math.max(0.8, skill.strength * 0.12)}rem`,
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
