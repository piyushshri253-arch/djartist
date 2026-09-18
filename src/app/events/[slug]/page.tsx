"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import rawEvents from "@/data/events.json";
import { TicketModal } from "@/components/ui/TicketModal";
import { EventReviewSection } from "@/components/events/EventReviewSection";
import { MapPin, Calendar, Users, Clock, ShieldCheck, ArrowLeft, Ticket } from "lucide-react";

export default function EventSinglePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const initialEvents = rawEvents as any[];
  const initialEvent = initialEvents.find((e) => e.slug === slug || e.id === slug) || initialEvents[0];
  const [event, setEvent] = useState<any>(initialEvent);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/events", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const match = data.find((e: any) => e.slug === slug || e.id === slug);
          if (match) {
            setEvent(match);
          }
        }
      })
      .catch(() => {});
  }, [slug]);

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#FF8400] uppercase hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tour Dates</span>
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-xs font-bold text-[#FF8400] uppercase">
              {event.city} • {event.country}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white uppercase">
              Capacity: {event.capacity}
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight mb-6 max-w-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 text-sm text-[#F4F1EA]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#FF8400]" />
              <span>{event.dateDisplay}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#FF8400]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#FF8400]" />
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
              <p className="text-base text-[#969696] leading-relaxed mb-4">
                {event.description}
              </p>
              <p className="text-sm text-[#969696] leading-relaxed">
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
                  { time: "22:30 - 02:00", title: "DJ G SPARK (Extended 3.5-Hour Headline Set)", desc: "Full live visual sync, pyrotechnics, and album premiere" },
                ].map((slot, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex items-start gap-4 ${
                      i === 3
                        ? "bg-[#FF6A00]/10 border-[#FF6A00]/40 shadow-spark"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-[#FF8400] min-w-[90px]">
                      {slot.time}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{slot.title}</h4>
                      <p className="text-xs text-[#969696]">{slot.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-bold tracking-wider text-[#FF8400] uppercase block mb-1">
                Official Ticketing
              </span>

              <div className="space-y-4 mb-6">
                {event.showPrice !== false ? (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#969696] block mb-1">
                      Tier 1 Starting Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {event.priceINR
                          ? `₹ ${Number(String(event.priceINR).replace(/[^0-9]/g, "")).toLocaleString("en-IN")}`
                          : "₹ 2,499"}
                      </span>
                      <span className="text-sm font-bold text-[#FF8400] font-mono">
                        / ${event.priceUSD || 35} USD
                      </span>
                    </div>
                    <span className="text-[11px] text-[#888888] block mt-1">
                      Exclusive of applicable GST & booking fee
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#969696] block mb-1">
                      Admission Policy
                    </span>
                    <div className="text-xl font-bold text-[#00FF88] font-mono">
                      Passes by Reservation
                    </div>
                    <span className="text-[11px] text-[#888888] block mt-1">
                      Submit pass request below to receive concierge allocation & live seat selection.
                    </span>
                  </div>
                )}
              </div>

              {/* Tiers List */}
              <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-white font-medium">General Admission (Arena Floor)</span>
                  <span className="text-[#00FF88] font-mono">Available</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-white font-medium">VIP Elevated Lounge</span>
                  <span className="text-[#FF8400] font-mono">Filling Fast</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-white font-medium">Spark Ultra Backstage Table</span>
                  <span className="text-[#FF6A00] font-mono">Inquiry Only</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-xs text-[#969696]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00FF88]" />
                  <span>100% Guaranteed Official RFID Barcode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#FF8400]" />
                  <span>Instant Mobile Ticket & Entry Pass Delivery</span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black font-bold text-xs tracking-[0.14em] uppercase hover:shadow-spark transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>{event.showPrice !== false ? "Book Passes Now" : "Request Pass Access"}</span>
              </button>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Venue Logistics & Doors
              </h4>
              <ul className="text-xs text-[#969696] space-y-2.5">
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

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventTitle={event.title}
        eventCity={event.city}
        eventDate={event.dateDisplay}
        priceINR={event.priceINR || 2499}
        priceUSD={event.priceUSD || 35}
        showPrice={event.showPrice !== false}
      />
    </main>
  );
}