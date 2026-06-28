'use client';

import { SpreadData } from "@/data/photos";
import { PhotoRenderer } from "./PhotoRenderer";

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

// High-visibility Vector outlines for Fitness section
const DumbbellSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 text-[#d4af37]/35 hover:text-[#d4af37]/80 transition-all duration-500 pointer-events-none select-none">
    <path d="M6 4h2v16H6V4zM16 4h2v16h-2V4zM2 8h4v8H2V8zM18 8h4v8h-4V8zM6 12h10" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

const HeartRateSVG = () => (
  <svg viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-36 h-12 text-[#d4af37]/30 pointer-events-none select-none">
    <path d="M0 15 H25 L30 5 L35 25 L40 12 L45 18 L50 15 H100" />
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center w-full max-w-6xl mx-auto px-6 py-16 md:py-24 z-10 relative">
          {/* Smaller Hero Image (Book-cover style) */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-[85%] md:w-full max-w-sm border border-[#2A2A2A] p-2 bg-[#0E0E0E] shadow-2xl rounded">
              <PhotoRenderer 
                photo={hero} 
                fill={true}
                className="aspect-[3/4]"
                filterClass="saturate-[0.8] contrast-[1.1] brightness-[0.9] hover:saturate-100 hover:brightness-100 transition-all duration-1000 ease-out" 
              />
            </div>
          </div>
          
          {/* Introduction Diary Entry on the other half of the screen */}
          <div className="md:col-span-7 flex flex-col justify-center gap-6">
            <span className="text-[#8C8C8C] text-xs font-mono tracking-[0.4em] uppercase">
              THE PRIVATE ARCHIVE // VOL. I
            </span>
            <h1 className="font-serif italic text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
              A record of quiet observations.
            </h1>
            <p className="text-[#8C8C8C] font-serif text-sm md:text-base leading-relaxed max-w-md">
              This is a personal repository of unedited film frames, silent streets, and mechanical solitude. A digital diary capturing moments that exist entirely outside the margins of work.
            </p>
          </div>
        </div>
      );
      break;

    case "Photo Dump":
      // Staggered 3-column Polaroid Grid with 7 Continents travel scribble background
      layoutContent = (
        <div className="w-full relative py-12">
          {/* Scribble Book Continents Background Overlay */}
          <ContinentsScribble />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-7xl mx-auto px-6 pb-24 z-10 relative">
            {photos.map((p, i) => {
              const rotation = i % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]";
              const offset = i % 3 === 1 ? "md:translate-y-12" : i % 3 === 2 ? "md:translate-y-20" : "";
              return (
                <div 
                  key={i} 
                  className={`relative flex flex-col justify-between bg-[#121212] border border-[#2A2A2A] p-4 rounded-lg shadow-2xl transition-all duration-500 hover:scale-105 hover:z-50 hover:border-[#444] ${rotation} ${offset}`}
                >
                  <div className="aspect-[4/5] w-full overflow-hidden rounded bg-[#0A0A0A]">
                    <PhotoRenderer 
                      photo={p} 
                      fill={true}
                      className="w-full h-full" 
                      filterClass="saturate-[0.75] contrast-[1.1] hover:saturate-100 transition-all duration-500" 
                    />
                  </div>
                  <div className="mt-4 flex justify-between items-center select-none">
                    <p className="text-[10px] text-[#6C6C6C] font-mono tracking-widest uppercase">
                      FILE_0{i+1}.RAW {"//"} {p.role}
                    </p>
                    {/* Tiny sketchy scribble marker under the polaroids */}
                    <span className="text-[8px] text-[#d4af37]/50 font-mono tracking-tighter">INDEX_LOC_{i * 45}</span>
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
          
          <div className="absolute top-4 left-6 font-mono text-xs text-[#d4af37]/45 tracking-[0.22em] pointer-events-none select-none font-bold">
            BIKE TELEMETRY {"//"} SYS.ACTIVE
          </div>
          <div className="absolute bottom-4 right-6 font-mono text-xs text-[#d4af37]/45 tracking-[0.22em] pointer-events-none select-none font-bold">
            LAT: 27.2044° N {"//"} LON: 77.4912° E {"//"} SPD: 140 KM/H
          </div>
          <div className="absolute top-6 right-6 font-mono text-xs text-[#d4af37]/65 tracking-widest pointer-events-none select-none flex gap-6 font-bold">
            <span>TIME: 23:42:01.84</span>
            <span>LAP: 01</span>
          </div>

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
                  {/* Subtle speed gauge overlay */}
                  <div className="absolute bottom-2 left-2 font-mono text-[7px] text-white/50 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    MKR_0{i+1} {"//"} 1000 RPM
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
      break;

    case "Lookbook":
      // Fitness Scramble layout with dumbbells, sweat spot indicators and telemetry overlays
      const sunsetHoop = photos[0];
      const playBasketball = photos[2];
      const posingDetail = photos[1];
      
      const bottomPosing1 = photos[3];
      const bottomPosing2 = photos[4];

      layoutContent = (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto gap-12 px-6 pb-24 relative overflow-hidden">
          {/* Prominent dumbbell & telemetry backdrop icons */}
          <div className="absolute top-4 left-4 pointer-events-none select-none z-0">
            <DumbbellSVG />
          </div>
          <div className="absolute bottom-12 right-4 pointer-events-none select-none z-0">
            <DumbbellSVG />
          </div>
          <div className="absolute top-[40%] right-[10%] pointer-events-none select-none z-0 opacity-40">
            <HeartRateSVG />
          </div>
          <div className="absolute bottom-24 left-[15%] pointer-events-none select-none z-0 opacity-40">
            <HeartRateSVG />
          </div>

          {/* Top Row: Staggered Scramble */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end w-full z-10">
            {/* Left side: Playing basketball */}
            {playBasketball && (
              <div className="md:col-span-3 border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-xl md:translate-y-6 relative group">
                <div className="aspect-[3/4] w-full overflow-hidden rounded bg-[#0A0A0A]">
                  <PhotoRenderer 
                    photo={playBasketball} 
                    fill={true} 
                    filterClass="saturate-[0.8] contrast-[1.2] hover:saturate-100 transition-all duration-700" 
                  />
                </div>
                <span className="mt-2 block text-[9px] text-[#6C6C6C] font-mono tracking-widest uppercase text-center">ACTION // BASKETBALL</span>
                {/* Spot crosshair target watermark */}
                <div className="absolute top-4 right-4 w-6 h-6 border-2 border-dashed border-[#d4af37]/45 rounded-full pointer-events-none group-hover:scale-125 transition-transform" />
              </div>
            )}
            {/* Center: Sunset Basketball Hoop */}
            {sunsetHoop && (
              <div className="md:col-span-6 border border-[#2A2A2A] bg-[#0E0E0E] p-3 rounded shadow-2xl z-10 scale-105 relative group">
                <div className="aspect-[4/3] md:aspect-[16/10] w-full overflow-hidden rounded bg-[#0A0A0A]">
                  <PhotoRenderer 
                    photo={sunsetHoop} 
                    fill={true} 
                    objectFit="contain"
                    filterClass="bg-[#0E0E0E] w-full h-full saturate-[0.9] contrast-[1.1] hover:saturate-100 transition-all duration-1000" 
                  />
                </div>
                <span className="mt-2 block text-[10px] text-[#8C8C8C] font-mono tracking-widest uppercase text-center font-bold">SILHOUETTE // SUNSET HORIZON</span>
                {/* Spot target indicator */}
                <div className="absolute top-6 left-6 w-6 h-6 border-2 border-[#d4af37]/40 flex items-center justify-center pointer-events-none">
                  <div className="w-2.5 h-2.5 bg-[#d4af37]/65 rounded-full" />
                </div>
              </div>
            )}
            {/* Right side: gymposing */}
            {posingDetail && (
              <div className="md:col-span-3 border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-xl md:-translate-y-6 relative group">
                <div className="aspect-[3/4] w-full overflow-hidden rounded bg-[#0A0A0A]">
                  <PhotoRenderer 
                    photo={posingDetail} 
                    fill={true} 
                    objectFit="contain"
                    filterClass="bg-[#0E0E0E] w-full h-full saturate-[0.8] contrast-[1.2] hover:saturate-100 transition-all duration-700" 
                  />
                </div>
                <span className="mt-2 block text-[9px] text-[#6C6C6C] font-mono tracking-widest uppercase text-center">DETAIL // GYMPOSING</span>
                <div className="absolute bottom-16 right-4 pointer-events-none opacity-40">
                  <HeartRateSVG />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Big Aspect Posing Photos with full bicep visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8 z-10">
            {bottomPosing1 && (
              <div className="border border-[#2A2A2A] bg-[#0E0E0E] p-3 rounded-lg shadow-2xl relative group">
                <div className="aspect-[3/4] md:aspect-[4/3] w-full overflow-hidden rounded bg-[#0A0A0A]">
                  <PhotoRenderer 
                    photo={bottomPosing1} 
                    fill={true} 
                    objectFit="contain"
                    filterClass="bg-[#0E0E0E] w-full h-full saturate-[0.85] contrast-[1.15] hover:saturate-100 transition-all duration-1000" 
                  />
                </div>
                <span className="mt-3 block text-[10px] text-[#8C8C8C] font-mono tracking-widest uppercase text-center">FORM // POSING IN GYM I</span>
                {/* Spot telemetry */}
                <div className="absolute top-6 right-6 font-mono text-[9px] text-[#d4af37]/65 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  CAL: 420 KCAL // HR: 156 BPM
                </div>
              </div>
            )}
            {bottomPosing2 && (
              <div className="border border-[#2A2A2A] bg-[#0E0E0E] p-3 rounded-lg shadow-2xl relative group">
                <div className="aspect-[3/4] md:aspect-[4/3] w-full overflow-hidden rounded bg-[#0A0A0A]">
                  <PhotoRenderer 
                    photo={bottomPosing2} 
                    fill={true} 
                    objectFit="contain"
                    filterClass="bg-[#0E0E0E] w-full h-full saturate-[0.85] contrast-[1.15] hover:saturate-100 transition-all duration-1000" 
                  />
                </div>
                <span className="mt-3 block text-[10px] text-[#8C8C8C] font-mono tracking-widest uppercase text-center">FORM // POSING IN GYM II</span>
                {/* Spot telemetry */}
                <div className="absolute top-6 right-6 font-mono text-[9px] text-[#d4af37]/65 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  SET: 04 // REP: 12 // VOL: 80KG
                </div>
              </div>
            )}
          </div>
        </div>
      );
      break;

    case "Minimalist Horizon":
      // Horizon layout side-by-side, removing vertical deadspaces
      layoutContent = (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative">
           {photos.map((p, i) => (
              <div key={i} className="border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-xl">
                 <div className="aspect-[16/10] w-full overflow-hidden rounded bg-black">
                   <PhotoRenderer 
                     photo={p} 
                     fill={true}
                     filterClass="w-full h-full object-cover saturate-[0.85] contrast-[1.1] hover:saturate-100 transition-all duration-1000" 
                   />
                 </div>
                 <span className="mt-2 block text-[9px] text-[#6C6C6C] font-mono tracking-widest uppercase text-center">HORIZON // 0{i+1}</span>
              </div>
           ))}
        </div>
      );
      break;

    case "Comic Strip":
      // Animals: Kept full color. Added outline animal vector decorators in card margins.
      layoutContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl mx-auto px-6 pb-24 z-10 relative">
           {photos.map((p, i) => {
              const colSpan = i === 0 ? "col-span-1 sm:col-span-2 md:col-span-4" : i % 3 === 0 ? "col-span-1 sm:col-span-2" : "col-span-1 sm:col-span-2 md:col-span-2";
              return (
                <div key={i} className={`${colSpan} border border-[#2A2A2A] bg-[#121212] p-4 flex flex-col justify-between group rounded-lg shadow-xl relative`}>
                   {/* Absolute vector animal corner badge decorators - floating outside of image box */}
                   <div className="absolute -top-3.5 -right-3.5 z-30 bg-[#121212] p-1.5 rounded-full border border-[#2A2A2A] shadow-xl group-hover:border-[#d4af37]/60 group-hover:scale-110 transition-all duration-500">
                     {i % 2 === 0 ? <PawPrintSVG /> : <CatSilhouetteSVG />}
                   </div>
                   
                   <div className="relative w-full aspect-[4/3] overflow-hidden rounded bg-black">
                     <PhotoRenderer 
                       photo={p} 
                       fill={true}
                       className="w-full h-full" 
                       filterClass="w-full h-full object-cover saturate-[0.85] hover:saturate-100 transition-all duration-700 ease-out" 
                     />
                   </div>
                   <div className="mt-4 flex justify-between items-center px-1 select-none">
                     <span className="text-[#8C8C8C] text-[10px] font-mono tracking-widest uppercase">{p.role}</span>
                     <span className="text-[#8C8C8C] text-[10px] font-mono">PANEL 0{i+1}</span>
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
          {/* Main photo: Me watching plane landing */}
          <div className="lg:col-span-7 border border-[#2A2A2A] bg-[#0E0E0E] p-3 rounded-lg shadow-2xl">
             <div className="relative w-full aspect-[16/9] overflow-hidden rounded bg-black">
               <PhotoRenderer 
                 photo={hero} 
                 fill={true}
                 filterClass="w-full h-full object-cover saturate-[0.6] contrast-[1.3] brightness-[0.85] hover:saturate-100 hover:brightness-100 transition-all duration-1000" 
               />
             </div>
             <span className="mt-2 block text-[10px] text-[#8C8C8C] font-mono tracking-widest uppercase text-center font-bold">ME WATCHING // WINGS OF GLORY</span>
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
                    className={`border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-xl transition-all duration-500 hover:scale-105 hover:z-30 hover:border-[#444] ${rotation} ${offset}`}
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden rounded bg-black">
                      <PhotoRenderer 
                        photo={p} 
                        fill={true}
                        className="w-full h-full" 
                        filterClass="w-full h-full object-cover saturate-[0.5] contrast-[1.2] hover:saturate-100 transition-all duration-700" 
                      />
                    </div>
                    <span className="mt-2 block text-[9px] text-[#6C6C6C] font-mono tracking-widest uppercase text-center">WINGS // DET_0{i+1}</span>
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
      // Staggered asymmetrical layout
      layoutContent = (
        <div className="flex flex-col w-full max-w-5xl mx-auto px-6 relative pb-24 z-10">
          {photos.map((p, i) => (
            <div key={i} className={`w-full md:w-[60%] ${i % 2 === 0 ? "ml-0" : "ml-auto"} ${i !== 0 ? "-mt-8 md:-mt-32 z-10" : "z-0"}`}>
              <div className="border border-[#2A2A2A] bg-[#0E0E0E] p-2 rounded shadow-2xl">
                <PhotoRenderer photo={p} filterClass="saturate-[0.8] contrast-[1.2] hover:saturate-100 transition-all duration-700" />
              </div>
            </div>
          ))}
        </div>
      );
      break;
  }

  return (
    <section className="relative w-full overflow-hidden border-b border-[#1A1A1A]/30">
      {renderHeader()}
      {layoutContent}
    </section>
  );
}
