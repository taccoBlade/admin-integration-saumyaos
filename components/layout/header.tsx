"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Play, Pause, SkipForward, Music, Volume2, VolumeX } from "lucide-react";
import { Cinzel } from "next/font/google";
import { spotifyTracks } from "@/lib/spotifyTracks";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });

const navItems = [
  { label: "Professional", href: "/" },
  { label: "Terminal Vault", href: "/projects/terminal-vault" },
  { label: "Personal", href: "/personal" },
  { label: "Contact", href: "/contact" },
];

export function HeaderMusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // The ref points to the <audio> JSX element — React populates this before
  // any useEffect runs, so it is always non-null when effects execute.
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = spotifyTracks[currentTrackIndex];

  // Track change: imperatively swap src, then resume if we were playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = isPlaying;
    audio.pause();
    audio.src = currentTrack.src;
    if (wasPlaying) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
    // isPlaying intentionally omitted — we only want to react to track changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);

  // Volume / mute sync
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Ensure src is set (in case track effect hasn't fired yet)
      if (!audio.src || audio.src === window.location.href) {
        audio.src = currentTrack.src;
      }
      audio.volume = isMuted ? 0 : volume;
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const nextTrack = () =>
    setCurrentTrackIndex((prev) => (prev + 1) % spotifyTracks.length);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-1.5 px-3 backdrop-blur-md text-white select-none shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      {/*
        JSX <audio> with NO src / autoPlay props — those are set imperatively
        via the ref only. onEnded and preload are stable, safe to set here.
      */}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={nextTrack}
      />

      {/* Pulse icon while playing */}
      <div className={`p-1.5 rounded-full bg-white/10 text-white/90 transition-all ${isPlaying ? "animate-pulse" : ""}`}>
        <Music className="w-3.5 h-3.5" />
      </div>

      {/* Track info */}
      <div className="flex flex-col w-[80px] md:w-[110px] overflow-hidden truncate">
        <span className="text-[10px] font-mono tracking-wider font-semibold truncate leading-tight text-white/95">
          {currentTrack.title}
        </span>
        <span className="text-[8px] text-white/50 truncate leading-none mt-0.5">
          {currentTrack.artist}
        </span>
      </div>

      {/* Play / Skip controls */}
      <div className="flex items-center gap-1.5 ml-1.5 border-l border-white/15 pl-2">
        <button
          onClick={togglePlay}
          className="p-1 hover:text-attention-400 text-white/80 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying
            ? <Pause className="w-3 h-3 fill-current" />
            : <Play  className="w-3 h-3 fill-current" />}
        </button>
        <button
          onClick={nextTrack}
          className="p-1 hover:text-attention-400 text-white/80 transition-colors"
          aria-label="Next track"
        >
          <SkipForward className="w-3 h-3 fill-current" />
        </button>
      </div>

      {/* Volume slider — expands on hover */}
      <div className="flex items-center gap-1 ml-1.5 border-l border-white/15 pl-2 group/vol">
        <button
          onClick={toggleMute}
          className="p-1 hover:text-attention-400 text-white/80 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setVolume(val);
            if (val > 0) setIsMuted(false);
          }}
          className="w-0 group-hover/vol:w-16 h-1 bg-white/20 accent-attention rounded-lg appearance-none cursor-pointer transition-all duration-300 opacity-0 group-hover/vol:opacity-100 group-hover/vol:ml-1"
          style={{ WebkitAppearance: "none", outline: "none" }}
        />
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === "/lithos") return null;

  const isPersonal = pathname === "/personal" || pathname.startsWith("/personal/");
  const accentColor   = isPersonal ? "text-[#d4af37]"        : "text-attention-400";
  const headerBg      = isPersonal ? "bg-[#050505]/45"        : "bg-[#08090b]/45";
  const mobileMenuBg  = isPersonal ? "bg-[#050505]/98"        : "bg-[#08090b]/98";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] py-4 xl:py-5 text-white ${headerBg} backdrop-blur-md border-b border-white/5 transition-colors duration-500`}>
        <div className="container mx-auto px-6 flex justify-between items-center gap-4">

          {/* Logo */}
          <Link href="/" className="z-[110] shrink-0">
            {isPersonal ? (
              <div className="relative group px-2 py-1 flex items-center h-10 select-none">
                <span className="font-mono text-base md:text-lg tracking-[0.2em] uppercase text-attention drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                  SAUMYA PAREKH
                </span>
              </div>
            ) : (
              <h1 className={`${cinzel.className} text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.08em] transition-colors duration-500`}>
                <span className={`${accentColor} transition-colors duration-500`}>S</span>aumya{" "}
                <span className={`${accentColor} transition-colors duration-500`}>P</span>arekh
                <span className={`${accentColor} transition-colors duration-500`}>.</span>
              </h1>
            )}
          </Link>

          {/* Desktop: player + nav */}
          <div className="hidden xl:flex items-center gap-8">
            <HeaderMusicPlayer />
            <nav className="flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
                const activeStyle = isPersonal
                  ? "text-[#d4af37] border-[#d4af37]"
                  : "text-attention-400 border-attention-400";
                const hoverStyle = isPersonal
                  ? "hover:text-[#d4af37]"
                  : "hover:text-attention-400";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`capitalize font-medium transition-all ${
                      isActive
                        ? `${activeStyle} border-b-2`
                        : `text-white/80 ${hoverStyle}`
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile: player + hamburger */}
          <div className="flex xl:hidden items-center gap-4 z-[110]">
            <HeaderMusicPlayer />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 ${accentColor} transition-colors duration-500`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`xl:hidden fixed inset-0 z-[95] ${mobileMenuBg} backdrop-blur-xl flex flex-col items-center justify-center gap-8`}
          >
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
              const activeStyle = isPersonal ? "text-[#d4af37]" : "text-attention-400";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-semibold capitalize transition-all ${
                    isActive ? activeStyle : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
