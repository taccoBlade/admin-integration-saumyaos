"use client";

import React, { useState, useEffect, useRef } from "react";

export function CinemaAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<any[]>([]);
  const lfoIntervalRef = useRef<any>(null);

  const startSynth = () => {
    try {
      // 1. Create AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 2. Setup Delay and Reverb filter nodes
      const delay = ctx.createDelay(2.0);
      delay.delayTime.value = 0.8;
      
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.55;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 350;
      filter.Q.value = 2.0;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.0); // Fade in over 2 seconds

      // Wire up delay feedback loop
      delay.connect(delayFeedback);
      delayFeedback.connect(filter);
      filter.connect(delay);

      // Wire master pipeline
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // 3. Create oscillators for A minor 7 chord (A2, C3, E3, G3)
      const frequencies = [110.00, 130.81, 164.81, 196.00]; 
      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        // Alternating triangle and sawtooth waves for warmth and depth
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Detune slightly for lush unison chorus effect
        osc.detune.setValueAtTime((Math.random() - 0.5) * 12, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.08;

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();

        oscillators.push(osc);
        gains.push(oscGain);
      });

      // Keep references to clean up later
      nodesRef.current = [...oscillators, ...gains, filter, delay, delayFeedback, masterGain];

      // 4. LFO filter sweep (modulates cutoff frequency ambiently)
      let time = 0;
      lfoIntervalRef.current = setInterval(() => {
        time += 0.05;
        const newFreq = 300 + Math.sin(time) * 120; // Sweeps between 180Hz and 420Hz
        filter.frequency.setValueAtTime(newFreq, ctx.currentTime);
      }, 50);

      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to initialize Web Audio synth:", error);
    }
  };

  const stopSynth = () => {
    // Fade out gain node
    const ctx = audioCtxRef.current;
    const masterGain = nodesRef.current[nodesRef.current.length - 1]; // Master gain is the last node
    
    if (ctx && masterGain && masterGain.gain) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0); // Fade out over 1s
    }

    // Stop oscillators and close context after fade
    setTimeout(() => {
      if (lfoIntervalRef.current) {
        clearInterval(lfoIntervalRef.current);
        lfoIntervalRef.current = null;
      }
      
      nodesRef.current.forEach(node => {
        try {
          if (node && node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      nodesRef.current = [];

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
      setIsPlaying(false);
    }, 1000);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSynth();
    } else {
      startSynth();
    }
  };

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      if (lfoIntervalRef.current) clearInterval(lfoIntervalRef.current);
      nodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Equalizer Wave Bars */}
      <div className="flex items-end gap-[2px] h-3.5 w-6 overflow-hidden">
        <div className={`w-[2.5px] bg-[#d4af37] rounded-full transition-all duration-300 ${isPlaying ? "animate-[eq-bar-1_0.7s_infinite_ease-in-out]" : "h-1"}`} style={{ height: isPlaying ? undefined : "3px" }} />
        <div className={`w-[2.5px] bg-[#d4af37] rounded-full transition-all duration-300 ${isPlaying ? "animate-[eq-bar-2_0.9s_infinite_ease-in-out]" : "h-1"}`} style={{ height: isPlaying ? undefined : "6px" }} />
        <div className={`w-[2.5px] bg-[#d4af37] rounded-full transition-all duration-300 ${isPlaying ? "animate-[eq-bar-3_0.5s_infinite_ease-in-out]" : "h-1"}`} style={{ height: isPlaying ? undefined : "4px" }} />
        <div className={`w-[2.5px] bg-[#d4af37] rounded-full transition-all duration-300 ${isPlaying ? "animate-[eq-bar-4_0.8s_infinite_ease-in-out]" : "h-1"}`} style={{ height: isPlaying ? undefined : "8px" }} />
        <div className={`w-[2.5px] bg-[#d4af37] rounded-full transition-all duration-300 ${isPlaying ? "animate-[eq-bar-1_0.6s_infinite_ease-in-out]" : "h-1"}`} style={{ height: isPlaying ? undefined : "2px" }} />
      </div>

      <button 
        onClick={togglePlayback}
        className="flex items-center gap-2 bg-[#050505]/75 backdrop-blur border border-white/10 hover:border-[#d4af37]/30 px-3 py-1.5 rounded-full transition-all text-[8px] font-mono tracking-widest text-[#A3A3A3] hover:text-white"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-ping" : "bg-slate-600"}`} />
        {isPlaying ? "CINEMA_AMBIENT: ON" : "PLAY_CINEMA_DRONE"}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes eq-bar-1 {
          0%, 100% { height: 3px; }
          50% { height: 12px; }
        }
        @keyframes eq-bar-2 {
          0%, 100% { height: 6px; }
          50% { height: 14px; }
        }
        @keyframes eq-bar-3 {
          0%, 100% { height: 4px; }
          50% { height: 10px; }
        }
        @keyframes eq-bar-4 {
          0%, 100% { height: 8px; }
          50% { height: 13px; }
        }
      `}} />
    </div>
  );
}
