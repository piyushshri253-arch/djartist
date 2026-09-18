"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  return (
    <footer className="relative bg-[#08080b] border-t border-white/10 pt-20 pb-12 z-20 overflow-hidden">
      {/* Background Subtle Amber Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[160px] bg-gradient-to-b from-[#FF6A00]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        {/* Top Call to Action Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-16 border-b border-white/10 gap-8">
          <div>
            <span className="text-xs font-semibold tracking-[0.24em] text-[#FF8400] uppercase block mb-2">
              WORLD TOUR 2026
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F4F1EA]">
              FEEL THE SPARK. <span className="text-[#FF6A00]">ENTER THE SOUND.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black font-bold text-xs tracking-[0.14em] uppercase hover:shadow-spark transition-all duration-300"
            >
              Book DJ G Spark
            </Link>
            <Link
              href="/events"
              className="px-8 py-3.5 rounded-full border border-white/20 text-[#F4F1EA] font-bold text-xs tracking-[0.14em] uppercase hover:border-[#FF6A00] hover:text-[#FF8400] transition-all duration-300"
            >
              Tour Dates
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
                alt="DJ G SPARK"
                className="h-14 sm:h-18 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:drop-shadow-[0_0_28px_rgba(255,106,0,0.5)]"
              />
            </Link>
            <p className="text-sm text-[#969696] leading-relaxed">
              International electronic music producer and arena headliner delivering high-octane 360-degree holographic concert experiences.
            </p>
            <div className="flex items-center gap-4 pt-2 text-[#969696]">
              <a
                href="https://www.facebook.com/share/1BxXiXLitH/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F4F1EA]/80 hover:text-[#FF8400] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/djgspark"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F4F1EA]/80 hover:text-[#FF8400] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@djg-spark"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F4F1EA]/80 hover:text-[#FF8400] transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.18em] text-[#F4F1EA] uppercase mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs tracking-[0.1em] text-[#969696]">
              <li><Link href="/" className="hover:text-white transition-colors">3D VIRTUAL TOUR</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">UPCOMING TOUR 2026</Link></li>
              <li><Link href="/past-events" className="hover:text-white transition-colors">CONCERT ARCHIVES</Link></li>
              <li><Link href="/music" className="hover:text-white transition-colors">DISCOGRAPHY & STEMS</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">STUDIO CHRONICLES</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">BIOGRAPHY & RIDER</Link></li>
            </ul>
          </div>

          {/* Col 3: Tour Cities */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.18em] text-[#F4F1EA] uppercase mb-4">
              Tour Destinations
            </h4>
            <ul className="space-y-2.5 text-xs tracking-[0.1em] text-[#969696]">
              <li><Link href="/events/delhi-live-set-2026" className="hover:text-white transition-colors">NEW DELHI • JLN STADIUM</Link></li>
              <li><Link href="/events/mumbai-dome-live-2026" className="hover:text-white transition-colors">MUMBAI • NSCI DOME</Link></li>
              <li><Link href="/events/goa-sunburn-nye-2026" className="hover:text-white transition-colors">GOA • VAGATOR MAINSTAGE</Link></li>
              <li><Link href="/events/dubai-arena-experience-2026" className="hover:text-white transition-colors">DUBAI • COCA-COLA ARENA</Link></li>
              <li><Link href="/events/tokyo-shibuya-sound-2026" className="hover:text-white transition-colors">TOKYO • WOMB STAGE</Link></li>
            </ul>
          </div>

          {/* Col 4: Representation & Press */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.18em] text-[#F4F1EA] uppercase mb-4">
              Representation
            </h4>
            <div className="space-y-3 text-xs text-[#969696]">
              <p><strong className="text-white">Management:</strong> Redline Global Talent / Armada</p>
              <p><strong className="text-white">Booking:</strong> booking@djgspark.com</p>
              <p><strong className="text-white">Press:</strong> press@djgspark.com</p>
              <p><strong className="text-white">Sync:</strong> licensing@djgspark.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-[#969696] gap-4">
          <p>© 2026 DJ G SPARK. All Rights Reserved. Engineered for Ultra-High Fidelity.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">Technical Rider</Link>
            <span>•</span>
            <Link href="/booking" className="hover:text-white transition-colors">Booking Offer</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors">Press Inquiries</Link>
            <span>•</span>
            <Link href="/admin/login" className="text-[#FF6A00] hover:text-white transition-colors font-mono tracking-wider font-semibold">⚡ ADMIN PORTAL</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}