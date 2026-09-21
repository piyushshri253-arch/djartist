"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Radio,
  ExternalLink,
  X,
  Volume2,
  VolumeX,
  TrendingUp,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle2,
  ArrowUpRight,
  Star,
  Eye,
  Ticket,
} from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import {
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
} from "@/components/ui/SocialIcons";
import { TicketModal } from "@/components/ui/TicketModal";
import { WhatsAppFloatButton } from "@/components/ui/WhatsAppFloatButton";
import ReviewModal from "@/components/reviews/ReviewModal";
import { ReviewItem } from "@/types";
import rawPastEvents from "@/data/past-events.json";

const INITIAL_HOMEPAGE_PAST_EVENTS = (rawPastEvents as any[]).slice(0, 4);

// Social Media Platforms Reach Data (Official Verified Platforms Only)
const SOCIAL_PLATFORMS = [
  {
    name: "YOUTUBE",
    handle: "@djg-spark",
    stat: "18.5M+",
    metric: "TOTAL WATCH VIEWS",
    subtext: "40K+ Subscribers • 4K HDR Live Sets & Official Tour Aftermovies",
    link: "https://youtube.com/@djg-spark",
    badge: "OFFICIAL CHANNEL",
    accent: "#FF0000",
    bgHover: "hover:border-[#FF0000]/60",
    Icon: YouTubeIcon,
    cta: "WATCH SETS",
  },
  {
    name: "INSTAGRAM",
    handle: "@djgspark",
    stat: "300k+",
    metric: "REEL PLAYS & ENGAGEMENT",
    subtext: "10K+ Followers • Viral Stage Drops & Exclusive Backstage Logs",
    link: "https://www.instagram.com/djgspark",
    badge: "VERIFIED ARTIST",
    accent: "#E1306C",
    bgHover: "hover:border-[#E1306C]/60",
    Icon: InstagramIcon,
    cta: "FOLLOW REELS",
  },
  {
    name: "FACEBOOK",
    handle: "DJ G SPARK",
    stat: "100k+",
    metric: "COMMUNITY REACH & UPDATES",
    subtext: "Official Tour Announcements, Concert Photos & Live Updates",
    link: "https://www.facebook.com/share/1BxXiXLitH/",
    badge: "OFFICIAL PAGE",
    accent: "#1877F2",
    bgHover: "hover:border-[#1877F2]/60",
    Icon: FacebookIcon,
    cta: "JOIN COMMUNITY",
  },
];

// Tour Event Data
const UPCOMING_EVENTS = [
  {
    id: "delhi-jln",
    city: "DELHI",
    country: "INDIA",
    venue: "Jawaharlal Nehru Stadium",
    date: "DEC 18, 2026",
    day: "18",
    month: "DEC",
    time: "07:00 PM IST",
    doors: "05:00 PM",
    badge: "HEADLINER STADIUM TOUR",
    status: "SELLING FAST",
    poster: "/images/poster_delhi.jpg",
    ticketLink: "/booking",
  },
  {
    id: "mumbai-dypatil",
    city: "MUMBAI",
    country: "INDIA",
    venue: "D.Y. Patil Stadium",
    date: "DEC 24, 2026",
    day: "24",
    month: "DEC",
    time: "07:30 PM IST",
    doors: "05:30 PM",
    badge: "360° SENSORY ARENA",
    status: "LIMITED VIP LEFT",
    poster: "/images/poster_mumbai.jpg",
    ticketLink: "/booking",
  },
  {
    id: "goa-sunburn",
    city: "GOA",
    country: "INDIA",
    venue: "Vagator Beach Festival Grounds",
    date: "DEC 31, 2026",
    day: "31",
    month: "DEC",
    time: "09:00 PM IST",
    doors: "06:00 PM",
    badge: "SUNBURN NYE SUNSET CLIMAX",
    status: "ALMOST SOLD OUT",
    poster: "/images/poster_goa.jpg",
    ticketLink: "/booking",
  },
  {
    id: "dubai-cocacola",
    city: "DUBAI",
    country: "UAE",
    venue: "Coca-Cola Arena",
    date: "JAN 15, 2027",
    day: "15",
    month: "JAN",
    time: "08:30 PM GST",
    doors: "06:30 PM",
    badge: "WORLD TOUR ARENA SPECTACLE",
    status: "VIP FAST TRACK",
    poster: "/images/poster_dubai.jpg",
    ticketLink: "/booking",
  },
];

// Artist Reviews & Industry Testimonials Data
const ARTIST_REVIEWS = [
  {
    id: "r1",
    name: "Karan Singh",
    role: "Festival Director",
    organization: "Percept Live • Sunburn Festival",
    initials: "KS",
    rating: 5,
    badge: "FESTIVAL PROMOTER",
    badgeColor: "text-[#00B4D8] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    event: "SUNBURN GOA MAINSTAGE",
    quote:
      "DJ G Spark's sunset headline set at Sunburn was legendary. 55,000 people moving in unison to his progressive drops and laser show. His crowd control, sound design, and live remixing are on par with the biggest global festival acts.",
    date: "JANUARY 2026",
    category: "promoter",
  },
  {
    id: "r2",
    name: "Liam Harrison",
    role: "Senior Electronic Music Critic",
    organization: "DJ Mag International (UK)",
    initials: "LH",
    rating: 5,
    badge: "MUSIC PRESS",
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    event: "DJ MAG WORLD RANKING REVIEW",
    quote:
      "Ranked among the most thrilling breakthrough arena headliners of 2026. G Spark doesn't just mix tracks; he constructs a colossal sonic cathedral of driving analog basslines, cinematic melodies, and synchronized light architecture.",
    date: "FEBRUARY 2026",
    category: "critic",
  },
  {
    id: "r3",
    name: "Tariq Al-Mansoor",
    role: "Director of Live Entertainment",
    organization: "Coca-Cola Arena Dubai",
    initials: "TA",
    rating: 5,
    badge: "ARENA OPERATOR",
    badgeColor: "text-[#00B4D8] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    event: "WORLD TOUR ARENA SPECTACLE",
    quote:
      "The acoustic precision and stadium production that G Spark delivered at Coca-Cola Arena set a new benchmark for electronic touring. 17,000 fans completely entranced from the opening ID to the final pyro blast. A true professional.",
    date: "JANUARY 2026",
    category: "promoter",
  },
  {
    id: "r4",
    name: "Ananya Sharma",
    role: "Culture & Music Editor",
    organization: "Rolling Stone Magazine",
    initials: "AS",
    rating: 5,
    badge: "EDITORIAL REVIEW",
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    event: "SPARK THEORY ALBUM TOUR",
    quote:
      "A masterclass in emotional buildup, tension release, and stadium euphoria. DJ G Spark is the rare producer whose live hybrid setup elevates raw festival power into pure art. One of the undisputed torchbearers of progressive electronic music.",
    date: "DECEMBER 2025",
    category: "critic",
  },
  {
    id: "r5",
    name: "Marc Van Der Bilt",
    role: "Stage Operations Director",
    organization: "Tomorrowland European Circuit",
    initials: "MB",
    rating: 5,
    badge: "STAGE CURATOR",
    badgeColor: "text-[#00B4D8] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    event: "TOMORROWLAND SUNSET ARENA",
    quote:
      "G Spark command of the 4-deck CDJ-3000 setup with custom analog modular synths brought an electric, unpredictable dynamism. The crowd was screaming for an encore even 15 minutes after curfew. Electrifying artist.",
    date: "SEPTEMBER 2025",
    category: "promoter",
  },
  {
    id: "r6",
    name: "Rohit Malhotra",
    role: "Verified Superfan & Producer",
    organization: "Attended 8 Tour Shows Across 3 Countries",
    initials: "RM",
    rating: 5,
    badge: "VERIFIED FAN",
    badgeColor: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30",
    event: "MUMBAI & DUBAI ARENA SHOWS",
    quote:
      "I've attended electronic concerts all over the world, but DJ G Spark's energy and track selection are completely unmatched. The unreleased edits he drops live give you chills. Best live concert experience of my life, hands down!",
    date: "AUGUST 2026",
    category: "fan",
  },
];

// Video Showcase Data
const VIDEO_SHOWCASE = [
  {
    id: "v1",
    title: "Mainstage Headline Performance",
    tag: "SONY CINEMATIC 4K // 50 FPS",
    duration: "00:11",
    thumbnail: "/images/thumb_C5083.jpg",
    videoSrc: "/images/C5083.MP4",
  },
  {
    id: "v2",
    title: "Viral New Year Event  & Pyro Blast",
    tag: "4K 60FPS REEL // BASS CLIMAX",
    duration: "00:30",
    thumbnail: "/images/thumb_lv_0_20250622150320.jpg",
    videoSrc: "/images/lv_0_20250622150320.mp4",
  },
  {
    id: "v3",
    title: "Behind The Decks: Stadium POV",
    tag: "LIVE BOOTH CROWD CAM",
    duration: "00:38",
    thumbnail: "/images/thumb_IMG_7608.jpg",
    videoSrc: "/images/IMG_7608.mp4",
  },
  {
    id: "v4",
    title: "Sunburn Goa 55,000 Crowd Climax",
    tag: "STADIUM HEADLINER DROP",
    duration: "18:45",
    thumbnail: "/images/past_event_crowd.jpg",
    videoSrc: "/images/tour_09_arena_climax.mp4",
  },
  {
    id: "v5",
    title: "Tomorrowland Sunset Mainstage 2026",
    tag: "LIVE FESTIVAL SET // 4K",
    duration: "24:18",
    thumbnail: "/images/past_event_sunset.jpg",
    videoSrc: "/images/tour_06_crowd_rise.mp4",
  },
  {
    id: "v6",
    title: "Spark Theory (Official 4K Music Video)",
    tag: "OFFICIAL CINEMATIC RELEASE",
    duration: "04:32",
    thumbnail: "/images/concert_led_wall.jpg",
    videoSrc: "/images/tour_05_led_tunnel.mp4",
  },
];

// Photo Gallery Data
const PHOTO_GALLERY = [
  {
    src: "/images/gallery_eep09781.jpg",
    title: "Live Stadium Headliner",
    subtitle: "Arena Grand Stage Climax",
    category: "live",
  },
  {
    src: "/images/gallery_festival_sunset.jpg",
    title: "Outdoor Sunset Festival",
    subtitle: "Synth Horizon & Bass Run",
    category: "festivals",
  },
  {
    src: "/images/gallery_stage_lasers.jpg",
    title: "Laser Volumetric Array",
    subtitle: "Spectacular Stage Pyrotechnics",
    category: "live",
  },
  {
    src: "/images/gallery_dj_decks_pov.jpg",
    title: "Decks Command POV",
    subtitle: "CDJ-3000 & DJM-V10 Control",
    category: "backstage",
  },
  {
    src: "/images/gallery_club_energy.jpg",
    title: "Club Nights & Light Sculptures",
    subtitle: "Hypnotic Progressive Set",
    category: "live",
  },
  {
    src: "/images/gallery_crowd_pulse.webp",
    title: "Electric Crowd Movement",
    subtitle: "30,000 Fans United",
    category: "festivals",
  },
  {
    src: "/images/gallery_visual_art.webp",
    title: "Visual Identity & Artwork",
    subtitle: "Architectural Music Experience",
    category: "backstage",
  },
  {
    src: "/images/gallery_backstage_moment.jpg",
    title: "Backstage Access & Focus",
    subtitle: "Green Room Pre-Show Ritual",
    category: "backstage",
  },
  {
    src: "/images/past_event_crowd.jpg",
    title: "Sunburn Goa 55,000 Crowd",
    subtitle: "Mainstage Headliner Set",
    category: "festivals",
  },
  {
    src: "/images/past_event_sunset.jpg",
    title: "Tomorrowland Sunset Arena",
    subtitle: "Melodic Anthem Euphoria",
    category: "festivals",
  },
  {
    src: "/images/dj_spark_stage.jpg",
    title: "Laser Pyro Deck Showcase",
    subtitle: "World Tour Arena Launch",
    category: "live",
  },
  {
    src: "/images/arena_crowd_pro.jpg",
    title: "40,000 Stadium Amphitheater",
    subtitle: "D.Y. Patil Sensory Night",
    category: "festivals",
  },
];

// Latest News / Blog Posts
const LATEST_POSTS = [
  {
    title: "Sunburn Festival 2026: DJ G Spark Confirmed as Mainstage Headliner",
    date: "OCTOBER 14, 2026",
    category: "FESTIVAL NEWS",
    image: "/images/past_event_crowd.jpg",
    slug: "sunburn-headliner-announcement",
  },
  {
    title: "Inside The Studio: The Analog Hardware Behind 'Spark Theory'",
    date: "SEPTEMBER 28, 2026",
    category: "PRODUCTION",
    image: "/images/dj_hero.jpg",
    slug: "producing-spark-theory",
  },
  {
    title: "World Tour Phase 2: Asia & Europe Stadium Dates Announced",
    date: "SEPTEMBER 05, 2026",
    category: "TOUR UPDATES",
    image: "/images/world_tour_stage.jpg",
    slug: "world-tour-phase-2",
  },
];

export default function HomePage() {
  const { isPlaying, togglePlay } = useAudio();
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>(PHOTO_GALLERY);
  const [videoList, setVideoList] = useState<any[]>(VIDEO_SHOWCASE);
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [reviewCategory, setReviewCategory] = useState("all");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(ARTIST_REVIEWS as any);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>(UPCOMING_EVENTS);
  const [homepagePastEvents, setHomepagePastEvents] = useState<any[]>(INITIAL_HOMEPAGE_PAST_EVENTS);
  const [latestPosts, setLatestPosts] = useState<any[]>(LATEST_POSTS);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<any | null>(null);
  const [siteSettings, setSiteSettings] = useState<any | null>(null);
  const [publicInstagram, setPublicInstagram] = useState<{
    enabled: boolean;
    account?: {
      username: string;
      profilePicture?: string;
      profileUrl: string;
      status: string;
      lastSyncedAt?: string;
    };
    totalReels: number;
    reels: Array<{
      id: string;
      instagramMediaId: string;
      username: string;
      caption: string;
      thumbnailUrl: string;
      permalink: string;
      mediaType: string;
      publishedAt: string;
      viewsDisplay?: string;
      likesCount?: number;
    }>;
  } | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const reelVideoRef = useRef<HTMLVideoElement>(null);

  const filteredPhotos = galleryPhotos.filter(
    (photo) => galleryFilter === "all" || photo.category === galleryFilter
  );

  const filteredReviews = reviewsList.filter(
    (rev) => reviewCategory === "all" || rev.category === reviewCategory
  );

  const fetchReviews = () => {
    fetch("/api/reviews", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList(data.reviews);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => {});
    }

    // Dynamic Live Events & Blogs Fetch
    fetch("/api/events?type=upcoming", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUpcomingEvents(data.slice(0, 4));
        }
      })
      .catch(() => {});

    // Dynamic Past Events Fetch
    fetch("/api/past-events?sort=latest", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHomepagePastEvents(data.slice(0, 4));
        }
      })
      .catch(() => {});

    fetch("/api/blogs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestPosts(data.slice(0, 3));
        }
      })
      .catch(() => {});

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.instagram || data.profile)) {
          setSiteSettings(data);
        }
      })
      .catch(() => {});

    // Live Instagram Integration Fetch
    fetch("/api/public/social/instagram", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPublicInstagram(data);
        }
      })
      .catch(() => {});

    // Dynamic Photo Gallery Fetch
    fetch("/api/gallery", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGalleryPhotos(data);
        }
      })
      .catch(() => {});

    // Dynamic Video Showcase Fetch
    fetch("/api/videos", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVideoList(data);
        }
      })
      .catch(() => {});

    fetchReviews();
  }, []);

  const instagramData = {
    enabled: publicInstagram?.enabled ?? false,
    handle: `@${publicInstagram?.account?.username || "djgspark"}`,
    profileUrl: publicInstagram?.account?.profileUrl || `https://www.instagram.com/${publicInstagram?.account?.username || "djgspark"}/`,
    profilePicture: publicInstagram?.account?.profilePicture || "/images/dj_hero.jpg",
    status: publicInstagram?.account?.status || "connected",
    lastSyncedAt: publicInstagram?.account?.lastSyncedAt,
    reels: publicInstagram?.reels || [],
  };

  const rawReels = instagramData.reels;
  const featuredReels = rawReels;

  return (
    <div className="bg-[#0B0C10] text-[#F5F6FA] min-h-screen overflow-x-hidden selection:bg-[#00E5FF] selection:text-black">
      {/* ============================================================ */}
      {/* 1. HERO VIDEO BANNER                                          */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Full-bleed background video */}
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        >
          <source src="/images/C5083.MP4" type="video/mp4" />
          <source src="/images/c5083.mp4" type="video/mp4" />
          <source src="/images/tour_04_dj_performing.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/85 via-[#0B0C10]/45 to-[#0B0C10]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0C10]/50 to-[#0B0C10]" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 text-center flex flex-col items-center">
          {/* Live Status Badge */}
          {/* <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-[#00E5FF]/40 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(0, 229, 255, 0.25)]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono tracking-[0.22em] text-[#00B4D8] uppercase font-semibold">
              DJ G SPARK • WORLD TOUR 2026
            </span>
          </div> */}

          {/* Main Hero Headline */}
          <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.03em] uppercase leading-[0.95] max-w-5xl mb-4 text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            DJ G-Spark <br />
           
          </h1>
           <span className="text-transparent  bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#FFA030] to-[#00B4D8] text-4sm">
              One Of The Best DJ From Delhi (INDIA)
            </span>
            

          {/* Tagline / Subtitle */}
          {/* <p className="max-w-2xl text-sm sm:text-base md:text-lg text-[#CCCCCC] font-normal leading-relaxed mb-8 sm:mb-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Pioneering the hybrid signature of progressive electronic melodies and driving stadium energy. Experience the international concert spectacle live across 4 continents.
          </p> */}

          {/* Interactive CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Audio Anthem Play Button */}
            {/* <button
              onClick={togglePlay}
              className="w-full sm:w-auto px-7 py-4 rounded-md bg-[#00E5FF] text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-white transition-all shadow-[0_0_30px_rgba(0, 229, 255, 0.5)] flex items-center justify-center gap-3 group"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-black text-black" />
                  <span>PAUSE ANTHEM</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>LISTEN TO ANTHEM</span>
                </>
              )}
            </button> */}

            {/* Upcoming Dates Button */}
            {/* <a
              href="#events"
              className="w-full sm:w-auto px-7 py-4 rounded-md border border-white/20 bg-black/50 text-[#F5F6FA] font-heading font-bold text-xs tracking-[0.2em] uppercase hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              <span>UPCOMING DATES</span>
              <ArrowRight className="w-4 h-4" />
            </a> */}

            {/* Watch Aftermovie Button */}
            {/* <button
              onClick={() => setActiveVideoModal("/images/C5083.MP4")}
              className="w-full sm:w-auto px-7 py-4 rounded-md border border-white/10 bg-white/5 text-[#CCCCCC] font-heading font-medium text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/30 transition-all backdrop-blur-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FFA030]" />
              <span>WATCH AFTERMOVIE</span>
            </button> */}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mt-14 pt-8 border-t border-white/10 w-full max-w-4xl">
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl text-white">10+</span>
              <span className="block text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#888888] uppercase mt-1">
                Years Headlining
              </span>
            </div>
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl text-[#00E5FF]">50K+</span>
              <span className="block text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#888888] uppercase mt-1">
                Fans United
              </span>
            </div>
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl text-white">20M+</span>
              <span className="block text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#888888] uppercase mt-1">
                Streams Worldwide
              </span>
            </div>
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl text-[#00E5FF]">04</span>
              <span className="block text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#888888] uppercase mt-1">
                Countries Toured
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. UPCOMING EVENTS SECTION (#events)                          */}
      {/* ============================================================ */}
      <section id="events" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#0B0C10]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
             
              <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white">
                UPCOMING <span className="text-[#00E5FF]">EVENTS</span>
              </h2>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#8A8D93] hover:text-[#00E5FF] transition-colors group"
            >
              <span>VIEW ALL TOUR DATES</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => {
              const dateDisplay = event.dateDisplay || event.date || "";
              const dateParts = dateDisplay.trim().split(" ");
              const day = event.day || dateParts[0] || "15";
              const month = event.month || dateParts[1] || "DEC";
              const poster = event.poster || event.image || "/images/past_event_crowd.jpg";
              const eventSlug = event.slug || event.id;
              const detailsLink = `/events/${eventSlug}`;
              const badge = event.badge || (event.region ? `${event.region.toUpperCase()} ARENA TOUR` : "WORLD TOUR 2026");
              const doors = event.doors || event.time || "07:00 PM IST";
              const showPrice = event.showPrice !== false;
              const inrPrice = event.priceINR ? `₹ ${Number(String(event.priceINR).replace(/[^0-9]/g, "")).toLocaleString("en-IN")}` : "₹ 2,499";
              const usdPrice = event.priceUSD ? `$${event.priceUSD}` : "$35";

              return (
                <div
                  key={event.id}
                  className="group relative bg-[#1F2833] border border-white/[0.08] hover:border-[#00E5FF]/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0, 229, 255, 0.15)] flex flex-col"
                >
                  {/* Poster Thumbnail Container (Clickable) */}
                  <Link href={detailsLink} className="block relative aspect-[3/4] w-full overflow-hidden bg-black">
                    <img
                      src={poster}
                      alt={`${event.city} Tour Poster`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2833] via-transparent to-black/40" />

                    {/* Date Badge */}
                    <div className="absolute top-3.5 left-3.5 w-12 h-12 rounded-md bg-black/80 border border-[#00E5FF]/40 backdrop-blur-md flex flex-col items-center justify-center text-center">
                      <span className="font-heading font-black text-sm text-[#00E5FF] leading-none">
                        {day}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/80 leading-tight">
                        {month}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded bg-[#00E5FF]/90 text-black text-[9px] font-mono uppercase tracking-widest font-bold">
                      {event.status || "ONSALE NOW"}
                    </div>
                  </Link>

                  {/* Event Details */}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase block mb-1">
                        {badge}
                      </span>
                      <h3 className="font-heading font-bold text-xl uppercase text-white mb-2 group-hover:text-[#00E5FF] transition-colors">
                        <Link href={detailsLink}>
                          {event.city}, {event.country}
                        </Link>
                      </h3>
                      <div className="space-y-1.5 text-xs text-[#929292] font-mono mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-white/50" />
                          <span>DOORS: {doors}</span>
                        </div>
                      </div>

                      {/* Pricing Tag */}
                      <div className="mb-4 pt-2 border-t border-white/5">
                        {showPrice ? (
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] uppercase font-mono text-[#777]">Passes:</span>
                            <div className="font-mono text-xs font-bold text-white">
                              {inrPrice} <span className="text-[#00B4D8] text-[11px]">/ {usdPrice}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] uppercase font-mono text-[#777]">Passes:</span>
                            <span className="font-mono text-xs font-bold text-[#00FF88]">Reservation Only</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={detailsLink}
                        className="py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white font-heading font-bold text-[11px] tracking-[0.14em] uppercase transition-all flex items-center justify-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 text-[#00E5FF]" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedTicketEvent(event)}
                        className="py-2.5 rounded bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-heading font-bold text-[11px] tracking-[0.14em] uppercase transition-all flex items-center justify-center gap-1 hover:shadow-[0_0_20px_rgba(0, 229, 255, 0.5)]"
                      >
                        <Ticket className="w-3 h-3" />
                        <span>Passes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2.5 PAST EVENTS SECTION (#past-events)                       */}
      {/* Dynamically loads completed past events from the unified DB */}
      {/* ============================================================ */}
      <section id="past-events" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#0B0C10]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-3">
                <Calendar className="w-3.5 h-3.5" />
                {/* <span>CONCERT ARCHIVES // COMPLETED ARENA & FESTIVAL SETS</span> */}
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white">
                PAST <span className="text-[#00E5FF]">EVENTS</span>
              </h2>
              {/* <p className="text-sm text-[#8A8D93] max-w-xl mt-2">
                Relive the electric energy, full tracklists, and fan moments from completed headline tour dates worldwide.
              </p> */}
            </div>

            <Link
              href="/past-events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 hover:bg-[#00E5FF] hover:text-black border border-white/10 text-xs font-heading font-bold tracking-[0.2em] uppercase text-white transition-all group"
            >
              <span>VIEW ALL PAST EVENTS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Past Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepagePastEvents.map((event) => {
              const eventSlug = event.slug || event.id;
              const detailsLink = `/past-events/${eventSlug}`;
              const year = event.date ? event.date.split("-")[0] : event.year || "ARCHIVE";

              return (
                <div
                  key={event.id}
                  className="group relative bg-[#1F2833] border border-white/[0.08] hover:border-[#00E5FF]/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0, 229, 255, 0.15)] flex flex-col justify-between"
                >
                  <div>
                    {/* Event Image */}
                    <Link href={detailsLink} className="block relative aspect-[4/3] w-full overflow-hidden bg-black">
                      <img
                        src={event.image || "/images/past_event_sunset.jpg"}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1F2833] via-transparent to-black/30" />
                      
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono uppercase tracking-wider text-[#00B4D8] font-bold border border-white/10">
                        {year} ARCHIVE
                      </span>

                      <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-[#00FF88] border border-white/10">
                        COMPLETED
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="p-5">
                      <span className="text-[11px] font-mono text-[#00B4D8] font-bold block mb-1">
                        {event.dateDisplay || event.date}
                      </span>
                      <h3 className="font-heading font-bold text-lg uppercase text-white mb-2 group-hover:text-[#00E5FF] transition-colors leading-snug">
                        <Link href={detailsLink}>
                          {event.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#8A8D93] font-mono mb-3">
                        <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                        <span className="truncate">{event.venue}, {event.city}</span>
                      </div>
                      <p className="text-xs text-[#8A8D93] line-clamp-2 leading-relaxed">
                        {event.description || event.excerpt || event.summary || "Massive headline performance featuring high-speed RGB lasers and custom live VIP edits."}
                      </p>
                    </div>
                  </div>

                  {/* Footer View Event Button */}
                  <div className="p-5 pt-0">
                    <Link
                      href={detailsLink}
                      className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-[#00E5FF] text-white hover:text-black font-heading font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-white/10 group-hover:border-[#00E5FF]"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ABOUT DJ G SPARK SECTION (#about)                          */}
      {/* ============================================================ */}
      <section id="about" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#0B0C10]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Artist Photo with glowing rim */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0, 229, 255, 0.18)]">
                <Image
                  src="/images/gallery_eep09781.jpg"
                  alt="DJ G SPARK Live Portrait"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 px-6 py-4 rounded-lg bg-[#1F2833]/95 border border-[#00E5FF]/40 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase block">
                  OFFICIAL ARTIST
                </span>
                <span className="font-heading font-black text-xl sm:text-2xl text-white">
                  DJ G-SPARK
                </span>
                
              </div>
            </div>

            {/* Right: Biography & Accolades */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ARTIST PROFILE // ORIGINS & SOUND</span>
              </div>

              <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white mb-6">
                Behind the beats<br />
                <span className="text-[#00E5FF]">Dj G-Spark</span>
              </h2>

             

              <p className="text-sm sm:text-base text-[#929292] leading-relaxed mb-8">
               DJ G Spark is a dynamic and high-energy DJ known for bringing explosive beats and seamless transitions to the dance floor.
              </p>
              <p className="text-sm sm:text-base text-[#929292] leading-relaxed mb-8">
              DJ G-Spark (Gaurav Singh) is a popular Delhi-based open-format DJ and music producer widely recognized for his high-energy performances at weddings, corporate gigs, and large-scale parties across India. Specialising in vibrant, non-stop dance mixes, he seamlessly blends multiple genres to keep the dance floor packed.
              </p>
                 <h2 className="font-heading font-black text-6xl sm:text-2xl tracking-[-0.02em] uppercase text-white mb-6">
                Key Details & Expertise<br />
                
              </h2>
              <ul>
                <li><b>Genres:</b>  Bollywood, Punjabi/Bhangra, Commercial, Retro, Electronic Dance Music (EDM), Bollytech, Bollyafro, Melodic Techno.</li>
                <li><b>Specialities: </b> 
                      Sangeet ceremonies, cocktail parties, wedding receptions, destination weddings, and concerts.</li>
                 <li><b>Performance Style:</b>  High-energy open-format mixing tailored closely to the crowd’s vibe and personal preferences.</li>
              </ul>

              

              {/* Sonic Philosophy Callout */}
              <blockquote className="p-5 sm:p-6 rounded-lg bg-[#0c0c10] border-l-4 border-[#00E5FF] mb-8">
                <p className="text-sm sm:text-base italic text-[#F5F6FA] font-medium leading-relaxed">
                  &quot;Music is not just heard — it is felt. When the drop hits at 128 BPM, forty thousand strangers breathe as one unified frequency. That is the spark.&quot;
                </p>
                <cite className="block text-xs font-mono tracking-[0.2em] text-[#00B4D8] uppercase mt-3 not-italic">
                  — DJ G SPARK
                </cite>
              </blockquote>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/about"
                  className="px-7 py-3.5 rounded bg-[#00E5FF] text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(0, 229, 255, 0.4)]"
                >
                  FULL BIOGRAPHY
                </Link>
                <Link
                  href="/booking"
                  className="px-7 py-3.5 rounded border border-white/20 hover:border-[#00E5FF] text-white hover:text-[#00E5FF] font-heading font-bold text-xs tracking-[0.2em] uppercase transition-all"
                >
                  PRESS KIT & BOOKING
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. VIRAL SOCIAL MILESTONE SECTION (#social)                   */}
      {/* ============================================================ */}
      <section id="social" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#07070b] overflow-hidden">
        {/* Ambient Backlight Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#00E5FF]/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-[#E1306C]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10">
          {/* Main Headline Banner */}
          <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>GLOBAL DIGITAL MOMENTUM // VIRAL SENSATION</span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-[-0.03em] uppercase text-white leading-[1.15] mb-6">
              <span className="bg-gradient-to-r from-[#00E5FF] via-[#FFAA00] to-white bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0, 229, 255, 0.4)]">
                20M+ Views
              </span>{" "}
              Across All Social Media Platforms!
            </h2>

            {/* <p className="text-base sm:text-lg text-[#B0B0B0] max-w-2xl mx-auto font-sans leading-relaxed">
              From explosive 50,000-person festival drops in Goa and Dubai to viral behind-the-decks transitions and trending club soundbites — join the global movement fueling modern electronic music.
            </p> */}

            {/* Quick Live Metric Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8">
              <div className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                <span className="text-xs font-mono tracking-wider text-white">10+ COUNTRIES STREAMING</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center gap-2.5">
                <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span className="text-xs font-mono tracking-wider text-white">240K+ ENGAGED COMMUNITY</span>
              </div>
              <div className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FFAA00]" />
                <span className="text-xs font-mono tracking-wider text-white">#DJGSPARK TRENDING</span>
              </div>
            </div>
          </div>

          {/* Grid Layout: 4 Platform Cards + Interactive Viral Reel Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: 4 Social Platform Metrics Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {SOCIAL_PLATFORMS.map((platform) => {
                const PlatformIcon = platform.Icon;
                return (
                  <div
                    key={platform.name}
                    className={`group relative p-6 rounded-xl bg-[#1F2833] border border-white/[0.08] ${platform.bgHover} transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex flex-col justify-between`}
                  >
                    <div>
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${platform.accent}15`, color: platform.accent }}
                        >
                          <PlatformIcon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 rounded text-[9px] font-mono tracking-widest uppercase font-bold bg-white/[0.05] border border-white/10 text-[#CCCCCC]">
                          {platform.badge}
                        </span>
                      </div>

                      {/* Stat Big Number */}
                      <div className="mb-2">
                        <span className="font-heading font-black text-3xl sm:text-4xl text-white group-hover:text-[#00E5FF] transition-colors block">
                          {platform.stat}
                        </span>
                        <span className="text-[10px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase font-bold block mt-1">
                          {platform.metric}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#8A8A8A] leading-relaxed mt-2.5 mb-4">
                        {platform.subtext}
                      </p>
                    </div>

                    {/* Footer Handle & Link */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-mono text-[#777777] group-hover:text-white transition-colors">
                        {platform.handle}
                      </span>
                      <a
                        href={platform.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-heading font-bold tracking-wider text-[#00E5FF] group-hover:text-white transition-colors uppercase"
                      >
                        <span>{platform.cta}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Realistic Viral Reel / TikTok Preview Mockup */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-grow rounded-2xl overflow-hidden border border-[#00E5FF]/30 bg-[#0c0c12] shadow-[0_15px_45px_rgba(0, 229, 255, 0.18)] flex flex-col justify-between min-h-[440px] sm:min-h-[500px]">
                {/* Autoplaying Festival Reel Video */}
                <video
                  ref={reelVideoRef}
                  autoPlay
                  loop
                  muted={isReelMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                >
                  <source src="/images/lv_0_20250622150320.mp4" type="video/mp4" />
                </video>

                {/* Dark Vignette & Gradient Overlays for readable UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                {/* Reel Header */}
                <div className="relative z-10 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#00E5FF] bg-black">
                      <Image src="/images/gallery_eep09781.webp" alt="DJ G Spark" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-sm text-white uppercase">DJ G SPARK</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00bfff] fill-[#00bfff]/20" />
                      </div>
                      <span className="text-[10px] font-mono text-[#00B4D8]">VIRAL NEW YEAR EVENT</span>
                    </div>
                  </div>

                  {/* Sound Toggle Button */}
                  <button
                    onClick={() => {
                      if (reelVideoRef.current) {
                        reelVideoRef.current.muted = !reelVideoRef.current.muted;
                        setIsReelMuted(reelVideoRef.current.muted);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-[#00E5FF] transition-colors"
                    title={isReelMuted ? "Unmute Video" : "Mute Video"}
                  >
                    {isReelMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00E5FF]" />}
                  </button>
                </div>

                {/* Reel Floating Right Reaction Counters (TikTok / Instagram style) */}
                <div className="relative z-10 self-end px-5 space-y-4 text-center pointer-events-auto">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#ff3366] hover:scale-110 transition-transform cursor-pointer">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white mt-1">428K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white mt-1">3.9K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:scale-110 transition-transform cursor-pointer">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white mt-1">54.2K</span>
                  </div>
                </div>

                {/* Reel Caption & Audio Strip */}
                <div className="relative z-10 p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <p className="text-xs sm:text-sm text-white leading-snug font-medium mb-3">
                    When 1,000 hands reach for the lasers right before the drop hits... Unbelievable energy tonight! 🔥⚡
                  </p>

                  {/* <div className="flex items-center gap-2 text-[11px] font-mono text-[#00B4D8] bg-black/60 px-3 py-1.5 rounded-full border border-white/10 w-fit backdrop-blur-sm">
                    <Radio className="w-3 h-3 animate-pulse text-[#00E5FF]" />
                    <span className="truncate">DJ G Spark — Spark Theory (Festival VIP)</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Call-to-Action Bar */}
          <div className="mt-12 p-6 rounded-xl bg-[#0c0c12] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-xs font-mono tracking-[0.2em] text-[#00B4D8] uppercase block mb-1">
                STAY IN SYNC WITH DJ G SPARK
              </span>
              <p className="text-sm sm:text-base font-heading font-bold text-white uppercase">
                FOLLOW FOR NEW DROPS, SHOWS ANNOUNCEMENTS & EXCLUSIVE VIP RELEASES
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/djgspark"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-[#E1306C] border border-white/10 text-white font-heading font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>INSTAGRAM</span>
              </a>
              <a
                href="https://youtube.com/@djg-spark"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-[#FF0000] border border-white/10 text-white font-heading font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
              >
                <YouTubeIcon className="w-4 h-4" />
                <span>YOUTUBE</span>
              </a>
              <a
                href="https://www.facebook.com/share/1BxXiXLitH/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-[#1877F2] border border-white/10 text-white font-heading font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>FACEBOOK</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* INSTAGRAM VIRAL REELS SECTION (#instagram)                   */}
      {/* If connected: display real reels; if not: clean empty state  */}
      {/* ============================================================ */}
      <section id="instagram" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#08080d] overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#E1306C]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-[#833ab4]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10">
          {featuredReels.length > 0 ? (
            <>
              {/* Header Banner */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
                <div>
                  {/* Connected Instagram Pill */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E1306C]/15 via-[#833ab4]/15 to-[#00E5FF]/15 border border-[#E1306C]/40 text-xs font-mono tracking-[0.2em] text-[#00B4D8] uppercase mb-4 shadow-[0_0_20px_rgba(225,48,108,0.2)]">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white">
                      <InstagramIcon className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-white">{instagramData.handle}</span>
                    <span className="text-[#888888]">•</span>
                    <span className="text-[#22c55e] flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <span>OFFICIAL INSTAGRAM</span>
                    </span>
                  </div>

                  <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-[-0.02em] uppercase text-white leading-[1.05]">
                    FOLLOW ON INSTAGRAM // <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-[#E1306C] via-[#00E5FF] to-[#F77737] bg-clip-text text-transparent">
                      VIRAL 4K REELS
                    </span>
                  </h2>
                  <p className="text-sm sm:text-base text-[#8A8D93] max-w-2xl mt-3 leading-relaxed">
                    Catch the explosive crowd drops, live 4-deck mashups, and stadium aftermovies directly from official Instagram feeds.
                  </p>
                </div>

                {/* View Profile Quick Link */}
                <a
                  href={instagramData.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#E1306C]/40 hover:border-[#E1306C] bg-[#E1306C]/10 text-white font-heading font-bold text-xs tracking-[0.18em] uppercase transition-all hover:shadow-[0_0_25px_rgba(225,48,108,0.4)]"
                >
                  <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                  <span>FOLLOW {instagramData.handle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Selected Reels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredReels.slice(0, 4).map((reel: any, idx: number) => (
                  <a
                    key={reel.id || idx}
                    href={reel.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-[#0c0c12] border border-white/[0.08] hover:border-[#E1306C]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_15px_45px_rgba(225,48,108,0.25)] flex flex-col cursor-pointer"
                  >
                    {/* Vertical Video Poster */}
                    <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                      <img
                        src={reel.thumbnailUrl || "/images/past_event_crowd.jpg"}
                        alt={reel.caption || "Instagram Reel"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 group-hover:via-black/10 transition-colors" />

                      {/* Top Row: Tag & Viral Views Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className="px-2.5 py-1 rounded bg-black/80 border border-white/10 text-[9px] font-mono uppercase tracking-wider text-[#00B4D8] font-bold flex items-center gap-1">
                          <InstagramIcon className="w-2.5 h-2.5 text-[#E1306C]" />
                          <span>REEL</span>
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-[#22c55e]/40 text-[10px] font-mono font-bold text-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                          <Eye className="w-3 h-3" />
                          <span>{reel.viewsDisplay || "Viral"}</span>
                        </div>
                      </div>

                      {/* Center Play Button with Instagram Gradient Glow */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-[0_0_30px_rgba(225,48,108,0.6)] group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-1" />
                        </div>
                      </div>

                      {/* Bottom Likes & Reel Badge */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10">
                        <div className="flex items-center gap-1 text-white/90 font-mono text-[11px] bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                          <Heart className="w-3.5 h-3.5 text-[#ff3366] fill-[#ff3366]" />
                          <span>{reel.likesCount ? Number(reel.likesCount).toLocaleString() : "Trending"}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/70 uppercase">
                          INSTAGRAM
                        </span>
                      </div>
                    </div>

                    {/* Caption & Instagram Link */}
                    <div className="p-4 flex flex-col flex-grow justify-between bg-[#1F2833]">
                      <h4 className="font-heading font-bold text-xs uppercase text-white line-clamp-2 leading-snug group-hover:text-[#00B4D8] transition-colors">
                        {reel.caption}
                      </h4>

                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#AAAAAA] group-hover:text-[#E1306C] flex items-center justify-between transition-colors">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                          <span>Watch on Instagram</span>
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Bottom Giant CTA Banner */}
              <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#170B16] via-[#100B16] to-[#0A0A0E] border border-[#E1306C]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_40px_rgba(225,48,108,0.15)] text-center md:text-left">
                <div>
                  <span className="text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase block mb-1">
                    OFFICIAL ARTIST PROFILE
                  </span>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase">
                    WANT TO EXPERIENCE MORE EXCLUSIVE DROPS?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#8A8D93] max-w-xl mt-1">
                    Watch official festival aftermovies, live soundcheck reels, and direct DM announcements on {instagramData.handle}.
                  </p>
                </div>

                <a
                  href={instagramData.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-heading font-black text-xs tracking-[0.2em] uppercase hover:shadow-[0_0_35px_rgba(225,48,108,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>VIEW MORE ON INSTAGRAM ({instagramData.handle})</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </>
          ) : instagramData?.status === "connected" ? (
            <div className="text-center py-16 px-6 glass-card rounded-2xl border border-white/10 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] mx-auto mb-5 shadow-[0_0_25px_rgba(225,48,108,0.4)]">
                <img
                  src={instagramData.profilePicture || "/images/gallery_eep09781.webp"}
                  alt={instagramData.handle}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Account Connected &bull; {instagramData.handle}</span>
              </div>
              <h3 className="font-heading font-black text-2xl text-white uppercase mb-3">
                Curating Live 4K Reels
              </h3>
              <p className="text-xs text-[#8A8D93] leading-relaxed mb-6">
                Featured festival reels from {instagramData.handle} are being selected in the Admin Panel. Visit the official profile on Instagram to stream live sets and stories.
              </p>
              <a
                href={instagramData.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-[0_0_25px_rgba(225,48,108,0.4)]"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow {instagramData.handle} on Instagram</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="text-center py-16 px-6 glass-card rounded-2xl border border-white/10 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f09433]/20 via-[#dc2743]/20 to-[#bc1888]/20 border border-[#E1306C]/30 flex items-center justify-center mx-auto mb-5 text-[#E1306C]">
                <InstagramIcon className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-2xl text-white uppercase mb-3">
                Instagram Feed
              </h3>
              <p className="text-xs text-[#8A8D93] leading-relaxed mb-6">
                Official live feeds and festival reels will appear here once the verified account is linked from the Admin Panel.
              </p>
              <a
                href="https://www.instagram.com/djgspark"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-heading font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity shadow-[0_0_25px_rgba(225,48,108,0.4)]"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Visit @djgspark on Instagram</span>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. ARTIST REVIEWS & INDUSTRY ACCLAIM (#reviews)              */}
      {/* ============================================================ */}
      <section id="reviews" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#07070a] overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#FFA030]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div>
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-4">
                <Star className="w-3.5 h-3.5 fill-[#00E5FF] text-[#00E5FF]" />
                <span>4.98 / 5.0 RATING • 250+ SHOWS & EVENTS</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl tracking-[-0.02em] uppercase text-white leading-[1.05]">
                WHAT THEY SAY // <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#00E5FF] via-[#FFA030] to-white bg-clip-text text-transparent">
                  ARTIST REVIEWS
                </span>
              </h2>
            </div>

            {/* Quick Metrics Strip & Write Review Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="px-3 border-r border-white/10">
                  <div className="flex items-center gap-1 text-[#00E5FF]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#00E5FF] text-[#00E5FF]" />
                    ))}
                  </div>
                  <span className="block font-heading font-black text-xl text-white mt-1">4.98 / 5.0</span>
                  <span className="text-[10px] font-mono text-[#888888] uppercase">GLOBAL RATING</span>
                </div>
                {/* <div className="px-3 border-r border-white/10">
                  <span className="font-heading font-black text-xl text-[#00E5FF]">100%</span>
                  <span className="block font-heading font-black text-sm text-white">SOLD OUT</span>
                  <span className="text-[10px] font-mono text-[#888888] uppercase">ARENA DATES</span>
                </div> */}
                {/* <div className="px-3">
                  <span className="font-heading font-black text-xl text-white">#14</span>
                  <span className="block font-heading font-black text-sm text-[#00B4D8]">TOP 100</span>
                  <span className="text-[10px] font-mono text-[#888888] uppercase">DJ MAG INNOVATION</span>
                </div> */}
              </div>

              {/* Primary Write Review CTA */}
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-heading font-black text-xs tracking-[0.2em] uppercase hover:brightness-110 transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.45)] flex items-center justify-center gap-2.5 shrink-0"
              >
                <Star className="w-4 h-4 fill-black text-black" />
                <span>WRITE A REVIEW</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {[
              { id: "all", label: `ALL REVIEWS (${reviewsList.length})` },
              { id: "promoter", label: "Performance" },
              { id: "critic", label: "Punctuality" },
              { id: "fan", label: "Behaviour" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReviewCategory(tab.id)}
                className={`px-5 py-2 rounded-full text-xs font-mono tracking-[0.14em] uppercase transition-all ${
                  reviewCategory === tab.id
                    ? "bg-[#00E5FF] text-black font-bold shadow-[0_0_20px_rgba(0, 229, 255, 0.4)]"
                    : "bg-white/5 text-[#929292] hover:text-white border border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="group relative bg-[#0c0c11] border border-white/[0.08] hover:border-[#00E5FF]/50 rounded-2xl p-7 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0, 229, 255, 0.15)] flex flex-col justify-between"
              >
                {/* Top: Stars + Badge */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-1 text-[#00E5FF]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#00E5FF] text-[#00E5FF]" />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] font-mono tracking-[0.18em] px-2.5 py-1 rounded-full border font-semibold uppercase ${rev.badgeColor}`}
                    >
                      {rev.badge}
                    </span>
                  </div>

                  {/* Event Tag */}
                  <span className="text-[11px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase block mb-3">
                    {rev.event}
                  </span>

                  {/* Quote */}
                  <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed mb-6 font-normal group-hover:text-white transition-colors">
                    "{rev.quote}"
                  </p>
                </div>

                {/* Bottom: Author info */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#181822] border border-[#00E5FF]/40 flex items-center justify-center font-heading font-bold text-sm text-[#00E5FF] shadow-[0_0_12px_rgba(0, 229, 255, 0.25)]">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white uppercase group-hover:text-[#00E5FF] transition-colors">
                        {rev.name}
                      </h4>
                      <span className="text-xs text-[#888888] font-sans block">
                        {rev.role} • <strong className="text-[#AAAAAA]">{rev.organization}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#666666] uppercase whitespace-nowrap">
                    {rev.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Reviewer Call-To-Action */}
          {/* <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-[#120D08] via-[#0C0C11] to-[#0A0A0E] border border-[#00E5FF]/25 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(0, 229, 255, 0.1)]">
            <div>
              <span className="text-xs font-mono tracking-[0.22em] text-[#00B4D8] uppercase block mb-1">
                FESTIVAL PROMOTER OR CONCERT-GOER?
              </span>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase">
                EXPERIENCED DJ G SPARK LIVE ON STAGE?
              </h3>
              <p className="text-xs sm:text-sm text-[#8A8D93] max-w-xl mt-1">
                Book DJ G Spark for your arena headline date, festival stage, or share your live concert review with our management team.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/booking"
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#00E5FF] text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-white transition-all shadow-[0_0_25px_rgba(0, 229, 255, 0.4)] text-center"
              >
                PROMOTER BOOKING
              </Link>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-white/5 border border-white/20 text-white font-heading font-bold text-xs tracking-[0.2em] uppercase hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all text-center flex items-center justify-center gap-2"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>WRITE FAN REVIEW</span>
              </button>
            </div>
          </div> */}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. LATEST VIDEOS SECTION (#videos)                            */}
      {/* ============================================================ */}
      <section id="videos" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#0B0C10]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-3">
                <Play className="w-3.5 h-3.5" />
                <span>4K CINEMATIC RECORDINGS // CONCERT AFTERMOVIES</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white">
                LATEST <span className="text-[#00E5FF]">VIDEOS</span>
              </h2>
            </div>

            <button
              onClick={() => setActiveVideoModal("/images/tour_09_arena_climax.mp4")}
              className="inline-flex items-center gap-2 text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#929292] hover:text-[#00E5FF] transition-colors"
            >
              <span>WATCH ARENA FINALE →</span>
            </button>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoList.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideoModal(video.videoSrc)}
                className="group relative bg-[#0c0c10] border border-white/[0.08] hover:border-[#00E5FF]/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0, 229, 255, 0.2)] flex flex-col"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                  {/* Play Icon Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#00E5FF] group-hover:scale-110 group-hover:bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(0, 229, 255, 0.6)] transition-all">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] tracking-wider border border-white/10">
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.2em] text-[#00B4D8] uppercase block mb-1">
                      {video.tag}
                    </span>
                    <h4 className="font-heading font-bold text-sm uppercase text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                      {video.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase mt-3 flex items-center gap-1.5">
                    <span>PLAY VIDEO</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PHOTO GALLERY SECTION (#gallery)                           */}
      {/* ============================================================ */}
      <section id="gallery" className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#07070a]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TOUR PHOTOGRAPHY // LIVE ON STAGE</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white">
                PHOTO <span className="text-[#00E5FF]">GALLERY</span>
              </h2>
            </div>

            <a
              href="https://www.instagram.com/djgspark/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#929292] hover:text-[#00E5FF] transition-colors"
            >
              <InstagramIcon className="w-4 h-4 text-[#00E5FF]" />
              <span>FOLLOW @DJGSPARK ON INSTAGRAM →</span>
            </a>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            {[
              { id: "all", label: `ALL SHOTS (${galleryPhotos.length})` },
              { id: "live", label: "LIVE STAGE" },
              { id: "festivals", label: "FESTIVALS & CROWD" },
              { id: "backstage", label: "BACKSTAGE & POV" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGalleryFilter(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-[0.14em] uppercase transition-all ${
                  galleryFilter === tab.id
                    ? "bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_rgba(0, 229, 255, 0.35)]"
                    : "bg-white/5 text-[#929292] hover:text-white border border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhotoModal(photo.src)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 hover:border-[#00E5FF]/50 bg-black cursor-pointer transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0, 229, 255, 0.2)]"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <span className="font-heading font-bold text-sm uppercase text-white leading-tight">
                    {photo.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#00B4D8] uppercase mt-1">
                    {photo.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. LATEST NEWS & POSTS                                        */}
      {/* ============================================================ */}
      <section className="relative py-24 sm:py-32 border-t border-white/[0.08] bg-[#0B0C10]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.24em] text-[#00B4D8] uppercase mb-3">
                <span>ARTIST DISPATCHES // PRESS & ANNOUNCEMENTS</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-[-0.02em] uppercase text-white">
                LATEST <span className="text-[#00E5FF]">POSTS</span>
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-heading font-bold tracking-[0.2em] uppercase text-[#929292] hover:text-[#00E5FF] transition-colors"
            >
              READ ALL ARTICLES →
            </Link>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post, idx) => (
              <Link
                key={post.id || idx}
                href={`/blog/${post.slug || post.id}`}
                className="group bg-[#0c0c10] border border-white/10 hover:border-[#00E5FF]/50 rounded-lg overflow-hidden transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={post.image || "/images/dj_hero.jpg"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 border border-white/10 text-[9px] font-mono uppercase tracking-wider text-[#00B4D8]">
                    {post.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#888888] uppercase block mb-2">
                      {post.dateDisplay || post.date}
                    </span>
                    <h3 className="font-heading font-bold text-lg uppercase text-white group-hover:text-[#00E5FF] transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#00B4D8] uppercase mt-4 flex items-center gap-1">
                    <span>READ ARTICLE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* VIDEO PLAYER MODAL                                            */}
      {/* ============================================================ */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8">
          <div className="relative w-full max-w-5xl bg-black rounded-xl overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(0, 229, 255, 0.3)]">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white hover:text-[#00E5FF] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video w-full bg-black">
              {activeVideoModal.includes("youtube") || activeVideoModal.includes("youtu.be") ? (
                <iframe
                  src={
                    activeVideoModal.includes("embed")
                      ? activeVideoModal
                      : `https://www.youtube-nocookie.com/embed/${
                          activeVideoModal.match(/(?:youtu\.be\/|watch\?v=)([\w-]+)/)?.[1] || ""
                        }?autoplay=1`
                  }
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeVideoModal}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src={activeVideoModal} type="video/mp4" />
                  <source src={activeVideoModal} type="video/quicktime" />
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHOTO LIGHTBOX MODAL                                          */}
      {/* ============================================================ */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-2 right-2 z-20 w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white hover:text-[#00E5FF] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={activePhotoModal}
                alt="Concert Moment Fullscreen"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
      {/* Ticket Modal */}
      {selectedTicketEvent && (
        <TicketModal
          isOpen={true}
          onClose={() => setSelectedTicketEvent(null)}
          eventTitle={selectedTicketEvent.title || `${selectedTicketEvent.city} Arena Tour`}
          eventCity={selectedTicketEvent.city}
          eventDate={selectedTicketEvent.dateDisplay || selectedTicketEvent.date || "DEC 2026"}
          priceINR={selectedTicketEvent.priceINR || 2499}
          priceUSD={selectedTicketEvent.priceUSD || 35}
          showPrice={selectedTicketEvent.showPrice !== false}
        />
      )}
      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitted={fetchReviews}
      />

      {/* Floating WhatsApp Quick Action Button */}
      <WhatsAppFloatButton />
    </div>
  );
}