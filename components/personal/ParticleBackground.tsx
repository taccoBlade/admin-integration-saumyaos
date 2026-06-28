'use client';

import { InteractiveParticleBackground } from '@/components/ui/interactive-particle-background';

export function ParticleBackground() {
  return (
    <InteractiveParticleBackground
      showConstellations={false}
      disableLines={true}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-70"
    />
  );
}
