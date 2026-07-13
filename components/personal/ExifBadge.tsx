"use client";

import React from "react";

interface ExifBadgeProps {
  exif?: string;
  className?: string;
}

export function ExifBadge({ exif, className = "" }: ExifBadgeProps) {
  if (!exif) return null;

  return (
    <div className={`absolute bottom-3 left-3 z-20 pointer-events-none transition-opacity duration-500 opacity-80 md:opacity-0 md:group-hover:opacity-100 ${className}`}>
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded text-[9px] md:text-[10px] font-mono tracking-widest text-[#d4af37]/80 uppercase shadow-xl">
        <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{exif}</span>
      </div>
    </div>
  );
}
