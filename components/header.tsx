"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Cinzel } from "next/font/google";


const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"] });


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
  const accentColor = isPersonal ? "text-[#d4af37]" : "text-attention-400";
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
                <span className={`font-mono text-xl tracking-widest uppercase text-attention drop-shadow-[0_0_10px_rgba(212, 175, 55, 0.3)]`}>
                  SAUMYA
                </span>
              </div>
            ) : (
              <h1 className={`${cinzel.className} text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.08em] transition-colors duration-500`}>
                <span className={`${accentColor} transition-colors duration-500`}>S</span>aumya{' '}
                <span className={`${accentColor} transition-colors duration-500`}>P</span>arekh
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
                  ? "text-[#d4af37] border-[#d4af37]" 
                  : "text-attention-400 border-attention-400";
              const linkHoverStyle = isPersonal 
                  ? "hover:text-[#d4af37]" 
                  : "hover:text-attention-400";

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

              const linkActiveStyle = isPersonal ? "text-[#d4af37]" : "text-attention-400";

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
