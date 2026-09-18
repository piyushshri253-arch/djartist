"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import rawTracks from "@/data/tracks.json";
import { TrackItem } from "@/types";

interface AudioContextType {
  tracks: TrackItem[];
  currentTrack: TrackItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: TrackItem) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const tracks = rawTracks as unknown as TrackItem[];
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(228);
  const [volume, setVolumeState] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener("ended", () => {
      // Auto play next
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update src when currentTrackIndex changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks[currentTrackIndex]) return;

    const track = tracks[currentTrackIndex];
    audio.src = track.audioUrl || "/audio/spark_theory.wav";
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const playTrack = (track: TrackItem) => {
    const idx = tracks.findIndex((t) => t.id === track.id || t.title === track.title);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    }
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback or user gesture restriction
        setIsPlaying(false);
      });
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const seek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        currentTrack: tracks[currentTrackIndex] || null,
        isPlaying,
        currentTime,
        duration,
        volume,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}