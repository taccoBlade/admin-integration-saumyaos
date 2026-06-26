"use client";

import { useEffect, useRef, useState } from "react";

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

const SPOTLIGHT_R = 260;

export function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Build radial gradient at (cursorX, cursorY) from 0 to SPOTLIGHT_R
    const grad = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,1)");
    grad.addColorStop(0.6, "rgba(212, 175, 55, 0.75)");
    grad.addColorStop(0.75, "rgba(212, 175, 55, 0.4)");
    grad.addColorStop(0.88, "rgba(212, 175, 55, 0.12)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    // Fill arc of radius SPOTLIGHT_R
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    // Export as Data URL
    try {
      const url = canvas.toDataURL();
      setMaskUrl(url);
    } catch (e) {
      console.error("Canvas toDataURL failed", e);
    }
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: "none" }}
      />
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          maskImage: maskUrl ? `url(${maskUrl})` : "none",
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : "none",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
    </>
  );
}
