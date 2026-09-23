"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/SocialIcons";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
}

export function MobileDrawer({ isOpen, onClose, links }: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const extraLinks = [
    { label: "BOOKING", href: "/booking" },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 w-full max-w-[320px] h-full bg-[#141620] border-l border-white/10 p-6 flex flex-col justify-between z-10 shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <Link href="/" onClick={onClose} className="inline-block py-1">
              <img
                src="/images/DJ-G-SPARK-Light.png"
                alt="Dj G-Spark"
                className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_18px_rgba(245,246,250,0.4)]"
              />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links List */}
          <nav className="flex flex-col gap-2.5 mt-6">
            {[...links, ...extraLinks].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className={`text-sm tracking-[0.16em] uppercase font-bold transition-all py-2.5 px-3 rounded-lg flex items-center justify-between ${
                    isActive
                      ? "text-[#00E5FF] bg-white/[0.08]"
                      : "text-white hover:text-[#00E5FF] hover:bg-white/[0.05]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <Link
              href="/booking"
              onClick={onClose}
              className="block w-full py-3 text-center rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#0B0C10] font-black text-xs tracking-[0.14em] uppercase shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              Book Dj G-Spark
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-[11px] tracking-[0.2em] text-white/60 font-mono uppercase mb-4">
            Dj G-Spark • Official Platform
          </p>
          <div className="flex items-center gap-4 text-[#8A8D93]">
            <a
              href="https://www.facebook.com/share/1BxXiXLitH/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00E5FF] transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/djgspark"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00E5FF] transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com/@djg-spark"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00E5FF] transition-colors"
              aria-label="YouTube"
            >
              <YouTubeIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}