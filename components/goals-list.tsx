"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  category: "short" | "long";
}

export function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "s1", text: "Complete Geotechnical Engineering Thesis Project", completed: false, category: "short" },
    { id: "s2", text: "Build Automated ZIP Ingestion Pipeline & Metadata Extractor", completed: true, category: "short" },
    { id: "s3", text: "Explore Generative AI & Automation workflows", completed: false, category: "short" },
    { id: "s4", text: "Maintain daily running discipline", completed: true, category: "short" },
    { id: "l1", text: "Design intelligent fiber-optic concrete stress sensors", completed: false, category: "long" },
    { id: "l2", text: "Deploy fully containerized personal operating system architecture", completed: false, category: "long" },
    { id: "l3", text: "Improve video editing pacing and sound design skills", completed: false, category: "long" }
  ]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  return (
    <section id="timeline" className="relative w-full max-w-7xl mx-auto px-5 py-16 sm:px-8 lg:px-12">
      <div className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-attention-400 mb-3">Milestones</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-[var(--foreground)] tracking-tight">Active Goals & Focus</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Short Term Goals */}
        <div className="bento-card p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-[var(--card-border)] pb-4">
              <h4 className="text-lg font-bold text-[var(--foreground)]">Short Term Targets</h4>
              <span className="text-xs font-mono text-[var(--muted)]">Active Horizon</span>
            </div>
            
            <div className="space-y-4">
              {goals.filter(g => g.category === "short").map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="flex items-start gap-4 text-left w-full group py-1.5 focus:outline-none"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-attention-400 transition-transform group-hover:scale-110" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--muted)] group-hover:text-attention-400 transition-transform group-hover:scale-110" />
                    )}
                  </div>
                  <span 
                    className={`text-sm leading-relaxed transition-all ${
                      goal.completed 
                        ? "text-[var(--muted)] line-through decoration-[var(--card-border)]" 
                        : "text-[var(--foreground)] group-hover:text-attention-400"
                    }`}
                  >
                    {goal.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Long Term Goals */}
        <div className="bento-card p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-[var(--card-border)] pb-4">
              <h4 className="text-lg font-bold text-[var(--foreground)]">Long Term Vision</h4>
              <span className="text-xs font-mono text-[var(--muted)]">Strategic Aspiration</span>
            </div>
            
            <div className="space-y-4">
              {goals.filter(g => g.category === "long").map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className="flex items-start gap-4 text-left w-full group py-1.5 focus:outline-none"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-attention-400 transition-transform group-hover:scale-110" />
                    ) : (
                      <Circle className="w-5 h-5 text-[var(--muted)] group-hover:text-attention-400 transition-transform group-hover:scale-110" />
                    )}
                  </div>
                  <span 
                    className={`text-sm leading-relaxed transition-all ${
                      goal.completed 
                        ? "text-[var(--muted)] line-through decoration-[var(--card-border)]" 
                        : "text-[var(--foreground)] group-hover:text-attention-400"
                    }`}
                  >
                    {goal.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
