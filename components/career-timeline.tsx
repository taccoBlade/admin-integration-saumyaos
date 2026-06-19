"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TimelineEvent } from "@/lib/types";

export function CareerTimeline({ events }: { events: TimelineEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="timeline" ref={containerRef} className="relative w-full max-w-7xl mx-auto px-5 py-32 sm:px-8 lg:px-12">
      <div className="mb-20">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400 mb-3">Trajectory</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Career Timeline</h3>
      </div>

      <div className="relative pl-8 md:pl-0">
        {/* Central Line for Desktop, Left Line for Mobile */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform md:-translate-x-1/2" />
        
        {/* Animated Fill Line */}
        <motion.div 
          className="absolute left-0 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-cyan-400 via-violet-400 to-amber-400 transform md:-translate-x-1/2 origin-top"
          style={{ height: lineHeight }}
        />

        <div className="flex flex-col gap-16 md:gap-24 relative z-10">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''} w-full`}
              >
                <div className={`md:w-1/2 ${isEven ? 'md:pl-12' : 'md:pr-12'}`}>
                  <div className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute top-2 w-3 h-3 rounded-full bg-[#08090b] border-2 border-cyan-400 -left-[37px] ${
                      isEven 
                        ? "md:left-[-54px] md:right-auto" 
                        : "md:right-[-54px] md:left-auto"
                    }`} />
                    
                    <span className="text-sm font-bold text-cyan-400 tracking-wider block mb-2">{event.year}</span>
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
