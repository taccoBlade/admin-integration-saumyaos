export default function InformationalLayout({ page, relatedProjects }: { page: any, relatedProjects: any[] }) {
  return (
    <div className="informational-layout max-w-4xl mx-auto px-4 py-24">
      {/* Educational, reading-focused layout */}
      <header className="mb-16 pb-8 border-b border-purple-500/20">
        <h1 className="text-4xl font-serif tracking-wide text-purple-50 mb-4">
          {page.title}
        </h1>
        <div className="flex gap-2">
          {page.related_technologies?.map((tech: string) => (
            <span key={tech} className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
              {tech}
            </span>
          ))}
        </div>
      </header>
      
      <article className="space-y-16">
        {page.content_blocks?.map((block: any, idx: number) => (
          <section key={idx} className="block-section">
            <h2 className="text-xl font-light text-white mb-6 border-l-2 border-emerald-500 pl-4">
              {block.type}
            </h2>
            <div className="prose prose-invert prose-purple max-w-none text-purple-100/80 leading-relaxed">
              {JSON.stringify(block.data)}
            </div>
          </section>
        ))}
      </article>

      <aside className="mt-24 bg-[#0e0721] rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-xl font-medium text-white mb-6">Further Reading & Case Studies</h3>
        <ul className="space-y-4">
          {relatedProjects.map(proj => (
            <li key={proj.id}>
              <a href={`/projects/${proj.slug}`} className="group flex items-center justify-between text-purple-200 hover:text-emerald-400 transition-colors">
                <span>{proj.title}</span>
                <span className="text-xs font-mono opacity-50 group-hover:opacity-100">Match: {proj.score}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
