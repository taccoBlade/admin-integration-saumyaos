import { EditorialLayout } from "@/components/personal/EditorialLayout"
import { ParticleBackground } from "@/components/personal/ParticleBackground"
import { editorialSpreads } from "@/data/photos"

export default function PersonalPage() {
  return (
    <div className="bg-[#0A0A0A] text-[#F0F0F0] min-h-screen overflow-x-hidden selection:bg-[#1A1A1A] selection:text-[#F0F0F0] relative">
      
      {/* Particle Background: Film Dust Motes */}
      <ParticleBackground />

      {/* Texture: Fine film grain */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Texture: Soft Vignette */}
      <div className="fixed inset-0 z-50 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
      
      <main className="relative z-10 flex flex-col pt-12 pb-32">
        {editorialSpreads.map((spread) => (
          <EditorialLayout key={spread.id} spread={spread} />
        ))}
      </main>

    </div>
  )
}
