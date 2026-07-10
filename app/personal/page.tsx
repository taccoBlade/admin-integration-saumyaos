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
    <div className="bg-[#0A0A0A] text-[#F0F0F0] min-h-screen overflow-x-hidden selection:bg-[#1A1A1A] selection:text-[#F0F0F0] relative">
      
      {/* Particle Background: Film Dust Motes */}
      <ParticleBackground />

      {/* Texture: Fine film grain */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Texture: Soft Vignette */}
      <div className="fixed inset-0 z-50 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      
      <main className="relative z-10 flex flex-col pt-24 pb-32 max-w-7xl mx-auto px-4 md:px-8">
        <header className="mb-20 max-w-2xl hidden">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white/90 font-serif">
            Analog Explorations
          </h1>
          <p className="text-sm md:text-base text-white/50 leading-relaxed font-mono">
            A collection of visual stories, raw captures, and moments documented outside the terminal. Curated into editorial photo spreads.
          </p>
        </header>
        
        <div className="flex flex-col gap-32">
          {spreads.map((spread) => (
            <EditorialLayout key={spread.id} spread={spread} />
          ))}
        </div>
      </main>

    </div>
  )
}
