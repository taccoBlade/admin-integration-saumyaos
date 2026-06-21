"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Professional", href: "/" },
  { label: "Personal", href: "/personal" },
  { label: "Archive", href: "/archive" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === "/lithos") return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] py-4 xl:py-5 text-white bg-[#08090b]/45 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo / Name */}
          <Link href="/" className="z-[110]">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Saumya Parekh
              <span className="text-cyan-400">.</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`capitalize font-medium transition-all ${
                    isActive
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-white/80 hover:text-cyan-400"
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
            className="xl:hidden text-cyan-400 z-[110] p-2"
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
            className="xl:hidden fixed inset-0 z-[95] bg-[#08090b]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-semibold capitalize transition-all ${
                    isActive
                      ? "text-cyan-400"
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
