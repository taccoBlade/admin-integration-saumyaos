"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, Cpu, Database, Activity, Terminal, 
  Binary, Layers
} from "lucide-react"
import { DashboardEmbed } from "@/components/projects/dashboard-embed"
import { Contact } from "@/components/layout/contact"

interface DashboardInfo {
  id: string
  title: string
  slug: string
  port: number
  domain: string
  icon: typeof Cpu
  color: string
  description: string
  keyFeatures: string[]
  techStack: string[]
  mockupDescription: string
}

const DASHBOARDS: DashboardInfo[] = [
  {
    id: "soil-strain",
    title: "Automated Soil Strain & Settlement",
    slug: "automated-soil-strain-and-settlement-analysis-system-with-iot-integration",
    port: 8085,
    domain: "Geotechnical Analytics",
    icon: Activity,
    color: "from-attention-500 to-attention-500",
    description: "Calculates live soil consolidation, strain values, and settlement profiles using MQTT IoT telemetry.",
    keyFeatures: [
      "Consolidation Profile Calculations",
      "Real-time Strain Over-limit Alarms",
      "MQTT Hardware Telemetry Ingestion",
      "Historical CSV Session Archival",
    ],
    techStack: ["Python", "Flask", "MQTT", "Matplotlib", "CSV DB"],
    mockupDescription: "This dashboard displays real-time displacement profiles, ultrasonic sensor measurements, and microstrain gauges (uE) logs to monitor soil consolidation rates under load test strip sequences."
  },
  {
    id: "promix",
    title: "ProMix: Concrete Mix Compliance",
    slug: "promix-concrete-mix-design-compliance-dashboard",
    port: 5001,
    domain: "Materials & Quality Control",
    icon: Layers,
    color: "from-attention-500 to-attention-500",
    description: "IS 10262:2019 mix design engine validating cementitious substitutions and IS 456 durability limits.",
    keyFeatures: [
      "IS 10262:2019 Mix Proportioning",
      "IS 456 Durability Compliance Auditor",
      "Geopolymer Binder Calculator",
      "CO2 & Material Economics Analyzer",
    ],
    techStack: ["Python", "Flask", "IS 10262", "SCM optimization", "Pandas"],
    mockupDescription: "The ProMix platform designs cementitious and geopolymer mixes. It evaluates supplementary cementitious materials (GGBS, fly ash) to optimize cost and carbon footprints against regulatory compliance constraints."
  },
  {
    id: "compaction",
    title: "Intelligent Compaction Control",
    slug: "automation-intelligent-machine-guided-construction",
    port: 5002,
    domain: "Construction Automation",
    icon: Cpu,
    color: "from-attention-500 to-attention-500",
    description: "Fuses simulated RTK-GPS & IMU sensor data using EKF to calculate and map soil stiffness (CMV) in real-time.",
    keyFeatures: [
      "Extended Kalman Filter (EKF) Tracker",
      "Disturbance Observer (DOB) Noise Filter",
      "Fast Fourier Transform CMV Processor",
      "Live Roller Path Mapping via WebSockets",
    ],
    techStack: ["Flask-SocketIO", "NumPy", "FFT Signal processing", "Canvas HTML5"],
    mockupDescription: "This real-time machine-guided terminal connects to road roller instrumentation, calculating CMV values using accelerometer FFT to provide automated pass-by stiffness mappings on high-resolution construction grids."
  },
  {
    id: "crop-recommend",
    title: "Smart Soil & Crop Advisor",
    slug: "soil-analysis-project-with-iot-integration",
    port: 5003,
    domain: "Agricultural Analytics & AI",
    icon: Binary,
    color: "from-attention-500 to-attention-500",
    description: "ML recommendation engine classifying soil parameters and invoking LLM-agent crop diagnostics.",
    keyFeatures: [
      "Random Forest Classifier Prediction",
      "Capacitive NPK Soil Input Mapper",
      "Gemini AI Agricultural Advisory",
      "Multilingual Voice Assistant Support",
    ],
    techStack: ["Python", "Scikit-Learn", "Gemini Pro API", "Google Translate"],
    mockupDescription: "This machine learning dashboard processes environmental NPK parameters alongside temperature, pH, and rainfall metrics to recommend ideal crops and generate tailored farm advisory reports via Gemini."
  }
]

function TerminalVaultContent() {
  const searchParams = useSearchParams()
  const initialProject = searchParams.get("project")

  const [activeDashboard, setActiveDashboard] = useState<DashboardInfo | null>(null)

  useEffect(() => {
    if (initialProject) {
      const db = DASHBOARDS.find(d => d.id === initialProject || d.slug === initialProject)
      if (db) {
        setActiveDashboard(db)
        setTimeout(() => {
          document.getElementById("terminal-view")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
      }
    }
  }, [initialProject])

  return (
    <div className="min-h-screen bg-[#08090b] text-neutral-100 font-sans selection:bg-attention-500/30 selection:text-attention-200">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-attention-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-24">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-attention-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to System Terminal
          </Link>
        </div>

        {/* Hero Section */}
        <div className="border-b border-neutral-800 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-attention-950/50 border border-attention-800/30 text-attention-400 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5" />
              INTEGRATED TERMINAL VAULT
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
              Terminal Vault
            </h1>
            <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
              Consolidated workspace containing live computational sandbox consoles and static geotechnical, structural, and material research records.
            </p>
          </div>          
        </div>

        {/* Terminals Content */}
        <motion.div
          key="terminals-tab"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {DASHBOARDS.map((db) => {
                  const Icon = db.icon
                  const isActive = activeDashboard?.id === db.id

                  return (
                    <div
                      key={db.id}
                      onClick={() => {
                        setActiveDashboard(db)
                        // Smooth scroll to the terminal embed
                        setTimeout(() => {
                          document.getElementById("terminal-view")?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }, 100)
                      }}
                      className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[300px] ${
                        isActive 
                          ? "border-attention-500 bg-neutral-900/40 shadow-lg shadow-attention-500/5" 
                          : "border-white/[0.06] bg-white/[0.01] hover:border-attention-500/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Blueprint grid effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(rgba(212, 175, 55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212, 175, 55,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-mono text-neutral-500 tracking-wider">PORT {db.port}</span>
                          
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-attention-500/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-attention-500 animate-pulse" />
                            <span className="text-[8px] font-mono font-semibold uppercase text-attention-400">
                              Active
                            </span>
                          </div>
                        </div>

                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${db.color} p-2 flex items-center justify-center mb-4`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-attention-400 transition-colors mb-2">
                          {db.title}
                        </h3>
                        
                        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                          {db.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {db.techStack.slice(0, 3).map((tech) => (
                            <span key={tech} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-neutral-850 text-neutral-400">
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] font-mono text-attention-400 group-hover:text-white font-medium flex items-center gap-1">
                          Launch Console &rarr;
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Live Terminal Embedding Section */}
              <div id="terminal-view" className="scroll-mt-24">
                {activeDashboard ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-attention-400" />
                        {activeDashboard.title} Console
                      </h2>
                      <button
                        onClick={() => setActiveDashboard(null)}
                        className="text-xs font-mono text-neutral-500 hover:text-neutral-300"
                      >
                        Clear Terminal
                      </button>
                    </div>

                    <DashboardEmbed
                      port={activeDashboard.port}
                      title={activeDashboard.title}
                      keyFeatures={activeDashboard.keyFeatures}
                      mockupDescription={activeDashboard.mockupDescription}
                    />
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/5 py-24 text-center px-6">
                    <Database className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-neutral-400">Terminal Standby</h3>
                    <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed">
                      Select any dashboard from the bento grid above to start the server checking interface and interact with the live dashboard panels.
                    </p>
                  </div>
                )}
              </div>
        </motion.div>

      </main>
      <Contact />
    </div>
  )
}

export default function TerminalVaultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090b]" />}>
      <TerminalVaultContent />
    </Suspense>
  )
}
