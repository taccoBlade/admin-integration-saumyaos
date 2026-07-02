export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import { InteractiveHero } from "@/components/home/interactive-hero";
import { Contact } from "@/components/layout/contact";
import { ScrollReveal, ScrollRevealStagger, RevealItem } from "@/components/ui/scroll-reveal";

const FeaturedProjects = nextDynamic(() => import("@/components/home/featured-projects").then(mod => mod.FeaturedProjects));
const CareerTimeline = nextDynamic(() => import("@/components/home/career-timeline").then(mod => mod.CareerTimeline));
const SkillsNetwork = nextDynamic(() => import("@/components/home/skills-network").then(mod => mod.SkillsNetwork));
import { getProjects, getTimelineEvents, getSkills } from "@/lib/content";
import Link from "next/link";
import { BookOpen, Cpu, ArrowRight, HardHat, Code2, Plane, Eye, Wrench, Leaf } from "lucide-react";

import { InteractiveParticleBackground } from "@/components/ui/interactive-particle-background";

export default async function Home() {
  const [projects, timelineEvents, skills] = await Promise.all([
    getProjects(),
    getTimelineEvents(),
    getSkills(),
  ]);

  return (
    <main className="min-h-screen bg-transparent text-slate-200 selection:bg-attention-500/30 overflow-x-hidden relative">
      <InteractiveParticleBackground 
        showConstellations={false}
        disableLines={true}
        className="fixed inset-0 w-full h-full pointer-events-none z-[20] opacity-75"
      />




      {/* ── FOREGROUND CONTENT ── */}
      <div className="relative z-10">
        {/* 1. Engineering Identity & Hero Section (Transparent so 3D is fully visible) */}
        <InteractiveHero />

        {/* 2. Core Domain Expertise Section (Glassmorphism backdrop) */}
        <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5 bg-[#08090b] rounded-t-3xl mt-[-2rem]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <ScrollReveal variant="slideRight" className="lg:col-span-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">01 — Engineering Focus</h2>
              <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Core Domain Expertise</h3>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                Applying computational technologies, embedded systems, and intelligent automation to solve practical challenges in civil engineering.
              </p>
            </ScrollReveal>
            <ScrollRevealStagger stagger={0.12} delay={0.1} className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  icon: BookOpen,
                  title: "Concrete Engineering",
                  desc: "Standards-based concrete mix design, computational material analysis, and sustainable binder systems.",
                },
                {
                  icon: Cpu,
                  title: "Geotechnical Monitoring",
                  desc: "Real-time sensing, settlement monitoring, wireless telemetry, and engineering data visualization.",
                },
                {
                  icon: Cpu,
                  title: "Infrastructure Intelligence",
                  desc: "Construction automation, edge computing, sensor integration, and machine-guided engineering systems.",
                },
              ].map((item, idx) => (
                <RevealItem key={idx}>
                  <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-attention-500/20 hover:-translate-y-1 transition-all flex flex-col justify-between h-full backdrop-blur-sm">
                    <div>
                      <item.icon className="w-5 h-5 text-attention-400 mb-4" />
                      <h4 className="text-white font-semibold text-base mb-2">{item.title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </ScrollRevealStagger>
          </div>
        </section>

        {/* 3. Featured Projects Section (Glassmorphism backdrop) */}
        <div className="bg-[#08090b]">
          <FeaturedProjects projects={projects} />
        </div>

        {/* 4. Research & Academic Focus Section (Glassmorphism backdrop) */}
        <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5 bg-[#08090b]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <ScrollReveal variant="slideRight" className="lg:col-span-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">02 — Engineering Interests</h2>
              <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Research &amp; Academic Focus</h3>
              <div className="mt-8 p-5 rounded-2xl border border-attention-500/20 bg-attention-500/5 backdrop-blur-sm">
                <h4 className="text-attention-400 font-semibold text-xs uppercase tracking-widest mb-3">Long-Term Vision</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  To contribute to the future of intelligent infrastructure by integrating civil engineering with sensing technologies, automation, artificial intelligence, and computational engineering.
                </p>
              </div>
            </ScrollReveal>
            <ScrollRevealStagger stagger={0.12} delay={0.15} className="lg:col-span-8">
              <RevealItem>
                <div className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                  <h4 className="text-white font-semibold text-base mb-6">Current Areas of Exploration</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: HardHat, title: "Intelligent Infrastructure", desc: "Digital technologies for monitoring, automation, and infrastructure management." },
                      { icon: Code2, title: "Construction Automation", desc: "Machine-guided construction and computational engineering workflows." },
                      { icon: Cpu, title: "Smart Sensing", desc: "Wireless telemetry, embedded systems, and real-time structural monitoring." },
                      { icon: Eye, title: "Computer Vision", desc: "Inspection, monitoring, and engineering analysis using AI and OpenCV." },
                      { icon: Leaf, title: "Sustainable Materials", desc: "Concrete technology, supplementary cementitious materials, and low-carbon construction." },
                      { icon: Plane, title: "Geospatial Technologies", desc: "Drone surveying, photogrammetry, GIS, and digital site mapping." },
                      { icon: Wrench, title: "Data-Driven Engineering", desc: "Engineering analytics, visualization, and computational decision support." },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors flex gap-4 items-start ${idx === 6 ? "sm:col-span-2" : ""}`}>
                         <div className="p-2 bg-attention-500/10 rounded-lg text-attention-400 shrink-0">
                           <item.icon className="w-4 h-4" />
                         </div>
                         <div>
                           <strong className="text-white text-sm font-medium block mb-1">{item.title}</strong>
                           <span className="text-slate-400 text-xs leading-relaxed block">{item.desc}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealItem>
            </ScrollRevealStagger>
          </div>
        </section>

        {/* 6. Career Timeline / Experience Section (Glassmorphism backdrop) */}
        <div className="bg-[#08090b]">
          <CareerTimeline events={timelineEvents} />
        </div>

        {/* 7. Skills Network Section (Glassmorphism backdrop) */}
        <div className="bg-[#08090b]">
          <SkillsNetwork skills={skills} projects={projects} />
        </div>

        {/* 8. Personal Story Callout (Glassmorphism backdrop) */}
        <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5 bg-[#08090b]">
          <ScrollReveal variant="scaleIn">
            <div className="p-8 sm:p-12 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-lg relative overflow-hidden group max-w-4xl mx-auto text-center">
              <div className="absolute inset-0 bg-attention-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-attention-400 mb-3 block">04 — Beyond Infrastructure</span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-4">
                Life Outside Engineering
              </h3>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed mb-8">
                Explore the balance between technical analytical systems and real-world physical disciplines: mechanical tuning of a parallel-twin motorcycle, endurance distance running, and quantitative market models.
              </p>
              <Link
                href="/personal"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 hover:scale-[1.03] active:scale-95 transition-all shadow-lg"
              >
                <span>Read Personal Story</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* 9. Contact / Footer Section (Solid dark backdrop for finality) */}
        <div className="bg-[#08090b]">
          <Contact />
        </div>
      </div>
    </main>
  );
}
