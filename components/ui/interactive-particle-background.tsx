"use client";

import { useEffect, useRef } from "react";
import { useOS } from "@/lib/os-context";

interface ConstellationNode {
  id: string;
  label: string;
  category: string;
  pctX: number;
  pctY: number;
  group: number;
  phase: number;
}

const CONSTELLATION_NODES: ConstellationNode[] = [
  { id: "fitness", label: "Fitness", category: "GOAL", pctX: 0.12, pctY: 0.22, group: 1, phase: 0 },
  { id: "discipline", label: "Discipline", category: "SKILL", pctX: 0.22, pctY: 0.35, group: 1, phase: 1.5 },
  { id: "pro-mix", label: "PRO-MIX", category: "PROJECT", pctX: 0.32, pctY: 0.50, group: 1, phase: 3.1 },
  { id: "civil-eng", label: "Civil Engineering", category: "ACADEMIC", pctX: 0.18, pctY: 0.65, group: 1, phase: 4.2 },
  { id: "systems-thinking", label: "Systems Thinking", category: "SKILL", pctX: 0.35, pctY: 0.72, group: 1, phase: 0.8 },
  { id: "soil-pipeline", label: "Soil Pipeline", category: "PROJECT", pctX: 0.48, pctY: 0.62, group: 1, phase: 2.1 },
  { id: "strain-telemetry", label: "Strain Telemetry", category: "PROJECT", pctX: 0.52, pctY: 0.82, group: 1, phase: 5.0 },
  
  { id: "motorcycles", label: "Motorcycles", category: "RIDE", pctX: 0.68, pctY: 0.25, group: 2, phase: 1.1 },
  { id: "meteor-650", label: "Super Meteor 650", category: "MACHINE", pctX: 0.84, pctY: 0.30, group: 2, phase: 2.9 },
  { id: "rann-of-kutch", label: "Rann of Kutch", category: "MEMORY", pctX: 0.80, pctY: 0.55, group: 2, phase: 4.7 },
  { id: "cinematography", label: "Cinematography", category: "CREATIVE", pctX: 0.65, pctY: 0.50, group: 2, phase: 0.2 }
];

interface ConstellationEdge {
  from: string;
  to: string;
  group: number;
}

const CONSTELLATION_EDGES: ConstellationEdge[] = [
  // Group 1: Systems & Build
  { from: "fitness", to: "discipline", group: 1 },
  { from: "discipline", to: "pro-mix", group: 1 },
  { from: "civil-eng", to: "systems-thinking", group: 1 },
  { from: "systems-thinking", to: "soil-pipeline", group: 1 },
  { from: "systems-thinking", to: "strain-telemetry", group: 1 },
  { from: "strain-telemetry", to: "discipline", group: 1 },

  // Group 2: Adventure & Story
  { from: "motorcycles", to: "meteor-650", group: 2 },
  { from: "meteor-650", to: "rann-of-kutch", group: 2 },
  { from: "rann-of-kutch", to: "cinematography", group: 2 },
  { from: "cinematography", to: "motorcycles", group: 2 }
];

export function InteractiveParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useOS();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseVx: number;
      baseVy: number;
      size: number;
    }> = [];

    const mouse = {
      x: -1000,
      y: -1000,
      active: false
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      particles = [];
      const count = theme.particleCount;
      for (let i = 0; i < count; i++) {
        const baseVx = (Math.random() - 0.5) * 1.5;
        const baseVy = (Math.random() - 0.5) * 1.5;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: baseVx,
          vy: baseVy,
          baseVx: baseVx,
          baseVy: baseVy,
          size: Math.random() * 2.2 + 0.8
        });
      }
    };

    initParticles();
    window.addEventListener("resize", initParticles);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();
      const forceRadius = 180;
      const borderThickness = 30;

      // ── Calculate Constellation Node Positions and Hover States ──
      const nodesWithPos = CONSTELLATION_NODES.map((node) => {
        const baseX = canvas.width * node.pctX;
        const baseY = canvas.height * node.pctY;
        
        // Float drift offset
        const driftX = Math.sin(time / 1500 + node.phase) * 12;
        const driftY = Math.cos(time / 1800 + node.phase) * 10;
        
        return {
          ...node,
          x: baseX + driftX,
          y: baseY + driftY
        };
      });

      let activeGroup: number | null = null;
      let hoveredNodeId: string | null = null;

      if (mouse.active) {
        for (const node of nodesWithPos) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 55) {
            activeGroup = node.group;
            hoveredNodeId = node.id;
            break;
          }
        }
      }

      // ── 1. Draw Constellation Connection Lines ──
      CONSTELLATION_EDGES.forEach((edge) => {
        const fromNode = nodesWithPos.find((n) => n.id === edge.from);
        const toNode = nodesWithPos.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        const isActive = activeGroup === edge.group;
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        if (isActive) {
          // Highlight connection lines
          ctx.strokeStyle = edge.group === 1 ? "#d4af37" : "#f97316";
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = 1.6;
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.strokeStyle;
        } else {
          // Faint backdrop lines
          ctx.strokeStyle = theme.accent;
          ctx.globalAlpha = 0.04;
          ctx.lineWidth = 0.6;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // ── 2. Move and Update Regular Particles ──
      particles.forEach((p) => {
        let currentVx = p.vx;
        let currentVy = p.vy;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < forceRadius) {
            const pushForce = (forceRadius - dist) * 0.0018;
            currentVx += (dx / dist) * pushForce * 3.5;
            currentVy += (dy / dist) * pushForce * 3.5;
          } else {
            currentVx += (p.baseVx - currentVx) * 0.04;
            currentVy += (p.baseVy - currentVy) * 0.04;
          }
        } else {
          currentVx += (p.baseVx - currentVx) * 0.04;
          currentVy += (p.baseVy - currentVy) * 0.04;
        }

        const speed = Math.sqrt(currentVx * currentVx + currentVy * currentVy);
        const maxSpeed = 3.0;
        if (speed > maxSpeed) {
          currentVx = (currentVx / speed) * maxSpeed;
          currentVy = (currentVy / speed) * maxSpeed;
        }

        p.vx = currentVx;
        p.vy = currentVy;

        p.x += p.vx * theme.particleSpeed;
        p.y += p.vy * theme.particleSpeed;

        if (p.x < 0) p.x = canvas.width;
        else if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        else if (p.y > canvas.height) p.y = 0;

        let isLit = false;
        let boundaryGlow = 0;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const boundaryDist = Math.abs(dist - forceRadius);

          if (boundaryDist < borderThickness) {
            isLit = true;
            boundaryGlow = (borderThickness - boundaryDist) / borderThickness;
          }
        }

        ctx.beginPath();
        if (isLit) {
          ctx.arc(p.x, p.y, p.size * (1.0 + boundaryGlow * 0.6), 0, Math.PI * 2);
          ctx.shadowBlur = 12 * boundaryGlow;
          ctx.shadowColor = theme.accent;
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.9;
        } else {
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.shadowBlur = 0;
          ctx.fillStyle = theme.accent;
          ctx.globalAlpha = 0.35;
        }
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // ── 3. Draw Connections Between Nearby Regular Particles ──
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 95) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = theme.accent;
            ctx.globalAlpha = ((95 - dist) / 95) * 0.08;
            ctx.lineWidth = 0.4;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // ── 4. Draw Constellation Node Stars ──
      nodesWithPos.forEach((node) => {
        const isGroupActive = activeGroup === node.group;
        const isNodeHovered = hoveredNodeId === node.id;

        ctx.beginPath();
        
        if (isGroupActive) {
          ctx.arc(node.x, node.y, isNodeHovered ? 5.5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = isNodeHovered ? 16 : 8;
          ctx.shadowColor = node.group === 1 ? "#d4af37" : "#f97316";
          ctx.globalAlpha = 0.95;
          ctx.fill();
          
          // Outer accent ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, isNodeHovered ? 11 : 8, 0, Math.PI * 2);
          ctx.strokeStyle = node.group === 1 ? "rgba(212, 175, 55, 0.4)" : "rgba(212, 175, 55, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.arc(node.x, node.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = theme.accent;
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.55;
          ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      // ── 5. Draw Sci-Fi HUD Callouts for Active Constellations ──
      if (activeGroup !== null) {
        nodesWithPos.forEach((node) => {
          if (node.group !== activeGroup) return;

          const activeColor = node.group === 1 ? "#d4af37" : "#f97316";
          const isNodeHovered = hoveredNodeId === node.id;

          ctx.font = "9px monospace";
          const categoryText = node.category;
          const labelText = node.label.toUpperCase();
          const fullText = `${categoryText} // ${labelText}`;
          const textWidth = ctx.measureText(fullText).width;

          // Responsive orientation (flip left on the right side of viewport)
          const drawLeft = node.pctX > 0.55;
          const lineDirection = drawLeft ? -1 : 1;
          const startBoxX = drawLeft ? node.x - 40 - textWidth - 8 : node.x + 40;

          // Leader Line
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(node.x + 15 * lineDirection, node.y - 15);
          ctx.lineTo(node.x + 40 * lineDirection, node.y - 15);
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = isNodeHovered ? 0.9 : 0.5;
          ctx.stroke();

          // Label Box background
          ctx.fillStyle = "rgba(8, 9, 11, 0.9)";
          ctx.globalAlpha = 0.85;
          ctx.fillRect(startBoxX, node.y - 25, textWidth + 8, 15);

          // Label Box border
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = isNodeHovered ? 0.9 : 0.4;
          ctx.strokeRect(startBoxX, node.y - 25, textWidth + 8, 15);

          // Accent corner tick mark
          ctx.fillStyle = activeColor;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(drawLeft ? startBoxX + textWidth + 6 : startBoxX, node.y - 25, 2, 2);

          // Write Text
          ctx.fillStyle = isNodeHovered ? "#ffffff" : activeColor;
          ctx.globalAlpha = isNodeHovered ? 1.0 : 0.85;
          ctx.fillText(fullText, startBoxX + 4, node.y - 14);
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initParticles);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-55"
    />
  );
}
