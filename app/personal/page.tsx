import { PersonalHero } from "@/components/personal-hero";
import { HobbiesGrid } from "@/components/hobbies-grid";
import { LifeCarousel } from "@/components/life-carousel";
import { DashboardWidgets } from "@/components/dashboard-widgets";
import { Contact } from "@/components/contact";

export default function PersonalPage() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white overflow-x-hidden">
      <PersonalHero />
      <HobbiesGrid />
      <LifeCarousel />
      <DashboardWidgets />
      <Contact />
    </main>
  );
}
