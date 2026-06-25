"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, MapPin, X
} from "lucide-react"
import { Contact } from "@/components/contact"
import { Playfair_Display, Inter } from "next/font/google"
import { springSnappy, springSoft, staggerContainer, staggerChild } from "@/lib/motion"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] })
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

const batmanFont = localFont({
  src: "../fonts/batmfa__.ttf"
})

const tracks = [
  {
    title: "The Nights",
    artist: "Avicii",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "/images/personal/music_nights.jpg",
    badge: "ACTIVE SOUNDTRACK // THE PATH",
    note: "A reminder to live a life you will remember. The ultimate cruising anthem when the roads are wide open.",
    glow: "rgba(234, 179, 8, 0.08)", // Gotham Yellow tint
    rainColor: "rgba(234, 179, 8, 0.15)",
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
    image: "/bike_situm_16_9.png",
    coords: { x: "45%", y: "70%" }
  }
]

// Memory Wall data including new Udaipur lake palace and airplane takeoff captures
const memoryWallItems = [
  {
    id: 0,
    src: "/images/personal/rain_window.jpg",
    title: "Rain on Glass Pane",
    tag: "AESTHETIC LOG",
    subtitle: "RAIN WINDOW",
    desc: "A study of raindrops tracing patterns against a dark window pane. The charcoal black ambient light highlighting the texture.",
    styleClass: "absolute top-10 left-[5%] rotate-[-4deg] w-48",
    parallax: "slow"
  },
  {
    id: 1,
    src: "/images/personal/astro.jpg",
    title: "Milky Way over Hills",
    tag: "ASTROLOG",
    subtitle: "MILKY WAY CORE",
    desc: "A few seconds of clear sky captured after waiting out a freezing dust storm in Kutch. Proof that patience pays off.",
    styleClass: "absolute top-24 right-[8%] rotate-[3deg] w-52",
    parallax: "fast"
  },
  {
    id: 2,
    src: "/images/personal/arch.jpg",
    title: "Minimal Raw Geometries",
    tag: "GEOMETRIES",
    subtitle: "RAW CONCRETE",
    desc: "Angles of structural geometry and industrial lines found in raw concrete facades. The bridge between order and visual design.",
    styleClass: "absolute top-[40%] left-[55%] rotate-[-2deg] w-48",
    parallax: "mid"
  },
  {
    id: 3,
    src: "/images/personal/lake_palace.jpg",
    title: "Mewar Water Reflections",
    tag: "TRAVEL LOG",
    subtitle: "UDAIPUR LAKE PALACE",
    desc: "A view of the floating white marble palace on Lake Pichola, Udaipur. A study in historic architectural symmetry and silent waters.",
    styleClass: "absolute top-[52%] left-[4%] rotate-[5deg] w-52",
    parallax: "mid"
  },
  {
    id: 4,
    src: "/images/personal/airplane.jpg",
    title: "Final Approach Alignment",
    tag: "AVIATION LOG",
    subtitle: "RUNWAY INTERCEPT",
    desc: "Capturing the intense alignment and power of an Airbus A320 on final approach. A reminder of human engineering scaling the skies.",
    styleClass: "absolute bottom-16 left-[22%] rotate-[2deg] w-48",
    parallax: "mid"
  },
  {
    id: 5,
    src: "/images/personal/roads.jpg",
    title: "Ahmedabad to Kutch Run",
    tag: "ROAD MAP",
    subtitle: "KUTCH ROUTE",
    desc: "Long highway perspective lines recorded on late night tours. Simple routes where the only light comes from the console dials.",
    styleClass: "absolute bottom-5 right-[10%] rotate-[-5deg] w-52",
    parallax: "slow"
  },
  {
    id: 6,
    src: "/images/personal/travel.jpg",
    title: "Chai Stalls & Quiet Alleys",
    tag: "TRAVEL LOG",
    subtitle: "CHAI STALLS",
    desc: "Captured candid scenes from remote chai stalls and quiet village alleys. Moments of simple life under street lights.",
    styleClass: "absolute bottom-5 right-[10%] rotate-[-5deg] w-52",
    parallax: "slow"
  },
  // Gym items for lightbox mapping only (not rendered in Memory Wall collage grid)
  {
    id: 7,
    src: "/images/personal/gym_triceps.jpg",
    title: "Triceps Lateral Head Extension",
    tag: "STRENGTH LOG",
    subtitle: "POST-DEADLIFT PUMP",
    desc: "Fleshing out raw physical capabilities. Consistent progression on compound pulls translates directly to muscle thickness and overhead extensions.",
    styleClass: "hidden",
    parallax: "none"
  },
  {
    id: 8,
    src: "/images/personal/gym_biceps.jpg",
    title: "Gothic Bicep Peak Silhouette",
    tag: "STRENGTH LOG",
    subtitle: "SHADOW PROJECTION",
    desc: "A high-contrast visual log of physical conditioning under low key lighting. Rebuilding strength efficiency to 2.85x bodyweight.",
    styleClass: "hidden",
    parallax: "none"
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

  // Lightning Ref to access current intensity inside canvas loop without re-triggering effect
  const lightningRef = useRef(0)
  useEffect(() => {
    lightningRef.current = lightningIntensity
  }, [lightningIntensity])

  // Rain on Window Glass, Premium Interactive Particles & Flying Bats Canvas
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

    // Interactive mouse positioning
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
    }
    const handleMouseLeave = () => {
      mouse.targetX = -1000
      mouse.targetY = -1000
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    // Window droplets: static and slow sliding (minimal density)
    const dropletsCount = 40
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

    // Ambient premium gold dust particles (motes floating in light beams)
    const dustCount = 45
    const dustParticles: Array<{
      x: number
      y: number
      r: number
      vy: number
      vx: number
      baseVx: number
      baseVy: number
      opacity: number
      pulsePhase: number
      pulseSpeed: number
    }> = []

    for (let i = 0; i < dustCount; i++) {
      const baseVy = -(Math.random() * 0.15 + 0.05)
      const baseVx = (Math.random() - 0.5) * 0.08
      dustParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.8, // bokeh scale
        vy: baseVy,
        vx: baseVx,
        baseVx,
        baseVy,
        opacity: Math.random() * 0.12 + 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005
      })
    }


    let animId: number
    const draw = () => {
      // Clear canvas slightly transparent to show trail
      ctx.fillStyle = "rgba(5, 5, 5, 0.07)"
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
          drop.y += drop.vy
          drop.x += drop.vx
          if (Math.random() < 0.03) {
            drop.vx = (Math.random() - 0.5) * 0.15
          }
          drop.trail.push({ x: drop.x, y: drop.y })
          if (drop.trail.length > 15) {
            drop.trail.shift()
          }
          if (drop.y > height) {
            drop.y = -5
            drop.x = Math.random() * width
            drop.trail = []
          }
        }
      })

      // Interpolate mouse coordinates
      if (mouse.x === -1000) {
        mouse.x = mouse.targetX
        mouse.y = mouse.targetY
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.08
        mouse.y += (mouse.targetY - mouse.y) * 0.08
      }

      // Draw ambient gold dust motes with soft radial glowing gradients & mouse interactivity
      dustParticles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Ambient sway return
        p.vx += (p.baseVx - p.vx) * 0.02
        p.vy += (p.baseVy - p.vy) * 0.02

        // Interactivity with mouse: push away gently
        if (mouse.x !== -1000) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < 160) {
            const force = (160 - dist) / 160
            const angle = Math.atan2(dy, dx)
            p.vx += Math.cos(angle) * force * 0.35
            p.vy += Math.sin(angle) * force * 0.35
          }
        }

        // Pulse opacity and size organically
        p.pulsePhase += p.pulseSpeed
        const opacityOscillation = Math.sin(p.pulsePhase) * 0.03
        const currentOpacity = Math.max(0.01, Math.min(0.4, p.opacity + opacityOscillation))
        const currentRadius = p.r * (1 + Math.sin(p.pulsePhase * 0.5) * 0.12)

        // Draw soft glowing bokeh particle
        ctx.beginPath()
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius)
        grad.addColorStop(0, `rgba(234, 179, 8, ${currentOpacity})`)
        grad.addColorStop(0.4, `rgba(234, 179, 8, ${currentOpacity * 0.5})`)
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)')
        ctx.fillStyle = grad
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()

        // Wrap around edges
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
          p.vx = p.baseVx
          p.vy = p.baseVy
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
      })

      // Spawn bats if lightning just flashed
      // Bats removed per user request

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
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
    <div className={`min-h-screen bg-[#08080a] text-[#f5f5f5] selection:bg-[#eab308]/30 selection:text-[#eab308] overflow-x-hidden relative ${inter.className}`}>
      
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

      {/* ZONE 1: HERO — PERSONAL ARCHIVE */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-6 py-20">

        {/* Skyline silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-[280px] pointer-events-none opacity-[0.03] z-[2]">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path fill="#050505" d="M0,300 L0,200 L40,200 L40,160 L90,160 L90,220 L150,220 L150,110 L210,110 L210,230 L270,230 L270,140 L340,140 L340,240 L400,240 L400,70 L480,70 L480,250 L560,250 L560,180 L620,180 L620,240 L700,240 L700,100 L760,100 L760,220 L820,220 L820,150 L900,150 L900,250 L1000,250 L1000,300 Z" />
            <circle cx="230" cy="180" r="1.5" fill="#eab308" className="animate-pulse" style={{ animationDuration: '4s' }} />
            <circle cx="310" cy="190" r="1" fill="#7f1d1d" className="animate-pulse" style={{ animationDuration: '6s' }} />
            <circle cx="440" cy="150" r="2" fill="#eab308" className="animate-pulse" style={{ animationDuration: '3s' }} />
            <circle cx="730" cy="170" r="1.5" fill="#f5f5f5" className="animate-pulse" style={{ animationDuration: '5s' }} />
          </svg>
        </div>

        {/* Airplane beacons */}
        <div className="absolute top-[25%] left-[10%] pointer-events-none z-[1] flex gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-red-800 animate-ping" style={{ animationDuration: '3.5s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
        </div>

        {/* ─── Editorial Hero Grid ─── */}
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10">

          {/* Left: Name & Tag */}
          <div className="md:col-span-7 space-y-8 text-left">

            {/* Eyebrow label */}
            <div className="flex items-center gap-3">
              <span className="block w-6 h-px bg-[#eab308]" />
              <span className="text-[10px] font-mono tracking-[0.35em] text-[#eab308] uppercase">Personal Archive</span>
            </div>

            {/* Name */}
            <div>
              <h1 className={`text-6xl md:text-8xl font-normal tracking-wider text-white leading-none ${batmanFont.className}`}>
                SAUMYA
              </h1>
              <p className="text-4xl md:text-6xl font-light tracking-widest text-white/70 mt-1 leading-none">
                Parekh
              </p>
            </div>

            {/* Descriptor */}
            <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-md font-light">
              Civil engineer by training. Motorcyclist, lifter, and late-night reader by choice.
              This is the unstructured side of the archive — the iron, the roads, the records, the quiet hours.
            </p>

            {/* Divider + scroll cue */}
            <div className="flex items-center gap-6 pt-2">
              <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-600 uppercase">Scroll to explore</span>
              <span className="text-neutral-600 text-sm">↓</span>
            </div>
          </div>

          {/* Right: Portrait */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] group">
              <Image
                src="/images/personal/rain_window.jpg"
                alt="Saumya Parekh"
                fill
                className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                priority
              />
              {/* Edge fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080a]/80 via-transparent to-transparent" />
              <div className="absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#08080a]/60 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#08080a]/60 to-transparent" />
            </div>
          </div>

        </div>
      </section>

      {/* ZONE 2: THE DESK */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10 bg-batmanCharcoal/80">
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer(0.12, 0)}
        >
          <motion.span variants={staggerChild} className="text-[10px] font-mono text-[#eab308] tracking-widest uppercase block font-bold">{"// THE WRITING DESK"}</motion.span>
          <motion.h2 variants={staggerChild} className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>Scattered Artifacts</motion.h2>
          <motion.p variants={staggerChild} className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            Items resting on a dark walnut desk. Inspect each object to uncover the memories and thoughts connected to them.
          </motion.p>
        </motion.div>

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
                    ? "bg-[#111] border-[#eab308] text-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
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
                    ? "bg-[#111] border-[#eab308] text-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
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
                    ? "bg-[#111] border-[#eab308] text-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
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
                    ? "bg-[#111] border-[#eab308] text-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
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
                    ? "bg-[#111] border-[#eab308] text-[#eab308] shadow-[0_0_20px_rgba(234,179,8,0.1)]" 
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
                  className="p-8 rounded-3xl border border-[#eab308]/20 bg-[#0d0d0d] space-y-4 shadow-xl"
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
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer(0.12, 0)}
        >
          <motion.span variants={staggerChild} className="text-[10px] font-mono text-[#eab308] tracking-widest uppercase block font-bold">{"// THE ARCHIVE WALL"}</motion.span>
          <motion.h2 variants={staggerChild} className={`text-3xl md:text-4xl font-normal text-white tracking-wider ${batmanFont.className}`}>Memory Wall</motion.h2>
          <motion.p variants={staggerChild} className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            An organized collection of photos, coordinate points, and captures. Structured inside a secure dossier archive.
          </motion.p>
        </motion.div>

        {/* Clean Responsive 3-Column Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer(0.08, 0)}
        >
          {memoryWallItems
            .filter((item) => item.styleClass !== "hidden")
            .map((item) => (
              <motion.div
                key={item.id}
                variants={staggerChild}
                whileHover={{ y: -6, scale: 1.02, transition: springSnappy }}
                onClick={() => setActiveWallImage(item.id)}
                className="relative p-4 bg-[#121216] border border-white/5 rounded-2xl shadow-2xl cursor-pointer hover:border-[#eab308]/30 transition-colors flex flex-col gap-4 group z-10"
              >
                {/* Bat silhouette accent */}
                <div className="absolute -top-3.5 left-6 pointer-events-none opacity-40 group-hover:opacity-100 text-[#eab308] group-hover:drop-shadow-[0_0_4px_rgba(234,179,8,0.5)] transition-all duration-300">
                  <svg width="20" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C11.5 4 10 5 8 5C6 5 4 4 2 2C3.5 5 3.5 8 2 12C3 13 4.5 13.5 6 13C5 14.5 3.5 15.5 2 16C5 17 8 16 9.5 15C9.5 16 10 17.5 11 18L12 22L13 18C14 17.5 14.5 16 14.5 15C16 16 19 17 22 16C20.5 15.5 19 14.5 18 13C19.5 13.5 21 13 22 12C20.5 8 20.5 5 22 2C20 4 18 5 16 5C14 5 12.5 4 12 2Z" />
                  </svg>
                </div>
                <div className="relative aspect-[4/3] w-full bg-neutral-900 rounded-xl overflow-hidden shadow-inner border border-white/5">
                  <Image 
                    src={item.src} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="space-y-1 font-mono pt-1">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-[#eab308] font-bold tracking-widest uppercase">{item.tag}</span>
                    <span className="text-neutral-500">{item.subtitle}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide mt-1">{item.title}</h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-sans line-clamp-2 mt-1">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </section>

      {/* ZONE 4: THE GARAGE BELOW */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer(0.12, 0)}
        >
          <motion.span variants={staggerChild} className="text-[10px] font-mono text-[#eab308] tracking-widest uppercase block font-bold">{"// THE LOWER SHED"}</motion.span>
          <motion.h2 variants={staggerChild} className={`text-4xl md:text-5xl font-bold text-white ${playfair.className}`}>Silent Spotlight</motion.h2>
          <motion.p variants={staggerChild} className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            The Super Meteor 650 sits beneath the warm overhead beam. Click the coordinate pins floating around the machine to read ride log excerpts.
          </motion.p>
        </motion.div>

        {/* Spotlight Visual Container — portrait framing for rider+bike shot */}
        <div className="relative bg-[#0b0b0d] border border-white/5 rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-2xl group">
          {/* Spotlight Cone overlay */}
          <div className="absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top,#eab308_0%,transparent_60%)] opacity-[0.08] pointer-events-none" />
          
          <div className="relative w-full max-w-sm aspect-[9/16] sm:max-w-md overflow-hidden rounded-2xl border border-white/5 bg-[#050505] shadow-2xl">
            <Image 
              src="/images/personal/motorcycle.jpg" 
              alt="RE Super Meteor 650 — Saumya Parekh" 
              fill 
              className="object-cover object-center opacity-90"
            />
            {/* Subtle edge fade */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

            {/* Hover floating dots coordinates */}
            {rideMemories.map((ride) => (
              <button
                key={ride.id}
                onClick={() => setActiveRide(ride)}
                className="absolute w-8 h-8 rounded-full bg-[#eab308]/25 border border-[#eab308] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-pulse"
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
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: springSnappy }}
                exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2 } }}
                className="absolute bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm p-6 rounded-2xl border border-[#eab308]/30 bg-[#0d0d0d] shadow-2xl z-30 font-mono text-neutral-300 space-y-3"
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
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10 bg-batmanCharcoal/80">
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer(0.12, 0)}
        >
          <motion.span variants={staggerChild} className="text-[10px] font-mono text-[#eab308] tracking-widest uppercase block font-bold">{"// PROGRESS JOURNAL"}</motion.span>
          <motion.h2 variants={staggerChild} className={`text-3xl md:text-4xl font-normal text-white tracking-wider ${batmanFont.className}`} style={{ color: "#eab308" }}>The Training Log</motion.h2>
          <motion.p variants={staggerChild} className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            Written logs of lifting over the years. Progression, plateaus, and setbacks from the iron record.
          </motion.p>
        </motion.div>

        {/* Container wrapping notebook and floating polaroids */}
        <div className="relative max-w-4xl mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-0 items-center justify-center">
          
          {/* Polaroid Left: Triceps pose */}
          <motion.div
            initial={{ opacity: 0, x: -40, rotate: -10 }}
            whileInView={{ opacity: 1, x: 0, rotate: -6, transition: { ...springSoft, delay: 0.1 } }}
            viewport={{ once: true }}
            whileHover={{ rotate: 0, scale: 1.05, transition: springSnappy }}
            onClick={() => setActiveWallImage(7)}
            className="lg:absolute lg:-left-32 lg:top-12 z-20 p-3 pb-6 bg-[#121216] text-neutral-200 shadow-2xl rounded-sm cursor-pointer w-64 border border-white/5"
          >
            <div className="relative aspect-video w-full bg-neutral-900 border border-white/5 rounded overflow-hidden">
              <Image src="/images/personal/gym_triceps.jpg" alt="Triceps Pose" fill className="object-cover object-center" />
            </div>
            <div className="text-center font-mono mt-3">
              <span className="text-[8px] text-[#ef4444] font-bold block uppercase">Iron Dossier</span>
              <span className="text-[10px] font-bold text-white">Triceps Aspect</span>
            </div>
          </motion.div>

          {/* Paper double-page notebook layout */}
          <div className="max-w-2xl w-full bg-[#121216] text-neutral-200 rounded-3xl p-6 md:p-10 shadow-2xl relative border border-white/10 font-mono select-text z-10">
            {/* Metal binder visual representation */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 border-x border-neutral-700 select-none pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              
              {/* Left Page (Failed logs / Backstories) */}
              <div className="space-y-6 pr-4 border-r border-dashed border-white/10 md:border-r-0">
                <span className="text-[9px] text-[#ef4444] font-bold block uppercase border-b border-white/5 pb-1">
                  JOURNAL ARCHIVE // PAGE 01
                </span>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 font-bold block">FEBRUARY 2025</span>
                    <h4 className="text-xs font-bold uppercase text-white">160kg Deadlift milestone</h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                      First lift that felt completely out of reach beforehand. Reaching it proved that structured loading and consistency always compound over time.
                    </p>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <span className="text-[9px] text-neutral-400 font-bold block">AUGUST 2025</span>
                    <h4 className="text-xs font-bold uppercase text-[#ef4444]">Setback: Jaundice Weight Loss</h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                      Lost 8kg of bodyweight in a single month. Barbell felt heavy at 60kg. Rebuilding strength from absolute scratch was a lesson in humility.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Page (Rebuilding / Success PRs) */}
              <div className="space-y-6 pl-4 md:pl-6">
                <span className="text-[9px] text-neutral-400 font-bold block uppercase border-b border-white/5 pb-1">
                  JOURNAL ARCHIVE // PAGE 02
                </span>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-400 font-bold block">JUNE 2026</span>
                    <h4 className="text-xs font-bold uppercase text-white">210kg Deadlift PR</h4>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-mono">
                      Pulled 210kg. A number I used to think belonged to other people. Reaching it felt less like a victory and more like proof that showing up works.
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3 text-[10px]">
                    <span className="text-[9px] text-neutral-400 font-bold block">CURRENT METRICS</span>
                    <div className="flex justify-between">
                      <span>Active Bodyweight:</span>
                      <span className="font-bold text-white">73.5 KG</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Strength Efficiency:</span>
                      <span className="font-bold text-[#eab308]">2.85x BW</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-1">
                      <span>Consistency Ratio:</span>
                      <span className="font-bold text-white">4x / week</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between text-[8px] text-neutral-500 border-t border-white/10 pt-4 mt-6">
              <span>JOURNAL RECOVERY DONE // SAUMYA</span>
              <span>SECURE STRENGTH LOG</span>
            </div>
          </div>

          {/* Polaroid Right: Biceps pose */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 10 }}
            whileInView={{ opacity: 1, x: 0, rotate: 6, transition: { ...springSoft, delay: 0.15 } }}
            viewport={{ once: true }}
            whileHover={{ rotate: 0, scale: 1.05, transition: springSnappy }}
            onClick={() => setActiveWallImage(8)}
            className="lg:absolute lg:-right-32 lg:bottom-12 z-20 p-3 pb-6 bg-[#121216] text-neutral-200 shadow-2xl rounded-sm cursor-pointer w-64 border border-white/5"
          >
            <div className="relative aspect-video w-full bg-neutral-900 border border-white/5 rounded overflow-hidden">
              <Image src="/images/personal/gym_biceps.jpg" alt="Bicep Silhouette" fill className="object-cover object-center" />
            </div>
            <div className="text-center font-mono mt-3">
              <span className="text-[8px] text-[#ef4444] font-bold block uppercase">Iron Dossier</span>
              <span className="text-[10px] font-bold text-white">Biceps Shadow</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ZONE 6: THE MUSIC CORNER (REACTIVE LOGIC) */}
      <section className="relative min-h-screen py-24 px-6 max-w-5xl mx-auto flex flex-col justify-center space-y-16 border-t border-white/5 z-10">
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer(0.12, 0)}
        >
          <motion.span variants={staggerChild} className="text-[10px] font-mono text-[#eab308] tracking-widest uppercase block font-bold">{"// THE TURNTABLE"}</motion.span>
          <motion.h2 variants={staggerChild} className={`text-3xl md:text-4xl font-normal text-white tracking-wider ${batmanFont.className}`}>Record Player</motion.h2>
          <motion.p variants={staggerChild} className="text-neutral-400 text-sm max-w-md font-light leading-relaxed">
            Changing tracks shifts the penthouse environment. The background rain, city wind speed, and lightning flashes adapt emotionally to the record.
          </motion.p>
        </motion.div>

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
                  <span className="text-[10px] font-mono text-[#eab308] uppercase tracking-wider block font-bold">
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
                        ? "bg-[#111111] border-[#eab308]/30 text-white" 
                        : "border-transparent bg-[#0d0d0d]/80 text-neutral-450 hover:bg-[#111111]/40 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-neutral-600">0{i + 1}</span>
                      <h4 className={`text-sm font-bold leading-none ${isActive ? "text-[#eab308]" : "text-white"}`}>{track.title}</h4>
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeWallImage !== null && (() => {
          const item = memoryWallItems.find(x => x.id === activeWallImage);
          if (!item) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveWallImage(null)}
              className="fixed inset-0 z-[200] backdrop-blur-2xl bg-black/70 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0, transition: { type: "spring", stiffness: 300 } }}
                exit={{ scale: 0.95, y: 20, transition: { type: "spring", stiffness: 300 } }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full bg-[#121216] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row m-4"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveWallImage(null)}
                  className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 border border-white/10 text-white hover:bg-[#eab308] hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Image Area */}
                <div className="relative aspect-[4/3] md:aspect-auto md:w-3/5 min-h-[300px] md:min-h-[450px] bg-black">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Info Area */}
                <div className="p-6 md:p-8 flex flex-col justify-between md:w-2/5 font-mono">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#eab308] font-bold tracking-widest uppercase">{item.tag}</span>
                      <span className="text-neutral-500">{item.subtitle}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-wide">{item.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans mt-2">
                      {item.desc}
                    </p>
                  </div>
                  <div className="text-[10px] text-neutral-500 pt-4 border-t border-white/5 mt-6 flex justify-between">
                    <span>DOSSIER: RECORD_0{item.id}</span>
                    <span>SECURE LOG</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  )
}
