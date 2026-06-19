"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";

/* ── Inline SVG icons for socials (lucide-react v1.x removed these names) ── */
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main className="min-h-screen bg-[#08090b] text-white overflow-x-hidden">
      {/* Grid SVG background */}
      <div className="w-full absolute left-0 top-0 min-h-full pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full min-h-screen"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Status Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2 text-cyan-400 font-mono text-sm mb-8"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          Available for opportunities
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold text-center tracking-tight mb-6"
        >
          Let&apos;s build something
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500">
            extraordinary
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-neutral-400 text-center text-base sm:text-lg max-w-xl mb-12 leading-relaxed"
        >
          Whether it&apos;s infrastructure innovation, market analysis, or creative
          collaboration — I&apos;m always looking for new challenges.
        </motion.p>

        {/* Animated CTA Button */}
        <motion.a
          href="mailto:saumyaparekh937@gmail.com"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative px-8 py-4 rounded-full bg-white/95 text-black font-semibold text-base overflow-hidden flex items-center justify-center group mb-16 cursor-pointer"
        >
          <span
            className={`transition-transform duration-500 ${
              isHovered ? "translate-x-40" : "translate-x-0"
            }`}
          >
            Write a Letter
          </span>
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 text-2xl ${
              isHovered ? "translate-x-0" : "-translate-x-40"
            }`}
          >
            <Mail className="w-6 h-6 text-[#08090b]" />
          </div>
        </motion.a>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full mb-16"
        >
          <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-colors">
            <MapPin className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-sm font-medium text-white">Ahmedabad</span>
            <span className="text-xs text-neutral-500">Gujarat, India</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-colors">
            <Mail className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-sm font-medium text-white">Email</span>
            <span className="text-xs text-neutral-500">saumyaparekh937@gmail.com</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 transition-colors">
            <span className="text-cyan-400 text-lg mb-1">🎓</span>
            <span className="text-sm font-medium text-white">PDEU</span>
            <span className="text-xs text-neutral-500">Civil Engineering</span>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
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
              className="flex items-center gap-2 text-neutral-400 hover:text-cyan-400 transition-colors text-sm font-medium group"
            >
              <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{social.label}</span>
            </a>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
