"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { MobileDrawer } from "./MobileDrawer";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "ABOUT", href: "/#about" },
    { label: "SOCIAL", href: "/#social" },
    { label: "UPCOMING EVENTS", href: "/#events" },
    { label: "PAST EVENTS", href: "/#past-events" },
    { label: "VIDEOS", href: "/#videos" },
    { label: "GALLERY", href: "/#gallery" },
    { label: "BLOGS", href: "/#blogs" },
    { label: "REVIEWS", href: "/#reviews" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          isScrolled
            ? "bg-[#0B0C10]/95 backdrop-blur-2xl border-b border-white/[0.1] shadow-[0_10px_35px_rgba(0,0,0,0.85)] py-3 sm:py-3.5"
            : "bg-[#0B0C10]/80 backdrop-blur-xl border-b border-white/[0.06] py-4 sm:py-5"
        }`}
      >
        <div className="max-w-[1480px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          {/* 1. Left: Brand Logo (Flex-shrink-0 to guarantee clean space) */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="group flex items-center py-0.5">
              <img
                src="/images/DJ-G-SPARK-Light.png"
                alt="DJ G SPARK"
                className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_2px_14px_rgba(245,246,250,0.35)] hover:drop-shadow-[0_0_22px_rgba(0,229,255,0.6)] ${
                  isScrolled
                    ? "h-9 sm:h-10 lg:h-11"
                    : "h-10 sm:h-11 lg:h-12 xl:h-13"
                }`}
              />
            </Link>
          </div>

          {/* 2. Center: Desktop Navigation (Flex-1 and centered naturally — NEVER overlaps) */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-5 xl:gap-7 2xl:gap-9 px-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[11px] xl:text-xs tracking-[0.16em] uppercase font-medium whitespace-nowrap transition-all relative py-1.5 ${
                    isActive
                      ? "text-[#00E5FF] font-bold"
                      : "text-[#8A8D93] hover:text-[#F5F6FA]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] shadow-[0_0_12px_#00E5FF] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Header CTA & Actions (Flex-shrink-0) */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <Link
              href="/booking"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#0B0C10] font-heading font-black text-xs tracking-[0.14em] uppercase shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.75)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              BOOK DJ G SPARK
            </Link>
          </div>

          {/* Mobile & Tablet Hamburger Toggle (< lg) */}
          <div className="flex lg:hidden items-center gap-3">
            <Link
              href="/booking"
              className="hidden sm:inline-flex px-4 py-1.5 rounded-full bg-[#00E5FF] text-[#0B0C10] font-black text-[10px] tracking-[0.14em] uppercase"
            >
              BOOK
            </Link>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#F5F6FA] hover:text-[#00E5FF] transition-colors py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-full"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4 text-[#00E5FF]" />
              <span className="font-mono text-[11px]">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        links={navLinks}
      />
    </>
  );
}