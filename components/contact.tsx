"use client";
import { Mail } from "lucide-react";

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
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left: Status + Location */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            Available for opportunities
          </div>
          <p className="text-slate-400 text-sm">Ahmedabad, Gujarat, India</p>
        </div>

        {/* Center: Name */}
        <div className="text-center">
          <span className="text-xl font-semibold text-white">
            Saumya Parekh<span className="text-cyan-400">.</span>
          </span>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Civil Engineering & Infrastructure
          </p>
        </div>

        {/* Right: Contact & Social Links */}
        <div className="flex flex-col items-center md:items-end gap-2 z-10">
          <a
            href="mailto:saumyaparekh937@gmail.com"
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>saumyaparekh937@gmail.com</span>
          </a>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/in/saumya-parekh-695474319"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors text-xs font-mono tracking-wider"
            >
              LINKEDIN
            </a>
            <span className="text-slate-700 font-mono text-xs">/</span>
            <a
              href="https://github.com/taccoBlade"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors text-xs font-mono tracking-wider"
            >
              GITHUB
            </a>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="relative z-10 mt-8 text-center">
        <p className="text-[11px] text-slate-600 font-mono">
          © {new Date().getFullYear()} Saumya Parekh. Built with Next.js &
          passion.
        </p>
      </div>
    </footer>
  );
}
