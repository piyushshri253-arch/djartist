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
    { label: "PAST EVENTS", href: "/past-events" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 w-full max-w-[320px] h-full bg-[#0b0b0e] border-l border-white/10 p-6 flex flex-col justify-between z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <Link href="/" onClick={onClose} className="inline-block py-1">
              <img
                src="/images/DJ-G-SPARK-Light.png"
                alt="DJ G SPARK"
                className="h-11 sm:h-12 w-auto object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.4)]"
              />
            </Link>
            <button
              onClick={onClose}
              className="p-1 text-[#969696] hover:text-white transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links List */}
          <nav className="flex flex-col gap-4 mt-8">
            {[...links, ...extraLinks].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className={`text-sm tracking-[0.16em] font-medium transition-colors py-2 flex items-center justify-between ${
                    isActive ? "text-[#FF8400]" : "text-[#F4F1EA]/80 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <Link
              href="/booking"
              onClick={onClose}
              className="block w-full py-3 text-center rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black font-semibold text-xs tracking-[0.14em] uppercase"
            >
              Book DJ G Spark
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10">
          <p className="text-[11px] tracking-[0.2em] text-[#969696] uppercase mb-4">
            FEEL THE SPARK. ENTER THE SOUND.
          </p>
          <div className="flex items-center gap-4 text-[#969696]">
            <a
              href="https://www.facebook.com/share/1BxXiXLitH/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF8400] transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/djgspark"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF8400] transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com/@djg-spark"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF8400] transition-colors"
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