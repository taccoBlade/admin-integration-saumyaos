"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, Cpu, Database, Activity, LayoutGrid, Terminal, 
  RefreshCw, Binary, Layers, BookOpen, Download, FileSpreadsheet 
} from "lucide-react"
import { DashboardEmbed } from "@/components/dashboard-embed"
import { Contact } from "@/components/contact"

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
    color: "from-cyan-500 to-blue-500",
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
    color: "from-emerald-500 to-teal-500",
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
    color: "from-violet-500 to-indigo-500",
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
    color: "from-amber-500 to-orange-500",
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

const DATASET_LOGS = [
  { date: "12 Mar 2026", id: "C-GP-04", param: "Na2SiO3/NaOH ratio", standard: "IS 10262:2019", val: "2.51 (Molarity: 10M)", status: "OPTIMAL" },
  { date: "14 Mar 2026", id: "C-GP-08", param: "Compressive Strength (28-day)", standard: "IS 516:1959", val: "44.2 MPa", status: "COMPLIANT" },
  { date: "18 Mar 2026", id: "S-CL-02", param: "Oven-Dried Water Content (w)", standard: "ASTM D2216", val: "18.4%", status: "VERIFIED" },
  { date: "22 Mar 2026", id: "P-IC-09", param: "Compaction index vibration harmonic", standard: "IRC:37-2018", val: "0.68 Cv (30Hz fundamental)", status: "STABLE" },
  { date: "05 Apr 2026", id: "S-CL-05", param: "Borehole clay consolidation (Cv)", standard: "ASTM D2435", val: "2.4 * 10^-3 cm²/sec", status: "STABLE" }
]

const LITERATURE_LIST = [
  { title: "Theoretical Soil Mechanics", author: "Terzaghi, K.", year: "1943", focus: "One-dimensional consolidation calculations and pore pressure deflection equations." },
  { title: "Properties of Concrete", author: "Neville, A. M.", year: "2011", focus: "Water-cement ratio parameters, aggregate grading limits, and geopolymerization boundaries." },
  { title: "IRC:37-2018 Flexible Pavement Design", author: "Indian Roads Congress", year: "2018", focus: "Resilient modulus (MR) mapping of subgrade soil compaction characteristics." }
]

const CALCULATIONS_LIST = [
  { title: "Concrete Mix Design compliance calculator (IS 10262)", file: "concrete_compliance_solver.xlsx", size: "4.2 MB", desc: "Automates water estimation, binder content, and aggregate mass fractions." },
  { title: "Capacitive Moisture sensor quadratic fit solver (ASTM D2216)", file: "moisture_calibration_fit.ipynb", size: "1.8 MB", desc: "Computes polynomial coefficients from raw voltage and dry mass laboratory samples." },
  { title: "Intelligent Compaction drum EKF & FFT script", file: "compaction_filter_fft.py", size: "340 KB", desc: "Runs Extended Kalman Filtering on IMU datasets and calculates Compaction index Cv peaks." }
]

export default function TerminalVaultPage() {
  const [activeTab, setActiveTab] = useState<"terminals" | "archive">("terminals")
  const [activeDashboard, setActiveDashboard] = useState<DashboardInfo | null>(null)
  const [serverStatuses, setServerStatuses] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkAllServers = async () => {
    setIsRefreshing(true)
    const statuses: Record<string, boolean> = {}
    
    await Promise.all(
      DASHBOARDS.map(async (db) => {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 1000)
          
          await fetch(`http://localhost:${db.port}/`, {
            mode: "no-cors",
            signal: controller.signal,
          })
          clearTimeout(timeoutId)
          statuses[db.id] = true
        } catch {
          statuses[db.id] = false
        }
      })
    )
    
    setServerStatuses(statuses)
    setIsRefreshing(false)
  }

  useEffect(() => {
    checkAllServers()
    const interval = setInterval(checkAllServers, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#08090b] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-7xl mx-auto px-6 py-12 md:py-24">
        
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-cyan-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to System Terminal
          </Link>
        </div>

        {/* Hero Section */}
        <div className="border-b border-neutral-800 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/30 text-cyan-400 text-xs font-mono">
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
          
          {activeTab === "terminals" && (
            <button
              onClick={checkAllServers}
              disabled={isRefreshing}
              className="self-start md:self-end flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-cyan-400 hover:border-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Scan Backend Ports
            </button>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex gap-4 border-b border-neutral-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("terminals")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "terminals"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Live Dashboard Terminals
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "archive"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <Database className="w-4 h-4" />
            Research & Document Vault
          </button>
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "terminals" ? (
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
                  const isOnline = serverStatuses[db.id] ?? false
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
                          ? "border-cyan-500 bg-neutral-900/40 shadow-lg shadow-cyan-500/5" 
                          : "border-white/[0.06] bg-white/[0.01] hover:border-cyan-500/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Blueprint grid effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-mono text-neutral-500 tracking-wider">PORT {db.port}</span>
                          
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800">
                            <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                            <span className="text-[8px] font-mono font-semibold uppercase text-neutral-400">
                              {isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                        </div>

                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${db.color} p-2 flex items-center justify-center mb-4`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
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

                        <div className="text-[11px] font-mono text-cyan-400 group-hover:text-white font-medium flex items-center gap-1">
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
                        <Terminal className="w-5 h-5 text-cyan-400" />
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
                      slug={activeDashboard.slug}
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
          ) : (
            <motion.div
              key="archive-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-16"
            >
              {/* 1. Empirical Laboratory Datasets */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Empirical Laboratory & Field Datasets
                </h3>
                <div className="overflow-x-auto rounded-3xl border border-neutral-800 bg-neutral-950/20 backdrop-blur-sm">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-900/40 text-neutral-450 uppercase tracking-wider">
                        <th className="p-4">Test Date</th>
                        <th className="p-4">Sample ID</th>
                        <th className="p-4">Parameter Monitored</th>
                        <th className="p-4">Applied Standard</th>
                        <th className="p-4">Recorded Value</th>
                        <th className="p-4">Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800 text-neutral-300">
                      {DATASET_LOGS.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-900/10 transition-colors">
                          <td className="p-4">{log.date}</td>
                          <td className="p-4 font-bold text-white">{log.id}</td>
                          <td className="p-4">{log.param}</td>
                          <td className="p-4 text-neutral-400">{log.standard}</td>
                          <td className="p-4 text-cyan-300 font-bold">{log.val}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Literature Reference Catalog */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  Academic Literature Catalog
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {LITERATURE_LIST.map((lit, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/10 backdrop-blur-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">[REF_{idx + 1}]</span>
                        <h4 className="text-base font-semibold text-white leading-snug">{lit.title}</h4>
                        <p className="text-xs text-neutral-400 font-mono">{lit.author} ({lit.year})</p>
                        <p className="text-xs text-neutral-500 leading-relaxed font-sans">{lit.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Computation Sheets & Downloadable Solvers */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                  Computational Solvers & Scripts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {CALCULATIONS_LIST.map((calc, idx) => (
                    <div key={idx} className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/10 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-white">{calc.title}</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed font-sans">{calc.desc}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-neutral-850 pt-4">
                        <div className="text-[10px] font-mono text-neutral-500">
                          <div className="text-neutral-400 truncate max-w-[120px]">{calc.file}</div>
                          <div>{calc.size}</div>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 hover:text-white transition-all text-[10px] font-mono font-bold uppercase cursor-pointer">
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <Contact />
    </div>
  )
}
