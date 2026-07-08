export default function CommercialLayout({ page, relatedProjects }: { page: any, relatedProjects: any[] }) {
  return (
    <div className="commercial-layout max-w-7xl mx-auto px-4 py-24">
      {/* High-contrast commercial intent UI */}
      <h1 className="text-5xl font-bold tracking-tight text-white mb-6">
        {page.title}
      </h1>
      
      <div className="space-y-12 mt-16">
        {page.content_blocks?.map((block: any, idx: number) => (
          <div key={idx} className="block-section">
            <h2 className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-4">
              {block.type}
            </h2>
            <div className="prose prose-invert prose-purple max-w-none">
              {JSON.stringify(block.data)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 border-t border-purple-500/20 pt-12">
        <h3 className="text-2xl font-light text-white mb-8">Related Case Studies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedProjects.map(proj => (
            <a key={proj.id} href={`/projects/${proj.slug}`} className="block group p-6 rounded-2xl bg-white/[0.02] border border-purple-500/20 hover:border-cyan-500/50 transition-colors">
              <h4 className="text-lg font-medium text-white group-hover:text-cyan-300">{proj.title}</h4>
              <p className="text-sm text-purple-300/70 mt-2">Similarity Score: {proj.score}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
