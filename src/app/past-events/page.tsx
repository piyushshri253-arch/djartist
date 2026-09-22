"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  ArrowUpDown, 
  X, 
  ArrowRight,
  Music,
  SlidersHorizontal,
  CalendarDays
} from "lucide-react";

import rawPastEvents from "@/data/past-events.json";

export default function PastEventsPage() {
  const [events, setEvents] = useState<any[]>(rawPastEvents as any[]);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");

  useEffect(() => {
    fetchEvents();
  }, [sortBy]);

  const fetchEvents = () => {
    setLoading(true);
    fetch(`/api/past-events?sort=${sortBy}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Derive unique cities, locations/venues, and years from events
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.city) set.add(e.city.trim());
    });
    return Array.from(set).sort();
  }, [events]);

  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.venue) set.add(e.venue.trim());
    });
    return Array.from(set).sort();
  }, [events]);

  const uniqueYears = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.date) {
        const yr = e.date.split("-")[0];
        if (yr) set.add(yr);
      } else if (e.year) {
        set.add(String(e.year));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [events]);

  // Unified multi-filter client-side combining Search, Year, Date Range, City, and Location
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Search Query (Title, Description, Venue, City)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title?.toLowerCase().includes(q);
        const matchesDesc = ev.description?.toLowerCase().includes(q) || ev.summary?.toLowerCase().includes(q);
        const matchesVenue = ev.venue?.toLowerCase().includes(q);
        const matchesCity = ev.city?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesCity) return false;
      }

      // 2. City Filter
      if (selectedCity !== "all") {
        if (ev.city?.toLowerCase() !== selectedCity.toLowerCase()) return false;
      }

      // 3. Location / Venue Filter
      if (selectedLocation !== "all") {
        const matchesVenue = ev.venue?.toLowerCase().includes(selectedLocation.toLowerCase());
        const matchesAddr = ev.address?.toLowerCase().includes(selectedLocation.toLowerCase());
        if (!matchesVenue && !matchesAddr) return false;
      }

      // 4. Year Filter
      if (selectedYear !== "all") {
        const eventYear = ev.date ? ev.date.split("-")[0] : String(ev.year || "");
        if (eventYear !== selectedYear) return false;
      }

      // 5. From Date Filter
      if (fromDate) {
        if (new Date(ev.date) < new Date(fromDate)) return false;
      }

      // 6. To Date Filter
      if (toDate) {
        if (new Date(ev.date) > new Date(toDate + "T23:59:59")) return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedCity, selectedLocation, selectedYear, fromDate, toDate]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedLocation("all");
    setSelectedYear("all");
    setFromDate("");
    setToDate("");
    setSortBy("latest");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCity !== "all" ||
    selectedLocation !== "all" ||
    selectedYear !== "all" ||
    fromDate ||
    toDate ||
    sortBy !== "latest";

  return (
    <main className="min-h-screen pt-32 pb-28 px-4 sm:px-8 max-w-[1400px] mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-bold tracking-[0.2em] text-[#00B4D8] uppercase mb-4">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>CONCERT ARCHIVES & RETROSPECTIVES</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4 uppercase">
          LEGENDARY <span className="text-[#00E5FF]">NIGHTS</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8D93] leading-relaxed">
          Echoes of tens of thousands united under volumetric laser arrays and roaring stadium acoustics. Relive the greatest completed arena shows and festival sets in Dj G-Spark history.
        </p>
      </div>

      {/* Global Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { num: "240,000+", label: "FANS UNITED" },
          { num: "18", label: "FESTIVALS HEADLINED" },
          { num: "24", label: "CITIES TOURED" },
          { num: "100%", label: "SOLD OUT ARENAS" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl text-center border border-white/10 bg-white/[0.02]">
            <span className="text-2xl sm:text-4xl font-black text-[#00E5FF] block mb-1 font-sans">
              {stat.num}
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] text-[#8A8D93] uppercase">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Search & Filter Control Bar */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 mb-10 space-y-5">
        {/* Top Row: Search Input + Sorting */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#00B4D8] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search past events by name, city, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-[#777] focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#8A8D93]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "latest" | "oldest")}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="latest" className="bg-[#111] text-white">Latest Past Events</option>
                <option value="oldest" className="bg-[#111] text-white">Oldest Past Events</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-bold text-[#00B4D8] hover:bg-[#00E5FF]/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
          {/* City Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00E5FF] transition-colors cursor-pointer"
            >
              <option value="all" className="bg-[#111] text-white">All Cities ({uniqueCities.length})</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c} className="bg-[#111] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Place / Location Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Venue / Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00E5FF] transition-colors cursor-pointer"
            >
              <option value="all" className="bg-[#111] text-white">All Venues ({uniqueLocations.length})</option>
              {uniqueLocations.map((v) => (
                <option key={v} value={v} className="bg-[#111] text-white">
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00E5FF] transition-colors cursor-pointer"
            >
              <option value="all" className="bg-[#111] text-white">All Years</option>
              {uniqueYears.map((yr) => (
                <option key={yr} value={yr} className="bg-[#111] text-white">
                  {yr} Tour
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From / To */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#888] block mb-1.5">
              Date Range
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-1/2 px-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="From"
              />
              <span className="text-[#666] text-xs">-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-1/2 px-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#00E5FF] transition-colors"
                placeholder="To"
              />
            </div>
          </div>
        </div>

        {/* Status Count Line */}
        <div className="flex items-center justify-between text-xs text-[#888] pt-2">
          <span>
            Showing <strong className="text-white">{filteredEvents.length}</strong> of{" "}
            <strong className="text-white">{events.length}</strong> past events
          </span>
          {hasActiveFilters && (
            <span className="text-[#00B4D8] text-[11px]">
              Active filter conditions applied
            </span>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl h-96 animate-pulse bg-white/5 border border-white/5" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-20 glass-card rounded-2xl border border-white/10 max-w-lg mx-auto p-8">
          <Calendar className="w-12 h-12 text-[#00E5FF]/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Past Events Found</h3>
          <p className="text-xs text-[#8A8D93] mb-6">
            No past concerts or festivals match your search criteria. Try clearing or relaxing your filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-full bg-white/10 text-white hover:bg-[#00E5FF] hover:text-black font-bold text-xs uppercase tracking-wider transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Past Events Grid */}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev) => {
            const eventYear = ev.date ? ev.date.split("-")[0] : ev.year || "ARCHIVE";
            const detailUrl = `/past-events/${ev.slug || ev.id}`;

            return (
              <article
                key={ev.id}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#00E5FF]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-2xl"
              >
                {/* Event Image */}
                <div className="relative h-64 w-full overflow-hidden bg-black/60">
                  <img
                    src={ev.image || "/images/past_event_sunset.jpg"}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#00B4D8] uppercase border border-white/10">
                    {eventYear} ARCHIVE
                  </span>

                  <span className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#F5F6FA] border border-white/10">
                    <Users className="w-3 h-3 text-[#00E5FF]" />
                    <span>{ev.attendance ? ev.attendance.toLocaleString() : (ev.capacity || "10,000+")} Fans</span>
                  </span>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[11px] font-mono text-[#00B4D8] font-bold block mb-0.5">
                      {ev.dateDisplay || ev.date}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug drop-shadow group-hover:text-[#00B4D8] transition-colors">
                      <Link href={detailUrl}>
                        {ev.title}
                      </Link>
                    </h3>
                  </div>
                </div>

                {/* Event Information */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#8A8D93] mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#00B4D8] shrink-0" />
                      <span className="truncate">
                        {ev.venue}, <strong className="text-white">{ev.city}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-[#8A8D93] leading-relaxed line-clamp-3 mb-4">
                      {ev.description || ev.summary || "A monumental headline performance featuring synchronized laser gantries, live uncompressed 24-bit audio, and peak crowd energy."}
                    </p>

                    {(ev.highlightTrack || ev.highlight_track) && (
                      <div className="flex items-center gap-2 text-xs text-[#F5F6FA] bg-white/5 p-3 rounded-lg border border-white/5 mb-4">
                        <Music className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                        <span className="text-[#8A8D93] shrink-0">Peak Anthem:</span>
                        <strong className="text-white truncate">{ev.highlightTrack || ev.highlight_track}</strong>
                      </div>
                    )}
                  </div>

                  {/* View Event Button */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href={detailUrl}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF] text-white hover:text-black font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all border border-white/10 group-hover:border-[#00E5FF]"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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