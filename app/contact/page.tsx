"use client";

import { motion } from "framer-motion";
import { OSProvider } from "@/lib/os-context";
import { Mail, MapPin, ArrowRight } from "lucide-react";
import { InteractiveParticleBackground } from "@/components/ui/interactive-particle-background";

/* ── Inline SVG icons for socials ── */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <OSProvider>
      <ContactPageContent />
    </OSProvider>
  );
}

function ContactPageContent() {
  return (
    <main className="min-h-screen bg-[#08090b] text-white overflow-hidden relative select-none">
      {/* Dynamic Repulsion Particles Backdrop */}
      <InteractiveParticleBackground />

      {/* Cybernetic grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Radial ambient glow behind the text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <div className="h-[450px] w-[450px] rounded-full filter blur-[130px] bg-attention-500/10 opacity-30 animate-pulse" />
      </div>

      {/* Cyberpunk corner bracket HUD decorations */}
      <div className="absolute top-28 left-8 z-15 w-6 h-6 border-l border-t border-white/10 pointer-events-none hidden md:block" />
      <div className="absolute top-28 right-8 z-15 w-6 h-6 border-r border-t border-white/10 pointer-events-none hidden md:block" />
      <div className="absolute bottom-12 left-8 z-15 w-6 h-6 border-l border-b border-white/10 pointer-events-none hidden md:block" />
      <div className="absolute bottom-12 right-8 z-15 w-6 h-6 border-r border-b border-white/10 pointer-events-none hidden md:block" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-28 pb-16 px-6">
        
        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 border border-attention-500/20 bg-attention-500/5 px-4 py-1.5 rounded-full text-attention-400 font-mono text-xs uppercase tracking-widest mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-attention-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-attention-500" />
          </span>
          Available for opportunities
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-mono font-extrabold text-center tracking-tighter mb-4 select-none uppercase leading-none"
        >
          Let&apos;s build something
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-attention-400 via-attention-300 to-attention-500 filter drop-shadow-[0_2px_10px_rgba(212, 175, 55,0.15)]">
            extraordinary
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-neutral-400 text-center text-xs sm:text-sm md:text-base max-w-xl mb-10 leading-relaxed font-mono"
        >
          Whether it&apos;s infrastructure telemetry, market velocity modeling, or creative storytelling — I&apos;m always scanning for new challenges.
        </motion.p>

        {/* Animated CTA Button */}
        <motion.a
          href="mailto:saumyaparekh937@gmail.com"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}

          className="relative px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-white hover:text-[#08090b] hover:bg-white hover:border-white transition-all duration-350 font-bold font-mono text-xs overflow-hidden flex items-center justify-center gap-2 group mb-12 cursor-pointer active:scale-95"
        >
          <span>WRITE A LETTER</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </motion.a>

        {/* Glassmorphic Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl w-full mb-12"
        >
          {/* Card 1: Ahmedabad */}
          <div className="flex flex-col items-center justify-between gap-4 p-5 rounded-xl bg-black/40 border border-white/5 hover:border-attention-500/30 hover:shadow-[0_4px_20px_rgba(212, 175, 55,0.06)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-1.5 left-2 text-[6px] text-slate-500 font-mono tracking-widest">[LOC_REF]</div>
            <MapPin className="w-5 h-5 text-attention-400 mt-2 transition-transform group-hover:scale-110" />
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-white uppercase tracking-tight block">Ahmedabad</span>
              <span className="text-[9px] text-slate-400 font-mono">Gujarat, India</span>
            </div>
            <div className="w-full text-center border-t border-white/5 pt-2 mt-1 text-[6.5px] text-slate-600 font-mono uppercase tracking-wider">
              LAT: 23.0225° N
            </div>
          </div>

          {/* Card 2: Email */}
          <a 
            href="mailto:saumyaparekh937@gmail.com" 
            className="flex flex-col items-center justify-between gap-4 p-5 rounded-xl bg-black/40 border border-white/5 hover:border-attention-500/30 hover:shadow-[0_4px_20px_rgba(212, 175, 55,0.06)] transition-all duration-300 relative group overflow-hidden cursor-pointer"
          >
            <div className="absolute top-1.5 left-2 text-[6px] text-slate-500 font-mono tracking-widest">[COMMS_REF]</div>
            <Mail className="w-5 h-5 text-attention-400 mt-2 transition-transform group-hover:scale-110" />
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-white uppercase tracking-tight block">Email</span>
              <span className="text-[9px] text-slate-400 font-mono break-all max-w-[150px] block">saumyaparekh937@gmail.com</span>
            </div>
            <div className="w-full text-center border-t border-white/5 pt-2 mt-1 text-[6.5px] text-slate-600 font-mono uppercase tracking-wider">
              SYNC STATUS: STANDBY
            </div>
          </a>

          {/* Card 3: PDEU */}
          <div className="flex flex-col items-center justify-between gap-4 p-5 rounded-xl bg-black/40 border border-white/5 hover:border-attention-500/30 hover:shadow-[0_4px_20px_rgba(212, 175, 55,0.06)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-1.5 left-2 text-[6px] text-slate-500 font-mono tracking-widest">[EDU_REF]</div>
            <span className="text-attention-400 text-lg mt-2 select-none group-hover:scale-110 transition-transform">🎓</span>
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold text-white uppercase tracking-tight block">PDEU</span>
              <span className="text-[9px] text-slate-400 font-mono">Civil Engineering</span>
            </div>
            <div className="w-full text-center border-t border-white/5 pt-2 mt-1 text-[6.5px] text-slate-600 font-mono uppercase tracking-wider">
              MAJOR: INFRASTRUCTURE
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-6 items-center"
        >
          {[
            { icon: LinkedinIcon, label: "LinkedIn", href: "https://www.linkedin.com/in/saumya-parekh-695474319" },
            { icon: GithubIcon, label: "GitHub", href: "https://github.com/taccoBlade" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-neutral-400 hover:text-attention-400 transition-colors text-xs font-mono font-bold uppercase tracking-wider group"
            >
              <social.icon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-attention-400" />
              <span>{social.label}</span>
            </a>
          ))}
        </motion.div>

      </div>
    </main>
  );
}
