"use client";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { hoverTap } from "@/lib/motion";

export function Contact() {
  return (
    <footer
      id="contact"
      className="relative w-full max-w-7xl mx-auto px-5 py-16 sm:px-8 lg:px-12 border-t border-white/10 mt-20"
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

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left: Status + Location */}
        <ScrollReveal variant="slideRight" delay={0}>
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
        <ScrollReveal variant="fadeUp" delay={0.1}>
          <div className="text-center">
            <span className="text-xl text-white font-sans font-normal tracking-wide">
              <span className="text-attention">S</span>aumya <span className="text-attention">P</span>arekh<span className="text-attention-400">.</span>
            </span>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Civil Engineering &amp; Infrastructure
            </p>
          </div>
        </ScrollReveal>

        {/* Right: Contact & Social Links */}
        <ScrollReveal variant="slideLeft" delay={0.2}>
          <div className="flex flex-col items-center md:items-end gap-2 z-10">
            <motion.a
              href="mailto:saumyaparekh937@gmail.com"
              {...hoverTap}
              className="flex items-center gap-2 text-slate-400 hover:text-attention-400 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4 text-attention-400" />
              <span>saumyaparekh937@gmail.com</span>
            </motion.a>
            <div className="flex gap-4">
              <motion.a
                href="https://www.linkedin.com/in/saumya-parekh-695474319"
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
      <ScrollReveal variant="fadeIn" delay={0.3}>
        <div className="relative z-10 mt-8 text-center">
          <p className="text-[11px] text-slate-600 font-mono">
            © {new Date().getFullYear()} <span className="font-sans font-normal text-white"><span className="text-attention">S</span>aumya <span className="text-attention">P</span>arekh</span>. Built with Next.js &amp;
            passion.
          </p>
        </div>
      </ScrollReveal>
    </footer>
  );
}
