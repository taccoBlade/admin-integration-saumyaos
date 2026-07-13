"use client";

import React, { useState, useEffect } from "react";

export function ProtocolReceipt() {
  const [time, setTime] = useState("");
  const [heartRate, setHeartRate] = useState(128);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false }) + " LST");
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }) + " LST");
      // Simulate real-time fluctuating heart rate
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + change;
        return Math.max(115, Math.min(145, next));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex absolute top-2 right-4 md:top-12 md:-right-8 lg:-right-32 w-56 flex-col gap-2 z-20 pointer-events-auto transition-all duration-500 hover:scale-[1.02]">
      {/* Subtle Glow backing */}
      <div className="absolute inset-0 bg-[#d4af37]/[0.02] blur-xl rounded-lg pointer-events-none" />

      {/* Main Glass Receipt Container */}
      <div className="bg-[#050505]/85 backdrop-blur-xl border border-white/10 p-4 shadow-[0_0_40px_rgba(0,0,0,0.8),_inset_0_0_20px_rgba(212,175,55,0.03)] font-mono text-[9px] text-[#A3A3A3] leading-relaxed uppercase tracking-wider relative rounded-sm">
        
        {/* SVG Zigzag Tear Edge Effect (Top) */}
        <div className="absolute top-0 inset-x-0 h-1 overflow-hidden -translate-y-[3px] pointer-events-none">
          <svg className="w-full h-1 text-white/10 fill-current" viewBox="0 0 100 10" preserveAspectRatio="none">
            <polygon points="0,10 5,0 10,10 15,0 20,10 25,0 30,10 35,0 40,10 45,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10" />
          </svg>
        </div>

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] opacity-20" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3 text-[#d4af37]">
          <span className="font-bold tracking-[0.15em] text-[10px] flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#d4af37]"></span>
            </span>
            SYS_LOG // PROTOCOL
          </span>
          <span className="text-[7px] text-[#666] font-semibold">TKT_083</span>
        </div>
        
        {/* Core Protocol Info */}
        <div className="flex flex-col gap-2 border-b border-white/5 pb-2.5 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">ACTIVE_MODE:</span>
            <span className="text-white font-bold bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
              HYPERTROPHY
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">TARGET_GRP:</span>
            <span className="text-white font-semibold">POSTERIOR CHAIN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">SYS_STATUS:</span>
            <span className="text-emerald-400 font-bold tracking-widest">NOMINAL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">TIMESTAMP:</span>
            <span className="text-white font-mono">{time || "14:40:38 LST"}</span>
          </div>
        </div>

        {/* Simulated Bio-Metrics / EKG Readout */}
        <div className="mb-3">
          <div className="flex justify-between text-[7px] text-slate-500 mb-1">
            <span>BIO_METRICS // PULSE</span>
            <span className="text-[#d4af37]/80 font-bold">{heartRate} BPM</span>
          </div>
          
          {/* Real-time moving EKG/Heartbeat Wave SVG */}
          <div className="h-8 bg-black/60 border border-white/5 rounded overflow-hidden relative flex items-center">
            <svg className="w-full h-full text-emerald-500/80 opacity-90 stroke-current" viewBox="0 0 200 40" fill="none" strokeWidth="1.5">
              <path d="M0,20 L40,20 L45,15 L50,25 L55,20 L80,20 L85,5 L90,35 L95,20 L120,20 L125,15 L130,25 L135,20 L170,20 L175,8 L180,32 L185,20 L200,20" 
                    className="animate-[ekg_2s_linear_infinite]"
                    style={{ strokeDasharray: "200", strokeDashoffset: "200" }} 
              />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black pointer-events-none" />
          </div>
        </div>

        {/* Biosensor stats */}
        <div className="grid grid-cols-2 gap-2 text-[7px] text-slate-500 border-b border-white/5 pb-2.5 mb-3">
          <div className="flex flex-col">
            <span>CNS_FATIGUE</span>
            <span className="font-semibold text-white/90">24.5% // STABLE</span>
          </div>
          <div className="flex flex-col">
            <span>LACTATE_EST</span>
            <span className="font-semibold text-white/90">1.8 MMOL/L</span>
          </div>
        </div>

        {/* Barcode graphic */}
        <div className="flex flex-col items-center gap-1 opacity-70">
          <div className="w-full flex justify-between h-5">
            <div className="w-1 bg-[#d4af37] h-full" />
            <div className="w-0.5 bg-[#d4af37] h-full opacity-60" />
            <div className="w-3 bg-[#d4af37] h-full" />
            <div className="w-0.5 bg-[#d4af37] h-full" />
            <div className="w-1 bg-[#d4af37] h-full" />
            <div className="w-2 bg-[#d4af37] h-full opacity-80" />
            <div className="w-0.5 bg-[#d4af37] h-full" />
            <div className="w-3 bg-[#d4af37] h-full opacity-90" />
            <div className="w-1.5 bg-[#d4af37] h-full" />
            <div className="w-0.5 bg-[#d4af37] h-full opacity-50" />
            <div className="w-1 bg-[#d4af37] h-full" />
          </div>
          <span className="text-[6px] text-slate-600 tracking-[0.3em] font-bold">GYM_SYS_METRIC_0x7FB</span>
        </div>

        {/* SVG Zigzag Tear Edge Effect (Bottom) */}
        <div className="absolute bottom-0 inset-x-0 h-1 overflow-hidden translate-y-[3px] pointer-events-none">
          <svg className="w-full h-1 text-white/10 fill-current rotate-180" viewBox="0 0 100 10" preserveAspectRatio="none">
            <polygon points="0,10 5,0 10,10 15,0 20,10 25,0 30,10 35,0 40,10 45,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10" />
          </svg>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ekg {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
      `}} />
    </div>
  );
}
