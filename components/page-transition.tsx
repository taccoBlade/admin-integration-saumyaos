"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Stair-reveal columns overlay */}
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <div className="h-screen w-screen fixed top-0 left-0 right-0 pointer-events-none z-[200] flex">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`stair-${pathname}-${i}`}
                className="h-full w-full bg-cyan-950"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{
                  duration: 0.4,
                  ease: [0.76, 0, 0.24, 1],
                  delay: i * 0.04,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Solid background flash */}
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key={`bg-${pathname}`}
            className="h-screen w-screen fixed bg-[#08090b] pointer-events-none top-0 z-[190]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        )}
      </AnimatePresence>

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

      {/* Page content */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
}
