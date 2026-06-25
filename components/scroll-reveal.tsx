"use client";

/**
 * components/scroll-reveal.tsx
 * A lightweight wrapper that triggers Framer Motion entrance animations
 * when the element scrolls into view. Replaces manual whileInView usage
 * with a consistent, spring-driven reveal across all pages.
 *
 * Usage:
 *   <ScrollReveal>
 *     <YourComponent />
 *   </ScrollReveal>
 *
 *   <ScrollReveal variant="slideLeft" delay={0.1}>
 *     <YourComponent />
 *   </ScrollReveal>
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, fadeIn, slideLeft, slideRight, staggerContainer, staggerChild, scaleIn } from "@/lib/motion";
import type { Variants } from "framer-motion";

type VariantName = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "stagger" | "staggerChild" | "scaleIn";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Which animation variant to use. Default: "fadeUp" */
  variant?: VariantName;
  /** Delay in seconds. Default: 0 */
  delay?: number;
  /** Distance in px for fadeUp. Default: 32 */
  distance?: number;
  /** Margin before element triggers. Default: "-80px" */
  margin?: string;
  /** Extra Tailwind classes for the wrapper div */
  className?: string;
  /** If true, animation replays every time element enters view */
  repeat?: boolean;
  /** Stagger children interval (only for "stagger" variant) */
  stagger?: number;
}

const variantMap: Record<VariantName, (delay?: number, distance?: number, stagger?: number) => Variants> = {
  fadeUp: (delay, distance) => fadeUp(delay, distance),
  fadeIn: (delay) => fadeIn(delay),
  slideLeft: (delay) => slideLeft(delay),
  slideRight: (delay) => slideRight(delay),
  stagger: (_delay, _distance, stagger) => staggerContainer(stagger, _delay),
  staggerChild: () => staggerChild,
  scaleIn: () => scaleIn,
};

export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  distance = 32,
  margin = "-80px",
  className,
  repeat = false,
  stagger = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: !repeat,
    margin: margin as `${number}px`,
  });

  const variants = variantMap[variant](delay, distance, stagger);

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Convenience: a scroll-reveal that animates children with stagger */
export function ScrollRevealStagger({
  children,
  delay = 0,
  stagger = 0.08,
  className,
  margin = "-60px",
  repeat = false,
}: {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
  margin?: string;
  repeat?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: !repeat, margin: margin as `${number}px` });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Convenience: a single stagger child item */
export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  );
}
