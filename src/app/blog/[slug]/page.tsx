"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import rawBlog from "@/data/blog.json";
import { BlogPostItem } from "@/types";
import { useAudio } from "@/context/AudioContext";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Share2,
  Flame,
  Check,
  Copy,
  MessageCircle,
  Music,
  Play,
  Pause,
  Radio,
  ShieldCheck,
  Sparkles,
  Bookmark,
  Volume2,
  Sliders,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Star,
} from "lucide-react";
import { ArticleReviewSection } from "@/components/blog/ArticleReviewSection";

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const initialPosts = rawBlog as unknown as BlogPostItem[];
  const initialPost = initialPosts.find((p) => p.slug === slug || p.id === slug) || initialPosts[0];
  
  const [allPosts, setAllPosts] = useState<BlogPostItem[]>(initialPosts);
  const [post, setPost] = useState<BlogPostItem>(initialPost);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("normal");
  const [sparksCount, setSparksCount] = useState(128);
  const [hasSparked, setHasSparked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Audio Context Integration
  const { currentTrack, isPlaying, togglePlay, playTrack, tracks } = useAudio();

  // Load latest blogs from API (if updated dynamically in admin panel)
  useEffect(() => {
    fetch("/api/blogs", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: BlogPostItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllPosts(data);
          const match = data.find((p) => p.slug === slug || p.id === slug);
          if (match) {
            setPost(match);
          }
        }
      })
      .catch(() => {});
  }, [slug]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute Previous and Next Articles
  const { prevPost, nextPost, relatedPosts } = useMemo(() => {
    const currentIndex = allPosts.findIndex((p) => p.id === post.id || p.slug === post.slug);
    const prev = currentIndex > 0 ? allPosts[currentIndex - 1] : allPosts[allPosts.length - 1];
    const next = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : allPosts[0];
    const others = allPosts.filter((p) => p.id !== post.id && p.slug !== post.slug).slice(0, 3);
    return { prevPost: prev, nextPost: next, relatedPosts: others };
  }, [allPosts, post]);

  // Handle Spark Click
  const handleSparkClick = () => {
    if (!hasSparked) {
      setSparksCount((prev) => prev + 1);
      setHasSparked(true);
    } else {
      setSparksCount((prev) => prev - 1);
      setHasSparked(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Share to WhatsApp
  const shareWhatsApp = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`Check out "${post.title}" by Dj G-Spark:\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  // Share to Twitter/X
  const shareTwitter = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(`"${post.title}" by @DJGSpark #ElectronicMusic #ArenaTour`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, "_blank");
    }
  };

  // Trigger Companion Audio
  const handleToggleCompanionAudio = () => {
    if (tracks && tracks.length > 0) {
      const companion = tracks.find((t) => t.title.toLowerCase().includes("spark")) || tracks[0];
      if (currentTrack?.id === companion.id) {
        togglePlay();
      } else {
        playTrack(companion);
      }
    } else {
      togglePlay();
    }
  };

  const isCompanionPlaying = isPlaying && (currentTrack?.title.toLowerCase().includes("spark") || currentTrack?.id === tracks[0]?.id);

  // Font size classes for article body
  const fontSizeClasses = {
    normal: "text-base sm:text-lg leading-[1.8]",
    large: "text-lg sm:text-xl leading-[1.85]",
    xl: "text-xl sm:text-2xl leading-[1.9]",
  }[fontSize];

  return (
    <main className="min-h-screen bg-[#0B0C10] text-[#F5F6FA] relative selection:bg-[#00E5FF] selection:text-black">
      {/* Top Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#00E5FF] via-[#00B4D8] to-[#7A4CFF] shadow-[0_0_12px_rgba(0, 229, 255, 0.8)] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-[#00E5FF]/10 via-[#7A4CFF]/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Navigation & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A8D93]">
            <Link href="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              STUDIO CHRONICLES
            </Link>
            <span>/</span>
            <span className="text-[#00B4D8] truncate max-w-[200px] sm:max-w-none">
              {post.category || "DISPATCH"}
            </span>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-[#00E5FF]/15 border border-white/10 hover:border-[#00E5FF]/50 text-xs font-bold text-[#00B4D8] transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>BACK TO ALL CHRONICLES</span>
          </Link>
        </div>

        {/* Article Hero Header */}
        <header className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          {/* Category Pill with Pulse */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] -ml-4" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#00B4D8] uppercase font-mono">
              {post.category}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            {post.title}
          </h1>

          {/* Excerpt Lead */}
          <p className="text-base sm:text-xl text-[#b4b4c0] font-normal leading-relaxed max-w-3xl mx-auto mb-8">
            {post.excerpt}
          </p>

          {/* Author Byline & Article Meta Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-5 px-6 rounded-2xl glass-card border border-white/10 backdrop-blur-xl max-w-3xl mx-auto text-xs">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00E5FF] shadow-[0_0_12px_rgba(0, 229, 255, 0.4)] flex-shrink-0">
                <img
                  src="/images/dj_hero.jpg"
                  alt={post.author || "Dj G-Spark"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">{post.author}</span>
                  <span className="inline-flex items-center text-[10px] font-bold text-[#00B4D8] bg-[#00E5FF]/20 px-1.5 py-0.5 rounded border border-[#00E5FF]/30 font-mono">
                    <ShieldCheck className="w-3 h-3 inline mr-0.5" /> ARTIST
                  </span>
                </div>
                <span className="text-[11px] text-[#8A8D93]">
                  {post.authorRole || "Artist & Sound Architect"}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Date */}
            <div className="flex items-center gap-2 text-[#8A8D93] font-mono">
              <Calendar className="w-4 h-4 text-[#00B4D8]" />
              <span>{post.dateDisplay}</span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Read Time */}
            <div className="flex items-center gap-2 text-[#8A8D93] font-mono">
              <Clock className="w-4 h-4 text-[#00B4D8]" />
              <span>{post.readTime}</span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Telemetry Tag */}
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[#7A4CFF] font-mono">
              <Radio className="w-3.5 h-3.5" />
              <span>HQ // AMSTERDAM LAB</span>
            </div>
          </div>
        </header>

        {/* Featured Cinematic Viewfinder Image */}
        <div className="max-w-5xl mx-auto mb-14">
          <div className="cinematic-viewfinder rounded-2xl overflow-hidden border border-white/15 bg-black/80 shadow-2xl relative group">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
              <img
                src={post.image || "/images/gallery_stage_lasers.jpg"}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

              {/* Top Viewfinder Telemetry Tag */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white tracking-widest uppercase">
                  RECORDING ID // {post.id}
                </span>
                <span className="px-3 py-1 rounded-md bg-[#00E5FF]/20 backdrop-blur-md border border-[#00E5FF]/40 text-[10px] font-mono font-bold text-[#00B4D8] tracking-widest uppercase hidden sm:inline-block">
                  24-BIT / 96KHZ FLAC
                </span>
              </div>
            </div>

            {/* Bottom Telemetry HUD */}
            <div className="py-3 px-5 sm:px-8 bg-black/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#8A8D93]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>VISUAL TELEMETRY: 64-AXIS VOLUMETRIC LASER ARRAY // MAIN ARENA STAGE</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#00B4D8]">
                <span>ARENA LATENCY: 2.8ms</span>
                <span>•</span>
                <span>SPL: 124dB PEAK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Interactive Action & Sharing Bar */}
        <div className="max-w-4xl mx-auto mb-12 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10 backdrop-blur-xl">
          {/* Reaction Sparks */}
          <button
            onClick={handleSparkClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              hasSparked
                ? "bg-[#00E5FF] text-black shadow-spark"
                : "bg-white/5 text-[#d0d0d8] hover:bg-white/10 border border-white/10"
            }`}
          >
            <Flame className={`w-4 h-4 ${hasSparked ? "fill-black" : "text-[#00E5FF]"}`} />
            <span>{hasSparked ? "SPARK IGNITED" : "IGNITE SPARK"}</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-[11px] font-mono">
              {sparksCount}
            </span>
          </button>

          {/* Audio Companion Bar */}
          <button
            onClick={handleToggleCompanionAudio}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              isCompanionPlaying
                ? "bg-[#7A4CFF]/25 border-[#7A4CFF] text-white shadow-[0_0_20px_rgba(122,76,255,0.4)]"
                : "bg-white/5 border-white/10 text-[#d0d0d8] hover:bg-white/10 hover:border-[#7A4CFF]/40"
            }`}
          >
            {isCompanionPlaying ? (
              <Pause className="w-4 h-4 text-[#7A4CFF] fill-[#7A4CFF]" />
            ) : (
              <Play className="w-4 h-4 text-[#00B4D8] fill-[#00B4D8]" />
            )}
            <div className="text-left">
              <span className="block text-[11px] font-mono tracking-wider text-[#00B4D8]">
                {isCompanionPlaying ? "NOW PLAYING" : "PLAY COMPANION TRACK"}
              </span>
              <span className="block text-xs font-semibold text-white">
                Spark Theory (Tour Master Edit)
              </span>
            </div>
            {/* Animated Equalizer */}
            <div className="flex items-end gap-0.5 h-4 ml-2">
              <span className={`w-1 bg-[#00E5FF] rounded-full transition-all ${isCompanionPlaying ? "h-4 animate-pulse" : "h-1"}`} />
              <span className={`w-1 bg-[#00B4D8] rounded-full transition-all ${isCompanionPlaying ? "h-3 animate-bounce" : "h-1.5"}`} />
              <span className={`w-1 bg-[#7A4CFF] rounded-full transition-all ${isCompanionPlaying ? "h-4 animate-pulse" : "h-1"}`} />
              <span className={`w-1 bg-[#00E5FF] rounded-full transition-all ${isCompanionPlaying ? "h-2 animate-bounce" : "h-2"}`} />
            </div>
          </button>

          {/* Font Resizer & Social Actions */}
          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-mono">
              <button
                onClick={() => setFontSize("normal")}
                className={`px-2 py-1 rounded ${fontSize === "normal" ? "bg-white/20 text-white font-bold" : "text-[#8A8D93] hover:text-white"}`}
                title="Normal Text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2 py-1 rounded text-sm ${fontSize === "large" ? "bg-white/20 text-white font-bold" : "text-[#8A8D93] hover:text-white"}`}
                title="Large Text"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize("xl")}
                className={`px-2 py-1 rounded text-base ${fontSize === "xl" ? "bg-white/20 text-white font-bold" : "text-[#8A8D93] hover:text-white"}`}
                title="Extra Large Text"
              >
                A++
              </button>
            </div>

            {/* WhatsApp Share */}
            <button
              onClick={shareWhatsApp}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-green-500/20 text-[#8A8D93] hover:text-green-400 border border-white/10 transition-colors"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Twitter/X Share */}
            <button
              onClick={shareTwitter}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-sky-500/20 text-[#8A8D93] hover:text-sky-400 border border-white/10 transition-colors"
              title="Share on X (Twitter)"
            >
              <XIcon className="w-4 h-4" />
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-[#00E5FF]/20 text-[#8A8D93] hover:text-[#00B4D8] border border-white/10 transition-colors"
              title="Copy Article Link"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black text-[10px] font-mono text-green-400 border border-green-500/30 whitespace-nowrap shadow-lg">
                  COPIED!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Article Grid (Content + Sticky Sidebar) */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content (8 cols on desktop) */}
          <div className="lg:col-span-8">
            <article className={`text-[#d4d4dc] ${fontSizeClasses} space-y-8 font-sans`}>
              {/* Styled Lead Paragraph with Drop Cap */}
              <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
                <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed first-letter:float-left first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-black first-letter:text-[#00B4D8] first-letter:mr-3 first-letter:leading-none">
                  {post.excerpt}
                </p>
              </div>

              {/* Dynamic or Static HTML Content */}
              {post.content ? (
                <div
                  className="space-y-6 prose prose-invert prose-orange max-w-none text-[#d4d4dc] [&>h3]:text-2xl [&>h3]:sm:text-3xl [&>h3]:font-black [&>h3]:text-white [&>h3]:tracking-tight [&>h3]:pt-6 [&>h3]:pb-2 [&>p]:leading-relaxed [&>blockquote]:my-8 [&>blockquote]:p-6 [&>blockquote]:rounded-2xl [&>blockquote]:bg-white/5 [&>blockquote]:border-l-4 [&>blockquote]:border-[#00E5FF] [&>blockquote]:text-xl [&>blockquote]:font-bold [&>blockquote]:text-white [&>blockquote]:italic"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <>
                  <p>
                    When you stand before 50,000 people in an open stadium or an underground bunker, sound ceases to be mere vibrations in the air. It transforms into physical mass. Over the past three years of developing our touring concept, our core obsession has been simple: how do we dissolve the boundary between the performer, the light, and the listener?
                  </p>

                  <blockquote className="my-8 p-6 sm:p-8 rounded-2xl bg-white/5 border-l-4 border-[#00E5FF] text-xl sm:text-2xl font-bold text-white italic shadow-lg">
                    &quot;A great DJ set is not just track selection. It is the conscious manipulation of physical space, electromagnetic fields, and mass human euphoria.&quot;
                    <span className="block text-xs font-mono font-normal text-[#00B4D8] mt-3 not-italic">
                      — Dj G-Spark, World Tour Sound Notes
                    </span>
                  </blockquote>

                  <h3 className="text-2xl sm:text-3xl font-black text-white pt-4">
                    Cardioid Sub-Bass Array Engineering
                  </h3>
                  <p>
                    Most commercial touring productions prioritize raw decibels over phase coherence. However, in our touring specification, phase alignment and transient decay time are paramount. By placing subwoofer elements in an end-fire cardioid configuration with microsecond delay alignment, we eliminate destructive low-frequency reflection and direct pure acoustic energy into the crowd floor.
                  </p>
                </>
              )}

              {/* Technical Rider / Audio Blueprint Card */}
              <div className="my-10 p-6 sm:p-8 rounded-2xl glass-card border border-white/10 bg-black/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00B4D8] uppercase tracking-wider mb-4">
                  <Sliders className="w-4 h-4" />
                  <span>TOUR TECHNICAL RIDER // ACOUSTIC BLUEPRINT</span>
                </div>

                <h4 className="text-xl font-black text-white mb-6">
                  Real-time FOH & Soundstage Specifications
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="block text-2xl font-black text-[#00E5FF] font-mono">100kW</span>
                    <span className="text-[11px] text-[#8A8D93] uppercase font-mono mt-1 block">Continuous RMS</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="block text-2xl font-black text-white font-mono">28Hz</span>
                    <span className="text-[11px] text-[#8A8D93] uppercase font-mono mt-1 block">Low Sub Extension</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="block text-2xl font-black text-[#7A4CFF] font-mono">32 CH</span>
                    <span className="text-[11px] text-[#8A8D93] uppercase font-mono mt-1 block">DMX Laser Bridge</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="block text-2xl font-black text-green-400 font-mono">&lt;4ms</span>
                    <span className="text-[11px] text-[#8A8D93] uppercase font-mono mt-1 block">Telemetry Latency</span>
                  </div>
                </div>
              </div>

              {/* Secondary Visual Breakout Photo */}
              <div className="my-10 rounded-2xl overflow-hidden border border-white/10 bg-black">
                <img
                  src="/images/concert_led.jpg"
                  alt="Dj G-Spark Live Concert Arena"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="p-4 bg-black/90 text-xs font-mono text-[#8A8D93] flex items-center justify-between border-t border-white/10">
                  <span>PHOTO ARCHIVE // LIVE ARENA ENERGY & PYRO CHOREOGRAPHY</span>
                  <span className="text-[#00B4D8]">NEW DELHI STADIUM</span>
                </div>
              </div>

              {/* Key Touring Takeaways Callout Box */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1F2833] border border-[#00E5FF]/25 relative">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00B4D8] uppercase tracking-wider font-mono mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>KEY TOURING TAKEAWAYS</span>
                </div>
                <ul className="text-sm sm:text-base text-[#d0d0d8] space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Zero Latency Telemetry:</strong> Lasers and visual shaders react within 4ms of synthesizer filter modulations.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Tactile Control:</strong> Live sets feature dynamic analog modulations rather than rigid pre-rendered playback.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-2.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Immersive Audio:</strong> Ambisonic fill speakers wrap the entire arena in subtle spatial reverberance.
                    </span>
                  </li>
                </ul>
              </div>

              {/* End-of-Article Engagement CTA */}
              <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-white block">
                    Shared from Dj G-Spark Chronicles
                  </span>
                  <span className="text-xs text-[#8A8D93]">
                    Stay tuned for upcoming tour dispatches & sound architecture releases.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSparkClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hasSparked
                        ? "bg-[#00E5FF] text-black shadow-spark"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${hasSparked ? "fill-black" : "text-[#00E5FF]"}`} />
                    <span>{sparksCount} Sparks</span>
                  </button>
                  <button
                    onClick={shareWhatsApp}
                    className="px-4 py-2 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Large Author Spotlight Card */}
              <div className="mt-12 p-8 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0, 229, 255, 0.3)] flex-shrink-0">
                  <img
                    src="/images/dj_hero.jpg"
                    alt="Dj G-Spark"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-xl font-bold text-white">Dj G-Spark</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[10px] font-bold text-[#00B4D8] font-mono">
                      FOUNDER & HEADLINER
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#8A8D93] leading-relaxed">
                    World-touring electronic music artist, producer, and audio architectural designer. Signed to global festival rosters and creator of the 2026 World Tour experience.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                    <Link
                      href="/about"
                      className="text-xs font-bold text-[#00B4D8] hover:text-white transition-colors"
                    >
                      Artist Biography &rarr;
                    </Link>
                    <Link
                      href="/music"
                      className="text-xs font-bold text-[#00B4D8] hover:text-white transition-colors"
                    >
                      Listen to Discography &rarr;
                    </Link>
                    <a
                      href="https://wa.me/919540681934?text=Hello%20DJ%20G%20SPARK%20Management,%20I%20am%20interested%20in%20booking%20an%20event."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Book on WhatsApp (+91 95406 81934)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Article Ratings & Community Reviews Section */}
              <ArticleReviewSection articleSlug={post.slug || post.id} articleTitle={post.title} />
            </article>
          </div>

          {/* Sticky Sidebar (4 cols on desktop) */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-6">
              {/* VIP Tour Booking Widget */}
              <div className="p-6 rounded-2xl glass-card border border-[#00E5FF]/40 bg-gradient-to-b from-[#00E5FF]/10 via-[#0B0B0B] to-[#0B0B0B] relative overflow-hidden">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00B4D8] uppercase block mb-2">
                  2026 WORLD TOUR TICKETS & VIP
                </span>
                <h4 className="text-lg font-black text-white mb-2 leading-tight">
                  Experience The Stadium Show Live
                </h4>
                <p className="text-xs text-[#8A8D93] leading-relaxed mb-5">
                  Grab VIP stage passes, private tables, and guestlist reservations for upcoming concerts in Mumbai, Delhi, Amsterdam, and Dubai.
                </p>

                <a
                  href="https://wa.me/919540681934?text=Hi%20DJ%20G%20SPARK%20Team,%20I%20read%20your%20article%20and%20would%20like%20to%20reserve%20VIP%20passes%20for%20the%20upcoming%20tour."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-extrabold text-xs tracking-wider uppercase text-center shadow-spark flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>GET VIP PASSES ON WHATSAPP</span>
                </a>

                <div className="mt-3 text-center">
                  <span className="text-[10px] font-mono text-[#8A8D93]">
                    Direct line: +91 95406 81934
                  </span>
                </div>
              </div>

              {/* Audio Companion Player Mini-Card */}
              <div className="p-5 rounded-2xl glass-card border border-white/10 bg-black/60 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#00B4D8] font-bold flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    AUDIO COMPANION
                  </span>
                  <span className="text-[10px] font-mono text-[#8A8D93]">
                    {isCompanionPlaying ? "PLAYING" : "PAUSED"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/15 relative flex-shrink-0">
                    <img
                      src="/images/album_art.jpg"
                      alt="Album Art"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <button
                        onClick={handleToggleCompanionAudio}
                        className="w-7 h-7 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        {isCompanionPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-black" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">
                      Spark Theory (Arena Edit)
                    </h5>
                    <span className="text-[10px] font-mono text-[#8A8D93] block truncate">
                      Dj G-Spark • 132 BPM
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of Contents / Key Highlights */}
              <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider block">
                  CHRONICLE HIGHLIGHTS
                </span>
                <nav className="space-y-2 text-xs font-medium">
                  <a
                    href="#introduction"
                    className="flex items-center gap-2 p-2 rounded-lg text-[#8A8D93] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="font-mono text-[#00B4D8] text-[10px]">01</span>
                    <span className="truncate">The Physical Reality of Sound</span>
                  </a>
                  <a
                    href="#engineering"
                    className="flex items-center gap-2 p-2 rounded-lg text-[#8A8D93] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="font-mono text-[#00B4D8] text-[10px]">02</span>
                    <span className="truncate">Cardioid Subwoofer Array</span>
                  </a>
                  <a
                    href="#visuals"
                    className="flex items-center gap-2 p-2 rounded-lg text-[#8A8D93] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="font-mono text-[#00B4D8] text-[10px]">03</span>
                    <span className="truncate">Laser Telemetry & OSC Bridge</span>
                  </a>
                  <a
                    href="#takeaways"
                    className="flex items-center gap-2 p-2 rounded-lg text-[#8A8D93] hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span className="font-mono text-[#00B4D8] text-[10px]">04</span>
                    <span className="truncate">Key Touring Takeaways</span>
                  </a>
                  <a
                    href="#reviews"
                    className="flex items-center gap-2 p-2 rounded-lg text-[#00B4D8] hover:text-white hover:bg-[#00E5FF]/10 transition-all font-semibold"
                  >
                    <span className="font-mono text-[#00B4D8] text-[10px]">05</span>
                    <span className="truncate flex items-center gap-1.5">
                      <span>Reader Reviews</span>
                      <Star className="w-3 h-3 fill-[#00B4D8]" />
                    </span>
                  </a>
                </nav>
              </div>

              {/* Trending Dispatches List */}
              <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider block">
                  TRENDING DISPATCHES
                </span>
                <div className="space-y-3">
                  {relatedPosts.slice(0, 2).map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug || rel.id}`}
                      className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/60">
                        <img
                          src={rel.image || "/images/dj_hero.jpg"}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-[#00B4D8] uppercase block">
                          {rel.category}
                        </span>
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                          {rel.title}
                        </h5>
                        <span className="text-[10px] text-[#8A8D93] font-mono">
                          {rel.readTime}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Previous & Next Article Navigation Switcher */}
        <div className="max-w-5xl mx-auto mt-20 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previous Post */}
          {prevPost && (
            <Link
              href={`/blog/${prevPost.slug || prevPost.id}`}
              className="p-6 rounded-2xl glass-card border border-white/10 hover:border-[#00E5FF]/50 transition-all flex items-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/60">
                <img
                  src={prevPost.image || "/images/dj_hero.jpg"}
                  alt={prevPost.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8A8D93] uppercase tracking-wider mb-1">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  <span>PREVIOUS DISPATCH</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                  {prevPost.title}
                </h4>
                <span className="text-[11px] text-[#8A8D93] font-mono mt-0.5 block">
                  {prevPost.dateDisplay} • {prevPost.readTime}
                </span>
              </div>
            </Link>
          )}

          {/* Next Post */}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug || nextPost.id}`}
              className="p-6 rounded-2xl glass-card border border-white/10 hover:border-[#00E5FF]/50 transition-all flex items-center justify-between gap-4 group text-right"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-[#8A8D93] uppercase tracking-wider mb-1">
                  <span>NEXT DISPATCH</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00B4D8] transition-colors">
                  {nextPost.title}
                </h4>
                <span className="text-[11px] text-[#8A8D93] font-mono mt-0.5 block">
                  {nextPost.dateDisplay} • {nextPost.readTime}
                </span>
              </div>
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/60">
                <img
                  src={nextPost.image || "/images/dj_hero.jpg"}
                  alt={nextPost.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </Link>
          )}
        </div>

        {/* Related Articles Showcase */}
        {relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#00B4D8] uppercase block">
                  CONTINUE READING
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  MORE FROM STUDIO CHRONICLES
                </h3>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#00B4D8] hover:text-white transition-colors flex items-center gap-1 font-mono uppercase"
              >
                <span>EXPLORE ALL ({allPosts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((item) => (
                <article
                  key={item.id}
                  className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-black/60">
                    <img
                      src={item.image || "/images/dj_hero.jpg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider text-[#00B4D8] uppercase border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-[#8A8D93] font-mono mb-2">
                        <span>{item.dateDisplay}</span>
                        <span>•</span>
                        <span>{item.readTime}</span>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight group-hover:text-[#00B4D8] transition-colors line-clamp-2 mb-2">
                        <Link href={`/blog/${item.slug || item.id}`}>{item.title}</Link>
                      </h4>

                      <p className="text-xs text-[#8A8D93] leading-relaxed line-clamp-2 mb-4">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[#d0d0d8] font-semibold text-[11px]">
                        {item.author}
                      </span>
                      <Link
                        href={`/blog/${item.slug || item.id}`}
                        className="text-[11px] font-bold text-[#00B4D8] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span>Read</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* High-Impact VIP Concert CTA Banner */}
        <div className="max-w-5xl mx-auto mt-20 p-8 sm:p-12 rounded-3xl relative overflow-hidden border border-[#00E5FF]/40 bg-gradient-to-r from-black via-[#0d0905] to-[#120a05] shadow-[0_0_60px_rgba(0, 229, 255, 0.15)] text-center">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#00E5FF]/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#7A4CFF]/20 rounded-full blur-[90px] pointer-events-none" />

          <span className="px-3.5 py-1 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-xs font-mono font-bold text-[#00B4D8] uppercase tracking-widest inline-block mb-4">
            LIVE ARENA EXPERIENCE
          </span>

          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            FEEL THE SPARK <span className="text-[#00E5FF]">LIVE IN CONCERT</span>
          </h3>

          <p className="text-sm sm:text-base text-[#b4b4c0] max-w-2xl mx-auto mb-8 leading-relaxed">
            Witness the 100,000-watt sound architecture, synchronized laser canopy, and unreleased festival anthems. Contact artist management for VIP tables, backstage guestlist, and tickets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/919540681934?text=Hi%20DJ%20G%20SPARK%20Management,%20I%20am%20interested%20in%20booking%20VIP%20passes%20and%20tickets%20for%20the%20World%20Tour."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:brightness-110 text-black font-black text-sm tracking-wider uppercase shadow-spark flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-black" />
              <span>RESERVE ON WHATSAPP (+91 95406 81934)</span>
            </a>

            <Link
              href="/#tour"
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm tracking-wider uppercase transition-all"
            >
              VIEW TOUR SCHEDULE
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}