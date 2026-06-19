"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const PLAYLIST = [
  { title: "The Nights", artist: "Avicii" },
  { title: "Hall of Fame", artist: "The Script ft. will.i.am" },
  { title: "Run Boy Run", artist: "Woodkid" },
  { title: "Experience", artist: "Ludovico Einaudi" },
  { title: "My Way", artist: "Frank Sinatra" },
  { title: "Mountain At My Gates", artist: "Foals" },
  { title: "Dream On", artist: "Aerosmith" },
  { title: "Way Down We Go", artist: "KALEO" },
  { title: "Time", artist: "Hans Zimmer" },
  { title: "Legends Never Die", artist: "Against The Current" },
];

export function DashboardWidgets() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(30);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [loopMode, setLoopMode] = useState<"none" | "track" | "playlist">("playlist");
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [trackUrls, setTrackUrls] = useState<Record<number, string>>({});
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = PLAYLIST[currentTrackIndex];

  // Initialize HTML5 Audio Ref
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Fetch track previews dynamically from iTunes API on mount
  useEffect(() => {
    PLAYLIST.forEach((item, index) => {
      const query = encodeURIComponent(`${item.artist} ${item.title}`);
      fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results[0] && data.results[0].previewUrl) {
            setTrackUrls((prev) => ({
              ...prev,
              [index]: data.results[0].previewUrl,
            }));
          }
        })
        .catch((err) => console.error("Error fetching preview for " + item.title, err));
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setCurrentTime(0);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setCurrentTime(0);
  }, []);

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
      if (currentTrackIndex < PLAYLIST.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  }, [loopMode, currentTrackIndex, handleNext]);

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

    const url = trackUrls[currentTrackIndex];
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
  }, [isPlaying, currentTrackIndex, trackUrls]);

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

  const handlePlayPause = () => {
    if (trackUrls[currentTrackIndex]) {
      setIsPlaying(!isPlaying);
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
  };

  const toggleLoopMode = () => {
    setLoopMode((prev) => {
      if (prev === "none") return "playlist";
      if (prev === "playlist") return "track";
      return "none";
    });
  };

  // Convert seconds to MM:SS format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          System Soundtrack
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Audio fuel for computational design and engineering cycles
        </p>
      </motion.div>

      {/* ── Center Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-cyan-500/20 bg-neutral-900/40 p-6 shadow-2xl backdrop-blur-xl md:p-8"
      >
        {/* Decorative Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] select-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M0 0h20v20H0z' fill='none' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-[80px]" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Album Cover Column */}
          <div className="flex justify-center">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-950 to-neutral-900 border-2 border-cyan-500/30 p-1 shadow-2xl shrink-0"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-950">
                {/* Center hole */}
                <div className="absolute h-8 w-8 rounded-full bg-neutral-900 border border-cyan-500/20 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#08090b]" />
                </div>
                {/* Vinyl groovelines */}
                <div className="absolute inset-4 rounded-full border border-neutral-900/50" />
                <div className="absolute inset-8 rounded-full border border-neutral-900/30" />
                <Music className="h-8 w-8 text-cyan-400/40" />
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
                  <p className="truncate text-sm text-cyan-400 font-mono mt-0.5">
                    {track.artist}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Audio Wave Visualizer */}
            <div className="mb-6 flex h-8 items-center justify-center md:justify-start gap-1">
              {[...Array(24)].map((_, i) => {
                const randomHeight = Math.floor(Math.random() * 20) + 4;
                return (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-cyan-500/80"
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
                    style={{ height: 4 }}
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
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Drag handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md border border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span>{formatTime(currentTime)}</span>
                <span>{isLoadingTrack ? "Loading preview..." : formatTime(audioDuration)}</span>
              </div>
            </div>

            {/* Playback Button Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrev}
                  aria-label="Previous track"
                  className="text-slate-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all p-1"
                >
                  <SkipBack className="h-5 w-5" fill="currentColor" />
                </button>

                <button
                  onClick={handlePlayPause}
                  disabled={!trackUrls[currentTrackIndex]}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-lg ${
                    trackUrls[currentTrackIndex]
                      ? "bg-cyan-505 bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20 cursor-pointer"
                      : "bg-neutral-800 text-slate-500 cursor-not-allowed"
                  }`}
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
                  className="text-slate-400 hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all p-1"
                >
                  <SkipForward className="h-5 w-5" fill="currentColor" />
                </button>

                <button
                  onClick={toggleLoopMode}
                  aria-label={`Loop mode: ${loopMode}`}
                  className={`p-1 transition-all hover:scale-105 active:scale-95 ${
                    loopMode !== "none" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                  }`}
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
                  className="hover:text-cyan-400 transition-colors"
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
                    className="w-full h-1 bg-neutral-850 rounded-lg appearance-none cursor-pointer accent-cyan-400 group-hover/vol:bg-neutral-700 transition-colors"
                    style={{ outline: "none" }}
                  />
                </div>
                <span className="text-[9px] font-mono w-8 text-right text-slate-500">
                  {isMuted ? "MUTED" : `${volume}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Toggle and list */}
        <div className="mt-6 border-t border-cyan-500/10 pt-4">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors mx-auto md:mx-0"
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
                className="overflow-hidden mt-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20"
              >
                <div className="space-y-1">
                  {PLAYLIST.map((trackItem, index) => {
                    const isCurrent = index === currentTrackIndex;
                    const isLoaded = !!trackUrls[index];
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
                            ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                            : isLoaded
                            ? "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                            : "text-slate-650 opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="font-mono text-[10px] text-slate-600 w-4">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <div className="truncate">
                            <p
                              className={`font-semibold ${
                                isCurrent ? "text-cyan-400" : "text-slate-300"
                              }`}
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
