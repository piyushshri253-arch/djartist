"use client";

import { useAudio } from "@/context/AudioContext";
import { Volume2, VolumeX, Compass, Sparkles } from "lucide-react";

interface TourHudProps {
  progress: number;
  isAutoTouring: boolean;
  onToggleAutoTour: () => void;
  onJumpToProgress: (target: number) => void;
}

export const TOUR_CHAPTERS = [
  { num: "01", label: "INTRO SPARK", target: 0.00 },
  { num: "02", label: "BACKSTAGE ALLEY", target: 0.10 },
  { num: "03", label: "ENTRANCE RAMP", target: 0.20 },
  { num: "04", label: "DJ BOOTH", target: 0.32 },
  { num: "05", label: "ARTIST ORBIT", target: 0.45 },
  { num: "06", label: "LED WALL PORTAL", target: 0.55 },
  { num: "07", label: "MUSIC CHAMBER", target: 0.67 },
  { num: "08", label: "TOUR CORRIDOR", target: 0.77 },
  { num: "09", label: "MEMORY GALLERY", target: 0.88 },
  { num: "10", label: "FINAL ARENA", target: 1.00 },
];

export function TourHud({
  progress,
  isAutoTouring,
  onToggleAutoTour,
  onJumpToProgress,
}: TourHudProps) {
  const { isPlaying, togglePlay } = useAudio();

  // Find active chapter based on waypoint progress
  let activeIndex = 0;
  for (let i = TOUR_CHAPTERS.length - 1; i >= 0; i--) {
    if (progress >= TOUR_CHAPTERS[i].target - 0.04) {
      activeIndex = i;
      break;
    }
  }
  const current = TOUR_CHAPTERS[activeIndex];

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 sm:p-10 pt-24 pb-20 select-none">
      {/* Top Film Coordinates & Telemetry */}
      <div className="flex items-center justify-between w-full">
        {/* Left Telemetry */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse shadow-[0_0_12px_#FF6A00]" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="text-[10px] tracking-[0.24em] uppercase text-white font-mono font-semibold">
              DJ G SPARK LIVE 3D
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#929292] font-mono">
              CAM [X: {(progress * 12).toFixed(1)}, Y: 2.2, Z: ${(95 - progress * 280).toFixed(0)}] // 140 BPM // 96KHZ
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Animated Equalizer Bars */}
          <div className="hidden sm:flex items-end gap-1 h-5 px-2 py-1 rounded bg-[#0B0B0B]/80 border border-white/10">
            {[0.6, 1.0, 0.4, 0.8, 0.5].map((scale, i) => (
              <span
                key={i}
                className={`w-[2px] rounded-full transition-all duration-300 ${
                  isPlaying ? "bg-[#FF6A00] animate-pulse" : "bg-white/30 h-1"
                }`}
                style={{
                  height: isPlaying ? `${Math.max(4, scale * 16)}px` : "4px",
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>

          <button
            onClick={onToggleAutoTour}
            className={`px-3.5 py-1.5 rounded-md text-[10px] tracking-[0.2em] uppercase font-semibold transition-all flex items-center gap-2 border ${
              isAutoTouring
                ? "bg-[#FF6A00] text-black border-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.5)]"
                : "bg-[#0B0B0B]/80 text-[#F5F2EA] border-white/10 hover:border-[#FF6A00]/50"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isAutoTouring ? "PAUSE CRUISE" : "AUTO CRUISE"}</span>
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-md bg-[#0B0B0B]/80 border border-white/10 flex items-center justify-center text-[#F5F2EA] hover:text-[#FF6A00] transition-colors"
            title="Toggle Audio"
          >
            {isPlaying ? <Volume2 className="w-3.5 h-3.5 text-[#FF6A00]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Right Side Award-Winning Chapter Rail & Scrubber */}
      <div className="fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-end pointer-events-auto">
        {/* Track Line Guide */}
        <div className="relative flex flex-col gap-3 py-2 pr-1">
          <div className="absolute right-[5px] top-0 bottom-0 w-[1px] bg-white/10" />
          {/* Progress Travelling Pip */}
          <div
            className="absolute right-[3.5px] w-[4px] h-4 rounded-full bg-[#FF6A00] shadow-[0_0_10px_#FF6A00] transition-all duration-150"
            style={{ top: `${Math.min(94, Math.max(0, progress * 100))}%` }}
          />

          {TOUR_CHAPTERS.map((ch, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={ch.num}
                onClick={() => onJumpToProgress(ch.target)}
                className="group flex items-center justify-end gap-3 focus:outline-none py-1 relative z-10"
              >
                <span
                  className={`transition-all duration-300 text-[9px] font-mono tracking-[0.2em] uppercase px-2.5 py-0.5 rounded border whitespace-nowrap ${
                    isActive
                      ? "opacity-100 bg-[#0B0B0B]/95 text-[#FF6A00] border-[#FF6A00]/40 shadow-[0_0_15px_rgba(255,106,0,0.2)]"
                      : "opacity-0 group-hover:opacity-100 bg-[#0B0B0B]/80 text-[#929292] border-white/10"
                  }`}
                >
                  {ch.num} • {ch.label}
                </span>
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-2.5 h-2.5 bg-[#FF6A00] shadow-[0_0_12px_#FF6A00] scale-125"
                      : "w-1.5 h-1.5 bg-white/30 group-hover:bg-[#FF6A00] group-hover:scale-110"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Animated Scroll Indicator (Only visible at start) */}
      <div
        className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none transition-all duration-500 ${
          progress < 0.03 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <span className="text-[10px] tracking-[0.3em] text-[#F5F2EA]/90 uppercase font-medium">
          SCROLL TO ENTER VENUE
        </span>
        <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
          <div className="w-full h-3 bg-[#FF6A00] animate-pulse" />
        </div>
      </div>

      {/* Bottom Minimal Film HUD (01 / 10 • CHAPTER NAME) */}
      <div className="flex items-end justify-between w-full">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl sm:text-4xl font-black text-[#FF6A00]">
              {current.num}
            </span>
            <span className="text-[12px] font-mono text-[#929292]">/ 10</span>
          </div>
          <span className="text-xs sm:text-sm font-heading font-bold tracking-[0.24em] text-[#F5F2EA] uppercase">
            {current.label}
          </span>
        </div>

        {/* Center Keyboard Guide on Desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0B0B]/80 border border-white/10 text-[9px] font-mono tracking-[0.2em] text-[#929292]">
          <span>[↑ / ↓] NAVIGATE</span>
          <span className="text-white/20">•</span>
          <span>[SPACE] ANTHEM</span>
        </div>

        {/* Minimal Progress Line Indicator on bottom right */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-32 h-[2px] bg-white/10 overflow-hidden rounded-full">
            <div
              className="h-full bg-[#FF6A00] transition-all duration-100 shadow-[0_0_8px_#FF6A00]"
              style={{ width: `${(progress * 100).toFixed(0)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white font-semibold">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}