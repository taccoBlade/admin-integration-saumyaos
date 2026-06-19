"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Cpu, Layers, Settings, Activity, 
  CheckCircle2, Calendar, Award, BookOpen
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.16, 1, 0.3, 1] as const,
      duration: 0.6
    }
  }
}

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-[#08090b] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 py-12 md:py-24">
        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-cyan-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to System Terminal
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-neutral-800 pb-8 mb-12"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-cyan-950/50 border border-cyan-800/30 text-cyan-400">
              Geotechnical Engineering
            </span>
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
              Computer Vision & IoT Monitoring
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              Jan 2026 - Present
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-4">
            Soil Analysis Automated
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-3xl">
            Viewed app.py:1-573 Here is a complete breakdown of all the features your system currently possesses, as well as the exact outputs you should expect to see in your terminal running `app.py`: When the Flask server runs, it acts as the central brain. Here is what prints to the console:
          </p>
        </motion.div>

        {/* Content Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Main Outcomes & Metrics */}
          <motion.div variants={itemVariants} className="md:col-span-2 p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-cyan-400">
              <Award className="w-5 h-5" />
              Key Outcomes & Evidence
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              Successful deployment and verification of the Soil Analysis Automated system.
            </p>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-850 pt-6">
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">STATUS</div>
                  <div className="text-sm font-semibold text-neutral-200">Verified</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">PERFORMANCE</div>
                  <div className="text-sm font-semibold text-neutral-200">Optimized</div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Core Technologies */}
          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-cyan-400">
              <Cpu className="w-5 h-5" />
              Technology Stack
            </h2>
            <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">Flask</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">Python</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">MQTT Protocol</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">Chart.js</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">NumPy</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">OpenCV</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-cyan-200">Arduino C++</span>

            </div>
          </motion.div>

          {/* Hardware & Software Components */}
          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-cyan-400">
              <Layers className="w-5 h-5" />
              Hardware Modules
            </h2>
                        <ul className="space-y-3 font-mono text-sm">
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />Soil Moisture Sensor</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />ESP32 Microcontroller</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />ESP32-CAM Board</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-cyan-400">
              <Settings className="w-5 h-5" />
              Software Core
            </h2>
                        <ul className="space-y-3 font-mono text-sm">
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />MQTT Broker Server</li>
            </ul>
          </motion.div>

          {/* Engineering Concepts */}
          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-cyan-400">
              <BookOpen className="w-5 h-5" />
              Engineering Concepts
            </h2>
                        <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>MQTT Pub/Sub Telemetry</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>Computer Vision Crack Detection</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>Soil-Structure Interaction</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>Real-Time Telemetry Systems</span></li>
            </ul>
          </motion.div>

          {/* Challenges & Lessons Learned */}
          <motion.div variants={itemVariants} className="md:col-span-3 p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-6 inline-flex items-center gap-2 text-cyan-400">
              <Activity className="w-5 h-5" />
              Technical Challenges & Iterations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider border-b border-neutral-850 pb-2">Challenges Encountered</h3>
                                  <div className="flex gap-3"><span className="text-xs font-mono text-cyan-500 shrink-0 mt-0.5">[01]</span><p className="text-sm text-neutral-300 leading-relaxed">Handling edge cases in high-frequency data inputs.</p></div>

              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider border-b border-neutral-850 pb-2">Engineering Decisions & Lessons</h3>
                                  <div className="flex gap-3"><span className="text-xs font-mono text-cyan-500 shrink-0 mt-0.5">[01]</span><p className="text-sm text-neutral-300 leading-relaxed">Iterative unit testing is critical when dealing with physical sensors.</p></div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
