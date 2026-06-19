"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function PullCord() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isSwinging, setIsSwinging] = useState(false);
  const dragY = useMotionValue(0);

  // Smooth string elasticity using Framer Motion springs
  const stringY = useSpring(dragY, { stiffness: 300, damping: 20, mass: 0.5 });
  const scaleY = useTransform(stringY, [0, 100], [1, 1.6]);
  
  // Set initial theme based on class on the HTML tag
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  // Synthesize a realistic mechanical light-switch click sound
  const playMechanicalClick = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // High-pitched mechanical switch snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);

      // Low-pitched springy mechanical thud
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(100, ctx.currentTime + 0.01);
      osc2.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.1);
      
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
      
      osc2.start();
      osc2.stop(ctx.currentTime + 0.11);
    } catch (e) {
      console.warn("Mechanical click audio synthesis failed or blocked by autoplay browser restrictions:", e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    
    // Toggle class on documentElement
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    
    setTheme(nextTheme);
    playMechanicalClick();
    
    // Trigger swing effect when released
    setIsSwinging(true);
    setTimeout(() => setIsSwinging(false), 1200);
  };

  // Click handler for desktop simple click toggle
  const handleClick = () => {
    // Animate pull down quickly
    dragY.set(65);
    setTimeout(() => {
      dragY.set(0);
      toggleTheme();
    }, 150);
  };

  return (
    <div className="fixed top-0 right-6 sm:right-12 z-[150] flex flex-col items-center">
      {/* Hanging Cord String */}
      <motion.div
        style={{
          y: stringY,
          scaleY: scaleY,
          originY: 0,
        }}
        className={`w-[1.5px] h-28 sm:h-36 bg-gradient-to-b ${
          theme === "dark" 
            ? "from-slate-800 via-slate-600 to-amber-500" 
            : "from-slate-200 via-slate-400 to-slate-800"
        } ${isSwinging ? "swing-animation" : ""}`}
      />

      {/* Pull Handle (Bead) */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 85 }}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 18 }}
        style={{ y: stringY }}
        onDragEnd={(_, info) => {
          // If pulled down past threshold, toggle theme
          if (info.offset.y > 35) {
            toggleTheme();
          }
          dragY.set(0);
        }}
        onClick={handleClick}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          theme === "dark"
            ? "bg-[#0F172A] border-amber-500 text-amber-500"
            : "bg-white border-slate-800 text-slate-800"
        } ${isSwinging ? "swing-animation" : ""}`}
        title="Pull or click to toggle Light/Dark mode"
      >
        {/* Toggle Icon Inside Handle */}
        {theme === "dark" ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.div>
    </div>
  );
}
