import { InteractiveHero } from "@/components/interactive-hero";
import { BentoGrid } from "@/components/bento-grid";
import { FeaturedProjects } from "@/components/featured-projects";
import { CareerTimeline } from "@/components/career-timeline";
import { SkillsNetwork } from "@/components/skills-network";
import { EngineeringLogbook } from "@/components/engineering-logbook";
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

      {/* 2. Bento Grid — Components of Focus */}
      <BentoGrid />

      {/* 3. Featured Projects */}
      <FeaturedProjects projects={projects} />

      {/* 4. Skills Network */}
      <SkillsNetwork skills={skills} />

      {/* 5. Career Timeline */}
      <CareerTimeline events={timelineEvents} />

      {/* 6. Engineering Logbook */}
      <EngineeringLogbook />

      {/* 7. Footer / Contact */}
      <Contact />
    </main>
  );
}
