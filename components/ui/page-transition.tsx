"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Ambient light beams (decorative) */}
      <div className="max-w-full overflow-hidden pointer-events-none fixed inset-0 h-full w-full z-[1]">
        {/* Left beam */}
        <div className="absolute top-0 left-0 w-screen h-screen pointer-events-none">
          <div
            className="absolute top-0 left-0"
            style={{
              transform: "translateY(-350px) rotate(-45deg)",
              background:
                "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(185, 100%, 85%, .06) 0, hsla(185, 100%, 55%, .02) 50%, hsla(185, 100%, 45%, 0) 80%)",
              width: "560px",
              height: "1380px",
            }}
          />
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              transform: "rotate(-45deg) translate(5%, -50%)",
              background:
                "radial-gradient(50% 50% at 50% 50%, hsla(185, 100%, 85%, .04) 0, hsla(185, 100%, 55%, .02) 80%, transparent 100%)",
              width: "240px",
              height: "1380px",
            }}
          />
        </div>
        {/* Right beam */}
        <div className="absolute top-0 right-0 w-screen h-screen pointer-events-none">
          <div
            className="absolute top-0 right-0"
            style={{
              transform: "translateY(-350px) rotate(45deg)",
              background:
                "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(185, 100%, 85%, .06) 0, hsla(185, 100%, 55%, .02) 50%, hsla(185, 100%, 45%, 0) 80%)",
              width: "560px",
              height: "1380px",
            }}
          />
          <div
            className="absolute top-0 right-0 origin-top-right"
            style={{
              transform: "rotate(45deg) translate(-5%, -50%)",
              background:
                "radial-gradient(50% 50% at 50% 50%, hsla(185, 100%, 85%, .04) 0, hsla(185, 100%, 55%, .02) 80%, transparent 100%)",
              width: "240px",
              height: "1380px",
            }}
          />
        </div>
      </div>

      {/* Page content — spring-driven fade + lift on route change */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes page-glitch {
          0% {
            clip-path: inset(35% 0 40% 0);
            transform: skewX(4deg) translateX(-4px);
            opacity: 0.8;
          }
          15% {
            clip-path: inset(80% 0 5% 0);
            transform: skewX(-3deg) translateX(3px);
            opacity: 0.95;
          }
          30% {
            clip-path: inset(5% 0 85% 0);
            transform: skewX(2deg) translateX(-2px);
            opacity: 0.9;
          }
          45% {
            clip-path: inset(60% 0 25% 0);
            transform: skewX(-1deg) translateX(1px);
            opacity: 0.97;
          }
          60% {
            clip-path: inset(0 0 0 0);
            transform: skewX(0deg) translateX(0);
            opacity: 1;
          }
        }
        .animate-page-glitch {
          animation: page-glitch 0.2s steps(5) forwards;
        }
      `}} />

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          ease: "easeOut"
        }}
        className="animate-page-glitch"
      >
        {children}
      </motion.div>

    </>
  );
}
