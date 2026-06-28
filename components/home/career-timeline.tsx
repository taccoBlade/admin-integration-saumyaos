"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { TimelineEvent } from "@/lib/types";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { springFluid } from "@/lib/motion";

export function CareerTimeline({ events }: { events: TimelineEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Smooth the scroll progress with a spring for fluid line drawing
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 1,
  });

  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto px-5 py-32 sm:px-8 lg:px-12"
    >
      <ScrollReveal variant="fadeUp" className="mb-20">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">Trajectory</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Career Timeline</h3>
      </ScrollReveal>

      <div className="relative pl-8 md:pl-0">
        {/* Central Line for Desktop, Left Line for Mobile */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform md:-translate-x-1/2" />

        {/* Spring-smoothed animated fill line */}
        <motion.div
          className="absolute left-0 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-attention-400 via-attention-400 to-attention-400 transform md:-translate-x-1/2 origin-top"
          style={{ height: lineHeight }}
        />

        <div className="flex flex-col gap-16 md:gap-24 relative z-10">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ ...springFluid, delay: index * 0.05 }}
                className={`flex flex-col md:flex-row items-start ${isEven ? "md:flex-row-reverse" : ""} w-full`}
              >
                <div className={`md:w-1/2 ${isEven ? "md:pl-12" : "md:pr-12"}`}>
                  <div className="relative group">
                    {/* Node dot with spring pulse */}
                    <motion.div
                      className={`absolute top-2 w-3 h-3 rounded-full bg-[#08090b] border-2 border-attention-400 -left-[37px] ${
                        isEven
                          ? "md:left-[-54px] md:right-auto"
                          : "md:right-[-54px] md:left-auto"
                      }`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ ...springFluid, delay: index * 0.05 + 0.2 }}
                    />

                    <span className="text-sm font-bold text-attention-400 tracking-wider block mb-2">{event.year}</span>
                    <h4 className="text-xl font-semibold text-white mb-2">{event.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{event.description}</p>
                    <span className="inline-block mt-4 text-xs font-medium px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300">
                      {event.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
