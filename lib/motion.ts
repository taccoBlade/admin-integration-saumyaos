/**
 * lib/motion.ts
 * Centralized Framer Motion spring/easing presets for the entire site.
 * Import these into any component that needs animated entrances, hovers, or transitions.
 */

import type { Variants, Transition } from "framer-motion";

// ─── Spring Presets ──────────────────────────────────────────────────────────

/** Snappy spring — for UI elements that need immediate response (buttons, cards) */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

/** Fluid spring — for hero text, section headings, large reveals */
export const springFluid: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 1,
};

/** Soft spring — for image containers, overlays, background elements */
export const springSoft: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 24,
  mass: 1.2,
};

/** Stagger delay factory — returns per-child delay for container stagger */
export const staggerDelay = (index: number, base = 0.08) => index * base;

// ─── Easing Curves ───────────────────────────────────────────────────────────

/** Premium ease — feels like a physical object settling */
export const easeExpo = [0.16, 1, 0.3, 1] as const;

/** Smooth ease for fades and opacity transitions */
export const easeSmooth = [0.4, 0, 0.2, 1] as const;

// ─── Variant Factories ───────────────────────────────────────────────────────

/** Fade up — standard scroll-reveal for sections and cards */
export const fadeUp = (delay = 0, distance = 32): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springFluid, delay },
  },
});

/** Fade in — for images and backgrounds (no y movement) */
export const fadeIn = (delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: easeSmooth, delay },
  },
});

/** Slide left — for right-column elements */
export const slideLeft = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springFluid, delay },
  },
});

/** Slide right — for left-column elements */
export const slideRight = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springFluid, delay },
  },
});

/** Container — staggered children */
export const staggerContainer = (stagger = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** Stagger child — used inside staggerContainer */
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springFluid,
  },
};

/** Scale in — for modal/lightbox popups */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSnappy,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.2, ease: easeSmooth },
  },
};

/** Hover lift — for cards and interactive elements */
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: springSnappy,
  },
};

/** Hover glow tap — for buttons */
export const hoverTap = {
  whileHover: { scale: 1.03, transition: springSnappy },
  whileTap: { scale: 0.97, transition: springSnappy },
};
