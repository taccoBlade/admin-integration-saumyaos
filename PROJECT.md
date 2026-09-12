# Project: Cinematic Personal Spread Redesign

## Architecture
- **Page Route**: `app/personal/page.tsx`
- **Layout Route**: `app/personal/layout.tsx`
- **Interactive Components**: `components/personal/` (contains layout structure, widgets, and styles)
- **Data Model**: `data/photos.ts` (defines template types and photo structures)
- **Theme Variables**: CSS variables matching HSL for tech-brutalist palette (pure blacks, silver grays, gold `#d4af37` accents).
- **Control Flow**:
  - Page-load triggers custom Camera Shutter / Terminal Boot transition screen.
  - On transition complete, reveals photo spreads styled with custom HUD grids.
  - Interactive elements (Audio Synth, Aviation HUDs) operate as modular components.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Theme & Tokens | Define dark tech-brutalist theme colors (`#050505`, silver, gold `#d4af37`), CSS variables, hairline grids, noise, and vignettes. | None | IN_PROGRESS (e39e2dbc) |
| M2 | Cinematic Intro | Implement custom page-load sequence (camera shutter reveal or telemetry terminal boot animation) on entry. | M1 | IN_PROGRESS (e39e2dbc) |
| M3 | Photo Animations | Build responsive parallax scroll and slow-zoom hover effects respecting `prefers-reduced-motion`. | M1 | IN_PROGRESS (e39e2dbc) |
| M4 | Tech-Brutalist HUD | Superimpose dynamic HUD overlay frames (EXIF telemetry, compass grids, trajectory lines) around photo sets. | M1 | IN_PROGRESS (e39e2dbc) |
| M5 | Integration & Compile | Verify full page integration, check Next.js builds, resolve any TypeScript warnings/compilation issues. | M2, M3, M4 | IN_PROGRESS (e39e2dbc) |
| M6 | E2E Testing Track | Design and build Category-Partition, BVA, Pairwise, and Workload tests (Tiers 1-4). Publish `TEST_READY.md`. | None | IN_PROGRESS (dae14188) |

## Code Layout
- `app/personal/page.tsx` - Main Entrypoint
- `components/personal/` - Modular UI & HUD widgets
- `components/personal/EditorialLayout.tsx` - Component mapping and layout strategies
- `data/photos.ts` - Photographic spreads & fallback metadata
- `app/globals.css` - Global styling tokens and custom grain definitions

## Interface Contracts
### `PhotoRenderer` ↔ HUD Grids
- Props: `photo: PhotoData`, `fill?: boolean`, `showHud?: boolean`, `overlayLabels?: string[]`
- Hover state transitions must use CSS transitions or Framer Motion to prevent layout shifts.
- Aspect ratio boundaries: `aspect-[3/4]`, `aspect-[16/9]`, `aspect-[16/10]`.
