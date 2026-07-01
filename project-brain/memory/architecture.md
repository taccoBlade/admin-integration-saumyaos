# Memory Domain: Architecture

## Layout & Render Pipeline
- **Next.js App Router**: Pages are statically pre-rendered (SSG) where possible. `/projects/[id]` resolves dynamically via `generateStaticParams`.
- **Global Provider (`OSProvider`)**: Mounts `lib/os-context.tsx` to handle state transitions (neutral, builder, execution, research, reflection, lockin, ride, chill) and coordinates audio player engines.
- **Dossier Transition Engine (`PageTransition`)**: Custom component in `components/ui/page-transition.tsx` that coordinates fade-out/fade-in clip-path animations and scanline overlays.
- **Three.js WebGL Engine (`ComputationalCanvas`)**: Implements an interactive 3D terrain wireframe with simplex noise and interactive node vectors.
