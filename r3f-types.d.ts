/**
 * r3f-types.d.ts
 *
 * Augments React.JSX.IntrinsicElements with all Three.js primitives from
 * @react-three/fiber so that <mesh>, <meshBasicMaterial>, <instancedMesh>
 * etc. pass TypeScript checking when tsconfig uses "jsx": "react-jsx".
 *
 * Next.js 16 + Turbopack with "jsx": "react-jsx" resolves JSX element types
 * through React.JSX.IntrinsicElements, not the legacy global JSX namespace.
 */

import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
