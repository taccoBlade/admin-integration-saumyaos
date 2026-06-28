"use client";

import { motion } from "framer-motion";

interface MetricsGridProps {
  metrics: {
    value: string;
    label: string;
  }[];
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/5 my-12 bg-white/[0.01]">
      {metrics.map((metric, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="flex flex-col items-center justify-center p-6 text-center space-y-2 border-r border-white/5 last:border-r-0"
        >
          <span className="text-3xl md:text-5xl font-bold font-mono text-attention-400 tracking-tighter">
            {metric.value}
          </span>
          <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-slate-400">
            {metric.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
