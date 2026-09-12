# Original User Request

## 2026-07-13T19:49:30Z

Redesign the Personal/Analog Explorations page into an immersive, dark tech-brutalist editorial spread depicting Saumya Parekh as a cinematic main character through advanced UI layout and animations.

Working directory: c:\Users\saumy\OneDrive\Documents\personalsite
Integrity mode: benchmark

## Requirements

### R1. Cinematic Visual Design
*   Establish a dark tech-brutalist visual style using pure blacks (`#050505`), muted silver grays, and glowing gold accents (`#d4af37`), fully backed by dynamic HSL theme CSS tokens.
*   Integrate delicate hairline grid overlays, local SVG fractal noise film grain, and soft vignettes to frame the photography sets.
*   Pair display typography (spaced-out, bold headings) with narrative serif blocks (italic Playfair) for high-fashion editorial contrast.

### R2. Immersive Page Animations & Transitions
*   Implement a custom page-load sequence (such as a camera lens-shutter reveal, telemetry terminal boot, or cross-fade mask) that triggers on entry.
*   Build responsive parallax scrolling behaviors and smooth, slow zoom hover transitions on all photos.
*   Ensure all animations respect the `prefers-reduced-motion` media query.

### R3. Dynamic HUD Overlays
*   Superimpose subtle tech-brutalist HUD overlay frames directly on or around the photography cards (e.g. EXIF telemetry labels, compass orientation grids, flight trajectory vectors, and mechanical log text) to weave the content into a main-character story.

## Acceptance Criteria

### Visual Quality & Layout
- [ ] The layout is completely bespoke, avoiding standard card templates or generic paddings.
- [ ] All grid columns, borders, and margins align perfectly, with no clipping of photos.
- [ ] Vignettes and grain overlay layers do not block interactive elements or text readability.

### Motion & Interaction
- [ ] The page-load animation executes smoothly on entry and transitions to the main photo layout.
- [ ] Hover states on photos trigger slow zoom-in effects with zero layout shifts.

### Stability & Performance
- [ ] The application compiles cleanly with no Next.js build errors or TypeScript warnings.
