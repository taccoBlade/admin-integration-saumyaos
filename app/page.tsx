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

      {/* 3. Skills Network */}
      <SkillsNetwork skills={skills} />

      {/* 4. Career Timeline */}
      <CareerTimeline events={timelineEvents} />

      {/* 5. Footer / Contact */}
      <Contact />
    </main>
  );
}
