# Memory Domain: Design Patterns

## Guidelines
- **Dynamic Imports**: Import heavy 3D canvases dynamically (`ssr: false`) to avoid server-side compilation bloat.
- **Spring Animations**: Use standard motion settings from `lib/motion.ts` to keep animation rates unified.
- **Custom Properties**: Rely on CSS variables for styles (e.g. `--background`, `--foreground`) to manage theme-reactive color updates.
