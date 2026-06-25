"use client"

import { useState, useRef } from "react"
import { RefreshCw, ExternalLink, Cpu } from "lucide-react"

interface DashboardEmbedProps {
  port: number
  title: string
  mockupDescription: string
  keyFeatures: string[]
}

const PORT_MAP: Record<number, string> = {
  8085: "/dashboards/soil-analysis/index.html",
  5001: "/dashboards/concrete-mix/index.html",
  5002: "/dashboards/nhai-compaction/index.html",
  5003: "/dashboards/crop-recommendation/index.html"
};

export function DashboardEmbed({
  port,
  title,
  mockupDescription,
  keyFeatures,
}: DashboardEmbedProps) {
  const [iframeKey, setIframeKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const dashboardPath = PORT_MAP[port] || "/dashboards/soil-analysis/index.html";

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="w-full rounded-3xl border border-neutral-800 bg-[#0a0c10] overflow-hidden relative group shadow-2xl">
      {/* Sleek Header Bar */}
      <div className="bg-neutral-950/80 border-b border-neutral-850 px-6 py-4 flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Client-Side Computational Engine Active
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="text-neutral-400 hover:text-white transition-colors p-1 hover:bg-neutral-850 rounded-lg"
            title="Reload Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={dashboardPath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1 p-1 hover:bg-neutral-850 rounded-lg"
            title="Open in New Tab"
          >
            Popout <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
      
      {/* Main Iframe Display */}
      <div className="relative aspect-[16/10] w-full bg-[#050608]">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={dashboardPath}
          className="w-full h-full border-none"
          title={title}
          allow="clipboard-write"
        />
      </div>

      {/* Description & Specs Footer */}
      <div className="p-6 md:p-8 bg-neutral-950/40 border-t border-neutral-900">
        <div className="space-y-4">
          <p className="text-sm text-neutral-400 leading-relaxed font-sans">
            {mockupDescription}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {keyFeatures.map((feat, i) => (
              <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-850 text-neutral-300">
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
