"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOS } from "@/lib/os-context";
import { sysAudio } from "@/lib/audio-engine";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Repeat1,
} from "lucide-react";

const PLAYLISTS = {
  lockin: [
    { title: "Run Boy Run", artist: "Woodkid" },
    { title: "Legends Never Die", artist: "Against The Current" },
    { title: "Warriors", artist: "Imagine Dragons" },
    { title: "Hall of Fame", artist: "The Script" },
    { title: "Believer", artist: "Imagine Dragons" },
    { title: "Centuries", artist: "Fall Out Boy" },
    { title: "Way Down We Go", artist: "KALEO" },
    { title: "The Nights", artist: "Avicii" },
    { title: "Arjan Vailly", artist: "Bhupinder Babbal" },
    { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh" },
    { title: "Brothers Anthem", artist: "Vishal-Shekhar" },
    { title: "Zinda", artist: "Amit Trivedi" },
  ],
  ride: [
    { title: "After Dark", artist: "Mr.Kitty" },
    { title: "Midnight City", artist: "M83" },
    { title: "Sweater Weather", artist: "The Neighbourhood" },
    { title: "Heat Waves", artist: "Glass Animals" },
    { title: "Husn", artist: "Anuv Jain" },
    { title: "Kho Gaye Hum Kahan", artist: "Jasleen Royal & Prateek Kuhad" },
    { title: "O Sanam", artist: "Lucky Ali" },
    { title: "Kasoor", artist: "Prateek Kuhad" },
    { title: "Sajni", artist: "Jal" },
    { title: "Choo Lo", artist: "The Local Train" },
    { title: "Paradise", artist: "Coldplay" },
    { title: "Nightcall", artist: "Kavinsky" },
  ],
  chill: [
    { title: "Experience", artist: "Ludovico Einaudi" },
    { title: "Time", artist: "Hans Zimmer" },
    { title: "Cornfield Chase", artist: "Hans Zimmer" },
    { title: "Interstellar Main Theme", artist: "Hans Zimmer" },
    { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
    { title: "Sunset Lover", artist: "Petit Biscuit" },
    { title: "Baarishein", artist: "Anuv Jain" },
    { title: "Gul", artist: "Anuv Jain" },
    { title: "Iktara", artist: "Amit Trivedi" },
    { title: "Until I Found You", artist: "Stephen Sanchez" },
  ],
};

const MODE_INFOS = {
  lockin: {
    name: "LOCK_IN.sys",
    quote: "Discipline beats motivation. Execution is everything.",
    statusTitle: "LOCK_IN TELEMETRY",
    stats: [
      { label: "STATUS", value: "EXECUTION" },
      { label: "HEART RATE", value: "ELEVATED" },
      { label: "FOCUS MODE", value: "ACTIVE" },
      { label: "TRACKS", value: "47" },
    ],
  },
  ride: {
    name: "RIDE.sys",
    quote: "Four wheels move the body. Two wheels move the soul.",
    statusTitle: "ROUTE TELEMETRY",
    stats: [
      { label: "ROUTE ARCHIVE", value: "ACTIVE" },
      { label: "CURRENT MODE", value: "CRUISING" },
      { label: "EST. SUNSET", value: "18:57" },
      { label: "FUEL STATUS", value: "STABLE" },
    ],
  },
  chill: {
    name: "CHILL.sys",
    quote: "Reflection is the path to design and engineering clarity.",
    statusTitle: "REFLECTION PARAMS",
    stats: [
      { label: "SYSTEM STATE", value: "REFLECTION" },
      { label: "ACTIVE ALERTS", value: "NONE" },
      { label: "CREATIVE PROCESS", value: "RUNNING" },
      { label: "THREAD COUNT", value: "MAX" },
    ],
  },
};

export function DashboardWidgets() {
  const { mode, setMode, addLog, theme } = useOS();

  // Mode local resolve
  const activeMode = (mode === "lockin" || mode === "ride" || mode === "chill") ? mode : "chill";
  const currentPlaylist = PLAYLISTS[activeMode];

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(30);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [loopMode, setLoopMode] = useState<"none" | "track" | "playlist">("playlist");
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  // iTunes preview URLs and Artworks cache
  const [trackUrls, setTrackUrls] = useState<Record<string, string>>({});
  const [trackArtworks, setTrackArtworks] = useState<Record<string, string>>({});
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  // local log console
  const [playerLogs, setPlayerLogs] = useState<string[]>(["[SOUNDTRACK.sys ACTIVE]"]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const addPlayerLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setPlayerLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, 12));
  }, []);

  const track = currentPlaylist[currentTrackIndex] || currentPlaylist[0] || { title: "Unknown", artist: "Unknown" };
  const trackKey = `${activeMode}-${currentTrackIndex}`;

  // Mode change handler
  const handleModeSelect = (m: "lockin" | "ride" | "chill") => {
    sysAudio.playSwitch();
    setMode(m);
    addLog("system", `${MODE_INFOS[m].name} loaded. Executing telemetry sync.`);
    addPlayerLog(`SYSTEM_MODE_CHANGE: ${MODE_INFOS[m].name}`);
  };

  // Sync mode changes with track index resets
  const lastActiveModeRef = useRef(activeMode);
  useEffect(() => {
    if (activeMode !== lastActiveModeRef.current) {
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setIsPlaying(false);
      lastActiveModeRef.current = activeMode;
    }
  }, [activeMode]);

  // Preload preview for active mode on index change or playlist mount
  useEffect(() => {
    const activePlaylist = PLAYLISTS[activeMode];
    // Preload current, prev, and next tracks for zero latency swaps
    const indicesToLoad = [
      currentTrackIndex,
      (currentTrackIndex - 1 + activePlaylist.length) % activePlaylist.length,
      (currentTrackIndex + 1) % activePlaylist.length,
    ];

    indicesToLoad.forEach((idx) => {
      const currentTrack = activePlaylist[idx];
      if (!currentTrack) return;
      const key = `${activeMode}-${idx}`;
      if (trackUrls[key]) return;

      const query = encodeURIComponent(`${currentTrack.artist} ${currentTrack.title}`);
      fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results[0]) {
            const previewUrl = data.results[0].previewUrl || "";
            const artworkUrl = data.results[0].artworkUrl100 
              ? data.results[0].artworkUrl100.replace("100x100bb", "300x300bb") 
              : "";
              
            setTrackUrls((prev) => ({ ...prev, [key]: previewUrl }));
            setTrackArtworks((prev) => ({ ...prev, [key]: artworkUrl }));
          }
        })
        .catch((err) => console.error("Error preloading preview", err));
    });
  }, [activeMode, currentTrackIndex, trackUrls]);

  // Initialize HTML5 Audio Ref
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % currentPlaylist.length);
    setCurrentTime(0);
  }, [currentPlaylist.length]);

  const handlePrev = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + currentPlaylist.length) % currentPlaylist.length);
    setCurrentTime(0);
  }, [currentPlaylist.length]);

  const handleTrackEnd = useCallback(() => {
    if (loopMode === "track") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => console.error("Replay failed", err));
      }
      setCurrentTime(0);
    } else if (loopMode === "playlist") {
      handleNext();
    } else {
      if (currentTrackIndex < currentPlaylist.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  }, [loopMode, currentTrackIndex, currentPlaylist.length, handleNext]);

  // Sync volume state with Audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Sync playback state and source URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = trackUrls[trackKey];
    if (isPlaying && url) {
      if (audio.src !== url) {
        setIsLoadingTrack(true);
        audio.src = url;
        audio.load();
      }
      audio.play()
        .then(() => setIsLoadingTrack(false))
        .catch((err) => {
          console.error("Playback failed", err);
          setIsPlaying(false);
        });
    } else {
      audio.pause();
    }
  }, [isPlaying, trackKey, trackUrls]);

  // Sync event listeners for time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleTrackEnd]);

  // Log state updates
  useEffect(() => {
    if (track.title !== "Unknown") {
      addPlayerLog(`MOUNTED_TRACK: "${track.title}" - ${track.artist}`);
    }
  }, [track.title, track.artist, addPlayerLog]);

  useEffect(() => {
    addPlayerLog(`PLAY_STATE_CHANGE: ${isPlaying ? "PLAYING" : "PAUSED"}`);
  }, [isPlaying, addPlayerLog]);

  useEffect(() => {
    addPlayerLog(`VOLUME_SYNC: ${isMuted ? "MUTED" : `${volume}%`}`);
  }, [volume, isMuted, addPlayerLog]);

  const handlePlayPause = () => {
    if (trackUrls[trackKey]) {
      setIsPlaying(!isPlaying);
      sysAudio.playClick();
    } else {
      addPlayerLog("PREVIEW_LOADING_WAIT: Stream buffer empty");
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    const targetTime = clickPercent * audioDuration;
    setCurrentTime(Math.floor(targetTime));
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    sysAudio.playClick();
  };

  const toggleLoopMode = () => {
    sysAudio.playClick();
    setLoopMode((prev) => {
      if (prev === "none") return "playlist";
      if (prev === "playlist") return "track";
      return "none";
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Center Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border bg-neutral-900/40 p-6 shadow-2xl backdrop-blur-xl md:p-8"
        style={{ borderColor: `${theme.accent}20` }}
      >
        {/* Dynamic System Modes Tabs */}
        <div className="flex border-b border-white/5 mb-6 font-mono text-xs w-full justify-around select-none">
          {(["lockin", "ride", "chill"] as const).map((m) => {
            const isSelected = activeMode === m;
            const info = MODE_INFOS[m];
            return (
              <button
                key={m}
                onClick={() => handleModeSelect(m)}
                className={`flex-1 py-3 text-center transition-all cursor-pointer font-bold tracking-wider relative ${
                  isSelected
                    ? "text-white bg-white/[0.02]"
                    : "text-slate-500 hover:text-slate-355 hover:text-slate-300 hover:bg-white/[0.01]"
                }`}
                style={isSelected ? { borderBottom: `2.5px solid ${theme.accent}` } : undefined}
              >
                {isSelected && (
                  <span 
                    className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse" 
                    style={{ backgroundColor: theme.accent }} 
                  />
                )}
                {info.name}
              </button>
            );
          })}
        </div>

        {/* Decorative Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] select-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M0 0h20v20H0z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full blur-[80px] transition-all duration-1000" style={{ backgroundColor: `${theme.accent}15` }} />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full blur-[80px] transition-all duration-1000" style={{ backgroundColor: `${theme.accent}08` }} />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Album Cover Column */}
          <div className="flex justify-center select-none">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="relative flex h-32 w-32 items-center justify-center rounded-full bg-neutral-950 border-2 p-0.5 shadow-2xl shrink-0 overflow-hidden"
              style={{ borderColor: `${theme.accent}30` }}
            >
              {/* Vinyl Groove Lines Overlaid on Image */}
              <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none z-10" />
              <div className="absolute inset-2 rounded-full border border-black/40 pointer-events-none z-10" />
              <div className="absolute inset-4 rounded-full border border-black/35 pointer-events-none z-10" />
              <div className="absolute inset-8 rounded-full border border-black/25 pointer-events-none z-10" />
              <div className="absolute inset-12 rounded-full border border-black/15 pointer-events-none z-10" />
              
              {/* Album Art Image */}
              {trackArtworks[trackKey] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={trackArtworks[trackKey]}
                  alt={`${track.title} cover`}
                  className="h-full w-full rounded-full object-cover pointer-events-none"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-955 bg-neutral-950">
                  <Music className="h-8 w-8" style={{ color: `${theme.accent}40` }} />
                </div>
              )}

              {/* Vinyl center hole */}
              <div className="absolute h-8 w-8 rounded-full bg-neutral-950/90 border border-white/20 flex items-center justify-center z-20">
                <div className="h-2.5 w-2.5 rounded-full bg-[#08090b] border" style={{ borderColor: `${theme.accent}30` }} />
              </div>
            </motion.div>
          </div>

          {/* Player Controls Column */}
          <div className="flex-1 min-w-0">
            {/* Song Meta info */}
            <div className="mb-4 text-center md:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={track.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="truncate text-xl font-bold text-white tracking-tight">
                    {track.title}
                  </h3>
                  <p className="truncate text-sm font-mono mt-0.5" style={{ color: theme.accent }}>
                    {track.artist}
                  </p>
                  <p className="text-[10px] text-slate-500 italic mt-2 border-l border-white/5 pl-2 leading-relaxed select-text">
                    &ldquo;{MODE_INFOS[activeMode].quote}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="mb-6 flex h-8 items-center justify-center md:justify-start gap-1 select-none">
              {[...Array(24)].map((_, i) => {
                const randomHeight = Math.floor(Math.random() * 20) + 4;
                return (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ height: 4, backgroundColor: theme.accent }}
                    animate={
                      isPlaying
                        ? { height: [4, randomHeight, 4] }
                        : { height: 4 }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (i % 5) * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* Progress / Seek bar */}
            <div className="mb-4">
              <div
                onClick={handleProgressBarClick}
                className="group relative h-1.5 w-full cursor-pointer rounded-full bg-neutral-800 transition-all hover:h-2"
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%`, backgroundColor: theme.accent }}
                />
                {/* Drag handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md border opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progressPercent}% - 7px)`, borderColor: theme.accent }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-500 select-none">
                <span>{formatTime(currentTime)}</span>
                <span>{isLoadingTrack ? "Buffering..." : formatTime(audioDuration)}</span>
              </div>
            </div>

            {/* Playback Button Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 select-none">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  aria-label="Previous track"
                  className="text-slate-400 hover:text-white hover:scale-105 active:scale-95 transition-all p-1 cursor-pointer"
                >
                  <SkipBack className="h-5 w-5" fill="currentColor" />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={!trackUrls[trackKey]}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex h-12 w-12 items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
                  style={trackUrls[trackKey] ? { backgroundColor: theme.accent } : { backgroundColor: "#262626" }}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" fill="currentColor" />
                  ) : (
                    <Play className="ml-1 h-5 w-5" fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next track"
                  className="text-slate-400 hover:text-white hover:scale-105 active:scale-95 transition-all p-1 cursor-pointer"
                >
                  <SkipForward className="h-5 w-5" fill="currentColor" />
                </button>

                <button
                  onClick={toggleLoopMode}
                  aria-label={`Loop mode: ${loopMode}`}
                  className="p-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={loopMode !== "none" ? { color: theme.accent } : { color: "#6b7280" }}
                >
                  {loopMode === "track" ? (
                    <Repeat1 className="h-5 w-5" />
                  ) : (
                    <Repeat className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Volume Slider Block */}
              <div className="flex items-center gap-2 text-slate-400 ml-auto md:ml-4">
                <button
                  onClick={toggleMute}
                  aria-label="Toggle mute"
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : volume < 50 ? (
                    <Volume1 className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <div className="relative w-16 flex items-center group/vol">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer group-hover/vol:bg-neutral-700 transition-colors"
                    style={{ outline: "none", accentColor: theme.accent }}
                  />
                </div>
                <span className="text-[9px] font-mono w-8 text-right text-slate-500">
                  {isMuted ? "MUTED" : `${volume}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry & Log Console */}
        <div className="mt-6 border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-5 gap-4 font-mono text-[9px] select-none">
          
          {/* Left Column: Mode Telemetry parameters */}
          <div className="md:col-span-2 bg-black/40 border border-white/5 p-3 rounded-xl flex flex-col gap-2">
            <span className="text-slate-500 uppercase tracking-widest font-bold border-b border-white/5 pb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
              {MODE_INFOS[activeMode].statusTitle}
            </span>
            <div className="flex flex-col gap-1.5 mt-1 text-slate-400">
              {MODE_INFOS[activeMode].stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/[0.02] pb-0.5">
                  <span className="text-slate-500 uppercase font-mono">{stat.label}:</span>
                  <span className="text-white font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Player scrolling terminal logs */}
          <div className="md:col-span-3 bg-black/60 border border-white/5 p-3 rounded-xl flex flex-col justify-between h-28">
            <span className="text-slate-500 uppercase tracking-widest font-bold border-b border-white/5 pb-1">
              SOUNDTRACK.sys Logs
            </span>
            <div className="flex-1 overflow-y-auto mt-1 flex flex-col gap-1 text-slate-400 [scrollbar-width:none]">
              {playerLogs.map((log, idx) => (
                <div key={idx} className="truncate">
                  <span style={{ color: theme.accent }}>&gt;</span> {log}
                </div>
              ))}
            </div>
            <div className="text-[7.5px] text-slate-500 text-right mt-1 font-mono">
              Status: Operational // Buffer 100%
            </div>
          </div>

        </div>

        {/* Playlist Toggle and list */}
        <div className="mt-6 border-t border-white/5 pt-4">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-2 text-xs font-mono hover:text-white transition-colors mx-auto md:mx-0 cursor-pointer"
            style={{ color: theme.accent }}
          >
            <span>{showPlaylist ? "HIDE QUEUE" : "SHOW QUEUE"}</span>
            <span className="text-[10px] text-slate-500">(Previews loaded)</span>
          </button>

          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin"
              >
                <div className="space-y-1">
                  {currentPlaylist.map((trackItem, index) => {
                    const isCurrent = index === currentTrackIndex;
                    const thisKey = `${activeMode}-${index}`;
                    const isLoaded = !!trackUrls[thisKey];
                    return (
                      <button
                        key={trackItem.title}
                        onClick={() => {
                          if (isLoaded) {
                            setCurrentTrackIndex(index);
                            setCurrentTime(0);
                            setIsPlaying(true);
                          }
                        }}
                        disabled={!isLoaded}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                          isCurrent
                            ? "bg-white/[0.03] border"
                            : isLoaded
                            ? "hover:bg-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
                            : "text-slate-500 opacity-40 cursor-not-allowed"
                        }`}
                        style={isCurrent ? { borderColor: `${theme.accent}30`, color: theme.accent } : undefined}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="font-mono text-[10px] text-slate-500 w-4">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <div className="truncate">
                            <p
                              className={`font-semibold`}
                              style={isCurrent ? { color: theme.accent } : undefined}
                            >
                              {trackItem.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {trackItem.artist}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 shrink-0 ml-2">
                          {isLoaded ? "0:30" : "Loading..."}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
