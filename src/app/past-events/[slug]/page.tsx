"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import rawPastEvents from "@/data/past-events.json";
import { Users, Calendar, MapPin, Music, ArrowLeft, Disc } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { EventReviewSection } from "@/components/events/EventReviewSection";

export default function PastEventSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const initialEvents = rawPastEvents as any[];
  const initialEvent = initialEvents.find((e) => e.slug === slug || e.id === slug) || initialEvents[0];
  const [event, setEvent] = useState<any>(initialEvent);
  const { togglePlay, isPlaying } = useAudio();

  useEffect(() => {
    fetch("/api/past-events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const match = data.find((e: any) => e.slug === slug || e.id === slug);
          if (match) {
            setEvent(match);
            return;
          }
        }
        // Fallback to all events
        return fetch("/api/events?type=all", { cache: "no-store" })
          .then((r) => r.json())
          .then((allData) => {
            if (Array.isArray(allData)) {
              const match = allData.find((e: any) => e.slug === slug || e.id === slug);
              if (match) setEvent(match);
            }
          });
      })
      .catch(() => {});
  }, [slug]);

  return (
    <main className="min-h-screen pt-28 pb-24">
      {/* Hero Header */}
      <section className="relative h-[65vh] min-h-[480px] w-full flex items-end pb-16 px-6 sm:px-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.95) 100%), url('${
              event.image || "/images/past_event_sunset.jpg"
            }')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
          <Link
            href="/past-events"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#00B4D8] uppercase hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Concert Archives</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-xs font-bold text-[#00B4D8] uppercase">
              {event.year} TOUR ARCHIVE
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white">
              {event.attendance?.toLocaleString()} Fans
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight mb-6 max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 text-sm text-[#F5F6FA]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#00B4D8]" />
              <span>{event.dateDisplay || event.date_display}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#00B4D8]" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Retrospective Content */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Narrative, Gallery & Setlist */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-4">
                The Historic Spectacle
              </h2>
              <p className="text-base text-[#8A8D93] leading-relaxed mb-4">
                {event.description || event.summary}
              </p>
              <p className="text-sm text-[#8A8D93] leading-relaxed">
                Under a sky ablaze with red lasers and stage pyrotechnics, DJ G SPARK delivered a tour-de-force performance, synchronizing 140dB L-Acoustics arrays with a hypnotic, continuous melodic techno progression.
              </p>
            </div>

            {/* Photo Gallery Strip */}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-6">
                Crowd Energy & Stage Atmosphere
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden h-64 border border-white/10">
                  <img
                    src="/images/past_event_crowd.jpg"
                    alt="Cheering Crowd"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-xl overflow-hidden h-64 border border-white/10">
                  <img
                    src="/images/concert_led.jpg"
                    alt="Kinetic Rig"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Setlist Table */}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-6">
                Live Setlist Highlights
              </h3>
              <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 border-b border-white/10 text-[#8A8D93] font-mono">
                    <tr>
                      <th className="p-4">#</th>
                      <th className="p-4">Track Title</th>
                      <th className="p-4">Artist / Mix</th>
                      <th className="p-4">BPM</th>
                      <th className="p-4">Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#F5F6FA]">
                    {[
                      { num: "01", title: "Spark Theory (Concert Intro)", artist: "DJ G Spark", bpm: "126", key: "F#m" },
                      { num: "02", title: "Neon Horizons (Extended Club)", artist: "DJ G Spark", bpm: "128", key: "Am" },
                      { num: "03", title: event.highlightTrack || "Velocity 9", artist: "DJ G Spark (VIP Edit)", bpm: "130", key: "Dm" },
                      { num: "04", title: "Sub Zero Pulse (Encore Climax)", artist: "DJ G Spark", bpm: "128", key: "Em" },
                    ].map((row) => (
                      <tr key={row.num} className="hover:bg-white/5">
                        <td className="p-4 font-mono text-[#00B4D8]">{row.num}</td>
                        <td className="p-4 font-bold text-white">{row.title}</td>
                        <td className="p-4 text-[#8A8D93]">{row.artist}</td>
                        <td className="p-4 font-mono text-[#8A8D93]">{row.bpm}</td>
                        <td className="p-4 font-mono text-[#8A8D93]">{row.key}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Audio & Next Tour */}
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-bold tracking-wider text-[#00B4D8] uppercase block mb-3">
                Live Audio Stream
              </span>
              <h4 className="text-lg font-bold text-white mb-2">
                Concert Audio Recording
              </h4>
              <p className="text-xs text-[#8A8D93] mb-6">
                Mastered directly from the FOH mixer in 24-bit uncompressed audio.
              </p>
              <button
                onClick={togglePlay}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:shadow-spark transition-all"
              >
                <Disc className="w-4 h-4" />
                <span>{isPlaying ? "Pause Live Recording" : "Play Live Recording"}</span>
              </button>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Production Specifications
              </h4>
              <ul className="text-xs text-[#8A8D93] space-y-2.5">
                <li>• <strong>Audio Rig:</strong> L-Acoustics K1 (142dB Peak)</li>
                <li>• <strong>LED Surface:</strong> 650 sq. meters 8K HDR</li>
                <li>• <strong>Laser Array:</strong> 36x 40W High-Speed RGB</li>
                <li>• <strong>Pyrotechnics:</strong> 12 Cryo Jets + Flame Mortars</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Event Review & Rating System */}
        <EventReviewSection
          eventId={event.id}
          eventSlug={event.slug || slug}
          eventTitle={event.title}
        />
      </section>
    </main>
  );
}