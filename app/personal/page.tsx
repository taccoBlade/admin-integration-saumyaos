import { Metadata } from "next"
import { EditorialLayout } from "@/components/personal/EditorialLayout"
import { ParticleBackground } from "@/components/personal/ParticleBackground"
import { getPhotoSpreads } from "@/lib/content"

export const metadata: Metadata = {
  title: "Personal / Analog Explorations | Saumya Parekh",
  description: "A collection of visual stories, analog memories, and personal editorial spreads exploring life beyond the terminal.",
}

export default async function PersonalPage() {
  const spreads = await getPhotoSpreads();

  return (
    <div className="bg-[#050505] text-[#F5F5F7] min-h-screen overflow-x-hidden selection:bg-white/[0.08] selection:text-[#d4af37] relative">
      
      {/* Particle Background: Film Dust Motes */}
      <ParticleBackground />

      {/* Texture: Fine film grain (100% offline SVG fractal noise) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.09] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Texture: Deep Cinematic Vignette */}
      <div className="fixed inset-0 z-50 pointer-events-none shadow-[inset_0_0_160px_rgba(0,0,0,0.92)]" />
      
      <main className="relative z-10 flex flex-col pt-12 pb-32 max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col gap-24">
          {spreads.map((spread) => (
            <EditorialLayout key={spread.id} spread={spread} />
          ))}
        </div>
      </main>

    </div>
  )
}
