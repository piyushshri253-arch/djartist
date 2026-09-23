"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, X as CloseIcon } from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  const [showTechRiderPhoto, setShowTechRiderPhoto] = useState(false);
  return (
    <footer className="relative bg-[#0B0C10] border-t border-white/10 pt-20 pb-12 z-20 overflow-hidden">
      {/* Background Subtle Neon Cyan Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[160px] bg-gradient-to-b from-[#00E5FF]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        {/* Top Call to Action Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-16 border-b border-white/10 gap-8">
          <div>
            {/* <span className="text-xs font-semibold tracking-[0.24em] text-[#00E5FF] uppercase block mb-2">
              WORLD TOUR 2026
            </span> */}
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F6FA]">
              Dj G-Spark <span className="text-[#00E5FF]">One Of The Best DJ From Delhi (INDIA)</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#0B0C10] font-black text-xs tracking-[0.14em] uppercase shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.7)] transition-all duration-300"
            >
              Book Dj G-Spark
            </Link>
            <Link
              href="/events"
              className="px-8 py-3.5 rounded-full border border-white/20 text-[#F5F6FA] font-bold text-xs tracking-[0.14em] uppercase hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all duration-300"
            >
              Events Dates
            </Link>
          </div>
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16 border-b border-white/10">
          {/* Col 1: Identity */}
          <div className="space-y-5">
            <Link href="/" className="inline-block group py-1">
              <img
                src="/images/DJ-G-SPARK-Light.png"
                alt="Dj G-Spark"
                className="h-14 sm:h-18 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_24px_rgba(245,246,250,0.35)] hover:drop-shadow-[0_0_28px_rgba(0,229,255,0.5)]"
              />
            </Link>
            <p className="text-sm text-[#8A8D93] leading-relaxed">
              One of the best DJ from delhi....
Dj G-Spark, A dj who is best in multi-genres like Bollywood, Punjabi, Commercial, Retro, Edm, etc....
            </p>
            <div className="flex items-center gap-4 pt-2 text-[#8A8D93]">
              <a
                href="mailto:djgspark98@gmail.com"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F5F6FA]/80 hover:text-[#00E5FF] transition-colors"
                aria-label="Email Dj G-Spark"
                title="Email: djgspark98@gmail.com"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1BxXiXLitH/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F5F6FA]/80 hover:text-[#00E5FF] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/djgspark"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F5F6FA]/80 hover:text-[#00E5FF] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@djg-spark"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F5F6FA]/80 hover:text-[#00E5FF] transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.18em] text-[#F5F6FA] uppercase mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs tracking-[0.1em] text-[#8A8D93]">
              <li><Link href="/" className="hover:text-[#F5F6FA] transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-[#F5F6FA] transition-colors">About</Link></li>
              <li><Link href="/events" className="hover:text-[#F5F6FA] transition-colors">Upcoming Events</Link></li>
              <li><Link href="/past-events" className="hover:text-[#F5F6FA] transition-colors">Past Events</Link></li>
              
              <li><Link href="/blog" className="hover:text-[#F5F6FA] transition-colors">blogs</Link></li>
              
            </ul>
          </div>

          {/* Col 3: Tour Cities */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.18em] text-[#F5F6FA] uppercase mb-4">
              Tour Destinations
            </h4>
            <ul className="space-y-2.5 text-xs tracking-[0.1em] text-[#8A8D93]">
              <li><Link href="/events/delhi-live-set-2026" className="hover:text-[#F5F6FA] transition-colors">NEW DELHI • JLN STADIUM</Link></li>
              <li><Link href="/events/mumbai-dome-live-2026" className="hover:text-[#F5F6FA] transition-colors">MUMBAI • NSCI DOME</Link></li>
              <li><Link href="/events/goa-sunburn-nye-2026" className="hover:text-[#F5F6FA] transition-colors">GOA • VAGATOR MAINSTAGE</Link></li>
              <li><Link href="/events/dubai-arena-experience-2026" className="hover:text-[#F5F6FA] transition-colors">DUBAI • COCA-COLA ARENA</Link></li>
              <li><Link href="/events/tokyo-shibuya-sound-2026" className="hover:text-[#F5F6FA] transition-colors">TOKYO • WOMB STAGE</Link></li>
            </ul>
          </div>

          {/* Col 4: Representation & Press */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.18em] text-[#F5F6FA] uppercase mb-4">
              Representation
            </h4>
            <div className="space-y-3 text-xs text-[#8A8D93]">
              <p><strong className="text-[#F5F6FA]">Management:</strong> Dj G-Spark Team</p>
              <p><strong className="text-[#F5F6FA]">Booking:</strong> djgspark98@gmail.com</p>
              
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-[#8A8D93] gap-4">
          <p>© 2026 Dj G-Spark. All Rights Reserved. Engineered for Ultra-High Fidelity.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setShowTechRiderPhoto(true)}
              className="hover:text-[#00E5FF] transition-colors cursor-pointer"
            >
              Tech-Rider
            </button>
            <span>•</span>
            <Link href="/booking" className="hover:text-[#F5F6FA] transition-colors">Booking</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#F5F6FA] transition-colors">Press Inquiries</Link>
            <span>•</span>
            <Link href="/admin/login" className="text-[#00E5FF] hover:text-[#F5F6FA] transition-colors font-mono tracking-wider font-semibold">⚡ CLIENT ADMIN</Link>
          </div>
        </div>
      </div>

      {/* Tech Rider Photo Lightbox */}
      {showTechRiderPhoto && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowTechRiderPhoto(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#141620] border border-white/20 rounded-2xl overflow-hidden shadow-2xl p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold tracking-wider text-[#00E5FF] uppercase">
                Dj G-Spark • Official Stage Setup & Tech Rider
              </span>
              <button
                type="button"
                onClick={() => setShowTechRiderPhoto(false)}
                className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                aria-label="Close"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src="/images/dj_performing.jpg"
                alt="Dj G-Spark Stage Setup & Tech Rider"
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}