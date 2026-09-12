'use client';

import { SpreadData } from "@/data/photos";
import { PhotoRenderer } from "./PhotoRenderer";
import { ProtocolReceipt } from "./ProtocolReceipt";
import { AviationWidget } from "./AviationWidget";
import { CinemaAudio } from "./CinemaAudio";

// Bolder Vector outlines for Animals section
const PawPrintSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-[#d4af37]/40 group-hover:text-[#d4af37]/90 transition-all duration-700 pointer-events-none select-none">
    <path d="M12 14c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="7.5" cy="8.5" r="1.8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="10.5" cy="5.5" r="1.8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="13.5" cy="5.5" r="1.8" fill="currentColor" fillOpacity="0.2" />
    <circle cx="16.5" cy="8.5" r="1.8" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const CatSilhouetteSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-[#d4af37]/40 group-hover:text-[#d4af37]/95 transition-all duration-700 pointer-events-none select-none">
    <path d="M12 5c-1.66 0-3 1.34-3 3v2H7V8c0-1.66-1.34-3-3-3s-3 1.34-3 3v4c0 3.87 3.13 7 7 7h8c3.87 0 7-3.13 7-7V8c0-1.66-1.34-3-3-3s-3 1.34-3 3v2h-2V8c0-1.66-1.34-3-3-3z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);



// High-visibility 7 Continents Sketch Map for Me section (Scribble Book background)
const ContinentsScribble = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none opacity-50">
    <svg viewBox="0 0 1000 600" className="w-full h-full text-white/15" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* North America */}
      <path d="M80 120 C120 90, 200 130, 190 210 C160 250, 110 230, 80 200 Z" strokeDasharray="4 4" />
      <text x="100" y="170" className="text-[11px] font-mono font-bold fill-white/25 tracking-widest uppercase">N. AMERICA</text>
      
      {/* South America */}
      <path d="M170 280 C210 310, 250 390, 220 460 C180 490, 140 420, 150 340 Z" strokeDasharray="3 3" />
      <text x="155" y="380" className="text-[11px] font-mono font-bold fill-white/25 tracking-widest uppercase">S. AMERICA</text>
      
      {/* Europe */}
      <path d="M360 110 C400 90, 480 120, 460 190 C410 220, 370 180, 360 140 Z" />
      <text x="385" y="150" className="text-[11px] font-mono font-bold fill-white/25 tracking-widest uppercase">EUROPE</text>
      
      {/* Africa */}
      <path d="M380 240 C460 210, 540 280, 500 390 C440 460, 380 390, 370 290 Z" />
      <text x="420" y="320" className="text-[11px] font-mono font-bold fill-white/25 tracking-widest uppercase">AFRICA</text>
      
      {/* Asia */}
      <path d="M520 90 C660 50, 800 120, 770 260 C690 330, 580 260, 520 180 Z" />
      <text x="610" y="180" className="text-[11px] font-mono font-bold fill-white/25 tracking-widest uppercase">ASIA</text>
      
      {/* Australia */}
      <path d="M720 370 C800 350, 840 420, 790 460 C730 480, 690 420, 720 370 Z" strokeDasharray="5 5" />
      <text x="735" y="420" className="text-[11px] font-mono font-bold fill-white/25 tracking-widest uppercase">AUSTRALIA</text>
      
      {/* Antarctica */}
      <path d="M280 540 C480 520, 750 520, 820 560 C620 560, 340 560, 280 540 Z" strokeDasharray="6 6" />
      <text x="500" y="555" className="text-[10px] font-mono font-bold fill-white/15 tracking-widest uppercase">ANTARCTICA // OUTBOUND</text>
      
      {/* Bold sketchy flight paths connecting continents & arrows */}
      <path d="M190 210 Q320 150, 385 150" strokeDasharray="6 6" className="text-white/20" strokeWidth="2" />
      <path d="M460 190 Q510 280, 500 320" strokeDasharray="6 6" className="text-white/20" strokeWidth="2" />
      <path d="M500 350 Q660 390, 720 390" strokeDasharray="6 6" className="text-white/20" strokeWidth="2" />
      <path d="M650 200 Q280 340, 210 340" strokeDasharray="4 4" className="text-[#d4af37]/35" strokeWidth="2.5" />
      
      {/* Bolder handwritten scribble annotation indicators */}
      <circle cx="610" cy="180" r="22" strokeDasharray="3 3" className="text-[#d4af37]/30" strokeWidth="1.5" />
      <path d="M590 180 L540 230" className="text-[#d4af37]/30" strokeWidth="2" />
      <text x="450" y="250" className="text-[9px] font-mono fill-[#d4af37]/75 font-bold tracking-widest uppercase">HOME REGION // ME.JPG DETECTOR</text>
    </svg>
  </div>
);

export function EditorialLayout({ spread }: { spread: SpreadData }) {
  const { title, template, photos, diaryEntry } = spread;

  // Render title and diary entry as a quiet narrative transition
  const renderHeader = () => {
    if (!title && !diaryEntry) return null;
    return (
      <div className="w-full max-w-5xl mx-auto px-6 py-20 md:py-28 flex flex-col gap-6 select-none z-10 relative">
        {title && (
          <h2 className="text-[#8C8C8C] text-xs font-mono tracking-[0.3em] uppercase opacity-70">
            {title}
          </h2>
        )}
        {diaryEntry && (
          <p className="font-serif italic text-base md:text-lg text-[#BFBFBF] leading-relaxed max-w-2xl opacity-90 border-l border-[#2A2A2A] pl-6 py-1">
            {diaryEntry}
          </p>
        )}
      </div>
    );
  };

  const hero = photos[0];
  const others = photos.slice(1);

  let layoutContent = null;

  switch (template) {
    case "Hero Intro":
      layoutContent = (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full max-w-5xl mx-auto px-6 py-12 md:py-20 z-10 relative">
          {/* Main Hero Photograph */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="relative w-full border border-white/5 p-2.5 bg-[#0a0a0a]/65 shadow-2xl rounded-sm backdrop-blur-sm group transition-all duration-700 hover:border-white/15">
              
              {/* Photo Renderer inside dynamic frame */}
              <PhotoRenderer 
                photo={hero} 
                fill={true}
                className="aspect-[3/4] rounded-sm"
                filterClass="saturate-[0.8] contrast-[1.1] brightness-[0.85] hover:saturate-100 hover:brightness-100 transition-all duration-1000 ease-out" 
              />
              
              {/* Monospace coordinates badge floating inside photo top-left */}
              <div className="absolute top-5 left-5 z-20 pointer-events-none bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[8px] font-mono tracking-widest text-slate-400 uppercase select-none">
                LOC: 27.7215° N // 85.3240° E
              </div>
            </div>
            
            {/* Inline metadata under the photo */}
            <div className="flex justify-between items-center px-1 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              <span>ROLL_INDEX // VOL. I</span>
              <span>INDEX: 01_COVER_GRID</span>
            </div>
          </div>
          
          {/* Editorial Content on the right */}
          <div className="lg:col-span-6 flex flex-col justify-center gap-6 lg:pl-4">
            <div className="flex flex-col">
              <span className="text-[#d4af37] text-[9px] font-mono tracking-[0.4em] uppercase font-bold mb-2">
                THE PRIVATE ARCHIVES
              </span>
              <h2 className="font-sans font-black text-4xl md:text-6xl text-white uppercase tracking-[0.1em] leading-tight select-none">
                SAUMYA<br/>PAREKH
              </h2>
            </div>
            
            <div className="h-[1px] w-12 bg-[#d4af37]/45" />

            <p className="text-[#C5C5C7] font-serif italic text-base md:text-[17px] leading-relaxed max-w-md">
              "I build systems in the light, but I capture the texture of life in the spaces between. An archive of mechanical noise, high-altitude skies, and empty roads."
            </p>
            
            <p className="text-[#8C8C8C] font-mono text-[9px] leading-relaxed max-w-sm uppercase tracking-wider">
              This is a personal repository of unedited film frames, silent streets, and mechanical solitude. A digital diary capturing moments that exist entirely outside the margins of work.
            </p>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              {/* Synthesizer Player integrated right next to the intro details */}
              <CinemaAudio />
            </div>
          </div>
        </div>
      );
      break;

    case "Photo Dump":
      // Masonry Polaroid Column Grid with 7 Continents travel scribble background
      layoutContent = (
        <div className="w-full relative py-12">
          {/* Scribble Book Continents Background Overlay */}
          <ContinentsScribble />
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative space-y-6">
            {photos.map((p, i) => {
              const rotation = i % 3 === 0 ? "rotate-[-1.2deg]" : i % 3 === 1 ? "rotate-[1.2deg]" : "rotate-[0.6deg]";
              return (
                <div 
                  key={i} 
                  className={`break-inside-avoid relative flex flex-col justify-between bg-[#121212] border border-[#2A2A2A] p-4 rounded-lg shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:z-50 hover:border-[#444] mb-6 ${rotation}`}
                >
                  <div className="w-full overflow-hidden rounded bg-[#0A0A0A]">
                    <PhotoRenderer 
                      photo={p} 
                      fill={false}
                      className="w-full h-auto" 
                      filterClass="saturate-[0.75] contrast-[1.1] hover:saturate-100 transition-all duration-500" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      break;

    case "Cinematic Widescreen":
      // Bike Section: Bold center dashed highway divider and telemetry
      layoutContent = (
        <div className="w-full bg-[#030303] flex flex-col items-center justify-center py-16 gap-8 relative overflow-hidden border-y border-[#181818]">
          {/* Bold Gold Center Dashed Road Lane Line */}
          <div className="absolute inset-x-0 top-1/2 h-[3px] border-b-2 border-dashed border-[#d4af37]/25 z-0 pointer-events-none" />
          
          <div className="w-full max-w-5xl mx-auto border-y border-[#1C1C1C] relative bg-[#020202] z-10 shadow-2xl">
            <PhotoRenderer 
              photo={hero} 
              className="w-full max-h-[75vh]" 
              filterClass="w-full max-h-[75vh] object-contain saturate-[0.85] contrast-[1.1] brightness-[0.9] hover:saturate-100 hover:brightness-100 transition-all duration-1000" 
            />
          </div>

          {others.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-7xl px-6 z-10">
              {others.map((p, i) => (
                <div key={i} className="aspect-[16/9] overflow-hidden border border-[#222] bg-[#0E0E0E] relative group rounded shadow-lg">
                  <PhotoRenderer 
                    photo={p} 
                    fill={true}
                    className="w-full h-full" 
                    filterClass="object-cover w-full h-full saturate-[0.6] opacity-60 group-hover:opacity-100 group-hover:saturate-100 transition-all duration-700" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
      break;

    case "Lookbook":
      // Clean masonry column layout for Fitness photos, preserving natural aspect ratios and removing bars
      layoutContent = (
        <div className="w-full relative py-12">
          {/* Protocol Receipt Widget */}
          <ProtocolReceipt />
          
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative space-y-6">
            {photos.map((p, i) => {
              const rotation = i % 3 === 0 ? "rotate-[-0.8deg]" : i % 3 === 1 ? "rotate-[0.8deg]" : "rotate-[0.4deg]";
              return (
                <div 
                  key={i} 
                  className={`break-inside-avoid relative flex flex-col justify-between bg-[#121212] border border-[#2A2A2A] p-4 rounded-lg shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:z-50 hover:border-[#444] mb-6 ${rotation}`}
                >
                  <div className="w-full overflow-hidden rounded bg-[#0A0A0A]">
                    <PhotoRenderer 
                      photo={p} 
                      fill={false}
                      className="w-full h-auto" 
                      filterClass="saturate-[0.8] contrast-[1.15] hover:saturate-100 transition-all duration-500" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      break;

    case "Minimalist Horizon":
      // Horizon layout side-by-side, removing vertical deadspaces
      layoutContent = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative items-start">
           {photos.map((p, i) => (
              <div key={i} className="border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-xl max-w-xs mx-auto w-full md:max-w-none">
                 <div className="aspect-[16/10] w-full overflow-hidden rounded bg-black">
                   <PhotoRenderer 
                     photo={p} 
                     fill={true}
                     filterClass="w-full h-full object-cover saturate-[0.85] contrast-[1.1] hover:saturate-100 transition-all duration-1000" 
                   />
                 </div>
              </div>
           ))}
        </div>
      );
      break;

    case "Comic Strip":
      // Animals: Kept full color, rendered as asymmetric photographic prints
      layoutContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative items-start">
           {photos.map((p, i) => {
              // Scrapbook offsets and rotations - uniform col-span-1 to keep grid balanced
              const styles = [
                "rotate-[-1.5deg] translate-y-2",
                "rotate-[2deg] -translate-y-2",
                "rotate-[-2deg] translate-y-3",
                "rotate-[1.5deg] -translate-y-1",
                "rotate-[-1.8deg] translate-y-2"
              ];
              
              const dynamicStyle = styles[i % styles.length];

              return (
                <div 
                  key={i} 
                  className={`relative group overflow-hidden rounded bg-black/60 border border-white/5 shadow-[0_15px_35px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.03)] hover:scale-105 hover:rotate-0 hover:z-30 transition-all duration-500 ease-out cursor-pointer p-2 w-full max-w-xs mx-auto ${dynamicStyle}`}
                >
                   {/* Watermark silhouette signature - embossed inside bottom-right */}
                   <div className="absolute bottom-4 right-4 z-30 opacity-20 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 pointer-events-none scale-75 origin-bottom-right">
                     {i % 2 === 0 ? <PawPrintSVG /> : <CatSilhouetteSVG />}
                   </div>
                   
                   {/* Photo Render - contained inside h-56 box to prevent vertical stretching and cropping */}
                   <div className="relative w-full h-56 overflow-hidden rounded bg-black/40">
                     <PhotoRenderer 
                       photo={p} 
                       fill={true}
                       objectFit="contain"
                       className="w-full h-full" 
                       filterClass="w-full h-full object-contain saturate-[0.85] group-hover:saturate-100 transition-all duration-700 ease-out" 
                     />
                   </div>
                </div>
              );
           })}
        </div>
      );
      break;

    case "Blue Hour Grid":
      // Aeroplanes: wings fully visible. Overlapping scattered deck on the right, large main photo on the left.
      layoutContent = (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-7xl mx-auto px-6 pb-24 z-10 relative">
          
          <AviationWidget />

          {/* Main photo: Me watching plane landing */}
          <div className="lg:col-span-7 border border-[#2A2A2A] bg-[#0E0E0E] p-3 rounded-lg shadow-2xl max-w-md mx-auto w-full lg:max-w-none">
             <div className="relative w-full aspect-[16/9] overflow-hidden rounded bg-black">
               <PhotoRenderer 
                 photo={hero} 
                 fill={true}
                 filterClass="w-full h-full object-cover saturate-[0.6] contrast-[1.3] brightness-[0.85] hover:saturate-100 hover:brightness-100 transition-all duration-1000" 
               />
             </div>
          </div>
          
          {/* Staggered overlapping detail photos with full wings visible */}
          {others.length > 0 && (
            <div className="lg:col-span-5 relative flex flex-col gap-6 md:gap-8 mt-6 lg:mt-0">
              {others.slice(0, 3).map((p, i) => {
                const rotation = i % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]";
                const offset = i === 1 ? "lg:-translate-x-12 z-20" : "z-10";
                return (
                  <div 
                    key={i} 
                    className={`border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-xl transition-all duration-500 hover:scale-105 hover:z-30 hover:border-[#444] max-w-xs mx-auto w-full lg:max-w-none ${rotation} ${offset}`}
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden rounded bg-black">
                      <PhotoRenderer 
                        photo={p} 
                        fill={true}
                        className="w-full h-full" 
                        filterClass="w-full h-full object-cover saturate-[0.5] contrast-[1.2] hover:saturate-100 transition-all duration-700" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
      break;

    case "Offset":
    default:
      // Clean, 3-column horizontal grid layout with no deadspace (items-start ensures cards don't stretch vertically)
      layoutContent = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative items-start">
          {photos.map((p, i) => (
            <div 
              key={i} 
              className="border border-[#2A2A2A] bg-[#0E0E0E] p-3 rounded shadow-2xl transition-all duration-500 hover:scale-[1.03]"
            >
              <div className="w-full overflow-hidden rounded bg-black">
                <PhotoRenderer 
                  photo={p} 
                  fill={false}
                  className="w-full h-auto"
                  filterClass="w-full h-auto object-cover saturate-[0.85] contrast-[1.1] hover:saturate-100 transition-all duration-1000" 
                />
              </div>
            </div>
          ))}
        </div>
      );
      break;
  }

  return (
    <section className="relative w-full border-b border-[#1A1A1A]/30">
      {renderHeader()}
      {layoutContent}
    </section>
  );
}
