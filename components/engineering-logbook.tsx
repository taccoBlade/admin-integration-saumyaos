export function EngineeringLogbook() {
  return (
    <section id="engineering-logbook" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12">
      <div className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">Documentation</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">Engineering Logbook</h3>
        <p className="mt-4 text-slate-400 max-w-2xl">
          Observations on deep excavations, ground improvement, concrete technology, infrastructure innovation, markets & risk, and content systems.
        </p>
      </div>

      <div className="p-12 border border-white/10 rounded-2xl bg-charcoal-900/50 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 border border-dashed border-slate-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-slate-300 mb-2">Logbook Engine Initialized</h4>
        <p className="text-sm text-slate-500 max-w-md">
          The markdown parser is ready. Waiting for markdown files to be imported into <code className="font-mono text-attention-400">/content/logbook/</code>.
        </p>
      </div>
    </section>
  );
}
