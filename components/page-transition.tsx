"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { springFluid } from "@/lib/motion";

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
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(2px)" }}
          transition={{
            ...springFluid,
            delay: 0.05,
            filter: { duration: 0.3, ease: "easeOut" },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
