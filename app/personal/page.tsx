"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, MapPin, X
} from "lucide-react"
import { Contact } from "@/components/contact"
import { Playfair_Display, Inter } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] })
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

const tracks = [
  {
    title: "The Nights",
    artist: "Avicii",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "/images/personal/music_nights.jpg",
    badge: "ACTIVE SOUNDTRACK // THE PATH",
    note: "A reminder to live a life you will remember. The ultimate cruising anthem when the roads are wide open.",
    glow: "rgba(201, 163, 90, 0.08)", // Gotham Gold tint
    rainColor: "rgba(201, 163, 90, 0.15)",
    flashRate: 0.001
  },
  {
    title: "Wish You Were Here",
    artist: "Pink Floyd",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "/images/personal/music_floyd.jpg",
    badge: "ACTIVE SOUNDTRACK // SOLITUDE",
    note: "Cruising companion. Best heard on an empty highway when the sun is going down and the visor is closed.",
    glow: "rgba(99, 102, 241, 0.06)", // Muted blue-indigo
    rainColor: "rgba(163, 191, 250, 0.1)",
    flashRate: 0.0005
  },
  {
    title: "Cornfield Chase",
    artist: "Hans Zimmer",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "/images/personal/music_zimmer.jpg",
    badge: "ACTIVE SOUNDTRACK // WATCHTOWER",
    note: "Soundtrack to stargazing. Huge, heavy tracks that make you feel tiny under a clear night sky.",
    glow: "rgba(239, 68, 68, 0.06)", // Blood Crimson
    rainColor: "rgba(239, 68, 68, 0.08)",
    flashRate: 0.003 // Storm approaches
  },
  {
    title: "Choo Lo",
    artist: "The Local Train",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "/images/personal/music_train.jpg",
    badge: "ACTIVE SOUNDTRACK // NOSTALGIA",
    note: "Nostalgic rock. Played on repeat during college hostel nights and late-night sessions.",
    glow: "rgba(255, 255, 255, 0.04)", // Muted white
    rainColor: "rgba(255, 255, 255, 0.08)",
    flashRate: 0.0008
  }
]

// Motorcycle ride data
const rideMemories = [
  {
    id: "ride-1",
    title: "Rann of Kutch Salt Run",
    date: "May 2025",
    location: "Kutch white desert",
    desc: "Cruised through empty salt deserts. Visited ancient ruins where road stretches disappeared into the horizon. Pure silence and parallel-twin engine hum.",
    image: "/images/personal/motorcycle.jpg",
    coords: { x: "25%", y: "40%" }
  },
  {
    id: "ride-2",
    title: "Coastline Highway",
    date: "November 2025",
    location: "Mandvi coast route",
    desc: "Windy coastal roads alongside dry geological terrains. Set the handlebars back and spent 6 hours straight riding without notifications.",
    image: "/images/personal/roads.jpg",
    coords: { x: "65%", y: "30%" }
  },
  {
    id: "ride-3",
    title: "Bypass Night Run",
    date: "April 2026",
    location: "Sardar Patel Ring Road",
    desc: "Late-night test run after tweaking custom exhausts. The cold air, the yellow street lights reflecting off the gas tank, and empty lanes.",
    image: "/images/personal/hero.jpg",
    coords: { x: "45%", y: "70%" }
  }
]

export default function PersonalPage() {
  const [mounted, setMounted] = useState(false)
  const [lightningIntensity, setLightningIntensity] = useState(0)

  // Music State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Interactive desk state
  const [activeDeskItem, setActiveDeskItem] = useState<string | null>(null)

  // Spotlight active memory
  const [activeRide, setActiveRide] = useState<typeof rideMemories[0] | null>(null)

  // Lightbox for Memory Wall
  const [activeWallImage, setActiveWallImage] = useState<number | null>(null)

  // Scroll bindings for Memory Wall
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Parallax offsets for floating memory wall items
  const yParallaxSlow = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const yParallaxFast = useTransform(scrollYProgress, [0, 1], [-120, 120])
  const yParallaxMid = useTransform(scrollYProgress, [0, 1], [-80, 80])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lightning Storm Logic
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      // Probability based on track parameters
      if (Math.random() < (tracks[currentTrackIndex].flashRate * 100)) {
        // Double flash sequence
        setLightningIntensity(0.9)
        setTimeout(() => setLightningIntensity(0), 100)
        setTimeout(() => setLightningIntensity(0.6), 180)
        setTimeout(() => setLightningIntensity(0), 300)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [mounted, currentTrackIndex])

  // Rain on Window Glass & Flying Bats Simulation Canvas
  useEffect(() => {
    const canvas = document.getElementById("rain-glass-canvas") as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Window droplets: static and slow sliding
    const dropletsCount = 60
    const droplets: Array<{
      x: number
      y: number
      r: number
      vy: number
      vx: number
      trail: Array<{ x: number; y: number }>
      sliding: boolean
    }> = []

    for (let i = 0; i < dropletsCount; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        vy: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.05,
        trail: [],
        sliding: Math.random() < 0.4
      })
    }

    // Ambient gold dust particles (motes floating in light beams)
    const dustCount = 35
    const dustParticles: Array<{
      x: number
      y: number
      r: number
      vy: number
      vx: number
      opacity: number
    }> = []

    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.0 + 0.4,
        vy: -(Math.random() * 0.15 + 0.05), // slow upward drift
        vx: (Math.random() - 0.5) * 0.08,    // gentle swaying
        opacity: Math.random() * 0.18 + 0.07 // very subtle, soft transparency
      })
    }

    let animId: number
    const draw = () => {
      // Clear canvas slightly transparent to show trail
      ctx.fillStyle = "rgba(5, 5, 5, 0.08)"
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = tracks[currentTrackIndex].rainColor
      droplets.forEach((drop) => {
        // Draw droplet trail
        if (drop.sliding && drop.trail.length > 0) {
          ctx.beginPath()
          ctx.strokeStyle = tracks[currentTrackIndex].rainColor
          ctx.lineWidth = drop.r * 0.4
          ctx.moveTo(drop.trail[0].x, drop.trail[0].y)
          for (let k = 1; k < drop.trail.length; k++) {
            ctx.lineTo(drop.trail[k].x, drop.trail[k].y)
          }
          ctx.stroke()
        }

        // Draw current droplet head
        ctx.beginPath()
        ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2)
        ctx.fill()

        if (drop.sliding) {
          // Slide down window glass
          drop.y += drop.vy
          drop.x += drop.vx

          // Occasional wiggle
          if (Math.random() < 0.03) {
            drop.vx = (Math.random() - 0.5) * 0.15
          }

          // Accumulate trail coordinates
          drop.trail.push({ x: drop.x, y: drop.y })
          if (drop.trail.length > 15) {
            drop.trail.shift()
          }

          // Reset at bottom
          if (drop.y > height) {
            drop.y = -5
            drop.x = Math.random() * width
            drop.trail = []
          }
        }
      })

      // Draw ambient gold dust motes
      dustParticles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 163, 90, ${p.opacity})` // Warm Gotham gold tint
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animId)
    }
  }, [currentTrackIndex])

  // Audio Event Bindings
  useEffect(() => {
    if (!audioRef.current) return
    const wasPlaying = isPlaying
    audioRef.current.src = tracks[currentTrackIndex].src
    audioRef.current.load()
    if (wasPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex])

  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      handleNext()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, currentTrackIndex])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  const selectTrack = (index: number) => {
    if (index === currentTrackIndex) {
      togglePlay()
    } else {
      setCurrentTrackIndex(index)
      setIsPlaying(true)
    }
  }

  const handlePrev = () => {
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    setIsPlaying(true)
  }

  const handleNext = () => {
    const nextIndex = currentTrackIndex === tracks.length - 1 ? 0 : currentTrackIndex + 1
    setCurrentTrackIndex(nextIndex)
    setIsPlaying(true)
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className={`min-h-screen bg-[#050505] text-[#f5f5f5] selection:bg-[#c9a35a]/30 selection:text-[#c9a35a] overflow-x-hidden relative ${inter.className}`}>
      
      {/* Playfair equalizer keyframes style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes equalize {
          0% { transform: scaleY(0.15); }
          100% { transform: scaleY(1); }
        }
      `}} />

      {/* Global Environmental Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Background window canvas (rain sliding down pane) */}
        <canvas id="rain-glass-canvas" className="w-full h-full block" />
        
        {/* Lightning flash overlay */}
        <div 
          className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-75 mix-blend-screen"
          style={{ opacity: lightningIntensity * 0.15 }}
        />

        {/* Ambient room glow reflecting active soundtrack */}
        <div 
          className="absolute inset-0 transition-all duration-[1500ms] blur-[160px]"
          style={{ backgroundColor: tracks[currentTrackIndex].glow }}
        />

        {/* Floor Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* FIXED Dossier Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-[#050505]/40 backdrop-blur-md border-b border-white/5 py-4">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-[#c9a35a] transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>TERMINAL SYSTEM</span>
          </Link>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#c9a35a] font-bold uppercase">
            SECURE ACCESS // PERSONAL SPACE
          </span>
        </div>
      </header>

      {/* ZONE 1: WINDOW OVERLOOKING THE CITY (HERO) */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-6 py-20">
        
        {/* Distant skyline svg silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-[280px] pointer-events-none opacity-20 z-[2]">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path fill="#050505" d="M0,300 L0,200 L40,200 L40,160 L90,160 L90,220 L150,220 L150,110 L210,110 L210,230 L270,230 L270,140 L340,140 L340,240 L400,240 L400,70 L480,70 L480,250 L560,250 L560,180 L620,180 L620,240 L700,240 L700,100 L760,100 L760,220 L820,220 L820,150 L900,150 L900,250 L1000,250 L1000,300 Z" />
            {/* Soft glowing windows in background */}
            <circle cx="230" cy="180" r="1.5" fill="#c9a35a" className="animate-pulse" style={{ animationDuration: '4s' }} />
            <circle cx="310" cy="190" r="1" fill="#7f1d1d" className="animate-pulse" style={{ animationDuration: '6s' }} />
            <circle cx="440" cy="150" r="2" fill="#c9a35a" className="animate-pulse" style={{ animationDuration: '3s' }} />
            <circle cx="730" cy="170" r="1.5" fill="#f5f5f5" className="animate-pulse" style={{ animationDuration: '5s' }} />
          </svg>
        </div>

        {/* Airplane beacons */}
        <div className="absolute top-[25%] left-[10%] pointer-events-none z-[1] flex gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-red-800 animate-ping" style={{ animationDuration: '3.5s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
        </div>

        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Title / Info */}
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-[#c9a35a] uppercase">
              {"// PENTHOUSE VIEW // 2:17 AM"}
            </div>
            <h1 className={`text-5xl md:text-8xl font-bold tracking-tight text-white leading-none ${playfair.className}`}>
              Beyond the <br />
              <span className="text-[#c9a35a] italic">Terminal</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-450 leading-relaxed font-light max-w-lg">
              When the display dims and the servers quiet down, the work stops. I do not run numbers on my life. I just live it. Uncover the records, the iron, the roads, and the silent thoughts.
            </p>
            <div className="pt-4 animate-bounce opacity-40">
              <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase block mb-1">Scroll to inspect</span>
              <span className="text-lg">↓</span>
            </div>
          </div>

          {/* Parallax Portrait Fading to Shadows */}
          <div className="md:col-span-5 flex justify-center relative group">
            <div className="relative aspect-[4/5] w-full max-w-[340px] rounded-3xl border border-white/10 overflow-hidden bg-[#0d0d0d] shadow-2xl">
              <Image 
                src="/images/personal/hero.jpg" 
                alt="Saumya Parekh - Shadow Profile" 
                fill 
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                priority
              />
              {/* Dynamic Shadow Gradients merging bottom/sides into #050505 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />
              <div className="absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-[#050505] to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-[#050505] to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 2: THE DESK */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-[#c9a35a] tracking-widest uppercase block font-bold">{"// THE WRITING DESK"}</span>
          <h2 className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>Scattered Artifacts</h2>
          <p className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            Items resting on a dark walnut desk. Inspect each object to uncover the memories and thoughts connected to them.
          </p>
        </div>

        {/* Interactive Desk Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Desk representation layout */}
          <div className="p-8 rounded-3xl border border-white/5 bg-[#0d0d0d]/80 backdrop-blur-sm relative min-h-[380px] shadow-2xl flex items-center justify-center">
            {/* Desk wood grains and shadow details */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.01),transparent_70%)]" />
            
            {/* Interactive Items Scattered */}
            <div className="grid grid-cols-3 gap-6 relative z-10 w-full text-center">
              
              {/* Helmet */}
              <button 
                onClick={() => setActiveDeskItem(activeDeskItem === "helmet" ? null : "helmet")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  activeDeskItem === "helmet" 
                    ? "bg-[#111] border-[#c9a35a] text-[#c9a35a] shadow-[0_0_20px_rgba(201,163,90,0.1)]" 
                    : "bg-[#050505]/40 border-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-3">
                  <span className="text-lg">🏍️</span>
                </div>
                <span className="text-xs font-mono font-bold">Riding Helmet</span>
              </button>

              {/* DSLR Camera */}
              <button 
                onClick={() => setActiveDeskItem(activeDeskItem === "camera" ? null : "camera")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  activeDeskItem === "camera" 
                    ? "bg-[#111] border-[#c9a35a] text-[#c9a35a] shadow-[0_0_20px_rgba(201,163,90,0.1)]" 
                    : "bg-[#050505]/40 border-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-3">
                  <span className="text-lg">📷</span>
                </div>
                <span className="text-xs font-mono font-bold">DSLR Body</span>
              </button>

              {/* Records */}
              <button 
                onClick={() => setActiveDeskItem(activeDeskItem === "record" ? null : "record")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  activeDeskItem === "record" 
                    ? "bg-[#111] border-[#c9a35a] text-[#c9a35a] shadow-[0_0_20px_rgba(201,163,90,0.1)]" 
                    : "bg-[#050505]/40 border-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-3">
                  <span className="text-lg">💿</span>
                </div>
                <span className="text-xs font-mono font-bold">Vinyl Sleeves</span>
              </button>

              {/* Notebook */}
              <button 
                onClick={() => setActiveDeskItem(activeDeskItem === "book" ? null : "book")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  activeDeskItem === "book" 
                    ? "bg-[#111] border-[#c9a35a] text-[#c9a35a] shadow-[0_0_20px_rgba(201,163,90,0.1)]" 
                    : "bg-[#050505]/40 border-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-3">
                  <span className="text-lg">📖</span>
                </div>
                <span className="text-xs font-mono font-bold">Pirsig&apos;s Book</span>
              </button>

              {/* Scattered note */}
              <button 
                onClick={() => setActiveDeskItem(activeDeskItem === "notes" ? null : "notes")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  activeDeskItem === "notes" 
                    ? "bg-[#111] border-[#c9a35a] text-[#c9a35a] shadow-[0_0_20px_rgba(201,163,90,0.1)]" 
                    : "bg-[#050505]/40 border-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-3">
                  <span className="text-lg">📝</span>
                </div>
                <span className="text-xs font-mono font-bold">Memo Note</span>
              </button>

              {/* Spotlight dot */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-white/5 text-neutral-600 select-none">
                <div className="w-12 h-12 rounded-full bg-neutral-900/10 flex items-center justify-center mb-3">
                  <span className="text-lg">💡</span>
                </div>
                <span className="text-xs font-mono">Spotlight</span>
              </div>

            </div>
          </div>

          {/* Details Panel */}
          <div className="min-h-[380px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeDeskItem ? (
                <motion.div
                  key={activeDeskItem}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="p-8 rounded-3xl border border-[#c9a35a]/20 bg-[#0d0d0d] space-y-4 shadow-xl"
                >
                  <span className="text-[10px] font-mono text-[#8fa882] uppercase tracking-widest block font-bold border-b border-white/5 pb-2">
                    Artifact Log // {activeDeskItem.toUpperCase()}
                  </span>
                  <h3 className={`text-2xl font-bold text-white ${playfair.className}`}>
                    {activeDeskItem === "helmet" && "The Full-Face Helmet"}
                    {activeDeskItem === "camera" && "The 200D DSLR Body"}
                    {activeDeskItem === "record" && "The Vinyl Records Collection"}
                    {activeDeskItem === "book" && "Zen and the Art of Motorcycle Maintenance"}
                    {activeDeskItem === "notes" && "Tonight&apos;s Sticky Note"}
                  </h3>
                  <p className="text-sm font-mono text-neutral-450 leading-relaxed">
                    {activeDeskItem === "helmet" && "Riding the Super Meteor 650 cruiser. visor down, Sardar Patel Ring Road night bypasses. No navigation systems, no notifications, just the hum of the parallel twin engine and highway wind. That silence is where I think clearly."}
                    {activeDeskItem === "camera" && "Carrying a basic crop-sensor DSLR on road trips. I don't take professional landscape shots. I collect angles, shadows, and architectural geometries that catch my eye. Visual logs of terrains that are slowly changing."}
                    {activeDeskItem === "record" && "Soundtrack choices that anchor memories. Wish You Were Here for highway night runs, Interstellar OST for late-night stargazing runs, and The Local Train for hostel memories. Music is the emotional backbone of my personal archive."}
                    {activeDeskItem === "book" && "Finished Robert M. Pirsig's classic. A deep dive into Quality, systems, and why the mechanical tuning of a motorcycle is directly connected to the alignment of your own mind. Essential reading."}
                    {activeDeskItem === "notes" && "Scattered memo: 'June 2026. Rebuilt the code base of the mix calculators. Tuned the straight-flow custom exhausts on the Super Meteor. Prepping for a 10km morning run tomorrow. Keep showing up.'"}
                  </p>
                </motion.div>
              ) : (
                <div className="p-8 rounded-3xl border border-white/5 bg-[#0d0d0d]/30 text-center text-neutral-500 font-mono text-sm h-[320px] flex items-center justify-center">
                  Select an object on the desk to read its log dossier.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ZONE 3: THE WALL (COLLAGE STORYTELLING) */}
      <section ref={containerRef} className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-[#c9a35a] tracking-widest uppercase block font-bold">{"// THE ARCHIVE WALL"}</span>
          <h2 className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>Memory Wall</h2>
          <p className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            A continuous collection of photos, coordinate points, and captures. As you scroll, they emerge from different layers of time.
          </p>
        </div>

        {/* Collage Display with varying scroll translations */}
        <div className="relative min-h-[700px] w-full mt-10">
          
          {/* Item 1: Astrophotography (Slow drift) */}
          <motion.div 
            style={{ y: yParallaxSlow }}
            onClick={() => setActiveWallImage(0)}
            className="absolute top-10 left-[5%] p-3 pb-6 bg-[#f5f5f5] text-black shadow-2xl rounded-sm rotate-[-4deg] cursor-pointer hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 w-48"
          >
            <div className="relative aspect-square w-full bg-neutral-200 border border-neutral-300 rounded overflow-hidden">
              <Image src="/images/personal/astro.jpg" alt="Astro Capture" fill className="object-cover" />
            </div>
            <div className="text-center font-mono mt-3">
              <span className="text-[8px] text-[#7f1d1d] font-bold block uppercase">ASTROLOG</span>
              <span className="text-[10px] font-bold text-neutral-800">MILKY WAY CORE</span>
            </div>
          </motion.div>

          {/* Item 2: Architecture (Fast drift) */}
          <motion.div 
            style={{ y: yParallaxFast }}
            onClick={() => setActiveWallImage(1)}
            className="absolute top-32 right-[10%] p-3 pb-6 bg-[#f5f5f5] text-black shadow-2xl rounded-sm rotate-[3deg] cursor-pointer hover:rotate-0 hover:scale-105 transition-all duration-300 z-20 w-52"
          >
            <div className="relative aspect-square w-full bg-neutral-200 border border-neutral-300 rounded overflow-hidden">
              <Image src="/images/personal/arch.jpg" alt="Arch Capture" fill className="object-cover" />
            </div>
            <div className="text-center font-mono mt-3">
              <span className="text-[8px] text-[#7f1d1d] font-bold block uppercase">GEOMETRIES</span>
              <span className="text-[10px] font-bold text-neutral-800">RAW CONCRETE</span>
            </div>
          </motion.div>

          {/* Item 3: Road Trip Ticket / Map (Mid drift) */}
          <motion.div 
            style={{ y: yParallaxMid }}
            onClick={() => setActiveWallImage(2)}
            className="absolute bottom-32 left-[15%] p-3 pb-6 bg-[#f5f5f5] text-black shadow-2xl rounded-sm rotate-[2deg] cursor-pointer hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 w-48"
          >
            <div className="relative aspect-square w-full bg-neutral-200 border border-neutral-300 rounded overflow-hidden">
              <Image src="/images/personal/roads.jpg" alt="Road Capture" fill className="object-cover" />
            </div>
            <div className="text-center font-mono mt-3">
              <span className="text-[8px] text-[#7f1d1d] font-bold block uppercase">ROAD MAP</span>
              <span className="text-[10px] font-bold text-neutral-800">KUTCH ROUTE</span>
            </div>
          </motion.div>

          {/* Item 4: Travel candid (Slow drift) */}
          <motion.div 
            style={{ y: yParallaxSlow }}
            onClick={() => setActiveWallImage(3)}
            className="absolute bottom-10 right-[20%] p-3 pb-6 bg-[#f5f5f5] text-black shadow-2xl rounded-sm rotate-[-5deg] cursor-pointer hover:rotate-0 hover:scale-105 transition-all duration-300 z-20 w-52"
          >
            <div className="relative aspect-square w-full bg-neutral-200 border border-neutral-300 rounded overflow-hidden">
              <Image src="/images/personal/travel.jpg" alt="Travel Capture" fill className="object-cover" />
            </div>
            <div className="text-center font-mono mt-3">
              <span className="text-[8px] text-[#7f1d1d] font-bold block uppercase">TRAVEL LOG</span>
              <span className="text-[10px] font-bold text-neutral-800">CHAI STALLS</span>
            </div>
          </motion.div>

        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activeWallImage !== null && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveWallImage(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
                className="bg-[#f5f5f5] p-6 pb-10 max-w-lg w-full rounded-xl shadow-2xl relative z-10 text-black flex flex-col gap-4 font-mono"
              >
                <div className="flex justify-between items-start border-b border-neutral-300 pb-2">
                  <span className="text-[9px] text-[#7f1d1d] font-bold uppercase">SECURE REPORT MODULE</span>
                  <button onClick={() => setActiveWallImage(null)} className="p-1 rounded-md hover:bg-black/5 text-neutral-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative aspect-[4/3] w-full bg-neutral-200 border border-neutral-300 rounded overflow-hidden shadow-inner">
                  <Image 
                    src={
                      [
                        "/images/personal/astro.jpg",
                        "/images/personal/arch.jpg",
                        "/images/personal/roads.jpg",
                        "/images/personal/travel.jpg"
                      ][activeWallImage]
                    }
                    alt="Enlarged gallery image"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center space-y-2 pt-2">
                  <h3 className={`text-xl font-bold text-neutral-850 ${playfair.className}`}>
                    {
                      [
                        "Milky Way over Hills",
                        "Minimal Raw Geometries",
                        "Ahmedabad to Kutch Desert Run",
                        "Chai Stalls & Quiet Alleys"
                      ][activeWallImage]
                    }
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto font-mono">
                    {
                      [
                        "A few seconds of clear sky captured after waiting out a freezing dust storm in Kutch. Proof that patience pays off.",
                        "Angles of structural geometry and industrial lines found in raw concrete facades. The bridge between order and visual design.",
                        "Long highway perspective lines recorded on late night tours. Simple routes where the only light comes from the console dials.",
                        "Captured candid scenes from remote chai stalls and quiet village alleys. Moments of simple life under street lights."
                      ][activeWallImage]
                    }
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* ZONE 4: THE GARAGE BELOW */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-[#c9a35a] tracking-widest uppercase block font-bold">{"// THE LOWER SHED"}</span>
          <h2 className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>Silent Spotlight</h2>
          <p className="text-neutral-450 text-sm max-w-md font-light leading-relaxed">
            The Super Meteor 650 sits beneath the warm overhead beam. Click the coordinate pins floating around the machine to read ride log excerpts.
          </p>
        </div>

        {/* Spotlight Visual Container */}
        <div className="relative bg-[#0b0b0d] border border-white/5 rounded-3xl p-8 min-h-[460px] flex items-center justify-center overflow-hidden shadow-2xl group">
          {/* Spotlight Cone overlay */}
          <div className="absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top,#c9a35a_0%,transparent_60%)] opacity-[0.08] pointer-events-none" />
          
          <div className="relative w-full max-w-2xl aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 bg-[#050505] shadow-2xl">
            <Image 
              src="/images/personal/motorcycle.jpg" 
              alt="RE Super Meteor 650 Spotlight" 
              fill 
              className="object-cover opacity-80"
            />
            {/* Dark vignette blending sides */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

            {/* Hover floating dots coordinates */}
            {rideMemories.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setActiveRide(ride)}
                className="absolute w-8 h-8 rounded-full bg-[#c9a35a]/25 border border-[#c9a35a] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-[0_0_15px_rgba(201,163,90,0.4)] animate-pulse"
                style={{ top: ride.coords.y, left: ride.coords.x }}
                aria-label={`Open ride memory: ${ride.title}`}
              >
                <MapPin className="w-4 h-4 text-white" />
              </button>
            ))}
          </div>

          {/* Floating Ride Detail Sheet Overlay */}
          <AnimatePresence>
            {activeRide && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm p-6 rounded-2xl border border-[#c9a35a]/30 bg-[#0d0d0d] shadow-2xl z-30 font-mono text-neutral-300 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] text-[#8fa882] block mb-0.5">{activeRide.date}</span>
                    <h4 className="text-sm font-bold text-white">{activeRide.title}</h4>
                  </div>
                  <button onClick={() => setActiveRide(null)} className="p-1 rounded hover:bg-white/5 text-neutral-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs leading-relaxed font-mono border-t border-white/5 pt-2">
                  {activeRide.desc}
                </p>
                <div className="flex justify-between items-center text-[8px] text-neutral-500 pt-1">
                  <span>LOC: {activeRide.location}</span>
                  <span>UNCLASSIFIED STATUS</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ZONE 5: THE TRAINING LOG */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-[#c9a35a] tracking-widest uppercase block font-bold">{"// PROGRESS JOURNAL"}</span>
          <h2 className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>The Training Log</h2>
          <p className="text-neutral-450 text-sm max-w-md font-light leading-relaxed">
            Written logs of lifting over the years. Progression, plateaus, and setbacks from the iron record.
          </p>
        </div>

        {/* Paper double-page notebook layout */}
        <div className="max-w-3xl mx-auto w-full bg-[#f5f5f5] text-black rounded-3xl p-6 md:p-10 shadow-2xl relative border border-neutral-300 font-mono select-text">
          {/* Metal binder visual representation */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-300 border-x border-neutral-400 select-none pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            
            {/* Left Page (Failed logs / Backstories) */}
            <div className="space-y-6 pr-4 border-r border-dashed border-neutral-300/60 md:border-r-0">
              <span className="text-[9px] text-[#7f1d1d] font-bold block uppercase border-b border-black/10 pb-1">
                JOURNAL ARCHIVE // PAGE 01
              </span>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 font-bold block">FEBRUARY 2025</span>
                  <h4 className="text-xs font-bold uppercase text-neutral-850">160kg Deadlift milestone</h4>
                  <p className="text-[11px] text-neutral-700 leading-relaxed font-mono">
                    First lift that felt completely out of reach beforehand. Reaching it proved that structured loading and consistency always compound over time.
                  </p>
                </div>

                <div className="space-y-1 border-t border-neutral-300/40 pt-3">
                  <span className="text-[9px] text-neutral-500 font-bold block">AUGUST 2025</span>
                  <h4 className="text-xs font-bold uppercase text-[#7f1d1d]">Setback: Jaundice Weight Loss</h4>
                  <p className="text-[11px] text-neutral-700 leading-relaxed font-mono">
                    Lost 8kg of bodyweight in a single month. Barbell felt heavy at 60kg. Rebuilding strength from absolute scratch was a lesson in humility.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Page (Rebuilding / Success PRs) */}
            <div className="space-y-6 pl-4 md:pl-6">
              <span className="text-[9px] text-neutral-500 font-bold block uppercase border-b border-black/10 pb-1">
                JOURNAL ARCHIVE // PAGE 02
              </span>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 font-bold block">JUNE 2026</span>
                  <h4 className="text-xs font-bold uppercase text-neutral-850">210kg Deadlift PR</h4>
                  <p className="text-[11px] text-neutral-700 leading-relaxed font-mono">
                    Pulled 210kg. A number I used to think belonged to other people. Reaching it felt less like a victory and more like proof that showing up works.
                  </p>
                </div>

                <div className="space-y-2 border-t border-neutral-300/40 pt-3 text-[10px]">
                  <span className="text-[9px] text-neutral-500 font-bold block">CURRENT METRICS</span>
                  <div className="flex justify-between">
                    <span>Active Bodyweight:</span>
                    <span className="font-bold text-neutral-850">73.5 KG</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strength Efficiency:</span>
                    <span className="font-bold text-[#c9a35a]">2.85x BW</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-300/40 pt-1">
                    <span>Consistency Ratio:</span>
                    <span className="font-bold text-neutral-800">4x / week</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-between text-[8px] text-neutral-500 border-t border-neutral-300 pt-4 mt-6">
            <span>JOURNAL RECOVERY DONE // SAUMYA</span>
            <span>SECURE STRENGTH LOG</span>
          </div>
        </div>
      </section>

      {/* ZONE 6: THE MUSIC CORNER (REACTIVE LOGIC) */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-[#c9a35a] tracking-widest uppercase block font-bold">{"// THE TURNTABLE"}</span>
          <h2 className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>Record Player</h2>
          <p className="text-neutral-450 text-sm max-w-md font-light leading-relaxed">
            Changing tracks shifts the penthouse environment. The background rain, city wind speed, and lightning flashes adapt emotionally to the record.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Active Record Display */}
          <div className="lg:col-span-5 flex items-center justify-center p-8 bg-[#0d0d0d]/80 rounded-3xl h-[360px] relative overflow-hidden shadow-2xl">
            {/* Spinning Record Sleeve representation */}
            <div className="relative w-60 h-60 flex items-center justify-center">
              {/* Vinyl Plate */}
              <motion.div
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ ease: "linear", duration: 7, repeat: Infinity }}
                className="absolute right-0 w-44 h-44 rounded-full bg-[#080808] border border-neutral-800 shadow-2xl flex items-center justify-center"
                style={{
                  backgroundImage: "radial-gradient(circle, #1a1a1a 10%, #0d0d0d 30%, #050505 50%, #010101 70%)"
                }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-4 rounded-full border border-neutral-900 opacity-60" />
                <div className="absolute inset-8 rounded-full border border-neutral-900 opacity-40" />
                
                {/* Record Core Label */}
                <div className="w-14 h-14 rounded-full overflow-hidden border border-black relative">
                  <Image src={tracks[currentTrackIndex].cover} alt="vinyl core" fill className="object-cover" />
                  <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-[#0d0d0d]" />
                </div>
              </motion.div>

              {/* Album cover sleeve card */}
              <div className="absolute left-0 w-44 h-44 rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-[#0d0d0d] z-10">
                <Image src={tracks[currentTrackIndex].cover} alt="album sleeve" fill className="object-cover" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 border border-black animate-pulse" />
              </div>
            </div>

            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[9px] font-mono text-neutral-500">
              <span>TURNTABLE SYSTEM ON</span>
              <span>VOL: {Math.round(volume * 100)}%</span>
            </div>
          </div>

          {/* Player controls & Playlist selector */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Player controls */}
            <div className="p-6 bg-[#0d0d0d] border border-white/5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#c9a35a] uppercase tracking-wider block font-bold">
                    {tracks[currentTrackIndex].badge}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {tracks[currentTrackIndex].title}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    {tracks[currentTrackIndex].artist}
                  </p>
                </div>
                
                {/* Play controls buttons */}
                <div className="flex items-center gap-3">
                  <button onClick={handlePrev} className="p-1.5 text-neutral-400 hover:text-white transition-colors" aria-label="Prev">
                    <SkipBack className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={togglePlay} 
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
                  </button>

                  <button onClick={handleNext} className="p-1.5 text-neutral-400 hover:text-white transition-colors" aria-label="Next">
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress seeker */}
              <div className="space-y-1">
                <input 
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const time = Number(e.target.value)
                    setCurrentTime(time)
                    if (audioRef.current) {
                      audioRef.current.currentTime = time
                    }
                  }}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume controller */}
              <div className="flex items-center gap-2 justify-end">
                <button 
                  onClick={() => {
                    if (!audioRef.current) return
                    const nextMute = !isMuted
                    setIsMuted(nextMute)
                    audioRef.current.muted = nextMute
                  }}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const vol = Number(e.target.value)
                    setVolume(vol)
                    setIsMuted(false)
                    if (audioRef.current) {
                      audioRef.current.volume = vol
                      audioRef.current.muted = false
                    }
                  }}
                  className="w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Playlist Track Selection buttons */}
            <div className="space-y-2">
              {tracks.map((track, i) => {
                const isActive = i === currentTrackIndex
                return (
                  <button
                    key={i}
                    onClick={() => selectTrack(i)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border ${
                      isActive 
                        ? "bg-[#111111] border-[#c9a35a]/30 text-white" 
                        : "border-transparent bg-[#0d0d0d]/80 text-neutral-450 hover:bg-[#111111]/40 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-neutral-600">0{i + 1}</span>
                      <h4 className={`text-sm font-bold leading-none ${isActive ? "text-[#c9a35a]" : "text-white"}`}>{track.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                      {isActive ? "SPINNING" : "LOAD"}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Album memory note */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#0d0d0d] shadow-lg">
              <span className="text-[10px] font-mono text-[#8fa882] uppercase tracking-widest block font-bold mb-2">Memory File</span>
              <p className="text-sm leading-relaxed text-neutral-300 italic font-mono">
                &ldquo;{tracks[currentTrackIndex].note}&rdquo;
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Contact />
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
