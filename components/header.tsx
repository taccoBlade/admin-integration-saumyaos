"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Cinzel } from "next/font/google";
import localFont from "next/font/local";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });

const batmanFont = localFont({
  src: "../app/fonts/batmfa__.ttf"
});

const navItems = [
  { label: "Professional", href: "/" },
  { label: "Terminal Vault", href: "/projects/terminal-vault" },
  { label: "Personal", href: "/personal" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === "/lithos") return null;

  const isPersonal = pathname === "/personal" || pathname.startsWith("/personal/");
  const accentColor = isPersonal ? "text-[#eab308]" : "text-cyan-400";
  const headerBg = isPersonal ? "bg-[#050505]/45" : "bg-[#08090b]/45";
  const mobileMenuBg = isPersonal ? "bg-[#050505]/98" : "bg-[#08090b]/98";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] py-4 xl:py-5 text-white ${headerBg} backdrop-blur-md border-b border-white/5 transition-colors duration-500`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo / Name */}
          <Link href="/" className="z-[110]">
            {isPersonal ? (
              <div className="relative group px-2 py-1 flex items-center justify-start h-10 select-none">
                <span className={`${batmanFont.className} text-xl tracking-widest text-[#eab308] drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]`}>
                  SAUMYA
                </span>
                {/* Upside Down Hanging Bat */}
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0 V6" stroke="#eab308" strokeWidth="1.2" />
                    <path d="M6 6 C6 6, 2 12, 4 24 C5 28, 9 32, 12 32 C15 32, 19 28, 20 24 C22 12, 18 6, 18 6 Z" fill="#121214" stroke="#2c2c30" strokeWidth="1" />
                    <path d="M6 7 C8 13, 10 19, 11 29" stroke="#2c2c30" strokeWidth="0.8" />
                    <path d="M18 7 C16 13, 14 19, 13 29" stroke="#2c2c30" strokeWidth="0.8" />
                    <path d="M9.5 32 L8 35 L11 33.5 Z" fill="#121214" stroke="#2c2c30" strokeWidth="0.5" />
                    <path d="M14.5 32 L16 35 L13 33.5 Z" fill="#121214" stroke="#2c2c30" strokeWidth="0.5" />
                    <circle cx="10" cy="30" r="0.75" fill="#ef4444" />
                    <circle cx="14" cy="30" r="0.75" fill="#ef4444" />
                  </svg>
                  {/* Glowing Red Eyes */}
                  <span className="absolute w-[3px] h-[3px] rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.9)] animate-pulse" style={{ top: '29px', left: '8.5px' }} />
                  <span className="absolute w-[3px] h-[3px] rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.9)] animate-pulse" style={{ top: '29px', left: '12.5px' }} />
                </div>
              </div>
            ) : (
              <h1 className={`${cinzel.className} text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.08em] uppercase transition-colors duration-500`}>
                Saumya Parekh
                <span className={`${accentColor} transition-colors duration-500`}>.</span>
              </h1>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const linkActiveStyle = isPersonal 
                  ? "text-[#eab308] border-[#eab308]" 
                  : "text-cyan-400 border-cyan-400";
              const linkHoverStyle = isPersonal 
                  ? "hover:text-[#eab308]" 
                  : "hover:text-cyan-400";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`capitalize font-medium transition-all ${
                    isActive
                      ? `${linkActiveStyle} border-b-2`
                      : `text-white/80 ${linkHoverStyle}`
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`xl:hidden ${accentColor} z-[110] p-2 transition-colors duration-500`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`xl:hidden fixed inset-0 z-[95] ${mobileMenuBg} backdrop-blur-xl flex flex-col items-center justify-center gap-8`}
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const linkActiveStyle = isPersonal ? "text-[#eab308]" : "text-cyan-400";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-semibold capitalize transition-all ${
                    isActive
                      ? linkActiveStyle
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
