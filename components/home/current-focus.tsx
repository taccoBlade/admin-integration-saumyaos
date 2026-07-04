import { AboutData } from "@/lib/content";

export function CurrentFocus({ data }: { data: AboutData }) {
  const title = data.title || "Current Focus";
  const eyebrow = data.eyebrow || "Now";
  const cards = data.focus_cards_json || [];

  return (
    <section id="about" className="relative w-full max-w-7xl mx-auto px-5 py-24 sm:px-8 lg:px-12">
      <div className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-attention-400 mb-3">{eyebrow}</h2>
        <h3 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">{title}</h3>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        {cards.map((card, idx) => (
          <div key={idx} className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-attention-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <h4 className="text-xl font-medium text-white mb-4">{card.title}</h4>
            <p className="text-slate-400 leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
