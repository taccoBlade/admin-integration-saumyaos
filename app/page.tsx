import nextDynamic from 'next/dynamic';
import { InteractiveHero } from "@/components/home/interactive-hero";
import { Contact } from "@/components/layout/contact";
import { ScrollReveal, ScrollRevealStagger, RevealItem } from "@/components/ui/scroll-reveal";

const FeaturedProjects = nextDynamic(() => import("@/components/home/featured-projects").then(mod => mod.FeaturedProjects));
const CareerTimeline = nextDynamic(() => import("@/components/home/career-timeline").then(mod => mod.CareerTimeline));
const SkillsNetwork = nextDynamic(() => import("@/components/home/skills-network").then(mod => mod.SkillsNetwork));
import { getProjects, getTimelineEvents, getSkills, getHero, getAbout } from "@/lib/content";
import { CurrentFocus } from "@/components/home/current-focus";
import Link from "next/link";
import { BookOpen, Cpu, ArrowRight, HardHat, Code2, Plane, Eye, Wrench, Leaf } from "lucide-react";

import { ClientParticleBackground } from "@/components/personal/ClientParticleBackground";

// Revalidate this page at most once per hour so new projects/content
// added to Supabase appear without requiring a full redeploy.
export const revalidate = 3600;

export default async function Home() {
  const [projects, timelineEvents, skills, heroData, aboutData] = await Promise.all([
    getProjects(),
    getTimelineEvents(),
    getSkills(),
    getHero(),
    getAbout(),
  ]);

  return (
    <main className="min-h-screen bg-transparent text-slate-200 selection:bg-attention-500/30 overflow-x-hidden relative">
      <ClientParticleBackground 
        showConstellations={false}
        disableLines={true}
        className="fixed inset-0 w-full h-full pointer-events-none z-[20] opacity-75"
      />

      {/* ── FOREGROUND CONTENT ── */}
      <div className="relative z-10">
        <InteractiveHero 
          title={heroData.title}
          tagline={heroData.tagline}
          subtitle={heroData.subtitle}
          description={heroData.description}
          cover_image={heroData.cover_image}
          cta_text={heroData.cta_text}
          cta_url={heroData.cta_url}
          secondary_cta_text={heroData.secondary_cta_text}
          secondary_cta_url={heroData.secondary_cta_url}
        />



        {/* 3. Featured Projects Section (Glassmorphism backdrop) */}
        <div className="relative w-full max-w-7xl mx-auto border-t border-white/5 bg-[#08090b] rounded-t-3xl mt-[-2rem] z-10">
          <FeaturedProjects projects={projects} />
        </div>


        
        {/* 5. About / Current Focus Section */}
        <div className="bg-[#08090b] border-t border-white/5">
          <CurrentFocus data={aboutData} />
        </div>

        {/* 6. Career Timeline / Experience Section (Glassmorphism backdrop) */}
        <div className="bg-[#08090b] border-t border-white/5">
          <CareerTimeline events={timelineEvents} />
        </div>

        {/* 7. Skills Network Section (Glassmorphism backdrop) */}
        <div className="bg-[#08090b]">
          <SkillsNetwork skills={skills} projects={projects} />
        </div>



        {/* 9. Contact / Footer Section (Solid dark backdrop for finality) */}
        <div className="bg-[#08090b]">
          <Contact />
        </div>
      </div>
    </main>
  );
}
