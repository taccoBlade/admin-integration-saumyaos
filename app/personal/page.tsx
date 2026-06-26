"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Play, Pause, SkipForward, SkipBack, Shuffle, ListMusic } from "lucide-react"
import { spotifyTracks } from "@/lib/spotifyTracks"
import { Contact } from "@/components/contact"
import { Playfair_Display, Source_Serif_4, JetBrains_Mono, Caveat } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] })
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["300", "400", "600"], style: ["normal", "italic"] })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] })
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] })

const telegramImages = [
  "/images/personal/photo_2026-06-25_11-44-20.jpg",
  "/images/personal/photo_2026-06-25_11-44-24.jpg",
  "/images/personal/photo_2026-06-25_11-44-25.jpg",
  "/images/personal/photo_2026-06-25_11-44-26.jpg",
  "/images/personal/photo_2026-06-25_11-44-28.jpg",
  "/images/personal/photo_2026-06-25_11-44-29.jpg",
  "/images/personal/photo_2026-06-25_11-44-30.jpg",
  "/images/personal/photo_2026-06-25_11-44-31.jpg",
  "/images/personal/photo_2026-06-25_11-44-32.jpg",
  "/images/personal/photo_2026-06-25_11-44-33.jpg"
]

const tracks = spotifyTracks;

export default function PersonalPage() {
  const [mounted, setMounted] = useState(false)
  const [lightningIntensity, setLightningIntensity] = useState(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isShuffle, setIsShuffle] = useState(false)
  const [playlistOrder, setPlaylistOrder] = useState<number[]>([])

  useEffect(() => {
    if (playlistOrder.length === 0) {
      setPlaylistOrder(tracks.map((_, i) => i))
    }
  }, [tracks, playlistOrder.length])

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle)
    if (!isShuffle) {
      // Create a shuffled array of indices, but keep the current track at the beginning
      const shuffled = tracks.map((_, i) => i).filter(i => i !== currentTrackIndex);
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setPlaylistOrder([currentTrackIndex, ...shuffled]);
    } else {
      // Restore original order
      setPlaylistOrder(tracks.map((_, i) => i));
    }
  }
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 3D Mouse Parallax State
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      if (Math.random() < (tracks[currentTrackIndex].flashRate * 100)) {
        setLightningIntensity(0.8)
        setTimeout(() => setLightningIntensity(0), 150)
        setTimeout(() => setLightningIntensity(0.5), 250)
        setTimeout(() => setLightningIntensity(0), 400)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [mounted, currentTrackIndex])

  // Rain Canvas Effect
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

    const dropletsCount = 30
    const droplets: Array<{x: number, y: number, r: number, vy: number, vx: number, trail: Array<{x: number, y: number}>, sliding: boolean}> = []
    for (let i = 0; i < dropletsCount; i++) {
      droplets.push({
        x: Math.random() * width, y: Math.random() * height,
        r: Math.random() * 2 + 0.5, vy: Math.random() * 0.3 + 0.1, vx: (Math.random() - 0.5) * 0.05,
        trail: [], sliding: Math.random() < 0.4
      })
    }

    let animId: number
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = tracks[currentTrackIndex].rainColor
      
      droplets.forEach((drop) => {
        if (drop.sliding && drop.trail.length > 0) {
          ctx.beginPath()
          ctx.strokeStyle = tracks[currentTrackIndex].rainColor
          ctx.lineWidth = drop.r * 0.3
          ctx.moveTo(drop.trail[0].x, drop.trail[0].y)
          for (let k = 1; k < drop.trail.length; k++) {
            ctx.lineTo(drop.trail[k].x, drop.trail[k].y)
          }
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2)
        ctx.fill()
        if (drop.sliding) {
          drop.y += drop.vy
          drop.x += drop.vx
          if (Math.random() < 0.03) drop.vx = (Math.random() - 0.5) * 0.1
          drop.trail.push({ x: drop.x, y: drop.y })
          if (drop.trail.length > 10) drop.trail.shift()
          if (drop.y > height) {
            drop.y = -5
            drop.x = Math.random() * width
            drop.trail = []
          }
        }
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animId)
    }
  }, [currentTrackIndex])

  useEffect(() => {
    if (!audioRef.current) return
    const wasPlaying = isPlaying
    audioRef.current.src = tracks[currentTrackIndex].src
    audioRef.current.load()
    if (wasPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
  }, [currentTrackIndex, isPlaying])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play().catch(() => setIsPlaying(false)); setIsPlaying(true) }
  }
  
  const handlePrev = () => {
    const currentOrderIndex = playlistOrder.indexOf(currentTrackIndex);
    const nextOrderIndex = currentOrderIndex === 0 ? playlistOrder.length - 1 : currentOrderIndex - 1;
    setCurrentTrackIndex(playlistOrder[nextOrderIndex]);
    setIsPlaying(true);
  }
  
  const handleNext = () => {
    const currentOrderIndex = playlistOrder.indexOf(currentTrackIndex);
    const nextOrderIndex = currentOrderIndex === playlistOrder.length - 1 ? 0 : currentOrderIndex + 1;
    setCurrentTrackIndex(playlistOrder[nextOrderIndex]);
    setIsPlaying(true);
  }
  
  useEffect(() => {
    if (!audioRef.current) return
    const audio = audioRef.current
    const handleEnded = () => handleNext()
    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, currentTrackIndex])

  const springHeavy = { type: "spring" as const, damping: 30, stiffness: 60, mass: 2 }

  return (
    <div className={`min-h-screen bg-[#050505] text-[#FAFAF9] overflow-x-hidden relative ${sourceSerif.className} selection:bg-[#A16207] selection:text-white`}>
      
      {/* Global CSS Noise & Environment */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <canvas id="rain-glass-canvas" className="w-full h-full block opacity-70" />
        <div 
          className="absolute inset-0 bg-white pointer-events-none mix-blend-screen transition-opacity duration-150"
          style={{ opacity: lightningIntensity * 0.1 }}
        />
        {/* Replaced intense colored haze with a clean dark radial blur to make text visible */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 25% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)' }}
        />
        <div 
          className="absolute inset-0 transition-colors duration-[2000ms] blur-[100px] pointer-events-none opacity-30"
          style={{ backgroundColor: tracks[currentTrackIndex].glow }}
        />
      </div>

      {/* ZONE 1: EDITORIAL HERO */}
      <section className="relative min-h-screen flex items-center pt-20 px-4 md:px-12 z-10">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-full">
          {/* Asymmetric Text */}
          <motion.div 
            className="md:col-span-5 md:col-start-1 space-y-12 z-20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springHeavy}
          >
            <div className="space-y-4">
              <span className={`text-xs uppercase tracking-[0.4em] text-[#A16207] ${jetbrains.className}`}>Vol. 01 — Archive</span>
              <h1 className={`text-6xl md:text-8xl font-normal leading-[0.9] text-white ${playfair.className}`}>
                Still figuring<br/>
                <span className="italic text-neutral-500">it out.</span>
              </h1>
            </div>
          </motion.div>

          {/* Bleeding Portrait */}
          <motion.div 
            className="md:col-span-8 md:col-start-6 relative h-[70vh] w-[120%] md:w-full ml-[-10%] md:ml-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              transform: `translateY(${(mousePos.y - 0.5) * -20}px) translateX(${(mousePos.x - 0.5) * -20}px)`
            }}
          >
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(5,5,5,1)] z-10" />
            <Image src="/images/personal/hero_new.jpg" alt="Portrait" fill className="object-cover object-center filter grayscale opacity-80 mix-blend-luminosity" priority />
          </motion.div>
        </div>
      </section>

      {/* ZONE 2: THE ARCHIVE (EDITORIAL GRID) */}
      <section className="relative min-h-screen py-32 md:py-48 px-4 md:px-12 z-10">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b-2 border-white/10 pb-8">
            <h2 className={`text-6xl md:text-8xl text-white ${playfair.className} italic leading-none`}>Records</h2>
            <p className={`text-neutral-500 max-w-xs text-right mt-8 md:mt-0 ${jetbrains.className} text-xs uppercase tracking-widest`}>
              Physical & digital artifacts. Compiled and documented.
            </p>
          </div>

          {/* True Masonry Grid (Aspect Ratio Preserved) */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {[2, 4, 5, 1, 3, 6, 8].map((imgIndex) => (
              <div key={imgIndex} className="relative group overflow-hidden bg-[#0c0a09] break-inside-avoid ring-1 ring-inset ring-white/10">
                <div className="relative w-full h-auto">
                  <Image 
                    src={telegramImages[imgIndex]} 
                    alt={`Archive ${imgIndex}`} 
                    width={800} 
                    height={800} 
                    className="w-full h-auto filter grayscale contrast-[1.2] opacity-80 group-hover:opacity-100 transition-all duration-[1s]" 
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ZONE 5: THE IRON JOURNAL (DARK EDITORIAL) */}
      <section className="relative min-h-screen py-32 z-10 bg-[#050505] border-t border-white/5">
        <div className="w-full flex flex-col lg:flex-row h-full min-h-[80vh]">
          
          {/* Left: Huge Editorial Photo */}
          <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-full flex items-center justify-center p-8 lg:p-24 bg-[#080808]">
            {/* Dark Concrete background subtle */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] pointer-events-none" />

            <div className="relative w-full max-w-xl mx-auto shadow-[0_40px_100px_rgba(0,0,0,0.9)] border-[4px] border-neutral-900 bg-black group overflow-hidden">
              
              {/* Printed Edge Inner Shadow */}
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,1)] z-20 pointer-events-none mix-blend-multiply" />
              
              {/* Image Base (Unfiltered as requested) */}
              <Image 
                src={telegramImages[7]} 
                alt="Gym Archive" 
                width={800}
                height={1200}
                className="w-full h-auto z-0" 
              />
            </div>
          </div>

          {/* Right: Stark Typography */}
          <div className="w-full lg:w-1/2 relative p-12 lg:p-32 flex flex-col justify-center text-white">
            <div className="max-w-md space-y-12 relative z-10">
              
              {/* Label */}
              <div className="flex gap-4 items-center">
                <span className={`text-xs tracking-[0.2em] uppercase ${jetbrains.className} text-[#A16207]`}>Discipline</span>
                <div className="h-[1px] w-12 bg-[#A16207]/30" />
                <span className={`text-xs tracking-[0.2em] ${jetbrains.className} text-neutral-500`}>2026</span>
              </div>

              {/* Massive Stat */}
              <div>
                <h3 className={`text-7xl md:text-[7rem] leading-none tracking-tighter text-white ${playfair.className}`}>
                  IRON<span className="text-4xl text-[#A16207] ml-2 block mt-4">MINDSET</span>
                </h3>
              </div>

              {/* Minimal Text */}
              <p className="text-2xl text-neutral-400 leading-snug">
                Showing up works.
              </p>

              {/* Handwritten Note */}
              <div className="pt-16 mt-8 border-t border-white/10">
                <p className={`${caveat.className} text-4xl text-neutral-300 rotate-[-2deg]`}>
                  Relentless progression.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ZONE 6: ACTIVE SOUNDTRACK // BUILDER & QUEUE */}
        <section className="relative min-h-[60vh] py-24 px-4 flex items-center justify-center z-10">
          <div className="w-full max-w-md bg-[#0a0a0a] rounded-3xl p-6 border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col gap-6">
            
            {/* Subtle Glow inside the card */}
            <div 
              className="absolute inset-0 opacity-20 blur-3xl transition-colors duration-[2000ms]"
              style={{ backgroundColor: tracks[currentTrackIndex]?.glow || '#F59E0B' }}
            />
            
            <div className="relative z-10 space-y-6">
              
              {/* Top row: Cover & Labels */}
              <div className="flex gap-5 items-center">
                {/* Cover Art */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0">
                  <Image 
                    src={tracks[currentTrackIndex]?.coverUrl || telegramImages[9]} 
                    alt="Track Cover" 
                    fill 
                    className="object-cover" 
                  />
                  {/* Active Dot */}
                  <div 
                    className="absolute top-2 right-2 w-3 h-3 rounded-full transition-colors duration-[2000ms] shadow-[0_0_10px_rgba(0,0,0,1)]" 
                    style={{ backgroundColor: '#F59E0B' }} 
                  />
                </div>
  
                {/* Labels */}
                <div className="flex flex-col justify-center">
                  <p className={`text-xs tracking-widest text-neutral-500 font-medium ${jetbrains.className} uppercase mb-1 flex items-center gap-2`}>
                    <ListMusic className="w-3 h-3" /> Active Soundtrack
                  </p>
                  <h3 className="text-2xl font-bold text-white truncate max-w-[240px]">
                    {tracks[currentTrackIndex]?.title}
                  </h3>
                  <p className="text-base text-neutral-400 truncate max-w-[240px]">
                    {tracks[currentTrackIndex]?.artist}
                  </p>
                </div>
              </div>
  
              {/* Visualizer Bar */}
              <div className="w-full h-10 flex items-end gap-[3px] px-1">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-full bg-[#F59E0B] rounded-t-sm opacity-90"
                    animate={{ 
                      height: isPlaying ? [
                        Math.random() * 12 + 2, 
                        Math.random() * 32 + 4, 
                        Math.random() * 16 + 2
                      ] : 2 
                    }}
                    transition={{ 
                      duration: 0.5 + Math.random() * 0.3,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
  
              {/* Controls */}
              <div className="flex justify-between items-center pt-2 px-2">
                <button 
                  onClick={toggleShuffle} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isShuffle ? 'text-[#F59E0B] bg-[#F59E0B]/10' : 'text-neutral-500 hover:text-white hover:bg-white/5'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={handlePrev} 
                    className="w-12 h-12 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  
                  <button 
                    onClick={togglePlay} 
                    className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  
                  <button 
                    onClick={handleNext} 
                    className="w-12 h-12 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                <div className="w-10" /> {/* Spacer for centering */}
              </div>
              
              {/* Up Next Queue */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className={`text-[10px] tracking-widest text-neutral-500 font-medium ${jetbrains.className} uppercase mb-3`}>
                  Up Next {isShuffle && '(Shuffled)'}
                </p>
                <div className="space-y-3">
                  {playlistOrder.slice(playlistOrder.indexOf(currentTrackIndex) + 1, playlistOrder.indexOf(currentTrackIndex) + 4).map((trackIdx) => (
                    <div key={trackIdx} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { setCurrentTrackIndex(trackIdx); setIsPlaying(true); }}>
                      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                        <Image src={tracks[trackIdx]?.coverUrl || telegramImages[9]} alt="cover" fill className="object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm text-white truncate max-w-[200px]">{tracks[trackIdx]?.title}</p>
                        <p className="text-xs text-neutral-400 truncate max-w-[200px]">{tracks[trackIdx]?.artist}</p>
                      </div>
                    </div>
                  ))}
                  {playlistOrder.indexOf(currentTrackIndex) + 4 > playlistOrder.length && tracks.length > 3 && (
                    <div className="flex items-center gap-3 opacity-60">
                       <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center">...</div>
                       <p className="text-xs text-neutral-500">End of queue</p>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </section>

      <Contact />
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
