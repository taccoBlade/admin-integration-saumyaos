"use client";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { hoverTap } from "@/lib/motion";

import { ContactForm } from "@/app/contact/ContactForm";

export function Contact() {
  return (
    <footer
      id="contact"
      className="relative w-full px-5 pt-20 pb-16 sm:px-8 lg:px-12 border-t border-white/10 mt-20"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Top: Contact Form Section */}
        <ScrollReveal variant="fadeUp" delay={0}>
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">Get in Touch</h2>
            <p className="text-slate-400 text-sm max-w-md text-center mb-8 font-mono">
              Have a project in mind, a question about telemetry, or just want to say hi? Send me a message below.
            </p>
            <div className="w-full max-w-2xl">
              <ContactForm />
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom: Footer Info */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/5">
          {/* Left: Status + Location */}
          <ScrollReveal variant="slideRight" delay={0.1}>
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 text-attention-400 font-mono text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-attention-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-attention-500" />
                </span>
                Available for opportunities
              </div>
              <p className="text-slate-400 text-sm">Ahmedabad, Gujarat, India</p>
            </div>
          </ScrollReveal>

          {/* Center: Name */}
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <div className="text-center">
              <span className="text-xl text-white font-sans font-normal tracking-wide">
                <span className="text-attention">S</span>aumya <span className="text-attention">P</span>arekh<span className="text-attention-400">.</span>
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Civil Engineering &amp; Infrastructure
              </p>
            </div>
          </ScrollReveal>

          {/* Right: Social Links */}
          <ScrollReveal variant="slideLeft" delay={0.3}>
            <div className="flex flex-col items-center md:items-end gap-2 z-10">
              <div className="flex gap-4">
                <motion.a
                  href="https://www.linkedin.com/in/saumyaparekh"
                  target="_blank"
                  rel="noreferrer"
                  {...hoverTap}
                  className="text-slate-400 hover:text-attention-400 transition-colors text-xs font-mono tracking-wider"
                >
                  LINKEDIN
                </motion.a>
                <span className="text-slate-700 font-mono text-xs">/</span>
                <motion.a
                  href="https://github.com/taccoBlade"
                  target="_blank"
                  rel="noreferrer"
                  {...hoverTap}
                  className="text-slate-400 hover:text-attention-400 transition-colors text-xs font-mono tracking-wider"
                >
                  GITHUB
                </motion.a>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom copyright */}
        <ScrollReveal variant="fadeIn" delay={0.4}>
          <div className="text-center">
            <p className="text-[11px] text-slate-600 font-mono">
              © {new Date().getFullYear()} <span className="font-sans font-normal text-white"><span className="text-attention">S</span>aumya <span className="text-attention">P</span>arekh</span>. Built with Next.js &amp; passion.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
