"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Check, X, RefreshCw } from "lucide-react";

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  presetImages?: string[];
}

const DEFAULT_PRESETS = [
  "/images/dj_hero.jpg",
  "/images/concert_led.jpg",
  "/images/concert_led_wall.jpg",
  "/images/past_event_crowd.jpg",
  "/images/past_event_sunset.jpg",
  "/images/dj_spark_stage.jpg",
  "/images/world_tour_stage.jpg",
  "/images/gallery_stage_lasers.jpg",
  "/images/gallery_dj_decks_pov.jpg",
];

export function ImageUploader({
  label = "Image Poster / Cover",
  value,
  onChange,
  presetImages = DEFAULT_PRESETS,
}: ImageUploaderProps) {
  const [activeMode, setActiveMode] = useState<"upload" | "presets" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Client-side quick checks
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files (JPG, PNG, WebP, etc.) are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      // Successful upload
      onChange(data.url);
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header & Source Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-[#AAAAAA]">
          {label}
        </label>

        <div className="flex items-center gap-1 bg-[#14141c] p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveMode("upload")}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              activeMode === "upload"
                ? "bg-[#00E5FF] text-black font-bold"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("presets")}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              activeMode === "presets"
                ? "bg-[#00E5FF] text-black font-bold"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("url")}
            className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
              activeMode === "url"
                ? "bg-[#00E5FF] text-black font-bold"
                : "text-[#888888] hover:text-white"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Box */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 space-y-3">
        {/* Current Active Preview Strip */}
        {value ? (
          <div className="flex items-center gap-3 bg-[#181824] p-2.5 rounded-lg border border-white/10">
            <div className="relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 bg-black/60 border border-white/15">
              <img
                src={value}
                alt="Selected"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/dj_hero.jpg";
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-[#00E5FF] uppercase block">
                Active Selection
              </span>
              <p className="text-xs font-mono text-white truncate">{value}</p>
            </div>

            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 text-[#888888] hover:text-red-400 rounded hover:bg-white/5 transition-colors flex-shrink-0"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* 1. Upload from Computer Dropzone */}
        {activeMode === "upload" && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                isDragging
                  ? "border-[#00E5FF] bg-[#00E5FF]/10 scale-[0.99]"
                  : "border-white/15 hover:border-[#00E5FF]/50 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin" />
                  <span className="text-xs font-mono text-[#00B4D8]">
                    Uploading image from computer...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#00E5FF]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Click to choose image from Desktop / Laptop
                    </span>
                    <span className="text-[10px] text-[#888888] block">
                      or drag & drop here (JPG, PNG, WebP up to 10MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-[11px] font-mono text-red-400 mt-2">
                ⚠️ {uploadError}
              </p>
            )}
          </div>
        )}

        {/* 2. Presets Grid */}
        {activeMode === "presets" && (
          <div>
            <span className="text-[10px] font-mono text-[#888888] uppercase block mb-2">
              Select existing tour & stage photography:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
              {presetImages.map((img, idx) => {
                const isSelected = value === img;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(img)}
                    className={`relative aspect-video rounded-md overflow-hidden border transition-all ${
                      isSelected
                        ? "border-[#00E5FF] ring-2 ring-[#00E5FF]/50 scale-95"
                        : "border-white/10 hover:border-white/40"
                    }`}
                  >
                    <Image src={img} alt="Preset" fill className="object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#00E5FF]/40 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Manual URL Input */}
        {activeMode === "url" && (
          <div>
            <label className="text-[10px] font-mono text-[#888888] uppercase block mb-1">
              Paste Image URL or relative path:
            </label>
            <input
              type="text"
              placeholder="e.g. /images/hero.jpg or https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#161622] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#00E5FF] focus:outline-none font-mono"
            />
          </div>
        )}
      </div>
    </div>
  );
}
