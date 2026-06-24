"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { WifiOff, Terminal, RefreshCw, ExternalLink, Play, CheckCircle } from "lucide-react"

interface DashboardEmbedProps {
  port: number
  title: string
  slug: string
  mockupDescription: string
  keyFeatures: string[]
}

export function DashboardEmbed({
  port,
  title,
  mockupDescription,
  keyFeatures,
}: DashboardEmbedProps) {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const [isRetrying, setIsRetrying] = useState(false)
  const [forceLoad, setForceLoad] = useState(false)

  const statusRef = useRef(status)
  useEffect(() => {
    statusRef.current = status
  }, [status])

  const checkServer = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setStatus("checking")
    }
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1500)

      // no-cors mode will bypass CORS restrictions. If the server is offline, 
      // fetch throws a Network Error (Failed to fetch). If it is online, it succeeds 
      // (even if response is opaque).
      await fetch(`http://localhost:${port}/`, {
        mode: "no-cors",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      setStatus("online")
    } catch {
      setStatus("offline")
    }
  }, [port])

  useEffect(() => {
    // Initial check on mount
    checkServer(true)
    
    // Set up polling interval to automatically connect when the server is started
    const interval = setInterval(() => {
      if (statusRef.current === "offline") {
        checkServer(false) // Run silently in background without setting state to "checking"
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [port, checkServer])

  const handleRetry = async () => {
    setIsRetrying(true)
    await checkServer()
    setTimeout(() => setIsRetrying(false), 500)
  }

  if (status === "online" || forceLoad) {
    return (
      <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-950 overflow-hidden relative group">
        <div className="bg-neutral-900/90 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Live Connection Established (Port {port})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => checkServer(true)}
              className="text-neutral-400 hover:text-white transition-colors"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === "checking" ? "animate-spin" : ""}`} />
            </button>
            <a
              href={`http://localhost:${port}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1 font-mono"
            >
              Popout <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        
        <div className="relative aspect-[16/10] w-full bg-black">
          <iframe
            src={`http://localhost:${port}/`}
            className="w-full h-full border-none"
            title={title}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-3xl border border-neutral-800/80 bg-neutral-900/20 backdrop-blur-md p-6 md:p-8 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[80px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Mockup Preview & Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-900/30 text-red-400">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">Dashboard Local Server Offline</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {title}
          </h3>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
            {mockupDescription}
          </p>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Dashboard Features Preview:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {keyFeatures.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Launcher Interface */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-neutral-800 bg-black/40 backdrop-blur-sm space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Quick Launch Guide
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Port {port}</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-neutral-400 leading-relaxed">
              Launch the Flask backend server from the workspace root directory:
            </p>

            <div className="relative">
              <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-850 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap select-all">
                {`# Run the launcher script in PowerShell:
.\\start-dashboards.ps1`}
              </pre>
            </div>
            
            <p className="text-[10px] text-neutral-500">
              Or manually run: <code className="text-neutral-400 font-mono text-[10px]">python app.py</code> in the project&apos;s folder.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={status === "checking" || isRetrying}
              className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === "checking" || isRetrying ? "animate-spin" : ""}`} />
              <span>{status === "checking" ? "Checking..." : "Retry Connection"}</span>
            </button>

            <button
              onClick={() => setForceLoad(true)}
              className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold border border-cyan-800/30 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Force Live Render</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
