"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Cpu, Layers, Settings, Activity, 
  CheckCircle2, Calendar, Award, BookOpen
} from 'lucide-react'
import { DashboardEmbed } from '@/components/dashboard-embed'


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
    <div className="min-h-screen bg-[#08090b] text-neutral-100 font-sans selection:bg-attention-500/30 selection:text-attention-200">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-attention-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 py-12 md:py-24">
        {/* Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-attention-400 transition-colors group">
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
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-attention-950/50 border border-attention-800/30 text-attention-400">
              Infrastructure Automation
            </span>
            <span className="px-3 py-1 text-xs font-mono rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
              Universal Intelligent Compaction (UIC)
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              Jan 2026 - Present
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-4">
            Automation & Intelligent Machine Guided Construction
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-3xl">
            
          </p>
        </motion.div>

        {/* Live Interactive Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-4 font-mono text-attention-400 flex items-center gap-2">
            <Activity className="w-5 h-5 text-attention-400" />
            Live Project Dashboard Console
          </h2>
          <DashboardEmbed
            port={5002}
            title="NHAI Intelligent Compaction & Roller Tracking Map"
            mockupDescription="Intelligent compaction monitoring dashboard displaying live heavy roller trajectories, pass counts, soil temperature gradients, and compaction value mappings in real-time."
            keyFeatures={[
              "Live roller trajectory tracking",
              "Pass count map visualizer",
              "Compaction stiffness value profiles",
              "Simulated Socket.IO telemetry feeds"
            ]}
          />
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
            <div className="absolute inset-0 bg-gradient-to-br from-attention-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-attention-400">
              <Award className="w-5 h-5" />
              Key Outcomes & Evidence
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-6">
              Developed and verified the Universal Intelligent Compaction Retrofit Kit. Tested on flexible pavement layers (subgrade, GSB, WMM, DBM, BC) showing high CMV correlation to physical Proctor and Plate Load testing.
            </p>

            {/* Metrics Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-850 pt-6">
                            <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5 text-attention-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">RETROFIT COST</div>
                  <div className="text-sm font-semibold text-neutral-200">₹58,000</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5 text-attention-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">MARKET COST COMPARISON</div>
                  <div className="text-sm font-semibold text-neutral-200">₹50,000,000 (Market Machine)</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5 text-attention-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">POSITIONING ACCURACY</div>
                  <div className="text-sm font-semibold text-neutral-200">±2.5cm</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-850">
                <CheckCircle2 className="w-5 h-5 text-attention-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">SENSOR SAMPLING RATE</div>
                  <div className="text-sm font-semibold text-neutral-200">100Hz</div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Core Technologies */}
          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-attention-400">
              <Cpu className="w-5 h-5" />
              Technology Stack
            </h2>
            <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">Python</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">NumPy</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">Flask</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">Socket.IO</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">SciPy</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">C++</span>
              <span className="px-3 py-1.5 text-xs font-mono rounded-xl bg-neutral-950 border border-neutral-850 text-attention-200">Raspberry Pi</span>

            </div>
          </motion.div>

          {/* Hardware & Software Components */}
          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-attention-400">
              <Layers className="w-5 h-5" />
              Hardware Modules
            </h2>
                        <ul className="space-y-3 font-mono text-sm">
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />RTK-GPS Module</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Time-of-Flight (ToF) LiDAR</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Infrared (IR) Thermometry</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Triaxial Industrial ICP Accelerometer</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Raspberry Pi IPC</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-attention-400">
              <Settings className="w-5 h-5" />
              Software Core
            </h2>
                        <ul className="space-y-3 font-mono text-sm">
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Edge Processing Core</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Extended Kalman Filter Sync</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Vibration Spectrum FFT</li>
              <li className="flex items-center gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500" />Web-based Operator HMI</li>
            </ul>
          </motion.div>

          {/* Engineering Concepts */}
          <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-4 inline-flex items-center gap-2 text-attention-400">
              <BookOpen className="w-5 h-5" />
              Engineering Concepts
            </h2>
                        <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500 mt-1.5 shrink-0" /><span>Extended Kalman Filter (EKF)</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500 mt-1.5 shrink-0" /><span>Fast Fourier Transform (FFT) Analysis</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500 mt-1.5 shrink-0" /><span>RTK-GPS Navigation</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500 mt-1.5 shrink-0" /><span>Compaction Meter Value (CMV) Physics</span></li>
              <li className="flex items-start gap-2 text-neutral-300"><span className="w-1.5 h-1.5 rounded-full bg-attention-500 mt-1.5 shrink-0" /><span>Vibration Harmonics</span></li>
            </ul>
          </motion.div>

          {/* Challenges & Lessons Learned */}
          <motion.div variants={itemVariants} className="md:col-span-3 p-6 md:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-sm relative overflow-hidden">
            <h2 className="text-xl font-bold mb-6 inline-flex items-center gap-2 text-attention-400">
              <Activity className="w-5 h-5" />
              Technical Challenges & Iterations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider border-b border-neutral-850 pb-2">Challenges Encountered</h3>
                                  <div className="flex gap-3"><span className="text-xs font-mono text-attention-500 shrink-0 mt-0.5">[01]</span><p className="text-sm text-neutral-300 leading-relaxed">Designing sensor casings capable of dampening extreme drum vibrations (up to 30G) without losing mechanical dynamics data.</p></div>
                  <div className="flex gap-3"><span className="text-xs font-mono text-attention-500 shrink-0 mt-0.5">[02]</span><p className="text-sm text-neutral-300 leading-relaxed">Mitigating EKF divergence when GPS signal is blocked by heavy tree cover or underpasses on rural highway paving routes.</p></div>
                  <div className="flex gap-3"><span className="text-xs font-mono text-attention-500 shrink-0 mt-0.5">[03]</span><p className="text-sm text-neutral-300 leading-relaxed">Ensuring real-time FFT frequency binning executes on low-power edge computers with latency below 50ms.</p></div>

              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-wider border-b border-neutral-850 pb-2">Engineering Decisions & Lessons</h3>
                                  <div className="flex gap-3"><span className="text-xs font-mono text-attention-500 shrink-0 mt-0.5">[01]</span><p className="text-sm text-neutral-300 leading-relaxed">Mechanical dampening materials must be carefully selected; too much dampening filters out actual compaction-related drum hopping data.</p></div>
                  <div className="flex gap-3"><span className="text-xs font-mono text-attention-500 shrink-0 mt-0.5">[02]</span><p className="text-sm text-neutral-300 leading-relaxed">Thermal windows of asphalt are highly localized; wind speed and sub-base moisture content are major variables in cooling rates.</p></div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
