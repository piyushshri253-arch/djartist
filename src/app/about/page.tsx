"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Sparkles, CheckCircle, Flame } from "lucide-react";

export default function AboutPage() {
  const [downloadToast, setDownloadToast] = useState(false);

  const handleDownloadEPK = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3500);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ARTIST PROFILE // ORIGINS & SOUND</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight uppercase mb-4">
          BEHIND THE BEATS <br className="hidden sm:block" />
          <span className="text-[#00E5FF]">Dj G-spark</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed max-w-2xl mx-auto">
          Dj G-spark is a dynamic and high-energy DJ known for bringing explosive beats and seamless transitions to the dance floor.
        </p>
      </div>

      {/* Narrative & Photo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
        {/* Left: Artist Photo with glowing rim */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,229,255,0.18)] bg-black/60">
            <Image
              src="/images/gallery_eep09781.jpg"
              alt="Dj G-spark Live Portrait"
              fill
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent opacity-80" />
          </div>

          {/* Floating Stat Card */}
          <div className="absolute -bottom-6 -right-4 sm:right-6 px-6 py-4 rounded-xl bg-[#1F2833]/95 border border-[#00E5FF]/40 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase block">
              OFFICIAL ARTIST
            </span>
            <span className="font-heading font-black text-xl sm:text-2xl text-white">
              Dj G-spark
            </span>
          </div>
        </div>

        {/* Right: Biography & Accolades */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-[#00B4D8] uppercase">
            <Flame className="w-4 h-4 text-[#00E5FF]" />
            <span>DELHI-BASED OPEN-FORMAT DJ & MUSIC PRODUCER</span>
          </div>

          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white">
            Behind the beats<br />
            <span className="text-[#00E5FF]">Dj G-spark</span>
          </h2>

          <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
            Dj G-spark is a dynamic and high-energy DJ known for bringing explosive beats and seamless transitions to the dance floor.
          </p>

          <p className="text-sm sm:text-base text-[#929292] leading-relaxed">
            Dj G-spark (Gaurav Singh) is a popular Delhi-based open-format DJ and music producer widely recognized for his high-energy performances at weddings, corporate gigs, and large-scale parties across India. Specialising in vibrant, non-stop dance mixes, he seamlessly blends multiple genres to keep the dance floor packed.
          </p>

          {/* Key Details & Expertise */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <h3 className="font-heading font-black text-xl sm:text-2xl tracking-[-0.02em] uppercase text-white">
              Key Details & Expertise
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="text-[#CCCCCC]">
                <strong className="text-[#00E5FF]">Genres: </strong>
                Bollywood, Punjabi/Bhangra, Commercial, Retro, Electronic Dance Music (EDM), Bollytech, Bollyafro, Melodic Techno.
              </li>
              <li className="text-[#CCCCCC]">
                <strong className="text-[#00E5FF]">Specialities: </strong>
                Sangeet ceremonies, cocktail parties, wedding receptions, destination weddings, and concerts.
              </li>
              <li className="text-[#CCCCCC]">
                <strong className="text-[#00E5FF]">Performance Style: </strong>
                High-energy open-format mixing tailored closely to the crowd’s vibe and personal preferences.
              </li>
            </ul>
          </div>

          {/* Sonic Philosophy Callout */}
          <blockquote className="p-5 sm:p-6 rounded-lg bg-[#0c0c10] border-l-4 border-[#00E5FF]">
            <p className="text-sm sm:text-base italic text-[#F5F6FA] font-medium leading-relaxed">
              &quot;Music is not just heard — it is felt. When the drop hits at 128 BPM, forty thousand strangers breathe as one unified frequency. That is the spark.&quot;
            </p>
            <cite className="block text-xs font-mono tracking-[0.2em] text-[#00B4D8] uppercase mt-3 not-italic">
              — Dj G-spark
            </cite>
          </blockquote>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/booking"
              className="px-7 py-3.5 rounded bg-[#00E5FF] text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              BOOK Dj G-spark
            </Link>
            <button
              onClick={handleDownloadEPK}
              className="px-7 py-3.5 rounded border border-white/20 hover:border-[#00E5FF] text-white hover:text-[#00E5FF] font-heading font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              PRESS KIT & TECH RIDER
            </button>
          </div>
        </div>
      </div>

      {/* Technical Rider Specification */}
      <div className="mb-24">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-[#00B4D8] uppercase block mb-2">
            PRODUCTION SPECIFICATIONS
          </span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            OFFICIAL TECHNICAL RIDER
          </h3>
          <p className="text-xs text-[#8A8D93] mt-2">
            Mandatory promoter specifications for weddings, corporate galas & concerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              category: "DJ Console Setup",
              items: [
                "Pioneer CDJ-3000 / CDJ-2000NXS2 Turntables",
                "Pioneer DJM-900NXS2 or DJM-V10 Mixer",
                "High-performance stereo booth monitors with dedicated gain control",
                "Isolated grounded power supply with surge protection",
              ],
            },
            {
              category: "Front of House (FOH) Audio",
              items: [
                "Pro Line Array / Concert PA system matching venue capacity",
                "High-output subwoofers tuned for punchy bass & clear highs",
                "Balanced wireless microphone system (Shure / Sennheiser)",
                "On-site sound technician for soundcheck & live support",
              ],
            },
            {
              category: "Lighting & Visuals",
              items: [
                "DMX-controlled intelligent moving heads & wash lights",
                "LED video wall display with visual synchronization",
                "Haze / Geyser fog machine (subject to venue permissions)",
                "Stage spot lighting focused on the DJ console",
              ],
            },
            {
              category: "Hospitality & Venue Support",
              items: [
                "Dedicated green room or changing area before showtime",
                "Stage / console setup ready at least 90 minutes prior to event start",
                "Refreshments, mineral water, and hospitality arrangements",
                "Secure backstage or console perimeter",
              ],
            },
          ].map((sec) => (
            <div key={sec.category} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-base font-bold text-white uppercase tracking-wider">
                {sec.category}
              </h4>
              <ul className="space-y-2 text-xs text-[#8A8D93]">
                {sec.items.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Press Kit Download Box */}
      <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/10 text-center max-w-3xl mx-auto flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF] shadow-spark">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Official Electronic Press Kit (EPK)
          </h3>
          <p className="text-xs sm:text-sm text-[#8A8D93] max-w-md">
            Download high-resolution stage photos, vector artist logos, biography one-sheet PDF, and the complete technical rider packet.
          </p>
        </div>
        <button
          onClick={handleDownloadEPK}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-bold text-xs tracking-wider uppercase hover:shadow-spark transition-all"
        >
          Download Press Kit (ZIP)
        </button>
      </div>

      {downloadToast && (
        <div className="fixed bottom-24 right-6 z-50 p-4 rounded-xl bg-[#0f0f14] border border-[#00FF88] text-white shadow-spark flex items-center gap-3 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
          <span>Official EPK ZIP archive download initiated.</span>
        </div>
      )}
    </main>
  );
}