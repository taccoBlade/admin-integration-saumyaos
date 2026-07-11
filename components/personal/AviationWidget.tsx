"use client";

import React from "react";

export function AviationWidget() {
  // SVPI Ahmedabad Airport center coordinates
  const amdLat = 23.0772;
  const amdLon = 72.6346;
  const amdPos = { x: 54.48, y: 46.14 };

  // Math to generate a perfect SVG sector path for the radar sweep wedge (45-degree slice)
  const radius = 45;
  const angle1 = -90; // Start at 12 o'clock (top)
  const angle2 = -45; // 45 degrees clockwise
  const rad1 = (angle1 * Math.PI) / 180;
  const rad2 = (angle2 * Math.PI) / 180;
  const x1 = amdPos.x + radius * Math.cos(rad1);
  const y1 = amdPos.y + radius * Math.sin(rad1);
  const x2 = amdPos.x + radius * Math.cos(rad2);
  const y2 = amdPos.y + radius * Math.sin(rad2);
  const sweepPath = `M ${amdPos.x},${amdPos.y} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;

  return (
    <div className="absolute -top-16 left-4 md:-left-8 lg:-left-24 w-60 h-60 z-30 pointer-events-auto transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]">
      {/* Main Glass Dashboard Console */}
      <div className="w-full h-full bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded shadow-[0_0_30px_rgba(0,0,0,0.8)] font-mono text-[9px] text-[#8C8C8C] uppercase tracking-wider relative overflow-hidden flex flex-col justify-stretch">
        
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-25" />
        
        {/* Subtle hardware flicker animation */}
        <div className="absolute inset-0 pointer-events-none z-30 bg-white/[0.005] animate-[flicker_0.15s_infinite]" />

        {/* Console Header */}
        <div className="bg-[#0C0C0C]/95 border-b border-white/10 px-3 py-2 flex items-center justify-between z-40">
          <span className="font-bold text-[8.5px] text-white tracking-[0.2em] flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            RADAR: AMD_VAAH
          </span>
          <span className="text-[7.5px] text-[#666] font-semibold">ADSB // 1090MHZ</span>
        </div>

        {/* Radar Scope Screen */}
        <div className="relative bg-black overflow-hidden select-none flex-grow flex items-stretch z-10">
          
          {/* High-Definition Map Image background - Pure Black and White Contrast */}
          <img 
            src="/images/ahmedabad-map.avif" 
            alt="Ahmedabad Map"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            style={{
              filter: "invert(1) grayscale(1) brightness(0.24) contrast(1.4)",
              mixBlendMode: "screen",
              opacity: 0.2
            }}
          />

          {/* Glowing Map Coordinate overlay */}
          <div className="absolute inset-0 border border-white/[0.03] z-10 pointer-events-none" />

          {/* Outer Interactive SVG Airspace Board */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full bg-transparent transition-all duration-300 relative z-10"
          >
            {/* Grid Lines (Longitude / Latitude intersections) */}
            <g className="stroke-white/[0.03] stroke-[0.08]" strokeDasharray="1 1">
              <line x1="0" y1="25" x2="100" y2="25" />
              <line x1="0" y1="50" x2="100" y2="50" />
              <line x1="0" y1="75" x2="100" y2="75" />
              <line x1="16.6" y1="0" x2="16.6" y2="100" />
              <line x1="33.3" y1="0" x2="33.3" y2="100" />
              <line x1="50.0" y1="0" x2="50.0" y2="100" />
              <line x1="66.6" y1="0" x2="66.6" y2="100" />
              <line x1="83.3" y1="0" x2="83.3" y2="100" />
            </g>

            {/* SVPI Center rings */}
            <g className="stroke-white/10 stroke-[0.1]" fill="none">
              <circle cx={amdPos.x} cy={amdPos.y} r="10" />
              <circle cx={amdPos.x} cy={amdPos.y} r="25" strokeDasharray="0.5 0.5" />
              <circle cx={amdPos.x} cy={amdPos.y} r="40" />
            </g>

            {/* Sabarmati River Path (Faint White Vector) */}
            <path 
              d="M 68,0 Q 56,38 54,46 T 46,75 T 41,100" 
              fill="none" 
              className="stroke-white/10 stroke-[0.4]" 
            />

            {/* SVPI Radar Station Marker */}
            <g transform={`translate(${amdPos.x}, ${amdPos.y})`}>
              <circle r="0.6" fill="white" />
              <circle r="1.5" fill="none" stroke="white" strokeWidth="0.08" className="animate-ping" />
            </g>

            {/* --- TIMELAPSE VECTOR FLIGHT PATHS & PLANES --- */}
            {/* Path 1: transit West -> East */}
            <g>
              {/* Static Airway line matches the plane flight trajectory */}
              <path d="M -10,20 L 110,40" fill="none" className="stroke-white/10 stroke-[0.15]" strokeDasharray="0.5 0.5" />
              <g className="timelapse-plane-1">
                <path d="M 0,-1 L -0.8,0.8 L -0.2,0.8 L 0,0.3 L 0.2,0.8 L 0.8,0.8 Z" fill="white" transform="scale(0.8) rotate(100)" />
                <text x="1.2" y="0.5" fill="white" className="text-[1px] font-mono font-bold scale-[0.8] opacity-70 tracking-wider">UAE502 / FL380</text>
              </g>
            </g>

            {/* Path 2: transit NE -> SW */}
            <g>
              <path d="M 110,5 L -10,95" fill="none" className="stroke-white/10 stroke-[0.15]" strokeDasharray="0.5 0.5" />
              <g className="timelapse-plane-2">
                <path d="M 0,-1 L -0.8,0.8 L -0.2,0.8 L 0,0.3 L 0.2,0.8 L 0.8,0.8 Z" fill="white" transform="scale(0.8) rotate(233)" />
                <text x="1.2" y="0.5" fill="white" className="text-[1px] font-mono font-bold scale-[0.8] opacity-70 tracking-wider">AIC153 / FL390</text>
              </g>
            </g>

            {/* Path 3: local Runway 23 Landing vector */}
            <g>
              <path d="M 110,20 Q 80,30 54.48,46.14" fill="none" className="stroke-white/10 stroke-[0.15]" strokeDasharray="0.5 0.5" />
              <g className="timelapse-plane-3">
                <path d="M 0,-1 L -0.8,0.8 L -0.2,0.8 L 0,0.3 L 0.2,0.8 L 0.8,0.8 Z" fill="white" transform="scale(0.8) rotate(240)" />
                <text x="1.2" y="0.5" fill="white" className="text-[1.1px] font-mono font-bold scale-[0.8] tracking-wider">IGO2091 / APRCH</text>
              </g>
            </g>

            {/* Path 4: local Runway 05 Takeoff vector */}
            <g>
              <path d="M 54.48,46.14 L 30,55 Q 5,65 -10,70" fill="none" className="stroke-white/10 stroke-[0.15]" strokeDasharray="0.5 0.5" />
              <g className="timelapse-plane-4">
                <path d="M 0,-1 L -0.8,0.8 L -0.2,0.8 L 0,0.3 L 0.2,0.8 L 0.8,0.8 Z" fill="white" transform="scale(0.8) rotate(250)" />
                <text x="1.2" y="0.5" fill="white" className="text-[1.1px] font-mono font-bold scale-[0.8] tracking-wider">SEJ332 / DEP</text>
              </g>
            </g>

            {/* Path 5: transit SE -> NW */}
            <g>
              <path d="M 90,110 L 10,-10" fill="none" className="stroke-white/10 stroke-[0.15]" strokeDasharray="0.5 0.5" />
              <g className="timelapse-plane-5">
                <path d="M 0,-1 L -0.8,0.8 L -0.2,0.8 L 0,0.3 L 0.2,0.8 L 0.8,0.8 Z" fill="white" transform="scale(0.8) rotate(326)" />
                <text x="1.2" y="0.5" fill="white" className="text-[1px] font-mono font-bold scale-[0.8] opacity-70 tracking-wider">QTR55A / FL320</text>
              </g>
            </g>

            {/* Sweeping Radar Scanner Wedge (Rotates around AMD airport) */}
            <path 
              d={sweepPath} 
              fill="url(#radarSweepGrad)" 
              className="radar-sweep-line pointer-events-none" 
            />

            {/* Definitions for SVG gradients */}
            <defs>
              <radialGradient id="radarSweepGrad" cx={`${amdPos.x}%`} cy={`${amdPos.y}%`} r="45%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
          </svg>

          {/* Coordinate label overlay */}
          <div className="absolute bottom-2 right-2 bg-black/80 border border-white/5 px-1 py-0.2 rounded font-mono text-[6px] text-slate-500 pointer-events-none z-20 flex gap-1">
            <span>{amdLat.toFixed(3)}N</span>
            <span>{amdLon.toFixed(3)}E</span>
          </div>

          {/* Sweep status dot */}
          <div className="absolute bottom-2 left-2 bg-black/80 border border-white/5 px-1.5 py-0.2 rounded font-mono text-[6px] text-white pointer-events-none z-20 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            <span>SWEEP_ACTIVE</span>
          </div>

        </div>

      </div>

      {/* Embedded CSS animations for path mapping & sweep effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flicker {
          0% { opacity: 0.98; }
          50% { opacity: 1; }
          100% { opacity: 0.99; }
        }

        /* Animate plane groups along SVG paths in browser with ROTATION OFF */
        .timelapse-plane-1 {
          offset-path: path('M -10,20 L 110,40');
          offset-rotate: 0deg; /* Keep group and text completely horizontal */
          animation: flight-motion 10s linear infinite;
        }
        .timelapse-plane-2 {
          offset-path: path('M 110,5 L -10,95');
          offset-rotate: 0deg;
          animation: flight-motion 13s linear infinite;
        }
        .timelapse-plane-3 {
          offset-path: path('M 110,20 Q 80,30 54.48,46.14');
          offset-rotate: 0deg;
          animation: flight-motion 8s ease-out infinite;
        }
        .timelapse-plane-4 {
          offset-path: path('M 54.48,46.14 L 30,55 Q 5,65 -10,70');
          offset-rotate: 0deg;
          animation: flight-motion 9s ease-in infinite;
        }
        .timelapse-plane-5 {
          offset-path: path('M 90,110 L 10,-10');
          offset-rotate: 0deg;
          animation: flight-motion 14s linear infinite;
        }

        @keyframes flight-motion {
          0% { offset-distance: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }

        .radar-sweep-line {
          transform-origin: ${amdPos.x}% ${amdPos.y}%;
          animation: sweep 6s linear infinite;
        }

        @keyframes sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
