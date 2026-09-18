"use client";

import { useState } from "react";
import rawTracks from "@/data/tracks.json";
import { TrackItem } from "@/types";
import { useAudio } from "@/context/AudioContext";
import { Play, Pause, Disc, Download, ExternalLink } from "lucide-react";

export default function MusicPage() {
  const tracks = rawTracks as unknown as TrackItem[];
  const [filter, setFilter] = useState("all");
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const [stemsToast, setStemsToast] = useState(false);

  const filtered = tracks.filter((t) => {
    if (filter === "all") return true;
    return t.genre?.toLowerCase().includes(filter) || (t as any).category === filter;
  });

  const handleDownloadStems = () => {
    setStemsToast(true);
    setTimeout(() => setStemsToast(false), 3500);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold tracking-[0.24em] text-[#FF8400] uppercase block mb-3">
          OFFICIAL DISCOGRAPHY
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
          SONIC <span className="text-[#FF6A00]">SIGNATURES</span>
        </h1>
        <p className="text-sm sm:text-base text-[#969696] leading-relaxed">
          From crushing stadium anthems to ethereal melodic techno journeys. Stream the official catalog in high fidelity or download production stems for DJ sets.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {[
            { id: "all", label: `ALL TRACKS (${tracks.length})` },
            { id: "latest", label: "LATEST DROPS" },
            { id: "popular", label: "POPULAR ANTHEMS" },
            { id: "live", label: "LIVE SETS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-[0.14em] uppercase transition-all ${
                filter === tab.id
                  ? "bg-[#FF6A00] text-black shadow-spark"
                  : "bg-white/5 text-[#969696] hover:text-white border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Album Showcase Banner */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 mb-16 border border-white/10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 group">
          <img
            src="/images/album_art.jpg"
            alt="Spark Theory LP"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <button
            onClick={() => playTrack(tracks[0])}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF6A00] text-black flex items-center justify-center shadow-spark">
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </div>
          </button>
        </div>

        <div className="space-y-4 text-center md:text-left flex-1">
          <span className="text-xs font-bold tracking-[0.2em] text-[#FF8400] uppercase block">
            STUDIO ALBUM • AVAILABLE NOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SPARK THEORY <span className="text-[#FF6A00]">LP</span>
          </h2>
          <p className="text-sm text-[#969696] leading-relaxed max-w-xl">
            Twelve tracks exploring the intersection of raw human emotion and mechanized groove. Mastered in 24-bit high-resolution audio with live guest vocalists.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-[#969696] pt-2">
            <span>12 Tracks</span>
            <span>•</span>
            <span>58:14 Total Time</span>
            <span>•</span>
            <span className="text-white">Armada Music / Spark Recs</span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
            <button
              onClick={() => playTrack(tracks[0])}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black font-bold text-xs tracking-wider uppercase hover:shadow-spark transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Stream LP</span>
            </button>
            <button
              onClick={handleDownloadStems}
              className="px-6 py-3 rounded-full border border-white/20 text-white font-bold text-xs tracking-wider uppercase hover:border-[#FF6A00] transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DJ Stems Pack</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 border-b border-white/10 text-[#969696] font-mono">
            <tr>
              <th className="p-4 w-16 text-center">PLAY</th>
              <th className="p-4">TITLE & ARTIST</th>
              <th className="p-4 hidden sm:table-cell">ALBUM</th>
              <th className="p-4 hidden md:table-cell">GENRE</th>
              <th className="p-4 hidden lg:table-cell">BPM / KEY</th>
              <th className="p-4">TIME</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <tr
                  key={track.id}
                  className={`hover:bg-white/5 transition-colors ${
                    isCurrent ? "bg-[#FF6A00]/10" : ""
                  }`}
                >
                  <td className="p-4 text-center">
                    <button
                      onClick={() => playTrack(track)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF6A00] hover:text-black flex items-center justify-center transition-colors text-white mx-auto"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{track.title}</div>
                    <div className="text-[#969696] text-xs">DJ G SPARK</div>
                  </td>
                  <td className="p-4 text-[#969696] hidden sm:table-cell">{track.album}</td>
                  <td className="p-4 text-[#969696] hidden md:table-cell">{track.genre}</td>
                  <td className="p-4 font-mono text-[#969696] hidden lg:table-cell">
                    {track.bpm} BPM • {track.key}
                  </td>
                  <td className="p-4 font-mono text-[#969696]">{track.duration}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={handleDownloadStems}
                      className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] tracking-wider font-bold text-[#FF8400] uppercase transition-colors"
                    >
                      Stems
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stems Download Alert Toast */}
      {stemsToast && (
        <div className="fixed bottom-24 right-6 z-50 p-4 rounded-xl bg-[#0f0f14] border border-[#00FF88] text-white shadow-spark flex items-center gap-3 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
          <span>Producer Stems unlocked: 24-bit WAV stems package link sent.</span>
        </div>
      )}
    </main>
  );
}