import { InteractiveHero } from "@/components/interactive-hero";
import { FeaturedProjects } from "@/components/featured-projects";
import { CareerTimeline } from "@/components/career-timeline";
import { SkillsNetwork } from "@/components/skills-network";
import { Contact } from "@/components/contact";
import { ScrollReveal, ScrollRevealStagger, RevealItem } from "@/components/scroll-reveal";
import { getProjects, getTimelineEvents, getSkills } from "@/lib/content";
import Link from "next/link";
import { BookOpen, Cpu, ArrowRight } from "lucide-react";

export default function Home() {
  const projects = getProjects();
  const timelineEvents = getTimelineEvents();
  const skills = getSkills();

  return (
    <main className="min-h-screen bg-[#08090b] text-slate-200 selection:bg-attention-500/30 overflow-x-hidden relative">
      {/* 1. Engineering Identity & Hero Section */}
      <InteractiveHero />

      {/* 2. Core Domain Expertise Section */}
      <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ScrollReveal variant="slideRight" className="lg:col-span-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">01 — Specialization</h2>
            <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Core Domain Expertise</h3>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Bridging classical civil engineering principles with modern instrumentation, data streams, and computational design.
            </p>
          </ScrollReveal>
          <ScrollRevealStagger stagger={0.12} delay={0.1} className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: BookOpen,
                title: "Concrete Technology",
                desc: "Developing mix compliance design engines, calculating packing density limits per Toufar modeling, and auditing geopolymer binder replacements according to IS 10262 standards.",
              },
              {
                icon: Cpu,
                title: "Geotechnical Analytics",
                desc: "Modeling settlement consolidation profiles and soil-structure deflection under dynamic loads, utilizing standard ASTM testing and sensor networks.",
              },
              {
                icon: Cpu,
                title: "Infrastructure Automation",
                desc: "Designing IoT hardware setups, state-estimation algorithms (Extended Kalman Filter), and edge-based computer vision monitoring systems (OpenCV) for live defect identification.",
              },
            ].map((item, idx) => (
              <RevealItem key={idx}>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-attention-500/20 hover:-translate-y-1 transition-all flex flex-col justify-between h-full">
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

      {/* 3. Featured Projects Section */}
      <FeaturedProjects projects={projects} />

      {/* 4. Research & Academic Focus Section */}
      <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ScrollReveal variant="slideRight" className="lg:col-span-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">02 — Investigation</h2>
            <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Research &amp; Academic Focus</h3>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Applying computational modeling to evaluate structural properties under severe stress. Focused on the transition towards green concrete and real-time smart monitoring.
            </p>
          </ScrollReveal>
          <ScrollRevealStagger stagger={0.12} delay={0.15} className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <RevealItem>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] h-full">
                  <h4 className="text-white font-semibold text-sm mb-2">Current Investigation Areas</h4>
                  <ul className="space-y-3 font-mono text-[11px] text-slate-300">
                    <li className="flex gap-2"><span className="text-attention-400">[01]</span><span>Geopolymer concrete mix proportioning and binder ratios optimization</span></li>
                    <li className="flex gap-2"><span className="text-attention-400">[02]</span><span>Edge image processing on microcontrollers for crack propagation metrics</span></li>
                    <li className="flex gap-2"><span className="text-attention-400">[03]</span><span>Extended Kalman Filter positioning algorithms for intelligent road rollers</span></li>
                  </ul>
                </div>
              </RevealItem>
              <RevealItem>
                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] h-full">
                  <h4 className="text-white font-semibold text-sm mb-2">Theoretical References</h4>
                  <ul className="space-y-3 font-mono text-[11px] text-slate-300">
                    <li className="flex gap-2"><span className="text-attention-400">[R1]</span><span>Terzaghi, K. Theoretical Soil Mechanics. Clay consolidation and structural settlement theories.</span></li>
                    <li className="flex gap-2"><span className="text-attention-400">[R2]</span><span>Neville, A. M. Properties of Concrete. Target strengths, w/c criteria, and hydration limits.</span></li>
                    <li className="flex gap-2"><span className="text-attention-400">[R3]</span><span>Kalman, R. E. State estimation and linear filtering principles in noisy sensor systems.</span></li>
                  </ul>
                </div>
              </RevealItem>
            </div>
          </ScrollRevealStagger>
        </div>
      </section>

      {/* 5. Engineering Evidence Section */}
      <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ScrollReveal variant="slideRight" className="lg:col-span-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">03 — Empirical Proof</h2>
            <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-white">Engineering Evidence</h3>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Real-world validation logs, laboratory measurements, and sensor calibration metrics that demonstrate system performance.
            </p>
          </ScrollReveal>
          <ScrollRevealStagger stagger={0.12} delay={0.1} className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <RevealItem>
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Capacitive Moisture Sensor Calibration</span>
                <div className="border border-white/5 rounded-xl bg-black/40 p-4 font-mono text-[10px] text-slate-300 space-y-2">
                  <div className="text-attention-500 font-bold">ASTM D2216 Oven-Drying Calibration Curve:</div>
                  <div>w = 0.045 * V² - 0.282 * V + 0.540</div>
                  <div className="text-slate-500">{"// Mean Square Error: 0.0024"}</div>
                  <div className="text-slate-500">{"// Calibration Range: 8% to 28% water content"}</div>
                </div>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">CV Crack Assessment Skeleton</span>
                <div className="border border-white/5 rounded-xl bg-black/40 p-4 font-mono text-[10px] text-slate-300 space-y-2">
                  <div className="text-attention-500 font-bold">OpenCV Spatial Scale Validation:</div>
                  <div>Fiducial Width: 10mm | Image Pixels: 67px</div>
                  <div>Calculated Scale Factor: 0.149 mm/pixel</div>
                  <div className="text-slate-500">{"// Feeler Gauge Ground Truth: 0.45mm"}</div>
                  <div className="text-slate-500">{"// Visual Measurement: 0.447mm (Dev: -0.003mm)"}</div>
                </div>
              </div>
            </RevealItem>
          </ScrollRevealStagger>
        </div>
      </section>

      {/* 6. Career Timeline / Experience Section */}
      <CareerTimeline events={timelineEvents} />

      {/* 7. Skills Network Section */}
      <SkillsNetwork skills={skills} projects={projects} />

      {/* 8. Personal Story Callout */}
      <section className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12 border-t border-white/5">
        <ScrollReveal variant="scaleIn">
          <div className="p-8 sm:p-12 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent backdrop-blur-md relative overflow-hidden group max-w-4xl mx-auto text-center">
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

      {/* 9. Contact / Footer Section */}
      <Contact />
    </main>
  );
}
