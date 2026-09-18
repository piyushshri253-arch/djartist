"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Download, Award, Music, Globe, CheckCircle } from "lucide-react";

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
        <span className="text-xs font-bold tracking-[0.24em] text-[#FF8400] uppercase block mb-3">
          ARTIST BIOGRAPHY & TECH RIDER
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
          THE ARCHITECT OF <span className="text-[#FF6A00]">SOUND</span>
        </h1>
        <p className="text-sm sm:text-base text-[#969696] leading-relaxed">
          DJ G SPARK is an international electronic music phenomenon, blending cinematic grandeur, hypnotic melodic techno, and relentless stadium basslines.
        </p>
      </div>

      {/* Narrative & Photo Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-ambient group">
          <img
            src="/images/dj_hero.jpg"
            alt="DJ G SPARK"
            className="w-full h-[540px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#FF8400] block">RANKED #14</span>
              <span className="text-xs text-[#969696]">Top 100 Global Electronic Innovators</span>
            </div>
            <Award className="w-6 h-6 text-[#FF8400]" />
          </div>
        </div>

        <div className="space-y-6">
          <span className="text-xs font-bold tracking-[0.2em] text-[#FF8400] uppercase block">
            ORIGINS & ARTISTIC VISION
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Forged In The Underground, Master Of The Stadium
          </h2>
          <p className="text-base text-[#d0d0d8] leading-relaxed">
            Hailing from New Delhi and commanding festival mainstages across Europe, Asia, and the Americas, <strong>DJ G SPARK</strong> has redefined what a modern electronic live performance can be.
          </p>
          <p className="text-sm text-[#969696] leading-relaxed">
            Rather than relying on generic club formulas, G Spark approaches every performance as an architectural installation. Each set is a calibrated emotional trajectory, constructed live using custom analog synthesizers, tactile rotary mixers, and responsive 360-degree LED visual scapes.
          </p>
          <p className="text-sm text-[#969696] leading-relaxed">
            With over 180 million global streams, headline appearances at Tomorrowland, Sunburn, and Ultra, and support from titans like Tale of Us, Eric Prydz, and Martin Garrix, G Spark continues to push electronic music into uncharted cinematic territories.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white font-sans block">180M+</span>
              <span className="text-[10px] tracking-widest text-[#969696] uppercase">Streams</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white font-sans block">42</span>
              <span className="text-[10px] tracking-widest text-[#969696] uppercase">Countries</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white font-sans block">#14</span>
              <span className="text-[10px] tracking-widest text-[#969696] uppercase">DJ Mag Top 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="mb-24">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-[#FF8400] uppercase block mb-2">
            CAREER MILESTONES
          </span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            THE EVOLUTIONARY TRAJECTORY
          </h3>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          {[
            { year: "2018", title: "Underground Genesis", desc: "Pioneered underground warehouse raves in industrial Delhi with analog melodic techno." },
            { year: "2021", title: "Global Breakthrough Single", desc: "Signed to Armada Music with debut anthem 'Velocity 9' (30M+ streams, BBC Radio 1 rotation)." },
            { year: "2023", title: "First Arena World Tour", desc: "Sold out 14 arena dates across Dubai, London, Amsterdam, and Tokyo with the custom Spark Genesis gantry." },
            { year: "2024", title: "Tomorrowland Mainstage", desc: "Delivered sunset prime-time set for 70,000 festival-goers in Boom, Belgium." },
            { year: "2025", title: "DJ Mag Top 100 #14", desc: "Recognized as one of electronic music's most influential live innovators; headlined Sunburn Goa to 55,000 fans." },
            { year: "2026", title: "The Spark Theory Era", desc: "Launch of sophomore LP Spark Theory and the 360-degree holographic stadium world tour." },
          ].map((item, i) => (
            <div
              key={item.year}
              className="glass-card p-6 rounded-2xl border border-white/10 flex items-start gap-6"
            >
              <span className="font-mono text-xl font-bold text-[#FF6A00] min-w-[60px]">
                {item.year}
              </span>
              <div>
                <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-[#969696] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Rider Specification */}
      <div className="mb-24">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-[0.2em] text-[#FF8400] uppercase block mb-2">
            PRODUCTION SPECIFICATIONS
          </span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            OFFICIAL TECHNICAL RIDER
          </h3>
          <p className="text-xs text-[#969696] mt-2">
            Mandatory promoter specifications for festival & arena touring dates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              category: "DJ Console Setup",
              items: [
                "4x Pioneer CDJ-3000 Turntables (Latest firmware, LAN link)",
                "1x Pioneer DJM-V10 6-Channel Mixer or Allen & Heath Xone:96",
                "2x Genelec 8351B or d&b M2 Stereo Booth Monitors",
                "Isolated grounded power supply with zero hum",
              ],
            },
            {
              category: "Front of House (FOH) Audio",
              items: [
                "L-Acoustics K1/K2 or d&b audiotechnik GSL Line Array",
                "End-fire cardioid sub array delivering 28Hz - 80Hz",
                "Minimum SPL capability: 110 dBA continuous / 125 dBA peak",
                "Dedicated FOH sound engineer provided by touring team",
              ],
            },
            {
              category: "Visual & Laser Sync",
              items: [
                "SMPTE LTC XLR feed + Art-Net / OSC Cat6 network line",
                "Curved LED pitch: min P3.9 outdoor or P2.6 indoor",
                "Minimum 12x cryogenic CO2 jet cannons with DMX triggers",
                "Licensed technicians for Class IV 40W RGB laser rigs",
              ],
            },
            {
              category: "Hospitality & Security",
              items: [
                "Private, climate-controlled green room with en-suite restroom",
                "Dedicated artist liaison & 24/7 backstage security perimeter",
                "Airport VIP tarmac meet & greet and executive transport",
                "Organic catering, electrolyte waters, fresh fruit",
              ],
            },
          ].map((sec) => (
            <div key={sec.category} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-base font-bold text-white uppercase tracking-wider">
                {sec.category}
              </h4>
              <ul className="space-y-2 text-xs text-[#969696]">
                {sec.items.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#FF6A00] flex-shrink-0 mt-0.5" />
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
        <div className="w-16 h-16 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00] flex items-center justify-center text-[#FF6A00] shadow-spark">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Official Electronic Press Kit (EPK)
          </h3>
          <p className="text-xs sm:text-sm text-[#969696] max-w-md">
            Download high-resolution stage photos, vector artist logos, biography one-sheet PDF, and the complete technical rider packet.
          </p>
        </div>
        <button
          onClick={handleDownloadEPK}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black font-bold text-xs tracking-wider uppercase hover:shadow-spark transition-all"
        >
          Download Press Kit (142MB ZIP)
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