"use client";

import { ReactNode, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";

interface ProductDemoFrameProps {
  children: ReactNode;
  title: string;
  githubUrl?: string;
}

export function ProductDemoFrame({ children, title, githubUrl }: ProductDemoFrameProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-2xl ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "w-full max-w-5xl mx-auto my-12 relative"
      }`}
    >
      {/* Browser / Frame Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-md border border-white/5 text-[10px] font-mono text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-attention-500 animate-pulse" />
            LIVE TELEMETRY
          </div>
          <span className="text-xs font-mono text-slate-300 hidden sm:block truncate max-w-xs">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {githubUrl && (
            <a 
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center"
              title="View Source"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.08-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.18 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
              </svg>
            </a>
          )}
          <button 
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white transition-colors flex items-center"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Embedded Content */}
      <div className={`relative w-full bg-[#08090b] ${isFullscreen ? "h-[calc(100vh-45px)]" : "h-[600px]"}`}>
        {children}
      </div>
    </motion.div>
  );
}
