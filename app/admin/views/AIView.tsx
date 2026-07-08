"use client";

import React, { useState } from "react";
import { Sparkles, BarChart, FileText } from "lucide-react";
import AIAuditPanel from "../components/AIAuditPanel";
import AIAssistantPanel from "../components/AIAssistantPanel";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  overview: string;
  status: string;
}

interface AIViewProps {
  projects?: ProjectItem[];
}

export default function AIView({ projects = [] }: AIViewProps) {
  const [selectedId, setSelectedId] = useState("");
  const selectedProject = projects.find((p) => p.id === selectedId);

  const handleApplyField = (field: string, value: string) => {
    alert(`AI Suggestion applied to ${field}:\n\n"${value}"\n\n(Remember to save changes in the Projects tab to make this permanent)`);
  };

  return (
    <div className="space-y-6 font-mono text-xs select-none">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">AI Workspace</h1>
          <p className="text-[10px] text-[var(--muted)]">CENTRAL AUDIT & GENERATION HUB</p>
        </div>

        <div>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full sm:w-64 py-2.5 px-3 bg-[#130a2a] border border-purple-500/15 rounded-xl text-white outline-none focus:ring-1 focus:ring-purple-500/50"
          >
            <option value="">-- SELECT A PROJECT --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedProject ? (
        <div className="border border-purple-500/15 bg-[#130a2a]/20 p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Assistant Control Center</h3>
            <p className="text-[10px] text-[var(--muted)] max-w-xs leading-relaxed">
              Select a project from the dropdown to run compliance audits, check SEO rankings, evaluate media metadata, or generate content using Gemini.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Project Details Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-purple-500/15 bg-[#130a2a]/50 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold border-b border-purple-500/15 pb-2">
                <FileText className="w-4 h-4 text-[var(--accent-blue)]" />
                <span className="uppercase text-[10px]">Project Context</span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] block mb-1">TITLE</span>
                <p className="text-white font-bold">{selectedProject.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-[var(--muted)] block mb-1">YEAR</span>
                  <p className="text-slate-300">{selectedProject.year}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--muted)] block mb-1">STATUS</span>
                  <span className="text-emerald-400 uppercase font-bold">{selectedProject.status}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] block mb-1">SHORT DESCRIPTION</span>
                <p className="text-slate-300 leading-relaxed line-clamp-4">{selectedProject.description}</p>
              </div>
            </div>

            <div className="border border-purple-500/15 bg-[#130a2a]/30 p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-white font-bold pb-2">
                <BarChart className="w-4 h-4 text-purple-400" />
                <span className="uppercase text-[10px]">Audit Checklist</span>
              </div>
              <p className="text-purple-300 text-[10px] leading-relaxed">
                The AI Reviewer will evaluate your project against completeness, technical methodology rigor, validation techniques, alt text coverage, and SEO optimizations.
              </p>
            </div>
          </div>

          {/* AI Audit Panel */}
          <div className="lg:col-span-4 h-[600px] flex">
            <AIAuditPanel projectFields={selectedProject as unknown as Record<string, unknown>} />
          </div>

          {/* AI Assistant Writing Panel */}
          <div className="lg:col-span-4 h-[600px] flex">
            <AIAssistantPanel
              context={{
                title: selectedProject.title,
                description: selectedProject.description,
                overview: selectedProject.overview,
              }}
              onApplyField={handleApplyField}
            />
          </div>
        </div>
      )}
    </div>
  );
}
