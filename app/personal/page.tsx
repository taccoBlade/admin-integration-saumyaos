"use client";

import { useState } from "react";
import { OSProvider, useOS } from "@/lib/os-context";
import { InteractiveParticleBackground } from "@/components/interactive-particle-background";
import { PersonalOSHUD } from "@/components/personal-os-hud";
import { PersonalHero } from "@/components/personal-hero";
import { LifeCarousel, CARDS } from "@/components/life-carousel";
import { PersonalBuilds } from "@/components/personal-builds";
import { MotorcycleDashboard } from "@/components/motorcycle-dashboard";
import { BeliefsTerminal } from "@/components/beliefs-terminal";
import { DashboardWidgets } from "@/components/dashboard-widgets";
import { Contact } from "@/components/contact";
import { PersonalBootScreen } from "@/components/personal-boot-screen";
import { AnimatePresence } from "framer-motion";

export default function PersonalPage() {
  return (
    <OSProvider>
      <PersonalPageContent />
    </OSProvider>
  );
}

function PersonalPageContent() {
  const { theme, isBooted } = useOS();
  const [activeDossier, setActiveDossier] = useState<typeof CARDS[number] | null>(null);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isBooted && <PersonalBootScreen key="boot" />}
      </AnimatePresence>

      <main className={`relative min-h-screen text-white overflow-x-hidden font-mono select-none transition-all duration-1000 bg-gradient-to-b ${theme.bgGradient}`}>
      
      {/* Fixed Interactive Cursor Repulsion Particle Background */}
      <InteractiveParticleBackground />

      {/* Sticky Credentials HUD Header Sub-bar */}
      <PersonalOSHUD />

      {/* Content Flow */}
      <div className="relative z-10 pt-24 sm:pt-28 xl:pt-32 pb-16 flex flex-col gap-8 sm:gap-10 md:gap-12">
        
        {/* 1. Who I Am */}
        <PersonalHero setActiveDossier={setActiveDossier} />

        {/* 2. What Drives Me */}
        <LifeCarousel activeDossier={activeDossier} setActiveDossier={setActiveDossier} />

        {/* 3. What I Build */}
        <PersonalBuilds />

        {/* 4. What I Ride */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="mb-8 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
              04 — VEHICLE TELEMETRY
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mt-2 font-mono">
              What I Ride
            </h2>
            <p className="mt-2 text-sm text-slate-400">Mechanical connection and environmental cruising</p>
          </div>
          <div className="w-full">
            <MotorcycleDashboard />
          </div>
        </section>

        {/* 5. What I Believe */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="mb-8 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
              05 — ARCHIVES
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mt-2 font-mono">
              What I Believe
            </h2>
            <p className="mt-2 text-sm text-slate-400">Operating system logic and core philosophical parameters</p>
          </div>
          <div className="w-full">
            <BeliefsTerminal />
          </div>
        </section>

        {/* 6. What's Next */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="mb-8 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
              06 — HORIZON
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mt-2 font-mono">
              What&apos;s Next
            </h2>
            <p className="mt-2 text-sm text-slate-400">Sync routines and upcoming targets</p>
          </div>
          <div className="w-full">
            <DashboardWidgets />
          </div>
        </section>

        {/* Contact footer */}
        <Contact />

      </div>

    </main>
  </>
 );
}
