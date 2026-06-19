export function CurrentObsessions() {
  const obsessions = [
    "Deep Excavation Engineering",
    "Infrastructure Automation",
    "Portfolio Construction",
    "Visual Storytelling",
    "Human Performance (210kg Deadlift)"
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-5 py-32 sm:px-8 lg:px-12 border-t border-white/5 mt-12">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-12 text-center">
        Current Obsessions
      </h3>
      
      <div className="flex flex-col items-center gap-6">
        {obsessions.map((item, i) => (
          <div 
            key={i} 
            className="text-center text-3xl sm:text-5xl font-bold tracking-tight text-white/40 hover:text-white transition-colors duration-500 cursor-default"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
