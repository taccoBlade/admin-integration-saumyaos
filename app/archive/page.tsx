import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Database, Download, FileSpreadsheet } from "lucide-react";
import { Contact } from "@/components/layout/contact";

export const metadata: Metadata = {
  title: "Engineering Archive & Datasets",
  description: "Explore geopolymer concrete strength logs, geotechnical telemetry data, and academic literature index compiled by Saumya Parekh.",
};

export default function ArchivePage() {
  const datasetLogs = [
    { date: "12 Mar 2026", id: "C-GP-04", param: "Na2SiO3/NaOH ratio", standard: "IS 10262:2019", val: "2.51 (Molarity: 10M)", status: "OPTIMAL" },
    { date: "14 Mar 2026", id: "C-GP-08", param: "Compressive Strength (28-day)", standard: "IS 516:1959", val: "44.2 MPa", status: "COMPLIANT" },
    { date: "18 Mar 2026", id: "S-CL-02", param: "Oven-Dried Water Content (w)", standard: "ASTM D2216", val: "18.4%", status: "VERIFIED" },
    { date: "22 Mar 2026", id: "P-IC-09", param: "Compaction index vibration harmonic", standard: "IRC:37-2018", val: "0.68 Cv (30Hz fundamental)", status: "STABLE" },
    { date: "05 Apr 2026", id: "S-CL-05", param: "Borehole clay consolidation (Cv)", standard: "ASTM D2435", val: "2.4 * 10^-3 cm²/sec", status: "STABLE" }
  ];

  const literatureList = [
    { title: "Theoretical Soil Mechanics", author: "Terzaghi, K.", year: "1943", focus: "One-dimensional consolidation calculations and pore pressure deflection equations." },
    { title: "Properties of Concrete", author: "Neville, A. M.", year: "2011", focus: "Water-cement ratio parameters, aggregate grading limits, and geopolymerization boundaries." },
    { title: "IRC:37-2018 Flexible Pavement Design", author: "Indian Roads Congress", year: "2018", focus: "Resilient modulus (MR) mapping of subgrade soil compaction characteristics." }
  ];

  const calculationsList = [
    { title: "Concrete Mix Design compliance calculator (IS 10262)", file: "concrete_compliance_solver.xlsx", size: "4.2 MB", desc: "Automates water estimation, binder content, and aggregate mass fractions." },
    { title: "Capacitive Moisture sensor quadratic fit solver (ASTM D2216)", file: "moisture_calibration_fit.ipynb", size: "1.8 MB", desc: "Computes polynomial coefficients from raw voltage and dry mass laboratory samples." },
    { title: "Intelligent Compaction drum EKF & FFT script", file: "compaction_filter_fft.py", size: "340 KB", desc: "Runs Extended Kalman Filtering on IMU datasets and calculates Compaction index Cv peaks." }
  ];

  return (
    <main className="min-h-screen bg-[#08090b] text-slate-200 selection:bg-attention-500/30 overflow-x-hidden relative">
      {/* Ambient background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-attention-500/[0.02] to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 sm:px-8 lg:px-12 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group text-sm font-mono text-slate-400 hover:text-attention-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Professional Profile</span>
        </Link>
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Research & Data Archive
        </span>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-16 sm:px-8 lg:px-12">
        <div className="max-w-3xl space-y-6">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-attention-400 block">
            Technical Documents Repository
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Research & Material Archive
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed font-sans">
            A centralized hub containing physical laboratory datasets, theoretical literature references, and calculation solvers used to validate structural and geotechnical models.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-32 sm:px-8 lg:px-12 space-y-20">
        
        {/* 1. Empirical Laboratory Datasets */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-attention-400" />
            1. Empirical Laboratory & Field Datasets
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-md">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Test Date</th>
                  <th className="p-4">Sample ID</th>
                  <th className="p-4">Parameter Monitored</th>
                  <th className="p-4">Applied Standard</th>
                  <th className="p-4">Recorded Value</th>
                  <th className="p-4">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-350">
                {datasetLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">{log.date}</td>
                    <td className="p-4 font-bold text-white">{log.id}</td>
                    <td className="p-4">{log.param}</td>
                    <td className="p-4 text-slate-400">{log.standard}</td>
                    <td className="p-4 text-attention-300 font-bold">{log.val}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-attention-500/10 text-attention-400 border border-attention-500/20 text-[9px] font-bold">
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
            <BookOpen className="w-5 h-5 text-attention-400" />
            2. Academic Literature Catalog
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {literatureList.map((lit, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-attention-400 uppercase tracking-widest">[REF_{idx + 1}]</span>
                  <h4 className="text-base font-semibold text-white leading-snug">{lit.title}</h4>
                  <p className="text-xs text-slate-400 font-mono">{lit.author} ({lit.year})</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{lit.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Computation Sheets & Downloadable Solvers */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-attention-400" />
            3. Computational Solvers & Scripts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calculationsList.map((calc, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-attention-500/20 transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">{calc.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{calc.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-[10px] font-mono text-slate-500">
                    <div className="text-slate-400 truncate max-w-[120px]">{calc.file}</div>
                    <div>{calc.size}</div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-attention-500/30 hover:bg-attention-500/10 text-attention-400 hover:text-white transition-all text-[10px] font-mono font-bold uppercase cursor-pointer">
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Contact Footer */}
      <Contact />
    </main>
  );
}
