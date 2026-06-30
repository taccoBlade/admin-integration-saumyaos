"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { PLAYLISTS } from "./playlists";

export type OSMode = "neutral" | "builder" | "execution" | "research" | "reflection" | "lockin" | "ride" | "chill";
export type OSModule = "none" | "fitness" | "riding" | "video" | "learning" | "engineering";
export type PlaylistName = "header" | "lockin" | "ride" | "chill" | "mix";

export interface LogEntry {
  id: string;
  time: string;
  source: string;
  message: string;
}

export interface Track {
  title: string;
  artist: string;
  src: string;
  artwork?: string;
  coverUrl?: string; // legacy mapping
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
  
  // Audio state variables
  activePlaylist: PlaylistName;
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  currentTrack: Track | null;
  
  // Audio functions
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (v: number) => void;
  setIsMuted: (m: boolean) => void;
  seek: (time: number) => void;
  setPlaylist: (name: PlaylistName) => void;
  playTrack: (playlistName: PlaylistName, index: number) => void;
  
  // Compatibility fallbacks
  currentTrackIndexLegacy: number;
  setCurrentTrackIndexLegacy: (idx: number) => void;
  isPlayingTrackLegacy: boolean;
  setIsPlayingTrackLegacy: (playing: boolean) => void;

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
    accent: "#d4af37",
    accentGlow: "rgba(212, 175, 55, 0.15)",
    bgGradient: "from-archive-900 via-archive-800 to-black",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  builder: {
    accent: "#d4af37",
    accentGlow: "rgba(212, 175, 55, 0.2)",
    bgGradient: "from-[#1a1c21] via-[#111111] to-[#0a0a0a]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  execution: {
    accent: "#c9a35a",
    accentGlow: "rgba(201, 163, 90, 0.25)",
    bgGradient: "from-[#111111] via-[#0d0d0d] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  research: {
    accent: "#f3ca3e",
    accentGlow: "rgba(243, 202, 62, 0.2)",
    bgGradient: "from-[#1c1e24] via-[#111111] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  reflection: {
    accent: "#b59530",
    accentGlow: "rgba(181, 149, 48, 0.15)",
    bgGradient: "from-[#151515] via-[#0d0d0d] to-[#000000]",
    particleSpeed: 0.5,
    particleCount: 50,
    ambientSoundRate: 1.0,
  },
  lockin: {
    accent: "#f3ca3e",
    accentGlow: "rgba(243, 202, 62, 0.25)",
    bgGradient: "from-[#111111] via-[#0a0a0a] to-[#000000]",
    particleSpeed: 1.6,
    particleCount: 90,
    ambientSoundRate: 1.0,
  },
  ride: {
    accent: "#6c757d",
    accentGlow: "rgba(108, 117, 125, 0.25)",
    bgGradient: "from-[#121417] via-[#0a0a0a] to-[#000000]",
    particleSpeed: 0.35,
    particleCount: 65,
    ambientSoundRate: 1.0,
  },
  chill: {
    accent: "#adb5bd",
    accentGlow: "rgba(173, 181, 189, 0.2)",
    bgGradient: "from-[#141517] via-[#08090b] to-[#000000]",
    particleSpeed: 0.18,
    particleCount: 45,
    ambientSoundRate: 1.0,
  },
};

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [isBooted, setIsBooted] = useState(false);
  const [mode, setMode] = useState<OSMode>("neutral");
  const [activeModule, setActiveModule] = useState<OSModule>("none");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Centered global audio states
  const [mixPlaylist, setMixPlaylist] = useState<Track[]>([]);
  const [activePlaylist, setPlaylistState] = useState<PlaylistName>("mix");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMutedState] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextTrackRef = useRef<() => void>(() => {});

  useEffect(() => {
    const allTracks = [
      ...(PLAYLISTS.lockin || []),
      ...(PLAYLISTS.ride || []),
      ...(PLAYLISTS.chill || [])
    ];
    // Fisher-Yates shuffle
    for (let i = allTracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTracks[i], allTracks[j]] = [allTracks[j], allTracks[i]];
    }
    setMixPlaylist(allTracks);
  }, []);

  const getTracks = (name: PlaylistName): Track[] => {
    if (name === "header") return PLAYLISTS.chill;
    if (name === "mix") return mixPlaylist;
    return PLAYLISTS[name] || [];
  };

  const tracks = getTracks(activePlaylist);
  const currentTrack = tracks[currentTrackIndex] || null;

  const addLog = (source: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: timestamp,
      source: source.toUpperCase(),
      message,
    };
    setLogs((prev) => [newEntry, ...prev].slice(0, 100));
  };

  const boot = () => {
    setIsBooted(true);
    addLog("system", "SAUMYA.OS Boot Successful V4.1");
    addLog("system", "Neutral Mode Engaged");
  };

  // Sync mode with playlists
  useEffect(() => {
    if (mode === "lockin" || mode === "ride" || mode === "chill") {
      setPlaylistState(mode);
      setCurrentTrackIndex(0);
    }
  }, [mode]);

  useEffect(() => {
    if (isBooted) {
      if (activeModule === "none") {
        addLog("system", "Returning to Neutral Orbits desktop");
      } else {
        addLog("system", `Launching subsystem module: ${activeModule.toUpperCase()}`);
      }
    }
  }, [activeModule, isBooted]);

  // Next track ref updater to prevent stale closures in event listeners
  useEffect(() => {
    nextTrackRef.current = () => {
      const currentTracks = getTracks(activePlaylist);
      if (currentTracks.length === 0) return;
      setCurrentTrackIndex((prev) => (prev + 1) % currentTracks.length);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlaylist]);

  // Sync volume state with Audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Track changes logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.load();
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error("Playback error on track change:", e);
          setIsPlaying(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Controls implementations
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = isMuted ? 0 : volume;
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error("Toggle play error:", e);
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    const currentTracks = getTracks(activePlaylist);
    if (currentTracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % currentTracks.length);
  };

  const prevTrack = () => {
    const currentTracks = getTracks(activePlaylist);
    if (currentTracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + currentTracks.length) % currentTracks.length);
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : v;
    }
  };

  const setIsMuted = (m: boolean) => {
    setIsMutedState(m);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = m ? 0 : volume;
    }
  };

  const playTrack = (playlistName: PlaylistName, index: number) => {
    setPlaylistState(playlistName);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const setPlaylist = (name: PlaylistName) => {
    setPlaylistState(name);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
  };

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
        
        // Audio states
        activePlaylist,
        currentTrackIndex,
        isPlaying,
        volume,
        isMuted,
        currentTime,
        duration,
        currentTrack,
        
        // Audio functions
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        setIsMuted,
        seek,
        setPlaylist,
        playTrack,

        // Legacy compatibility mappings
        currentTrackIndexLegacy: currentTrackIndex,
        setCurrentTrackIndexLegacy: setCurrentTrackIndex,
        isPlayingTrackLegacy: isPlaying,
        setIsPlayingTrackLegacy: setIsPlaying,
        
        theme,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        preload="none"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onEnded={() => nextTrackRef.current()}
      />
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
