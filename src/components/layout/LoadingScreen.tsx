"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExpanding(true);
          setTimeout(() => {
            setIsDone(true);
            onComplete();
          }, 800);
          return 100;
        }
        // Realistic step acceleration
        const increment = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + increment);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0B0C10] flex flex-col items-center justify-center transition-opacity duration-700 ${
        isExpanding ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Central Expanding Spark */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className={`w-3 h-3 rounded-full bg-[#FFA020] shadow-[0_0_30px_#00E5FF] transition-all duration-700 ${
            isExpanding ? "scale-[80] opacity-0" : "scale-100 animate-pulse"
          }`}
        />
        <div className="absolute inset-0 w-12 h-12 -translate-x-4 -translate-y-4 rounded-full border border-[#00E5FF]/30 animate-ping pointer-events-none" />
      </div>

      {/* Brand Title */}
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-[#00E5FF] fill-current" />
        <span className="font-sans font-bold tracking-[0.2em] text-xl text-[#F5F6FA]">
          DJ G SPARK
        </span>
      </div>

      <p className="text-[11px] tracking-[0.24em] text-[#8A8D93] uppercase mb-8">
        INITIALIZING 3D CONCERT EXPERIENCE
      </p>

      {/* Progress Bar & Percentage */}
      <div className="w-64 flex flex-col items-center gap-3">
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] transition-all duration-100 ease-out shadow-spark"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-mono text-[#8A8D93] tracking-widest">
          {progress}%
        </span>
      </div>
    </div>
  );
}