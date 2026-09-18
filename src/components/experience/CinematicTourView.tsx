"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { TOUR_SECTORS, TourSector } from "@/data/tourSectors";

interface CinematicTourViewProps {
  progress: number;
}

export function CinematicTourView({ progress }: CinematicTourViewProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Mouse tilt tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x: normX, y: normY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Sync video playback to scroll position
  useEffect(() => {
    TOUR_SECTORS.forEach((sec, idx) => {
      const vid = videoRefs.current[idx];
      if (!vid) return;

      const isCurrentSector =
        progress >= sec.startProgress - 0.05 && progress <= sec.endProgress + 0.05;

      if (isCurrentSector) {
        if (vid.paused) {
          vid.play().catch(() => {});
        }
        // Smoothly scrub currentTime based on progress within sector
        const span = sec.endProgress - sec.startProgress || 0.01;
        const subProg = Math.max(0, Math.min(1, (progress - sec.startProgress) / span));

        if (vid.duration && !isNaN(vid.duration)) {
          const targetTime = subProg * vid.duration;
          // Smooth seek if difference is noticeable
          if (Math.abs(vid.currentTime - targetTime) > 0.4) {
            vid.currentTime = targetTime;
          }
        }
      } else {
        if (!vid.paused) {
          vid.pause();
        }
      }
    });
  }, [progress]);

  // Find active sector
  let activeSectorIndex = 0;
  for (let i = TOUR_SECTORS.length - 1; i >= 0; i--) {
    if (progress >= TOUR_SECTORS[i].startProgress - 0.03) {
      activeSectorIndex = i;
      break;
    }
  }
  const activeSector = TOUR_SECTORS[activeSectorIndex];

  // Calculate 3D tilt
  const rotX = -mousePos.y * 3.5;
  const rotY = mousePos.x * 4.5;
  const transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.03)`;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#050505] select-none">
      {/* 3D Tilted Spatial Canvas Layer */}
      <div
        className="relative w-full h-full transition-transform duration-200 ease-out"
        style={{ transform, transformStyle: "preserve-3d" }}
      >
        {/* Full-bleed 1080p Video Layers */}
        {TOUR_SECTORS.map((sec, idx) => {
          // Calculate opacity with smooth cross-dissolve at boundaries
          const isActive = idx === activeSectorIndex;
          const isNext = idx === activeSectorIndex + 1;
          const isPrev = idx === activeSectorIndex - 1;

          let opacity = 0;
          if (isActive) {
            opacity = 1;
          } else if (isNext && progress > sec.startProgress - 0.04) {
            opacity = Math.min(1, (progress - (sec.startProgress - 0.04)) / 0.04);
          } else if (isPrev && progress < sec.endProgress + 0.04) {
            opacity = Math.max(0, (sec.endProgress + 0.04 - progress) / 0.04);
          }

          if (!isActive && !isNext && !isPrev) return null;

          return (
            <div
              key={sec.id}
              className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-out"
              style={{ opacity }}
            >
              {/* Fallback Poster Background */}
              <div className="absolute inset-0 w-full h-full -z-10">
                <Image
                  src={sec.fallbackImage}
                  alt={sec.title}
                  fill
                  priority={idx < 2}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {/* 1080p Cinematic Tour Video */}
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={sec.videoSrc}
                playsInline
                muted
                loop
                preload={idx <= 2 ? "auto" : "metadata"}
                className="w-full h-full object-cover"
              />

              {/* Cinematic Vignette & Atmospheric Contrast Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />
            </div>
          );
        })}

        {/* Spatial In-World Editorial Typography (Floating in the venue, NO BOXES) */}
        <div className="absolute inset-0 flex flex-col justify-center items-start px-8 sm:px-16 lg:px-24 pointer-events-none z-10">
          <div className="max-w-3xl">
            {/* Live Telemetry Tag */}
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse shadow-[0_0_12px_#FF6A00]" />
              <span className="text-[10px] font-mono tracking-[0.26em] text-[#FF6A00] uppercase font-bold">
                {activeSector.telemetry}
              </span>
            </div>

            {/* Giant Spatial Headline */}
            <h1 className="text-4xl sm:text-7xl font-heading font-black tracking-[-0.03em] uppercase text-white mb-2 leading-[0.95] drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              {activeSector.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-2xl font-heading font-bold spark-text-gradient tracking-[0.08em] uppercase mb-4 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
              {activeSector.subtitle}
            </p>

            {/* Floating Watermark Numeral */}
            <span className="font-heading font-black text-8xl sm:text-[14rem] text-stroke-watermark absolute -top-16 right-8 sm:right-24 opacity-25 select-none pointer-events-none">
              {activeSector.num}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
