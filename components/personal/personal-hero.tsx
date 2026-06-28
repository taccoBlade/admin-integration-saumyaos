"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOS } from "@/lib/os-context";
import { CARDS } from "./life-carousel";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

/* ─── Props Interface ─── */
export interface PersonalHeroProps {
  setActiveDossier: (card: typeof CARDS[number] | null) => void;
}

/* ─── Terrain Landmark Data Definitions ─── */
interface TerrainLandmark {
  id: string;
  label: string;
  category: string;
  gridX: number; // -16 to 16
  gridY: number; // -16 to 16
  color: string;
  type: string;
  location: string;
  telemetry: string;
  status: string;
  description: string;
}

const LANDMARKS: TerrainLandmark[] = [
  {
    id: "music",
    label: "Music & Frequencies",
    category: "REFLECTION",
    gridX: -8,
    gridY: 6,
    color: "#ced4da", // archive-400
    type: "Ambient Soundscapes",
    location: "Reflective Space",
    telemetry: "Acoustic Calibration",
    status: "Active Listening",
    description: "Curating ambient soundscapes and progressive tracks to calibrate cognitive focus during deep work."
  },
  {
    id: "markets & investing",
    label: "Markets & Investing",
    category: "FINANCE",
    gridX: 6,
    gridY: -8,
    color: "#adb5bd", // archive-500
    type: "Capital Strategy",
    location: "Personal Desk",
    telemetry: "Quantitative Systems",
    status: "Active Tracking",
    description: "Structuring capital allocation models and managing swing trading risk profiles."
  },
  {
    id: "photography",
    label: "Photography",
    category: "CREATIVE",
    gridX: 0,
    gridY: 0,
    color: "#d4af37", // attention gold
    type: "Visual Cinematics",
    location: "Journey Logs",
    telemetry: "Framing & Composition",
    status: "Active Capture",
    description: "Framing natural and built geometry, editing visual pacing, and documenting journeys."
  },
  {
    id: "fitness",
    label: "Fitness & Endurance",
    category: "PHYSICAL",
    gridX: 8,
    gridY: 8,
    color: "#f3ca3e", // attention hover gold
    type: "Endurance & Lift",
    location: "Training Zone",
    telemetry: "Consistent Routine",
    status: "Active Discipline",
    description: "Testing physical resilience through daily running cycles and progressive strength training."
  },
  {
    id: "motorcycling",
    label: "Motorcycling",
    category: "ADVENTURE",
    gridX: 10,
    gridY: -4,
    color: "#c9a35a", // muted gold
    type: "Cruiser Touring",
    location: "Open Highway",
    telemetry: "Super Meteor 650",
    status: "Active Riding",
    description: "Exploring remote geographies and experiencing the mechanical feedback of long-distance cruising."
  },
  {
    id: "learning",
    label: "Learning & Systems",
    category: "CURIOSITY",
    gridX: -10,
    gridY: -8,
    color: "#6c757d", // archive-600
    type: "Cognitive Inquiry",
    location: "Emerging Tech",
    telemetry: "Systems Architecture",
    status: "Active Learning",
    description: "Exploring automation frameworks, systems logic, and emerging software libraries."
  }
];

export function PersonalHero({ setActiveDossier }: PersonalHeroProps) {
  const { theme } = useOS();

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 pb-4">
      {/* Radial ambient glow behind the bento panel */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div 
          className="h-[600px] w-[600px] rounded-full filter blur-[150px] transition-all duration-1000 opacity-20"
          style={{ backgroundColor: theme.accent }}
        />
      </div>

      {/* ── BENTO GRID CONTAINER ── */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* Cell 1: Identity & Bio (col-span-7) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 bg-black/45 border border-white/5 p-6 sm:p-10 rounded-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[380px]"
        >
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(212, 175, 55, 0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="flex items-center justify-between text-[9px] tracking-widest text-slate-500 uppercase z-10">
            <span>[ PERSONAL LOG // INITIATED ]</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
              <span className="font-bold" style={{ color: theme.accent }}>LIVE</span>
            </div>
          </div>

          <div className="my-auto py-4 z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-bigger-scape select-none leading-none font-normal tracking-wide">
              <span className="text-attention">S</span>aumya <span className="text-attention">P</span>arekh
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-4 text-[9px] sm:text-xs font-bold font-mono tracking-wider">
              <span className="px-2.5 py-1 rounded border bg-white/5 uppercase transition-all duration-350" style={{ borderColor: theme.accent + "40", color: theme.accent }}>
                Civil Engineer
              </span>
              <span className="text-slate-600 font-normal">{"//"}</span>
              <span className="px-2.5 py-1 rounded border bg-white/5 uppercase transition-all duration-350" style={{ borderColor: theme.accent + "40", color: theme.accent }}>
                Systems Thinker
              </span>
              <span className="text-slate-600 font-normal">{"//"}</span>
              <span className="px-2.5 py-1 rounded border bg-white/5 uppercase transition-all duration-350" style={{ borderColor: theme.accent + "40", color: theme.accent }}>
                Motorcycle Cruiser
              </span>
            </div>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-xl font-sans font-medium">
              I am a Civil Engineer building digital tools for infrastructure problems. Bridging geotechnical analysis, site monitoring automation, and mechanical cruising.
            </p>
          </div>

          <div className="border-t border-white/5 pt-4 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-500 z-10">
            <span>EXPLORING BEYOND CONSTRAINTS</span>
            <span className="italic text-slate-400">Interact with the map landmarks to explore.</span>
          </div>
        </motion.div>

        {/* Cell 2: Topography Canvas Window (col-span-5) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 bg-black/45 border border-white/5 rounded-2xl relative h-[380px] overflow-hidden backdrop-blur-md"
        >
          <TopographyBentoCell setActiveDossier={setActiveDossier} />
        </motion.div>

      </div>
    </section>
  );
}

/* ─── 3D Topography Canvas Bento Component ─── */
interface TopographyBentoCellProps {
  setActiveDossier: (card: typeof CARDS[number] | null) => void;
}

function TopographyBentoCell({ setActiveDossier }: TopographyBentoCellProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // HUD Overlays State
  const [hoveredLandmark, setHoveredLandmark] = useState<TerrainLandmark | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [elevationMax, setElevationMax] = useState(35);

  // Projection Camera configuration
  const cameraYaw = useRef(0.85);
  const cameraPitch = useRef(0.65);
  const cameraZoom = useRef(1.05);
  const autoRotate = useRef(true);

  // Event interaction tracking variables
  const mousePos = useRef({ x: -1000, y: -1000 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef<TerrainLandmark | null>(null);
  const lastHoveredId = useRef<string | null>(null);

  // Heightmap generation mathematical peaks
  const getHeight = (x: number, y: number) => {
    // Base rolling wave structure
    const hills = Math.sin(x * 0.16) * Math.cos(y * 0.16) * 15;
    
    // Engineering Peak at (-8, 6)
    const engPeak = 24 * Math.exp(-((x + 8) * (x + 8) + (y - 6) * (y - 6)) / 30);
    
    // Markets Peak at (6, -8)
    const marketsPeak = 24 * Math.exp(-((x - 6) * (x - 6) + (y + 8) * (y + 8)) / 30);
    
    // Content Creation Central Valley at (0, 0)
    const creativeValley = -16 * Math.exp(-(x * x + y * y) / 40);
    
    // Fitness Peak at (8, 8)
    const fitnessPeak = 32 * Math.exp(-((x - 8) * (x - 8) + (y - 8) * (y - 8)) / 35);
    
    // Riding Ridge at (10, -4)
    const ridingRidge = 18 * Math.exp(-((x - 10) * (x - 10) + (y + 4) * (y + 4)) / 25);
    
    // Learning & AI Plateau at (-10, -8)
    const aiPlateau = 20 * Math.exp(-((x + 10) * (x + 10) + (y + 8) * (y + 8)) / 35);

    return hills + engPeak + marketsPeak + creativeValley + fitnessPeak + ridingRidge + aiPlateau;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse Listeners
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      autoRotate.current = false;
      setIsAutoRotating(false);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;

      cameraYaw.current += dx * 0.006;
      cameraPitch.current = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, cameraPitch.current + dy * 0.006));
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If they clicked without dragging, open dossier
      if (dist < 6 && hoveredRef.current) {
        const matchingCard = CARDS.find(
          c => c.title.toLowerCase() === hoveredRef.current?.id.toLowerCase()
        );
        if (matchingCard) {
          setActiveDossier(matchingCard);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraZoom.current = Math.max(0.4, Math.min(2.5, cameraZoom.current - e.deltaY * 0.0015));
    };

    // Touch Support
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      autoRotate.current = false;
      setIsAutoRotating(false);
      if (e.touches.length === 1 && e.touches[0]) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches.length === 1 && e.touches[0]) {
        mousePos.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        cameraYaw.current += dx * 0.008;
        cameraPitch.current = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, cameraPitch.current + dy * 0.008));
      } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (touchStartDist > 0) {
          const factor = dist / touchStartDist;
          cameraZoom.current = Math.max(0.4, Math.min(2.5, cameraZoom.current * factor));
          touchStartDist = dist;
        }
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      touchStartDist = 0;
      
      const dx = mousePos.current.x - (dragStartPos.current.x - canvas.getBoundingClientRect().left);
      const dy = mousePos.current.y - (dragStartPos.current.y - canvas.getBoundingClientRect().top);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 15 && hoveredRef.current) {
        const matchingCard = CARDS.find(
          c => c.title.toLowerCase() === hoveredRef.current?.id.toLowerCase()
        );
        if (matchingCard) {
          setActiveDossier(matchingCard);
        }
      }
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    // Heightmap Grid Config
    const gridCols = 32;
    const gridRows = 32;
    const cellSize = 14;

    // Animation Loop
    const animate = () => {
      const time = Date.now();
      if (autoRotate.current) {
        cameraYaw.current += 0.0012;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 25; // center slightly offset down

      const yaw = cameraYaw.current;
      const pitch = cameraPitch.current;
      const zoom = cameraZoom.current;

      const fov = 500;

      // Project 3D to 2D
      const project = (wx: number, wy: number, wz: number) => {
        const xRot = wx * Math.cos(yaw) - wy * Math.sin(yaw);
        const yRot = wx * Math.sin(yaw) + wy * Math.cos(yaw);
        
        const yDepth = yRot * Math.cos(pitch) - wz * Math.sin(pitch);
        const zHeight = yRot * Math.sin(pitch) + wz * Math.cos(pitch);

        const scale = fov / (fov + yDepth);
        
        return {
          x: centerX + xRot * scale * zoom,
          y: centerY - zHeight * scale * zoom,
          depth: yDepth
        };
      };

      // Depth sorting grid iteration
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);

      const endCol = cosY + sinY > 0 ? -1 : gridCols + 1;
      const stepCol = cosY + sinY > 0 ? -1 : 1;

      const endRow = -sinY + cosY > 0 ? -1 : gridRows + 1;
      const stepRow = -sinY + cosY > 0 ? -1 : 1;

      const points: Array<Array<{x: number, y: number, z: number, px: number, py: number}>> = [];
      let maxEl = -Infinity;

      for (let c = 0; c <= gridCols; c++) {
        points[c] = [];
        const gridX = c - gridCols / 2;
        const wx = gridX * cellSize;
        
        for (let r = 0; r <= gridRows; r++) {
          const gridY = r - gridRows / 2;
          const wy = gridY * cellSize;
          
          const wz = getHeight(gridX, gridY);
          if (wz > maxEl) maxEl = wz;

          const proj = project(wx, wy, wz);
          points[c][r] = { x: wx, y: wy, z: wz, px: proj.x, py: proj.y };
        }
      }

      setElevationMax(Math.floor(maxEl));

      // Draw Grid Mesh Lines
      ctx.lineWidth = 0.6;
      for (let c = (stepCol === 1 ? 0 : gridCols); c !== endCol; c += stepCol) {
        for (let r = (stepRow === 1 ? 0 : gridRows); r !== endRow; r += stepRow) {
          if (c < gridCols) {
            const p1 = points[c][r];
            const p2 = points[c + 1][r];
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            
            const avgZ = (p1.z + p2.z) / 2;
            const elevationRatio = Math.max(0, Math.min(1, (avgZ + 15) / 45));
            ctx.strokeStyle = `rgba(${34 + elevationRatio * 150}, ${100 + elevationRatio * 100}, ${238 - elevationRatio * 120}, ${0.07 + elevationRatio * 0.12})`;
            ctx.stroke();
          }
          if (r < gridRows) {
            const p1 = points[c][r];
            const p2 = points[c][r + 1];
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            
            const avgZ = (p1.z + p2.z) / 2;
            const elevationRatio = Math.max(0, Math.min(1, (avgZ + 15) / 45));
            ctx.strokeStyle = `rgba(${34 + elevationRatio * 150}, ${100 + elevationRatio * 100}, ${238 - elevationRatio * 120}, ${0.07 + elevationRatio * 0.12})`;
            ctx.stroke();
          }
        }
      }

      // Project Landmarks
      const projectedLandmarks = LANDMARKS.map((lm) => {
        const wx = lm.gridX * cellSize;
        const wy = lm.gridY * cellSize;
        const wz = getHeight(lm.gridX, lm.gridY);
        const proj = project(wx, wy, wz);
        
        return {
          ...lm,
          screenX: proj.x,
          screenY: proj.y,
          groundY: proj.y,
          pinY: proj.y - 35, // floating offset
          depth: proj.depth
        };
      });

      // Render landmarks back-to-front
      projectedLandmarks.sort((a, b) => b.depth - a.depth);

      // Node Hover Collision check (Radius enlarged to 40px)
      let hoveredNode: TerrainLandmark | null = null;
      for (const lm of projectedLandmarks) {
        const dx = lm.screenX - mousePos.current.x;
        const dy = lm.pinY - mousePos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 40) {
          hoveredNode = lm;
          break;
        }
      }

      hoveredRef.current = hoveredNode;
      const newHoverId = hoveredNode ? hoveredNode.id : null;
      if (newHoverId !== lastHoveredId.current) {
        lastHoveredId.current = newHoverId;
        setHoveredLandmark(hoveredNode);
      }

      // Draw Pins
      projectedLandmarks.forEach((lm) => {
        const isActive = newHoverId === lm.id;
        
        // Coordinates support vertical line
        ctx.beginPath();
        ctx.moveTo(lm.screenX, lm.groundY);
        ctx.lineTo(lm.screenX, lm.pinY);
        ctx.strokeStyle = lm.color;
        ctx.lineWidth = isActive ? 1.0 : 0.6;
        ctx.globalAlpha = isActive ? 0.75 : 0.25;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;

        // Ground anchor dot
        ctx.beginPath();
        ctx.arc(lm.screenX, lm.groundY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = lm.color;
        ctx.globalAlpha = isActive ? 0.95 : 0.45;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Floating diamond indicator
        const diamondAngle = time / 400 + lm.gridX;
        const dSize = isActive ? 6.5 : 4.5;
        
        ctx.save();
        ctx.translate(lm.screenX, lm.pinY);
        ctx.rotate(diamondAngle);
        
        ctx.beginPath();
        ctx.moveTo(0, -dSize);
        ctx.lineTo(dSize, 0);
        ctx.lineTo(0, dSize);
        ctx.lineTo(-dSize, 0);
        ctx.closePath();
        
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = isActive ? 12 : 4;
        ctx.shadowColor = lm.color;
        ctx.fill();
        
        ctx.strokeStyle = lm.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0; // reset

        // Compact Label
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        const labelText = lm.label.toUpperCase();
        const lblWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = "rgba(8, 9, 11, 0.75)";
        ctx.fillRect(lm.screenX - lblWidth / 2 - 3, lm.pinY - 18, lblWidth + 6, 10);
        
        ctx.strokeStyle = isActive ? lm.color : "rgba(212, 175, 55, 0.12)";
        ctx.lineWidth = 0.6;
        ctx.strokeRect(lm.screenX - lblWidth / 2 - 3, lm.pinY - 18, lblWidth + 6, 10);

        ctx.fillStyle = isActive ? "#ffffff" : "rgba(212, 175, 55, 0.65)";
        ctx.fillText(labelText, lm.screenX, lm.pinY - 10);
      });

      // Compass Ring Indicator
      const compassCx = canvas.width - 45;
      const compassCy = 45;
      const compassR = 18;

      ctx.beginPath();
      ctx.arc(compassCx, compassCy, compassR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.save();
      ctx.translate(compassCx, compassCy);
      ctx.rotate(-yaw);

      ctx.font = "6px monospace";
      ctx.fillStyle = "rgba(212, 175, 55, 0.3)";
      ctx.textAlign = "center";
      ctx.fillText("N", 0, -compassR + 6);
      
      ctx.beginPath();
      ctx.moveTo(0, -compassR);
      ctx.lineTo(3, -6);
      ctx.lineTo(-3, -6);
      ctx.closePath();
      ctx.fillStyle = "#d4af37";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, compassR);
      ctx.lineTo(2.5, 6);
      ctx.lineTo(-2.5, 6);
      ctx.closePath();
      ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
      ctx.fill();

      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [setActiveDossier]);

  const adjustZoom = (amount: number) => {
    cameraZoom.current = Math.max(0.4, Math.min(2.5, cameraZoom.current + amount));
  };

  const toggleAutoRotate = () => {
    autoRotate.current = !autoRotate.current;
    setIsAutoRotating(autoRotate.current);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 z-10 select-none">
      {/* Mini HUD Header */}
      <div className="flex justify-between items-start z-20 pointer-events-none">
        <div>
          <span className="text-[7.5px] text-attention font-bold uppercase tracking-wider block">
            MAP OVERVIEW // PERSONAL SPACE
          </span>
          <h2 className="text-[10px] font-bold text-white uppercase font-mono tracking-tight mt-0.5">
            Landscape of Interests
          </h2>
        </div>
        <span className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">
          {elevationMax}m peak
        </span>
      </div>

      {/* Primary Wireframe Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      />

      {/* Floating Tactical Overlay HUD (inside cell bottom left) */}
      <div className="absolute bottom-4 left-4 z-20 max-w-[190px] bg-neutral-950/80 border border-white/10 rounded-xl p-2.5 backdrop-blur-md transition-all duration-300 pointer-events-none text-[8px] font-mono">
        <AnimatePresence mode="wait">
          {hoveredLandmark ? (
            <motion.div
              key={hoveredLandmark.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="space-y-1"
            >
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-white uppercase truncate max-w-[100px]">{hoveredLandmark.label}</span>
                <span className="text-[7px] uppercase font-bold px-1 py-0.5 rounded" style={{ backgroundColor: hoveredLandmark.color + "25", color: hoveredLandmark.color }}>
                  {hoveredLandmark.category}
                </span>
              </div>
              <p className="text-slate-400 text-[7.5px] leading-snug line-clamp-2">
                {hoveredLandmark.description}
              </p>
              <div className="text-[6.5px] text-slate-500 pt-1 flex justify-between border-t border-white/5">
                <span>LAT: {hoveredLandmark.gridX * 2 + 23}°N</span>
                <span>LON: {hoveredLandmark.gridY * 2 + 69}°E</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-slate-500 text-center py-2"
            >
              * Hover landmarks to explore *
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Micro Control Overlay (right side bottom) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto bg-neutral-950/50 p-1.5 rounded-lg border border-white/5">
        <button
          onClick={() => adjustZoom(0.2)}
          className="w-5 h-5 flex items-center justify-center rounded border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          onClick={() => adjustZoom(-0.2)}
          className="w-5 h-5 flex items-center justify-center rounded border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
        <button
          onClick={toggleAutoRotate}
          className={`w-5 h-5 flex items-center justify-center rounded border transition-all ${
            isAutoRotating
              ? "border-attention/30 bg-attention/10 text-attention"
              : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
          }`}
          title="Toggle Rotation"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
