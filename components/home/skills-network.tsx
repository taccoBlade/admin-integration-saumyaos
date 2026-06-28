"use client";

import { Skill, Project } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Helper to resolve associated projects for a skill
const getAssociatedProjects = (skill: Skill, allProjects: Project[]) => {
  const matched = allProjects.filter(p => skill.relatedProjects.includes(p.id));
  if (matched.length > 0) return matched;
  
  // Fallback keyword search
  return allProjects.filter(p => {
    const text = `${p.title} ${p.description} ${p.domain}`.toLowerCase();
    return text.includes(skill.name.toLowerCase());
  }).slice(0, 3);
};

// Helper to resolve related skills
const getRelatedSkills = (targetSkill: Skill, allSkills: Skill[]) => {
  const customRelated: Record<string, string[]> = {
    "civil engineering": ["Concrete Technology", "Surveying", "Intelligent Compaction"],
    "qgis and drone mapping": ["Surveying", "Data Interpretation", "Civil Engineering"],
    "concrete technology": ["Concrete Mix Design", "Construction Materials", "Research & Development"],
    "concrete mix design": ["Concrete Technology", "Construction Materials", "Problem Solving"],
    "construction materials": ["Concrete Technology", "Concrete Mix Design", "Civil Engineering"],
    "surveying": ["Qgis and drone mapping", "Engineering Drawing", "Civil Engineering"],
    "engineering drawing": ["Surveying", "Civil Engineering", "Qgis and drone mapping"],
    "research & development": ["Problem Solving", "Data Interpretation", "Technical Documentation"],
    "technical documentation": ["Research & Development", "Content Creation", "Problem Solving"],
    "data interpretation": ["Research & Development", "Problem Solving", "Qgis and drone mapping"],
    "problem solving": ["Research & Development", "Data Interpretation", "Civil Engineering"],
    "intelligent compaction": ["Civil Engineering", "Concrete Technology", "Data Interpretation"],
    "video editing": ["Photography", "Content Creation", "Technical Documentation"],
    "photography": ["Video Editing", "Content Creation", "Technical Documentation"],
    "content creation": ["Video Editing", "Photography", "Technical Documentation"]
  };

  const nameLower = targetSkill.name.toLowerCase();
  if (customRelated[nameLower]) {
    return customRelated[nameLower];
  }

  return allSkills
    .filter(s => s.id !== targetSkill.id && s.category === targetSkill.category)
    .slice(0, 3)
    .map(s => s.name);
};

export function SkillsNetwork({ skills, projects }: { skills: Skill[]; projects: Project[] }) {
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);

  // Group skills by category
  const categories = ["Core Engineering", "Technical Tools", "Programming", "Creative"];

  return (
    <section id="research" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 overflow-hidden">
      <div className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">Intelligence Graph</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Skills Network</h3>
      </div>

      <div className="relative w-full border border-white/10 rounded-3xl bg-[#08090b]/50 backdrop-blur-sm flex flex-col gap-8 p-6 sm:p-8 items-center pt-10 pb-40 md:pb-32">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212, 175, 55, 0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />
        
        <div className="w-full max-w-5xl flex flex-col gap-12 z-10">
          {categories.map((category) => {
            const categorySkills = skills.filter(s => s.category === category);
            if (categorySkills.length === 0) return null;

            return (
              <div key={category} className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 whitespace-nowrap">
                    [ {category} ]
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
                  {categorySkills.map((skill) => {
                    const isSelected = hoveredSkill ? hoveredSkill.id === skill.id : true;
                    const isHovered = hoveredSkill?.id === skill.id;
                    
                    const colorClass = "border-attention-500/40 bg-attention-500/10 text-attention-300 hover:bg-attention-500/20 hover:border-attention-500/60";

                    return (
                      <motion.div
                        key={skill.id}
                        onMouseEnter={() => setHoveredSkill(skill)}
                        onMouseLeave={() => setHoveredSkill(null)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: isSelected ? 1 : 0.2, scale: isHovered ? 1.05 : (isSelected ? 1 : 0.95) }}
                        animate={{ opacity: isSelected ? 1 : 0.2, scale: isHovered ? 1.05 : (isSelected ? 1 : 0.95) }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.25 }}
                        className={`relative cursor-pointer flex items-center px-4 py-2 sm:px-6 sm:py-3 rounded-full border backdrop-blur-md transition-colors ${colorClass}`}
                        style={{
                          zIndex: isHovered ? 20 : 10,
                          fontSize: `calc(${Math.max(0.72, skill.strength * 0.1)}rem + 0.1vw)`,
                        }}
                      >
                        {skill.name}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic HUD / Detail Card */}
        <AnimatePresence mode="wait">
          {hoveredSkill ? (
            <motion.div
              key={hoveredSkill.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 bg-neutral-950/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 z-30 shadow-2xl"
            >
              {/* Left Side: Skill Name and Category */}
              <div className="space-y-1 shrink-0 md:max-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-attention-400" />
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">{hoveredSkill.category}</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-tight">{hoveredSkill.name}</h4>
              </div>

              {/* Middle: Evidence (Projects) */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">System Evidence</span>
                <div className="space-y-1">
                  {getAssociatedProjects(hoveredSkill, projects).length > 0 ? (
                    getAssociatedProjects(hoveredSkill, projects).map((proj, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-attention-400 font-mono text-[9px]">[✓]</span>
                        <span className="truncate">{proj.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 italic">Academic & industry coursework</div>
                  )}
                </div>
              </div>

              {/* Right: Related Skills */}
              <div className="space-y-1.5 shrink-0 md:max-w-[240px]">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Related Nodes</span>
                <div className="flex flex-wrap gap-1.5">
                  {getRelatedSkills(hoveredSkill, skills).map((relName, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded">
                      {relName}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs text-slate-500 font-mono pointer-events-none">
              <span>{skills.length} Nodes</span>
              <span>Hover or tap a node to inspect system evidence</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
