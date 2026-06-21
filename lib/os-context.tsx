"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type OSMode = "neutral" | "builder" | "execution" | "research" | "reflection" | "lockin" | "ride" | "chill";
export type OSModule = "none" | "fitness" | "riding" | "video" | "learning" | "engineering";

export interface LogEntry {
  id: string;
  time: string;
  source: string;
  message: string;
}

interface OSContextType {
  isBooted: boolean;
  boot: () => void;
  mode: OSMode;
  setMode: (mode: OSMode) => void;
  activeModule: OSModule;
  setActiveModule: (module: OSModule) => void;
  logs: LogEntry[];
  addLog: (source: string, message: string) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (idx: number) => void;
  isPlayingTrack: boolean;
  setIsPlayingTrack: (playing: boolean) => void;
  theme: {
    accent: string;
    accentGlow: string;
    bgGradient: string;
    particleSpeed: number;
    particleCount: number;
    ambientSoundRate: number;
  };
}

const OSContext = createContext<OSContextType | undefined>(undefined);

const THEMES: Record<OSMode, OSContextType["theme"]> = {
  neutral: {
    accent: "#22d3ee", // cyan-400
    accentGlow: "rgba(34, 211, 238, 0.15)",
    bgGradient: "from-[#080a0f] via-[#050608] to-[#010203]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  builder: {
    accent: "#f59e0b", // amber-500
    accentGlow: "rgba(245, 158, 11, 0.2)",
    bgGradient: "from-[#0d0903] via-[#060401] to-[#010100]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  execution: {
    accent: "#ef4444", // red-500
    accentGlow: "rgba(239, 68, 68, 0.25)",
    bgGradient: "from-[#0f0404] via-[#070101] to-[#020000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  research: {
    accent: "#06b6d4", // cyan-500
    accentGlow: "rgba(6, 182, 212, 0.2)",
    bgGradient: "from-[#02090b] via-[#010405] to-[#000102]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  reflection: {
    accent: "#b91c1c", // red-700
    accentGlow: "rgba(185, 28, 28, 0.15)",
    bgGradient: "from-[#080202] via-[#030101] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  lockin: {
    accent: "#f97316", // red/amber accent
    accentGlow: "rgba(249, 115, 22, 0.25)",
    bgGradient: "from-[#110505] via-[#080202] to-[#020000]",
    particleSpeed: 1.6, // faster particles
    particleCount: 90,
    ambientSoundRate: 1.0,
  },
  ride: {
    accent: "#3b82f6", // deep blue theme
    accentGlow: "rgba(59, 130, 246, 0.25)",
    bgGradient: "from-[#020617] via-[#00020d] to-[#000002]",
    particleSpeed: 0.35, // slow stars
    particleCount: 65,
    ambientSoundRate: 1.0,
  },
  chill: {
    accent: "#8b5cf6", // soft purple glow
    accentGlow: "rgba(139, 92, 246, 0.2)",
    bgGradient: "from-[#090514] via-[#030107] to-[#000000]",
    particleSpeed: 0.18, // soft floating dust particles
    particleCount: 45,
    ambientSoundRate: 1.0,
  },
};

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [isBooted, setIsBooted] = useState(false);
  const [mode, setMode] = useState<OSMode>("neutral");
  const [activeModule, setActiveModule] = useState<OSModule>("none");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingTrack, setIsPlayingTrack] = useState(false);

  const addLog = (source: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: timestamp,
      source: source.toUpperCase(),
      message,
    };
    setLogs((prev) => [newEntry, ...prev].slice(0, 100)); // cap at 100 entries
  };

  const boot = () => {
    setIsBooted(true);
    addLog("system", "SAUMYA.OS Boot Successful V4.1");
    addLog("system", "Neutral Mode Engaged");
  };

  // Log module changes
  useEffect(() => {
    if (isBooted) {
      if (activeModule === "none") {
        addLog("system", "Returning to Neutral Orbits desktop");
      } else {
        addLog("system", `Launching subsystem module: ${activeModule.toUpperCase()}`);
      }
    }
  }, [activeModule, isBooted]);

  const theme = THEMES[mode];

  return (
    <OSContext.Provider
      value={{
        isBooted,
        boot,
        mode,
        setMode,
        activeModule,
        setActiveModule,
        logs,
        addLog,
        currentTrackIndex,
        setCurrentTrackIndex,
        isPlayingTrack,
        setIsPlayingTrack,
        theme,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error("useOS must be used within an OSProvider");
  }
  return context;
}
