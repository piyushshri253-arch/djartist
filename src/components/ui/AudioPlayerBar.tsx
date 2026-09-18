"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudio } from "@/context/AudioContext";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc } from "lucide-react";

export function AudioPlayerBar() {
  const pathname = usePathname();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
  } = useAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  if (pathname === "/" || !currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume || 0.8);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 bg-[#0c0c10]/95 border-t border-white/10 backdrop-blur-xl transition-all">
      {/* Top Seek Progress Line */}
      <div
        className="w-full h-[3px] bg-white/10 cursor-pointer group relative"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] group-hover:h-[5px] transition-all duration-100 shadow-spark"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-3 flex items-center justify-between gap-4">
        {/* Left: Track Information & Artwork */}
        <div className="flex items-center gap-3.5 min-w-0 max-w-xs sm:max-w-sm">
          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-black/60 border border-white/10 flex-shrink-0">
            <img
              src={currentTrack.cover || "/images/album_art.jpg"}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? "animate-spin" : ""}`}
              style={{ animationDuration: "12s" }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#F4F1EA] truncate">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-[#969696] truncate">
              {currentTrack.album} • {currentTrack.bpm} BPM
            </span>
          </div>
        </div>

        {/* Center: Transport Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={prevTrack}
              className="p-1.5 text-[#969696] hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8400] text-black flex items-center justify-center hover:scale-105 transition-transform shadow-spark"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-[#969696] hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-[#969696]">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Catalog Link */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleMute} className="text-[#969696] hover:text-white">
              {volume === 0 || isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF6A00]"
            />
          </div>

          <Link
            href="/music"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] text-[#FF8400] hover:text-white transition-colors px-3 py-1.5 rounded bg-white/5 border border-white/10"
          >
            <Disc className="w-3.5 h-3.5" />
            <span>DISCOGRAPHY</span>
          </Link>
        </div>
      </div>
    </div>
  );
}