"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";

const InteractiveParticleBackground = dynamic(
  () => import("@/components/ui/interactive-particle-background").then(mod => mod.InteractiveParticleBackground),
  { ssr: false }
);

export function ClientParticleBackground(props: any) {
  return <InteractiveParticleBackground {...props} />;
}
