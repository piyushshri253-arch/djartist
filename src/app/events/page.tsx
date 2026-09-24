"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { isEventPast } from "@/lib/eventsHelper";
import { getMergedEvents } from "@/lib/clientStorage";
import { MapPin, Calendar, Users, ArrowRight, Search, Sparkles, Filter, MessageCircle } from "lucide-react";

export default function EventsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Clear any legacy localStorage event overrides
    getMergedEvents([]);

    fetch("/api/events?type=upcoming", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const upcoming = data.filter(
            (ev: any) => ev.isPublished !== false && !isEventPast(ev.date || ev.dateDisplay)
          );
          setEvents(upcoming);
        }
      })
      .catch(() => {});
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.country?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category / Region filter
      if (filter === "all") return true;
      if (filter === "india") return ev.country?.toLowerCase() === "india" || ev.region?.toLowerCase() === "india";
      if (filter === "international") return ev.country?.toLowerCase() !== "india" && ev.region?.toLowerCase() !== "india";
      if (filter === "selling-fast") return ev.status?.toLowerCase().includes("fast") || ev.status?.toLowerCase().includes("sold") || ev.status?.toLowerCase().includes("limited");
      if (filter === "vip") return ev.status?.toLowerCase().includes("vip") || ev.title?.toLowerCase().includes("vip");

      return ev.region?.toLowerCase() === filter || ev.status?.toLowerCase().includes(filter);
    });
  }, [events, filter, searchQuery]);

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-mono font-bold tracking-[0.24em] text-[#00B4D8] uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL WORLD TOUR 2026</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 uppercase">
          GLOBAL ARENA <span className="text-[#00E5FF]">CIRCUIT</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed">
          Experience monumental stadium atmospheres with custom 360° LED visual architecture and cutting-edge sound systems. Select your city to reserve official passes.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md mx-auto mt-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, venue, or country..."
            className="w-full bg-[#1F2833] border border-white/10 hover:border-white/20 focus:border-[#00E5FF] rounded-full py-3 pl-11 pr-5 text-sm text-white placeholder:text-[#666666] focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#888888] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          {[
            { id: "all", label: `ALL DATES (${events.length})` },
            { id: "india", label: "INDIA SHOWS" },
            { id: "international", label: "INTERNATIONAL" },
            { id: "selling-fast", label: "SELLING FAST" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-[0.14em] uppercase transition-all ${
                filter === tab.id
                  ? "bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black shadow-spark"
                  : "bg-white/5 text-[#8A8D93] hover:text-white border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-xs font-mono text-[#888888] border-b border-white/10 pb-4 mb-8">
        <span>SHOWING {!isMounted ? "..." : filteredEvents.length} TOUR DATES</span>
        <span>VIP PASS RESERVATION & CONCIERGE</span>
      </div>

      {/* Events Grid */}
      {!isMounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-card rounded-2xl h-96 animate-pulse bg-white/5 border border-white/5"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl p-8">
          <p className="text-white text-lg font-bold mb-2">No tour dates found matching your criteria</p>
          <p className="text-sm text-[#888888] mb-6">Try clearing your search query or selecting another filter category.</p>
          <button
            onClick={() => {
              setFilter("all");
              setSearchQuery("");
            }}
            className="px-6 py-2.5 rounded-full bg-[#00E5FF] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev) => {
            return (
              <article
                key={ev.id}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#00E5FF]/50 transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_10px_35px_rgba(0, 229, 255, 0.15)]"
              >
                {/* Top Poster Image */}
                <Link href={`/events/${ev.slug || ev.id}`} className="block relative h-56 w-full overflow-hidden bg-black/60">
                  <img
                    src={ev.image || "/images/past_event_crowd.jpg"}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2833] via-transparent to-black/50" />
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md text-[10px] font-extrabold tracking-wider text-amber-400 uppercase border border-amber-500/30">
                      {ev.eventType || "ARENA CONCERT"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#00B4D8] uppercase border border-white/10">
                      {ev.city}{ev.country ? ` • ${ev.country}` : ""}
                    </span>
                  </div>
                </Link>

                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#00B4D8] mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.dateDisplay} • {ev.time}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#00B4D8] transition-colors mb-2">
                      <Link href={`/events/${ev.slug || ev.id}`}>
                        {ev.title}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-[#8A8D93] mb-4">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#00E5FF]" />
                      <span><strong>{ev.venue}</strong> • {ev.city}{ev.country ? `, ${ev.country}` : ""}</span>
                    </div>

                    <p className="text-xs text-[#8A8D93] leading-relaxed line-clamp-2 mb-4">
                      {ev.description}
                    </p>

                    {/* Lineup */}
                    {ev.lineup && ev.lineup.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {(Array.isArray(ev.lineup) ? ev.lineup : [ev.lineup]).map((artist: string) => (
                          <span
                            key={artist}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#d0d0d8] border border-white/5"
                          >
                            {artist}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#8A8D93] block font-mono">
                        Artist
                      </span>
                      <span className="text-xs font-bold text-[#00E5FF] font-mono truncate block max-w-[130px]">
                        {ev.artist || "Dj G-Spark"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/events/${ev.slug || ev.id}`}
                        className="px-3.5 py-2 rounded-full border border-white/15 text-xs font-bold tracking-wider text-white hover:border-white transition-colors"
                      >
                        Details
                      </Link>
                      <a
                        href={`https://wa.me/919540681934?text=${encodeURIComponent(`Hi Dj G-Spark, I would like to reserve VIP passes / RSVP for ${ev.title || ev.city} on ${ev.dateDisplay}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black text-xs font-bold tracking-wider uppercase hover:shadow-spark transition-all flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>VIP RSVP</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}