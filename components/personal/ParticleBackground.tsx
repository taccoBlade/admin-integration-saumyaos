'use client';

import nextDynamic from 'next/dynamic';
const InteractiveParticleBackground = nextDynamic(() => import("@/components/ui/interactive-particle-background").then(mod => mod.InteractiveParticleBackground), { ssr: false });

export function ParticleBackground() {
  return (
    <InteractiveParticleBackground
      showConstellations={false}
      disableLines={true}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-70"
    />
  );
}
