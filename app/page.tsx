import { InteractiveHero } from "@/components/interactive-hero";
import { FeaturedProjects } from "@/components/featured-projects";
import { CareerTimeline } from "@/components/career-timeline";
import { SkillsNetwork } from "@/components/skills-network";
import { Contact } from "@/components/contact";
import { getProjects, getTimelineEvents, getSkills } from "@/lib/content";

export default function Home() {
  const projects = getProjects();
  const timelineEvents = getTimelineEvents();
  const skills = getSkills();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* 1. Full-screen Spotlight Reveal Hero */}
      <InteractiveHero />

      {/* 2. Featured Projects */}
      <FeaturedProjects projects={projects} />

      {/* 3. Engineering Philosophy Section */}
      <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400 mb-3">Core Mindset</h2>
            <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Engineering Philosophy</h3>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <p className="text-xl sm:text-2xl font-light text-slate-200 leading-relaxed max-w-3xl">
              I am interested in <span className="text-white font-medium">systems operating under constraints.</span>
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
              Whether analyzing soil beneath a foundation, designing a monitoring platform, or optimizing a concrete mixture, the challenge remains the same:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { num: "01", title: "Understand the system.", desc: "Model physical interactions and stress behavior with mathematical precision." },
                { num: "02", title: "Measure it accurately.", desc: "Integrate robust hardware sensors and telemetry to capture real-world data points." },
                { num: "03", title: "Improve its performance.", desc: "Optimize materials and algorithms to build resilient, sustainable infrastructure." }
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-cyan-500/20 transition-all group">
                  <span className="font-mono text-xs text-cyan-500 font-bold block mb-2">{item.num}</span>
                  <h4 className="text-white font-semibold text-sm mb-1.5">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Skills Network */}
      <SkillsNetwork skills={skills} projects={projects} />

      {/* 5. Current Research Directions Section */}
      <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400 mb-3">Future Outlook</h2>
            <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Current Research</h3>
          </div>
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {[
                { num: "01", title: "Infrastructure Monitoring (IoT integration)", desc: "Developing ESP32 and automated sensor matrices for real-time deflection, strain, and temperature tracking in structural components." },
                { num: "02", title: "Geotechnical Data Systems", desc: "Building pipelines and visualizers for borehole data and soil consolidation modeling to predict settlement profiles." }
              ].map((dir, idx) => (
                <div key={idx} className="flex gap-4 sm:gap-6 p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all items-start">
                  <span className="font-mono text-lg font-bold text-violet-400 tracking-tight">{dir.num}</span>
                  <div className="space-y-1">
                    <h4 className="text-white font-semibold text-base">{dir.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{dir.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Career Timeline */}
      <CareerTimeline events={timelineEvents} />

      {/* 7. Footer / Contact */}
      <Contact />
    </main>
  );
}
