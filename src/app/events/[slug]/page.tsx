"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getMergedEvents } from "@/lib/clientStorage";
import { EventReviewSection } from "@/components/events/EventReviewSection";
import { MapPin, Calendar, Clock, ShieldCheck, ArrowLeft, MessageCircle, Phone, Sparkles } from "lucide-react";

export default function EventSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [isMounted, setIsMounted] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    getMergedEvents([]);

    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const match = data.find((e: any) => e.slug === slug || e.id === slug);
          setEvent(match || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!isMounted || (loading && !event)) {
    return (
      <main className="min-h-screen pt-40 pb-24 text-center px-6">
        <div className="inline-block w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-[#8A8D93]">Loading event profile...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen pt-40 pb-24 text-center px-6 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-4">Event Not Found</h1>
        <p className="text-sm text-[#8A8D93] mb-8">The requested tour date could not be found or has concluded.</p>
        <Link
          href="/events"
          className="px-6 py-3 rounded-full bg-[#00E5FF] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
        >
          View All Tour Dates
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-24">
      {/* Event Hero Header with Backdrop Image */}
      <section className="relative h-[65vh] min-h-[480px] w-full flex items-end pb-16 px-6 sm:px-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.95) 100%), url('${
              event.image || "/images/past_event_crowd.jpg"
            }')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#00B4D8] uppercase hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tour Dates</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-xs font-bold text-[#00B4D8] uppercase">
              {event.city} • {event.country}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white uppercase">
              Capacity: {event.capacity}
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight mb-6 max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 text-sm text-[#F5F6FA]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#00B4D8]" />
              <span>{event.dateDisplay}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#00B4D8]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#00B4D8]" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content & Logistics Layout */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-4">
                About The Arena Production
              </h2>
              <p className="text-base text-[#8A8D93] leading-relaxed mb-4">
                {event.description}
              </p>
              <p className="text-sm text-[#8A8D93] leading-relaxed">
                Featuring the touring <strong>Spark Theory 360</strong> architecture with uncompressed L-Acoustics K1 line arrays, synchronized cryogenic jet cannons, and custom kinetic laser gantries calibrated specifically for {event.venue}.
              </p>
            </div>

            {/* Stage Schedule */}
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-6">
                Event Timetable
              </h3>
              <div className="space-y-4">
                {[
                  { time: "18:00", title: "Gates Open & RFID Check-In", desc: "Merchandise village and food arena open" },
                  { time: "19:30", title: "Opening Set: Progressive Warmup", desc: "Deep ambient electronic selection" },
                  { time: "21:00", title: `Direct Support: ${event.lineup?.[1] || "Special Guest"}`, desc: "Peak-time driving techno" },
                  { time: "22:30 - 02:00", title: "Dj G-Spark (Extended 3.5-Hour Headline Set)", desc: "Full live visual sync, pyrotechnics, and album premiere" },
                ].map((slot, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex items-start gap-4 ${
                      i === 3
                        ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 shadow-spark"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-[#00B4D8] min-w-[90px]">
                      {slot.time}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{slot.title}</h4>
                      <p className="text-xs text-[#8A8D93]">{slot.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-[#00B4D8] uppercase">
                  VIP Concierge
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00FF88]/20 text-[10px] font-bold text-[#00FF88] uppercase border border-[#00FF88]/30">
                  {event.status || "EXCLUSIVE RSVP"}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8D93] block mb-1">
                    Headliner
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    {event.artist || "Dj G-Spark"}
                  </div>
                </div>

                {event.eventType && (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8D93] block mb-0.5">
                      Event Category
                    </span>
                    <span className="text-xs font-bold text-[#00E5FF] uppercase">
                      {event.eventType}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8D93] block mb-0.5">
                    Admission Policy
                  </span>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    Direct VIP table reservations, guestlist allocations, and backstage accreditation via private concierge.
                  </p>
                </div>
              </div>

              {/* VIP Benefits */}
              <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-white">
                  <ShieldCheck className="w-4 h-4 text-[#00FF88] shrink-0" />
                  <span>Exclusive VIP Backstage & Lounge Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <Sparkles className="w-4 h-4 text-[#00B4D8] shrink-0" />
                  <span>Dedicated Hospitality & Concierge Host</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white">
                  <Clock className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span>Priority Fast-Track Entry</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/919540681934?text=${encodeURIComponent(`Hi Dj G-Spark, I would like to reserve VIP passes / RSVP for ${event.title} in ${event.city} on ${event.dateDisplay}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-bold text-xs tracking-[0.14em] uppercase hover:shadow-spark transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reserve VIP Access on WhatsApp</span>
                </a>
                <a
                  href="tel:+919540681934"
                  className="w-full py-3 rounded-full border border-white/15 hover:border-white text-white font-bold text-xs tracking-[0.14em] uppercase transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Call Concierge (+91 9540681934)</span>
                </a>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Venue Logistics & Doors
              </h4>
              <ul className="text-xs text-[#8A8D93] space-y-2.5">
                <li>• <strong>Doors Open:</strong> {event.doors || "18:00 (Entry gates open 2 hours prior)"}</li>
                <li>• <strong>Age Policy:</strong> 18+ valid government photo ID required at gate.</li>
                <li>• <strong>Address:</strong> {event.address || event.venue}</li>
                <li>• <strong>Curfew:</strong> Entry doors close strictly at 23:00.</li>
                <li>• <strong>Sound Notice:</strong> High sound pressure levels (&gt;105dB). Hearing protection provided.</li>
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