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
    accent: "#d4af37", // gold
    accentGlow: "rgba(212, 175, 55, 0.15)",
    bgGradient: "from-archive-900 via-archive-800 to-black",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  builder: {
    accent: "#d4af37", // gold
    accentGlow: "rgba(212, 175, 55, 0.2)",
    bgGradient: "from-[#1a1c21] via-[#111111] to-[#0a0a0a]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  execution: {
    accent: "#c9a35a", // slightly muted gold
    accentGlow: "rgba(201, 163, 90, 0.25)",
    bgGradient: "from-[#111111] via-[#0d0d0d] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  research: {
    accent: "#f3ca3e", // bright gold
    accentGlow: "rgba(243, 202, 62, 0.2)",
    bgGradient: "from-[#1c1e24] via-[#111111] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  reflection: {
    accent: "#b59530", // dark gold
    accentGlow: "rgba(181, 149, 48, 0.15)",
    bgGradient: "from-[#151515] via-[#0d0d0d] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  lockin: {
    accent: "#f3ca3e", // bright gold
    accentGlow: "rgba(243, 202, 62, 0.25)",
    bgGradient: "from-[#111111] via-[#0a0a0a] to-[#000000]",
    particleSpeed: 1.6, // faster particles
    particleCount: 90,
    ambientSoundRate: 1.0,
  },
  ride: {
    accent: "#6c757d", // slate/archive-600
    accentGlow: "rgba(108, 117, 125, 0.25)",
    bgGradient: "from-[#121417] via-[#0a0a0a] to-[#000000]",
    particleSpeed: 0.35, // slow stars
    particleCount: 65,
    ambientSoundRate: 1.0,
  },
  chill: {
    accent: "#adb5bd", // light slate/archive-500
    accentGlow: "rgba(173, 181, 189, 0.2)",
    bgGradient: "from-[#141517] via-[#08090b] to-[#000000]",
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
