"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDossierActive, setIsDossierActive] = useState(true);

  useEffect(() => {
    if (children !== displayChildren) {
      setIsTransitioning(true);
      setIsDossierActive(false);

      // Phase 1: Fade out the current layout content over 180ms
      const fadeOutTimer = setTimeout(() => {
        setDisplayChildren(children);
        
        // Phase 2: Fade in the new content & start stagger animations
        setIsDossierActive(true);
        setIsTransitioning(false);
      }, 180);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [children, displayChildren]);

  return (
    <>
      {/* Global CSS for the premium dossier transitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Transition targets */
        .dossier-page-container h1:not(.no-dossier-reveal), .dossier-page-container .dossier-title {
          opacity: 0;
          transform: translateY(20px);
        }
        .dossier-page-container .dossier-meta {
          opacity: 0;
          transform: translateY(20px);
        }
        .dossier-page-container .dossier-desc {
          opacity: 0;
          transform: translateY(20px);
        }
        .dossier-page-container .dossier-content, 
        .dossier-page-container section, 
        .dossier-page-container footer {
          opacity: 0;
          transform: translateY(24px);
        }
        
        /* Soft Mask Reveal for images */
        .dossier-page-container main img, 
        .dossier-page-container section img, 
        .dossier-page-container .dossier-content img {
          clip-path: inset(100% 0 0 0);
          opacity: 0;
          transition: clip-path 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out;
        }

        /* Active Reveal animations */
        .dossier-active h1:not(.no-dossier-reveal), .dossier-active .dossier-title {
          animation: dossier-reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.05s;
        }
        .dossier-active .dossier-meta {
          animation: dossier-reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.11s;
        }
        .dossier-active .dossier-desc {
          animation: dossier-reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.17s;
        }
        .dossier-active .dossier-content, .dossier-active section, .dossier-active footer {
          animation: dossier-reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.23s;
        }
        
        .dossier-active main img, .dossier-active section img, .dossier-active .dossier-content img {
          clip-path: inset(0 0 0 0);
          opacity: 1;
        }
        
        @keyframes dossier-reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Scanline sweep animation */
        @keyframes scanline-sweep {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        .scanline {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d4af37 40%, #d4af37 60%, transparent);
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
          z-index: 100;
          pointer-events: none;
          animation: scanline-sweep 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Accessibility: prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .dossier-page-container h1, 
          .dossier-page-container .dossier-title, 
          .dossier-page-container .dossier-meta, 
          .dossier-page-container .dossier-desc, 
          .dossier-page-container .dossier-content, 
          .dossier-page-container section, 
          .dossier-page-container footer, 
          .dossier-page-container main img, 
          .dossier-page-container section img {
            transform: none !important;
            clip-path: none !important;
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
          }
          .scanline {
            display: none !important;
          }
        }
      `}} />

      {/* ── PERSISTENT DOSSIER BACKGROUND GRID ── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div 
          className="absolute inset-0 bg-[#08090b]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212, 175, 55, 0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 175, 55, 0.015) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        
        {/* Technical Corner Crop Marks */}
        <div className="absolute top-8 left-8 w-4 h-4 border-l border-t border-attention-500/20" />
        <div className="absolute top-8 right-8 w-4 h-4 border-r border-t border-attention-500/20" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-l border-b border-attention-500/20" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-r border-b border-attention-500/20" />
        
        {/* Technical Labelings */}
        <div className="absolute top-8 left-16 text-[9px] font-mono text-slate-600 uppercase tracking-widest hidden md:block select-none">
          SYS_REF: IND-3529 // DOSSIER_MODE
        </div>
        <div className="absolute bottom-8 left-16 text-[9px] font-mono text-slate-600 uppercase tracking-widest hidden md:block select-none">
          CONFIDENTIAL // SUBJECT TO AUDIT
        </div>
      </div>

      {/* ── TRANSITION OVERLAY ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 0.35 : 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 bg-black z-[5] pointer-events-none"
      />

      {/* ── THIN GOLD SCANLINE SWEEP ── */}
      {isTransitioning && (
        <div key={pathname} className="scanline" />
      )}

      {/* ── TRANSITION CONTENT LAYER ── */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className={`dossier-page-container ${isDossierActive ? "dossier-active" : ""}`}
      >
        {displayChildren}
      </motion.div>

    </>
  );
}
