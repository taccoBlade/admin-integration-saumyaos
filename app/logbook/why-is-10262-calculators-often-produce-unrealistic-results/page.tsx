"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, BookOpen, Layers, Terminal } from 'lucide-react'

export default function LogbookPage() {
  return (
    <div className="min-h-screen bg-[#08090b] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <main className="relative max-w-3xl mx-auto px-6 py-12 md:py-24">
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

        {/* Article Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-neutral-800 pb-6 mb-8"
        >
          <div className="flex items-center gap-3 text-xs font-mono text-cyan-500 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>June 2026</span>
            <span>•</span>
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research Log</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Why IS 10262 calculators often produce unrealistic results
          </h1>

          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Project context:</span>
            <Link href="/projects/promix-concrete-mix-design-compliance-dashboard" className="text-cyan-400 hover:underline">
              ProMix: Concrete Mix Design & Compliance Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Article Body */}
        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="prose prose-invert max-w-none text-neutral-300 leading-relaxed space-y-6"
        >
          <p className="text-lg text-neutral-200 italic font-light border-l-2 border-cyan-500 pl-4">
            This logbook records the detailed technical investigation, system decisions, and design rationale behind the ProMix: Concrete Mix Design & Compliance Dashboard implementation.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-500" />
            1. Problem Context & Physics
          </h2>
          <p>
            When implementing computational solvers in this domain (specifically under the Concrete Technology framework), we hit significant non-linearities and boundary constraints. Traditional calculators simplify these, leading to unrealistic output values.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500" />
            2. System Decisions & Verification
          </h2>
          <p>
            We implemented a multi-stage feedback algorithm using the following techniques:
          </p>
          <ul className="list-disc pl-6 space-y-2">
                        <li className="text-neutral-300"><strong>IS 456 Compliance Auditing</strong>: Utilized to dynamically adjust parameters.</li>
            <li className="text-neutral-300"><strong>Particle Packing Optimization</strong>: Utilized to dynamically adjust parameters.</li>
            <li className="text-neutral-300"><strong>IS 10262 Mix Design Standards</strong>: Utilized to dynamically adjust parameters.</li>

          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Mathematical Formulation</h2>
          <p>
            The optimization function is formulated as follows:
          </p>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center font-mono my-4 text-cyan-300 overflow-x-auto">
            {"\\[ f(x) = \\sum_{i=1}^n \\omega_i \\cdot (x_i - \\hat{x}_i)^2 + \\lambda \\cdot \\mathcal{R}(x) \\]"}
          </div>
          <p className="text-sm text-neutral-400">
            {"Where \\(\\omega_i\\) represents individual component weights, \\(\\hat{x}_i\\) are standard targets, and \\(\\mathcal{R}(x)\\) is the structural compliance penalty."}
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Summary of Lessons Learned</h2>
          <div className="grid grid-cols-1 gap-4 p-4 rounded-2xl bg-neutral-950 border border-cyan-950/40">
                          <div className="flex gap-3"><span className="text-cyan-500 shrink-0 font-mono">[1]</span><p className="text-sm leading-relaxed">Iterative unit testing is critical when dealing with physical sensors.</p></div>

          </div>
        </motion.article>
      </main>
    </div>
  )
}
