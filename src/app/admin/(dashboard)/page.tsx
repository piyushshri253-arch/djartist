"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Star,
  Ticket,
  Share2,
  Users,
  FileText,
  User,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowLeft,
  History,
  Check,
  Ban,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Menu,
  ShieldCheck,
  Globe,
  MessageCircle,
  Clock,
  MapPin,
  Tag,
  CheckCheck,
  Sparkles,
  ImageIcon,
  Video,
  Play,
  Film,
  LayoutGrid,
  List,
} from "lucide-react";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/ui/SocialIcons";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { InstagramIntegrationModule } from "@/components/admin/InstagramIntegrationModule";
import { isEventPast } from "@/lib/eventsHelper";
import { ReviewItem, AdminUserData, PlatformSocialConfig, GalleryItem, VideoShowcaseItem } from "@/types";
import { EventData } from "@/app/api/admin/events/route";
import rawEvents from "@/data/events.json";
import rawPastEvents from "@/data/past-events.json";
import rawBlogs from "@/data/blog.json";
import rawGallery from "@/data/gallery.json";
import rawVideos from "@/data/videos.json";
import {
  getMergedEvents,
  saveCustomEvent,
  deleteCustomEvent,
  getMergedBlogs,
  saveCustomBlog,
  deleteCustomBlog,
  getMergedGallery,
  saveCustomGallery,
  deleteCustomGallery,
  getMergedVideos,
  saveCustomVideo,
  deleteCustomVideo,
} from "@/lib/clientStorage";

export interface LeadData {
  id: string;
  type: string;
  name: string;
  phone: string;
  email?: string;
  eventTitle?: string;
  eventCity?: string;
  eventDate?: string;
  tier?: string;
  quantity?: number;
  totalPrice?: number;
  notes?: string;
  timestamp: string;
  status?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "events"
    | "past-events"
    | "event-editor"
    | "reviews"
    | "leads"
    | "social"
    | "users"
    | "blogs"
    | "gallery"
    | "videos"
    | "profile"
  >("overview");

  // Track where the editor came from so Cancel / Save returns to the right tab
  const [editorOrigin, setEditorOrigin] = useState<"events" | "past-events" | "overview">("events");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Data states - initialized empty during SSR to avoid 1-second flash of old/deleted items before client hydration
  const [events, setEvents] = useState<EventData[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewCounts, setReviewCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserData[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoShowcaseItem[]>([]);
  const [socialSettings, setSocialSettings] = useState<PlatformSocialConfig>({
    facebook: { url: "https://www.facebook.com/share/1BxXiXLitH/", enabled: true },
    youtube: { channelUrl: "https://youtube.com/@djg-spark", enabled: true },
    instagram: {
      enabled: true,
      connected: false,
      username: "Dj G-Spark",
      accountName: "Dj G-Spark",
      profilePicture: "/images/dj_hero.jpg",
      profileUrl: "https://www.instagram.com/djgspark",
      lastSyncedAt: null,
    },
  });

  // Filter states for Upcoming Events
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<"all" | "upcoming" | "past">("all");
  const [eventCityFilter, setEventCityFilter] = useState("all");

  // Filter states for Dedicated Past Events Dashboard
  const [pastSearchQuery, setPastSearchQuery] = useState("");
  const [pastCityFilter, setPastCityFilter] = useState("all");
  const [pastYearFilter, setPastYearFilter] = useState("all");
  const [pastSortOrder, setPastSortOrder] = useState<"latest" | "oldest">("latest");
  const [pastViewMode, setPastViewMode] = useState<"table" | "grid">("table");

  const [reviewFilter, setReviewFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [reviewTargetFilter, setReviewTargetFilter] = useState<"all" | "event" | "article">("all");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");

  const [leadSearchQuery, setLeadSearchQuery] = useState("");

  // Gallery Management States
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>("all");
  const [gallerySearchQuery, setGallerySearchQuery] = useState("");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    subtitle: "",
    category: "live" as "live" | "festivals" | "backstage",
    src: "/images/gallery_stage_lasers.jpg",
  });

  // Video Showcase Management States
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoShowcaseItem | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: "",
    tag: "4K CINEMATIC // BASS DROP",
    duration: "03:45",
    thumbnail: "/images/past_event_crowd.jpg",
    videoSrc: "/images/tour_09_arena_climax.mp4",
  });
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Blog Management States
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    category: "MUSIC PRODUCTION",
    excerpt: "",
    content: "",
    image: "/images/dj_hero.jpg",
    author: "Dj G-Spark",
    authorRole: "Artist & Headliner",
    readTime: "5 MIN READ",
  });

  // Dedicated Event Editor states (NO popup/modal)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    slug: "",
    eventType: "Arena Concert",
    artist: "Dj G-Spark",
    city: "",
    country: "INDIA",
    region: "india",
    venue: "",
    address: "",
    date: new Date().toISOString().split("T")[0],
    dateDisplay: "",
    time: "20:00 - 02:00 IST",
    doors: "18:00 IST",
    capacity: "25,000",
    status: "SELLING FAST",
    priceINR: "",
    priceUSD: "",
    showPrice: false,
    isPublished: true,
    image: "/images/past_event_crowd.jpg",
    description: "",
    detailedAbout: "",
    lineup: "Dj G-Spark (Headliner)",
  });

  // Social Save Loading
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  // Toast Helper
  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch all initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Unified Events (Upcoming + Past Archives)
      const [evRes, pastEvRes] = await Promise.all([
        fetch("/api/admin/events", { cache: "no-store" }).catch(() => null),
        fetch("/api/admin/past-events", { cache: "no-store" }).catch(() => null),
      ]);
      const evData = evRes && evRes.ok ? await evRes.json().catch(() => []) : [];
      const pastEvData = pastEvRes && pastEvRes.ok ? await pastEvRes.json().catch(() => []) : [];
      
      const combinedEvents = Array.isArray(evData) ? [...evData] : [];
      const existingIds = new Set(combinedEvents.map((e: any) => e.id));
      if (Array.isArray(pastEvData)) {
        for (const p of pastEvData) {
          if (!existingIds.has(p.id)) {
            combinedEvents.push({
              ...p,
              status: "COMPLETED",
              isPublished: true,
            });
            existingIds.add(p.id);
          }
        }
      }
      setEvents(getMergedEvents(combinedEvents));

      // 2. Reviews
      const revRes = await fetch("/api/admin/reviews", { cache: "no-store" });
      if (revRes.ok) {
        const revData = await revRes.json();
        if (revData && Array.isArray(revData.reviews)) {
          setReviews(revData.reviews);
          if (revData.counts) setReviewCounts(revData.counts);
        }
      }

      // 3. Leads
      const leadRes = await fetch("/api/admin/leads", { cache: "no-store" });
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        if (Array.isArray(leadData)) setLeads(leadData);
      }

      // 4. Social Settings
      const socialRes = await fetch("/api/admin/social/settings", { cache: "no-store" });
      if (socialRes.ok) {
        const socialData = await socialRes.json();
        if (socialData.facebook) setSocialSettings(socialData);
      }

      // 5. Admin Users
      const userRes = await fetch("/api/admin/users", { cache: "no-store" });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (Array.isArray(userData)) setAdminUsers(userData);
      }

      // 6. Blogs
      const blogRes = await fetch("/api/admin/blogs", { cache: "no-store" });
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        if (Array.isArray(blogData)) setBlogs(getMergedBlogs(blogData));
      }

      // 7. Gallery
      const galRes = await fetch("/api/admin/gallery", { cache: "no-store" });
      if (galRes.ok) {
        const galData = await galRes.json();
        if (Array.isArray(galData)) setGalleryItems(getMergedGallery(galData));
      }

      // 8. Videos
      const vidRes = await fetch("/api/admin/videos", { cache: "no-store" });
      if (vidRes.ok) {
        const vidData = await vidRes.json();
        if (Array.isArray(vidData)) setVideoItems(getMergedVideos(vidData));
      }
    } catch (err: any) {
      console.error(err);
      showToast("error", "Error refreshing dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // Clear any legacy localStorage event overrides; load events strictly from MongoDB Atlas via API
    saveCustomEvent(null);
    setBlogs(getMergedBlogs(rawBlogs as any[]));
    setGalleryItems(getMergedGallery(rawGallery as any[]));
    setVideoItems(getMergedVideos(rawVideos as any[]));

    fetchData();

    // Check query params for tab selection (e.g. ?tab=past-events or ?tab=gallery)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam &&
        [
          "overview",
          "events",
          "past-events",
          "event-editor",
          "reviews",
          "leads",
          "social",
          "users",
          "blogs",
          "gallery",
          "videos",
          "profile",
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  // Filtered Upcoming / All Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const past = isEventPast(ev.date) || ev.status === "COMPLETED";

      // 1. Type filter
      if (eventTypeFilter === "upcoming" && past) return false;
      if (eventTypeFilter === "past" && !past) return false;

      // 2. City filter
      if (eventCityFilter !== "all" && ev.city?.toLowerCase() !== eventCityFilter.toLowerCase()) {
        return false;
      }

      // 3. Search query
      if (eventSearchQuery.trim()) {
        const q = eventSearchQuery.toLowerCase();
        const mTitle = ev.title?.toLowerCase().includes(q);
        const mCity = ev.city?.toLowerCase().includes(q);
        const mVenue = ev.venue?.toLowerCase().includes(q);
        if (!mTitle && !mCity && !mVenue) return false;
      }

      return true;
    });
  }, [events, eventTypeFilter, eventCityFilter, eventSearchQuery]);

  // Unique cities for upcoming event filter
  const eventCities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.city) set.add(e.city.trim());
    });
    return Array.from(set).sort();
  }, [events]);

  // Filtered Past Events for Dedicated Past Events Dashboard
  const pastEventsList = useMemo(() => {
    return events
      .filter((ev) => isEventPast(ev.date) || ev.status === "COMPLETED")
      .filter((ev) => {
        // 1. City filter
        if (pastCityFilter !== "all" && ev.city?.toLowerCase() !== pastCityFilter.toLowerCase()) {
          return false;
        }

        // 2. Year filter
        if (pastYearFilter !== "all") {
          const evYear = ev.date ? ev.date.split("-")[0] : "";
          if (evYear !== pastYearFilter) return false;
        }

        // 3. Search query
        if (pastSearchQuery.trim()) {
          const q = pastSearchQuery.toLowerCase();
          const mTitle = ev.title?.toLowerCase().includes(q);
          const mCity = ev.city?.toLowerCase().includes(q);
          const mVenue = ev.venue?.toLowerCase().includes(q);
          const mDesc = ev.description?.toLowerCase().includes(q);
          if (!mTitle && !mCity && !mVenue && !mDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return pastSortOrder === "oldest" ? timeA - timeB : timeB - timeA;
      });
  }, [events, pastCityFilter, pastYearFilter, pastSearchQuery, pastSortOrder]);

  // Unique past event cities
  const pastEventCities = useMemo(() => {
    const set = new Set<string>();
    events
      .filter((e) => isEventPast(e.date) || e.status === "COMPLETED")
      .forEach((e) => {
        if (e.city) set.add(e.city.trim());
      });
    return Array.from(set).sort();
  }, [events]);

  // Unique past event years
  const pastEventYears = useMemo(() => {
    const set = new Set<string>();
    events
      .filter((e) => isEventPast(e.date) || e.status === "COMPLETED")
      .forEach((e) => {
        if (e.date) {
          const yr = e.date.split("-")[0];
          if (yr && yr.length === 4) set.add(yr);
        }
      });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [events]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // 1. Status Filter
      if (reviewFilter !== "all" && r.status !== reviewFilter) return false;

      // 2. Target Filter
      if (reviewTargetFilter !== "all") {
        if (reviewTargetFilter === "event" && r.targetType !== "event" && !r.eventId) return false;
        if (reviewTargetFilter === "article" && r.targetType !== "article" && !r.articleSlug) return false;
      }

      // 3. Search Query
      if (reviewSearchQuery.trim()) {
        const q = reviewSearchQuery.toLowerCase();
        const mUser = r.userName?.toLowerCase().includes(q) || r.name?.toLowerCase().includes(q);
        const mEmail = r.userEmail?.toLowerCase().includes(q);
        const mComment = r.comment?.toLowerCase().includes(q) || r.quote?.toLowerCase().includes(q);
        const mTarget = r.eventTitle?.toLowerCase().includes(q) || r.articleTitle?.toLowerCase().includes(q);
        if (!mUser && !mEmail && !mComment && !mTarget) return false;
      }

      return true;
    });
  }, [reviews, reviewFilter, reviewTargetFilter, reviewSearchQuery]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (!leadSearchQuery.trim()) return true;
      const q = leadSearchQuery.toLowerCase();
      return (
        l.name?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.eventCity?.toLowerCase().includes(q) ||
        l.eventTitle?.toLowerCase().includes(q)
      );
    });
  }, [leads, leadSearchQuery]);

  // Filtered Gallery Items
  const filteredGalleryItems = useMemo(() => {
    return galleryItems.filter((item) => {
      if (galleryCategoryFilter !== "all" && item.category !== galleryCategoryFilter) {
        return false;
      }
      if (!gallerySearchQuery.trim()) return true;
      const q = gallerySearchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q)
      );
    });
  }, [galleryItems, galleryCategoryFilter, gallerySearchQuery]);

  // Filtered Video Items
  const filteredVideoItems = useMemo(() => {
    return videoItems.filter((item) => {
      if (!videoSearchQuery.trim()) return true;
      const q = videoSearchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.tag?.toLowerCase().includes(q)
      );
    });
  }, [videoItems, videoSearchQuery]);

  // Review Moderation Action
  const handleModerateReview = async (id: string, status: "approved" | "rejected" | "pending") => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review status");

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      // Recalculate review counts
      setReviewCounts((prev) => {
        const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
        return {
          total: updated.length,
          pending: updated.filter((r) => r.status === "pending").length,
          approved: updated.filter((r) => r.status === "approved").length,
          rejected: updated.filter((r) => r.status === "rejected").length,
        };
      });

      showToast("success", `Review status changed to ${status.toUpperCase()}.`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to moderate review");
    }
  };

  // Review Deletion Action
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete review");

      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Review permanently deleted from database.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete review");
    }
  };

  // Lead Deletion Action
  const handleDeleteLead = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete lead from "${name || "Client"}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete lead");

      setLeads((prev) => prev.filter((l) => l.id !== id));
      showToast("success", "Lead removed successfully.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete lead");
    }
  };

  // Dedicated Full-Page Event Editor openers (NO popup/modal)
  const openCreateEvent = (origin: "events" | "past-events" | "overview" = "events") => {
    setEditingEvent(null);
    setEditorOrigin(origin);
    const isPastOrigin = origin === "past-events";
    setEventForm({
      title: "",
      slug: "",
      eventType: isPastOrigin ? "Festival" : "Arena Concert",
      artist: "Dj G-Spark (Headliner)",
      city: "",
      country: "INDIA",
      region: "india",
      venue: "",
      address: "",
      date: isPastOrigin ? "2025-12-01" : new Date().toISOString().split("T")[0],
      dateDisplay: isPastOrigin ? "01 DEC 2025" : "",
      time: "20:00 - 02:00 IST",
      doors: "18:00 IST",
      capacity: isPastOrigin ? "45,000 Attendance" : "25,000",
      status: isPastOrigin ? "COMPLETED" : "SELLING FAST",
      priceINR: "",
      priceUSD: "",
      showPrice: false,
      isPublished: true,
      image: "/images/past_event_crowd.jpg",
      description: "",
      detailedAbout: "",
      lineup: "Dj G-Spark (Headliner)",
    });
    setActiveTab("event-editor");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openEditEvent = (ev: EventData, origin: "events" | "past-events" | "overview" = "events") => {
    setEditingEvent(ev);
    setEditorOrigin(origin);
    setEventForm({
      title: ev.title || "",
      slug: ev.slug || "",
      eventType: (ev as any).eventType || "Arena Concert",
      artist: (ev as any).artist || "Dj G-Spark (Headliner)",
      city: ev.city || "",
      country: ev.country || "INDIA",
      region: ev.region || "india",
      venue: ev.venue || "",
      address: ev.address || "",
      date: ev.date || new Date().toISOString().split("T")[0],
      dateDisplay: ev.dateDisplay || "",
      time: ev.time || "20:00 - 02:00 IST",
      doors: ev.doors || "18:00 IST",
      capacity: ev.capacity || "25,000",
      status: ev.status || (isEventPast(ev.date) ? "COMPLETED" : "SELLING FAST"),
      priceINR: String(ev.priceINR || ""),
      priceUSD: String(ev.priceUSD || ""),
      showPrice: false,
      isPublished: ev.isPublished !== false,
      image: ev.image || "/images/past_event_crowd.jpg",
      description: ev.description || "",
      detailedAbout: ev.detailedAbout || "",
      lineup: Array.isArray(ev.lineup) ? ev.lineup.join(", ") : String(ev.lineup || ""),
    });
    setActiveTab("event-editor");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Compatibility aliases
  const openCreateEventModal = () => openCreateEvent("events");
  const openEditEventModal = (ev: EventData) => openEditEvent(ev, "events");

  // Return to previous listing from event editor
  const handleBackFromEditor = () => {
    if (editorOrigin === "past-events") {
      setActiveTab("past-events");
    } else {
      setActiveTab("events");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Save Event Action (Dedicated Full-Page Editor)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.city.trim() || !eventForm.venue.trim()) {
      showToast("error", "Please provide Title, City / State, and Venue for the event.");
      return;
    }

    setIsSavingEvent(true);

    try {
      const payload = {
        ...eventForm,
        id: editingEvent?.id,
        lineup: eventForm.lineup.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const method = editingEvent ? "PUT" : "POST";
      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.event) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          throw new Error("Admin session expired. Redirecting to login...");
        }
        throw new Error(data?.error || "Failed to save event to database.");
      }

      const savedEvent: EventData = data.event;

      // Update state immediately from the database response
      setEvents((prev) => {
        const withoutOld = prev.filter((ev) => ev.id !== savedEvent.id);
        return [savedEvent, ...withoutOld];
      });

      // Also re-sync full list from database
      await fetchData();

      showToast("success", `Event "${savedEvent.title}" ${editingEvent ? "updated" : "published"} to live database!`);

      // Return smoothly to the appropriate archive or upcoming tab
      if (editorOrigin === "past-events" || (eventForm.date && isEventPast(eventForm.date))) {
        setActiveTab("past-events");
      } else {
        setActiveTab("events");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to save event");
    } finally {
      setIsSavingEvent(false);
    }
  };

  // Delete Event Action (Commits directly to MongoDB Atlas before updating UI)
  const handleDeleteEvent = async (id: string, title?: string, slug?: string) => {
    const name = title ? `"${title}"` : "this event";
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This will remove it from the live database and all devices.`)) {
      return;
    }

    try {
      const qParams = new URLSearchParams();
      qParams.set("id", id);
      if (slug) qParams.set("slug", slug);
      if (title) qParams.set("title", title);
      const qStr = qParams.toString();

      const [evDelRes, pastDelRes] = await Promise.all([
        fetch(`/api/admin/events?${qStr}`, { method: "DELETE", cache: "no-store" }),
        fetch(`/api/admin/past-events?${qStr}`, { method: "DELETE", cache: "no-store" }),
      ]);

      if (evDelRes.status === 401 || pastDelRes.status === 401) {
        window.location.href = "/admin/login";
        throw new Error("Admin session expired. Redirecting to login...");
      }

      if (!evDelRes.ok && !pastDelRes.ok) {
        const errData = await evDelRes.json().catch(() => ({}));
        throw new Error(errData?.error || "Failed to delete event from database.");
      }

      // Remove from client state now that database deletion succeeded
      deleteCustomEvent(id, slug, title);
      setEvents((prev) =>
        prev.filter((e) => {
          if (e.id === id) return false;
          if (slug && (e.slug === slug || e.id === slug)) return false;
          if (title && e.title?.toLowerCase().trim() === title.toLowerCase().trim()) return false;
          return true;
        })
      );

      await fetchData();

      showToast("success", `Event ${title ? `"${title}"` : ""} permanently deleted from database.`);

      // If inside dedicated editor, navigate back to listing
      if (activeTab === "event-editor") {
        handleBackFromEditor();
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete event");
    }
  };

  // Gallery Photo Actions (Add, Edit, Delete)
  const openCreateGallery = () => {
    setEditingPhoto(null);
    setGalleryForm({
      title: "",
      subtitle: "",
      category: "live",
      src: "/images/gallery_stage_lasers.jpg",
    });
    setIsGalleryModalOpen(true);
  };

  const openEditGallery = (photo: any) => {
    setEditingPhoto(photo);
    setGalleryForm({
      title: photo.title || "",
      subtitle: photo.subtitle || "",
      category: photo.category || "live",
      src: photo.src || "/images/gallery_stage_lasers.jpg",
    });
    setIsGalleryModalOpen(true);
  };

  // Save Gallery Photo Action (Supports POST & PUT)
  const handleSaveGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title.trim() || !galleryForm.src.trim()) {
      showToast("error", "Please provide a title and image source for the photo.");
      return;
    }
    setIsSavingGallery(true);
    try {
      const method = editingPhoto ? "PUT" : "POST";
      const payload = editingPhoto ? { ...galleryForm, id: editingPhoto.id } : galleryForm;
      const res = await fetch("/api/admin/gallery", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      const savedPhoto: any = data?.item || { ...payload, id: (payload as any).id || `GAL-${Date.now()}` };

      saveCustomGallery(savedPhoto);

      setGalleryItems((prev) => {
        const withoutOld = prev.filter((p: any) => p.id !== savedPhoto.id);
        return [savedPhoto, ...withoutOld];
      });

      setIsGalleryModalOpen(false);
      setGalleryForm({
        title: "",
        subtitle: "",
        category: "live",
        src: "/images/gallery_stage_lasers.jpg",
      });
      showToast("success", `Photo ${editingPhoto ? "updated" : "added to live gallery"} successfully!`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save photo");
    } finally {
      setIsSavingGallery(false);
    }
  };

  // Delete Gallery Photo Action
  const handleDeleteGalleryPhoto = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this photo from the live website gallery?")) {
      return;
    }
    try {
      deleteCustomGallery(id);
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" }).catch(() => {});
      showToast("success", "Photo removed from gallery.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete photo");
    }
  };

  // Video Showcase Actions (Add, Edit, Delete)
  const openCreateVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: "",
      tag: "4K CINEMATIC // BASS DROP",
      duration: "03:45",
      thumbnail: "/images/past_event_crowd.jpg",
      videoSrc: "/images/tour_09_arena_climax.mp4",
    });
    setIsVideoModalOpen(true);
  };

  const openEditVideo = (video: any) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title || "",
      tag: video.tag || "4K CINEMATIC // BASS DROP",
      duration: video.duration || "03:45",
      thumbnail: video.thumbnail || "/images/past_event_crowd.jpg",
      videoSrc: video.videoSrc || "",
    });
    setIsVideoModalOpen(true);
  };

  // Save Video Showcase Action (Supports POST & PUT)
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.videoSrc.trim()) {
      showToast("error", "Please provide a video title and video link / file.");
      return;
    }
    setIsSavingVideo(true);
    try {
      const method = editingVideo ? "PUT" : "POST";
      const payload = editingVideo ? { ...videoForm, id: editingVideo.id } : videoForm;
      const res = await fetch("/api/admin/videos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save video");

      const savedVideo = data.item || {
        ...payload,
        id: editingVideo ? editingVideo.id : `vid_${Date.now()}`,
      };
      saveCustomVideo(savedVideo);

      setVideoItems((prev) => {
        if (editingVideo) {
          return prev.map((v) => (v.id === savedVideo.id ? savedVideo : v));
        } else {
          return [savedVideo, ...prev.filter((v) => v.id !== savedVideo.id)];
        }
      });

      setIsVideoModalOpen(false);
      setVideoForm({
        title: "",
        tag: "4K CINEMATIC // BASS DROP",
        duration: "03:45",
        thumbnail: "/images/past_event_crowd.jpg",
        videoSrc: "/images/tour_09_arena_climax.mp4",
      });
      showToast("success", `Video ${editingVideo ? "updated" : "added to live showcase"} successfully!`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save video");
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Delete Video Showcase Action
  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this video from the live website showcase?")) {
      return;
    }
    try {
      deleteCustomVideo(id);
      setVideoItems((prev) => prev.filter((item) => item.id !== id));
      await fetch(`/api/admin/videos?id=${id}`, { method: "DELETE" }).catch(() => {});
      showToast("success", "Video removed from showcase.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete video");
    }
  };

  // Blog Management Actions
  const openCreateBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: "",
      slug: "",
      category: "MUSIC PRODUCTION",
      excerpt: "",
      content: "",
      image: "/images/dj_hero.jpg",
      author: "Dj G-Spark",
      authorRole: "Artist & Headliner",
      readTime: "5 MIN READ",
    });
    setIsBlogModalOpen(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openEditBlog = (blog: any) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || "",
      slug: blog.slug || "",
      category: blog.category || "MUSIC PRODUCTION",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "/images/dj_hero.jpg",
      author: blog.author || "Dj G-Spark",
      authorRole: blog.authorRole || "Artist & Headliner",
      readTime: blog.readTime || "5 MIN READ",
    });
    setIsBlogModalOpen(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      showToast("error", "Please provide Title and Content for the article.");
      return;
    }

    setIsSavingBlog(true);
    try {
      const payload = {
        ...blogForm,
        id: editingBlog?.id,
        slug:
          blogForm.slug.trim() ||
          blogForm.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
      };

      const method = editingBlog ? "PUT" : "POST";
      const res = await fetch("/api/admin/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      const savedBlog = data?.post || {
        ...payload,
        id: editingBlog?.id || `blog_${Date.now()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      saveCustomBlog(savedBlog);

      setBlogs((prev) => {
        if (editingBlog) {
          return prev.map((b) => (b.id === savedBlog.id ? savedBlog : b));
        } else {
          return [savedBlog, ...prev.filter((b) => b.id !== savedBlog.id)];
        }
      });

      showToast("success", `Article ${editingBlog ? "updated" : "published"} successfully!`);
      setIsBlogModalOpen(false);
    } catch (err: any) {
      showToast("error", err.message || "Failed to save blog");
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string, title?: string, slug?: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title || "this article"}"?`)) {
      return;
    }

    try {
      deleteCustomBlog(id, slug, title);
      setBlogs((prev) =>
        prev.filter((b) => {
          if (b.id === id) return false;
          if (slug && (b.slug === slug || b.id === slug)) return false;
          if (title && b.title?.toLowerCase().trim() === title.toLowerCase().trim()) return false;
          return true;
        })
      );
      const qParams = new URLSearchParams();
      qParams.set("id", id);
      if (slug) qParams.set("slug", slug);
      if (title) qParams.set("title", title);
      await fetch(`/api/admin/blogs?${qParams.toString()}`, { method: "DELETE" }).catch(() => {});
      showToast("success", "Article removed successfully.");
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete article");
    }
  };

  // Save Social Settings Action (Facebook & YouTube)
  const handleSaveSocialSettings = async () => {
    setIsSavingSocial(true);
    try {
      const res = await fetch("/api/admin/social/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialSettings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save social settings");

      showToast("success", "Social media configurations saved successfully!");
    } catch (err: any) {
      showToast("error", err.message || "Failed to save social settings");
    } finally {
      setIsSavingSocial(false);
    }
  };

  // Grouped Sidebar navigation sections
  const upcomingCount = events.filter((e) => !isEventPast(e.date) && e.status !== "COMPLETED").length;
  const pastCount = events.filter((e) => isEventPast(e.date) || e.status === "COMPLETED").length;

  const navSections = [
    {
      title: "Core Operations",
      items: [
        {
          id: "overview",
          label: "Dashboard Overview",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: "events",
          label: "Tour & Upcoming Shows",
          icon: Calendar,
          badge: `${upcomingCount} Shows`,
        },
        {
          id: "past-events",
          label: "Past Events Archive",
          icon: Clock,
          badge: `${pastCount} Shows`,
          badgeColor: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
        },
        {
          id: "leads",
          label: "Pass Inquiries & Leads",
          icon: Ticket,
          badge: leads.length > 0 ? `${leads.length}` : null,
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold",
        },
      ],
    },
    {
      title: "Content & Moderation",
      items: [
        {
          id: "reviews",
          label: "Reviews Moderation",
          icon: Star,
          badge: reviewCounts.pending > 0 ? `${reviewCounts.pending} New` : null,
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
        },
        {
          id: "blogs",
          label: "Articles & Tour News",
          icon: FileText,
          badge: blogs.length > 0 ? `${blogs.length}` : null,
        },
      ],
    },
    {
      title: "Media & Visuals",
      items: [
        {
          id: "gallery",
          label: "Photo Gallery",
          icon: ImageIcon,
          badge: galleryItems.length > 0 ? `${galleryItems.length}` : null,
        },
        {
          id: "videos",
          label: "Video Showcase",
          icon: Video,
          badge: videoItems.length > 0 ? `${videoItems.length}` : null,
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          id: "social",
          label: "Social Hub & Instagram",
          icon: Share2,
          badge: socialSettings.instagram?.connected ? "IG Live" : "3 Channels",
          badgeColor: socialSettings.instagram?.connected
            ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold"
            : "bg-slate-100 text-slate-700 border-slate-200",
        },
      ],
    },
    {
      title: "System & Settings",
      items: [
        {
          id: "users",
          label: "Admin Roles & Access",
          icon: Users,
          badge: adminUsers.length > 0 ? `${adminUsers.length}` : null,
        },
        {
          id: "profile",
          label: "Artist Bio & Concierge",
          icon: User,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white border transition-all animate-in slide-in-from-bottom-4 ${
            toastMessage.type === "success"
              ? "bg-slate-900 border-slate-700 shadow-slate-900/30"
              : "bg-rose-600 border-rose-500 shadow-rose-600/30"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-200" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Mobile Sidebar Toggle Button */}
      <div className="w-full lg:hidden flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 capitalize">
          <span className="text-slate-400 uppercase tracking-wider font-mono">Current:</span>
          <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/80">{activeTab}</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Collapsible SaaS Sidebar Navigation */}
      <aside
        className={`w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-5 transition-all ${
          isSidebarOpen ? "block" : "hidden lg:block"
        }`}
      >
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id || (activeTab === "event-editor" && editorOrigin === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-950 text-white shadow-xs ring-1 ring-slate-800"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-amber-400" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        isActive
                          ? "bg-white/15 text-white border-white/20 font-bold"
                          : item.badgeColor || "bg-slate-100 text-slate-700 border-slate-200 font-semibold"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          {/* Quick WhatsApp Lead Status Pill */}
          <a
            href="https://api.whatsapp.com/send?phone=919540681934"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 hover:bg-emerald-100/80 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-[11px] font-bold text-emerald-900 block leading-tight">
                  Lead WhatsApp
                </span>
                <span className="text-[10px] font-mono text-emerald-700">
                  +91 95406 81934
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-0.5">Automated Event Engine</span>
            <span className="text-[11px] text-slate-500 leading-relaxed block">
              Dates in the past automatically transition from Upcoming to Past Archives without manual intervention.
            </span>
          </div>
        </div>
      </aside>

      {/* Main SaaS Content Workspace */}
      <section className="flex-1 w-full min-w-0 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW DASHBOARD                                    */}
        {/* ============================================================ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top SaaS Welcome Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dj G-Spark OFFICIAL PORTAL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Artist Operations Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                  Manage live concert tours, moderate attendee feedback, track pass requests, and configure verified social accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openCreateEvent("overview")}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Event</span>
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Moderate Reviews ({reviewCounts.pending})</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Total Events */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Total Events
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {!isMounted || isLoading ? (
                    <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    events.length
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  {!isMounted || isLoading ? (
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("events")}
                        className="text-emerald-600 font-bold hover:underline cursor-pointer"
                      >
                        {events.filter((e) => !isEventPast(e.date) && e.status !== "COMPLETED").length} Upcoming
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("past-events")}
                        className="text-slate-600 font-bold hover:underline cursor-pointer"
                      >
                        {events.filter((e) => isEventPast(e.date) || e.status === "COMPLETED").length} Past Completed
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Card 2: Pending Reviews */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pending Reviews
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600">
                  {!isMounted || isLoading ? (
                    <div className="h-8 w-12 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    reviewCounts.pending
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  {!isMounted || isLoading ? (
                    <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <span className="text-emerald-600 font-bold">{reviewCounts.approved} Live</span>
                      <span>•</span>
                      <span>{reviewCounts.total} Total Submissions</span>
                    </>
                  )}
                </div>
              </div>

              {/* Card 3: Pass Requests */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pass Concierge
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {!isMounted || isLoading ? (
                    <div className="h-8 w-12 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    leads.length
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  <span>Client pass & ticket requests received</span>
                </div>
              </div>

              {/* Card 4: Instagram Integration */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Instagram Sync
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      socialSettings.instagram?.connected ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-base font-black text-slate-900">
                    {socialSettings.instagram?.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-mono">
                  {socialSettings.instagram?.connected
                    ? `@${socialSettings.instagram?.username}`
                    : "No account linked"}
                </div>
              </div>
            </div>

            {/* Two Column Layout: Recent Leads & Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Recent Leads Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-slate-700" />
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                        Recent Pass Inquiries ({leads.slice(0, 5).length})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {leads.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">No pass requests received yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {leads.slice(0, 5).map((lead) => (
                        <div key={lead.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{lead.name}</span>
                            <span className="text-[11px] text-slate-500">
                              {lead.eventCity || lead.eventTitle || "Tour Show"} • {lead.quantity || 1} Passes
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              title="Call Client"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Reviews Awaiting Moderation Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                        Pending Reviews ({reviewCounts.pending})
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <span>Manage All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {reviews.filter((r) => r.status === "pending").length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center">
                      All reviews are moderated. No pending comments.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {reviews
                        .filter((r) => r.status === "pending")
                        .slice(0, 4)
                        .map((rev) => (
                          <div key={rev.id} className="py-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-slate-900">
                                  {rev.userName || rev.name}
                                </span>
                                <span className="text-[11px] text-slate-400 ml-2">
                                  {rev.eventTitle || rev.articleTitle || "Concert Review"}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {[...Array(rev.rating || 5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 italic">
                              "{rev.comment || rev.quote}"
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleModerateReview(rev.id, "approved")}
                                className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Approve & Publish
                              </button>
                              <button
                                onClick={() => handleModerateReview(rev.id, "rejected")}
                                className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: EVENTS MANAGEMENT                                     */}
        {/* ============================================================ */}
        {activeTab === "events" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Header & New Event Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Events Management</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unified catalog with automatic timeline categorization (Upcoming vs Past Archives).
                </p>
              </div>

              <button
                onClick={() => openCreateEvent("events")}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by title, venue, or city..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Type Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: "all", label: `All (${events.length})` },
                  {
                    id: "upcoming",
                    label: `Upcoming (${
                      events.filter((e) => !isEventPast(e.date) && e.status !== "COMPLETED").length
                    })`,
                  },
                  {
                    id: "past",
                    label: `Past Archive (${
                      events.filter((e) => isEventPast(e.date) || e.status === "COMPLETED").length
                    })`,
                  },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setEventTypeFilter(pill.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      eventTypeFilter === pill.id
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* City Filter */}
              <select
                value={eventCityFilter}
                onChange={(e) => setEventCityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Cities ({eventCities.length})</option>
                {eventCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Events Data Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Photo</th>
                    <th className="p-3.5">Upcoming Event</th>
                    <th className="p-3.5">Event Type</th>
                    <th className="p-3.5">Venue</th>
                    <th className="p-3.5">City / State</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Artist</th>
                    <th className="p-3.5">Summary Column</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(!isMounted || isLoading) ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-3.5"><div className="w-12 h-14 bg-slate-100 rounded-lg" /></td>
                        <td className="p-3.5"><div className="h-4 w-36 bg-slate-100 rounded mb-1.5" /><div className="h-3 w-20 bg-slate-100 rounded" /></td>
                        <td className="p-3.5"><div className="h-5 w-20 bg-slate-100 rounded-full" /></td>
                        <td className="p-3.5"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                        <td className="p-3.5"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                        <td className="p-3.5"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                        <td className="p-3.5"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                        <td className="p-3.5"><div className="h-4 w-44 bg-slate-100 rounded" /></td>
                        <td className="p-3.5 text-right"><div className="h-8 w-16 bg-slate-100 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No events match the current search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev) => {
                      const past = isEventPast(ev.date) || ev.status === "COMPLETED";
                      const viewUrl = past
                        ? `/past-events/${ev.slug || ev.id}`
                        : `/events/${ev.slug || ev.id}`;

                      return (
                        <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Photo */}
                          <td className="p-3.5">
                            <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img
                                src={ev.image || "/images/past_event_crowd.jpg"}
                                alt={ev.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Upcoming Event */}
                          <td className="p-3.5">
                            <div className="min-w-0 max-w-[200px]">
                              <span className="font-bold text-slate-900 block truncate" title={ev.title}>
                                {ev.title}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 block truncate">
                                /{ev.slug || ev.id}
                              </span>
                            </div>
                          </td>

                          {/* Event Type */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              {ev.eventType || "Arena Concert"}
                            </span>
                          </td>

                          {/* Venue */}
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block truncate max-w-[130px]" title={ev.venue}>
                              {ev.venue}
                            </span>
                          </td>

                          {/* City / State */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">
                              {ev.city}{ev.country ? `, ${ev.country}` : ""}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">
                              {ev.dateDisplay || ev.date}
                            </span>
                            <span className="text-[11px] text-slate-400 block">{ev.time}</span>
                          </td>

                          {/* Artist */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-bold text-amber-700 block truncate max-w-[120px]" title={ev.artist || "Dj G-Spark"}>
                              {ev.artist || "Dj G-Spark"}
                            </span>
                          </td>

                          {/* Summary Column */}
                          <td className="p-3.5">
                            <p className="text-xs text-slate-500 line-clamp-2 max-w-[220px] leading-relaxed" title={ev.description}>
                              {ev.description || "—"}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                href={viewUrl}
                                target="_blank"
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="View on Live Site"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden xl:inline">Live</span>
                              </Link>
                              <button
                                onClick={() => openEditEvent(ev, "events")}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                title="Edit Event Details"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev.id, ev.title, ev.slug)}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                title="Delete Event"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: PAST EVENTS ARCHIVE MANAGEMENT                           */}
        {/* ============================================================ */}
        {activeTab === "past-events" && (
          <div className="space-y-6">
            {/* Header with Title and Add Event Button */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    Archive Operations
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">Automatic Timeline Classification</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Past Events & Concert Archives</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete management of archived stadium shows, festivals, and headline tours. All details can be edited directly in the dedicated event studio.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/past-events"
                  target="_blank"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Public Archive</span>
                </Link>
                <button
                  onClick={() => openCreateEvent("past-events")}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Past Event</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Archived Shows</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  {!isMounted || isLoading ? (
                    <div className="h-7 w-12 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-900">{pastEventsList.length}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        of {events.filter((e) => isEventPast(e.date) || e.status === "COMPLETED").length} total past
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Automatically archived by date</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tour Cities</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  {!isMounted || isLoading ? (
                    <div className="h-7 w-12 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    <>
                      <span className="text-2xl font-black text-slate-900">{pastEventCities.length}</span>
                      <span className="text-xs text-slate-500 font-medium">Metros & Arenas</span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-medium">
                  {pastEventCities.slice(0, 3).join(", ") || "Global Venues"}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Estimated Fans</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">280K+</span>
                  <span className="text-xs text-slate-500 font-medium">Total Attendance</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-medium">
                  Across historical arena dates
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Timeline Engine</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    AUTOMATIC
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-medium">
                  Zero manual migration required
                </div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search past events by title, venue, city, or description..."
                  value={pastSearchQuery}
                  onChange={(e) => setPastSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* City Filter */}
                <select
                  value={pastCityFilter}
                  onChange={(e) => setPastCityFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Cities ({pastEventCities.length})</option>
                  {pastEventCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Year Filter */}
                <select
                  value={pastYearFilter}
                  onChange={(e) => setPastYearFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {pastEventYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                {/* Sort Order */}
                <select
                  value={pastSortOrder}
                  onChange={(e) => setPastSortOrder(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="latest">Sort: Latest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                </select>

                {(pastSearchQuery || pastCityFilter !== "all" || pastYearFilter !== "all") && (
                  <button
                    onClick={() => {
                      setPastSearchQuery("");
                      setPastCityFilter("all");
                      setPastYearFilter("all");
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}

                {/* View Switcher: Table vs Cards */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 ml-auto md:ml-0">
                  <button
                    type="button"
                    onClick={() => setPastViewMode("table")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pastViewMode === "table"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Table List View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPastViewMode("grid")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pastViewMode === "grid"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Cards Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Past Events Display: Table View OR Cards Grid View */}
            {pastViewMode === "table" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[860px]">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-4">Past Event / Poster</th>
                        <th className="p-4">Date & Year</th>
                        <th className="p-4">Venue & City</th>
                        <th className="p-4">Attendance</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Visibility</th>
                        <th className="p-4 text-right">Actions (Edit / Delete)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(!isMounted || isLoading) ? (
                        [1, 2, 3, 4].map((i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-14 bg-slate-100 rounded-lg shrink-0" /><div className="h-4 w-36 bg-slate-100 rounded" /></div></td>
                            <td className="p-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                            <td className="p-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                            <td className="p-4"><div className="h-5 w-20 bg-slate-100 rounded" /></td>
                            <td className="p-4"><div className="h-5 w-20 bg-slate-100 rounded" /></td>
                            <td className="p-4"><div className="h-5 w-16 bg-slate-100 rounded" /></td>
                            <td className="p-4 text-right"><div className="h-8 w-20 bg-slate-100 rounded ml-auto" /></td>
                          </tr>
                        ))
                      ) : pastEventsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-400">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-600">No past events found</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Try adjusting your filters or click "Add Past Event" to record a historical show.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        pastEventsList.map((ev) => {
                          const viewUrl = `/past-events/${ev.slug || ev.id}`;

                          return (
                            <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Event / Poster */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                    <img
                                      src={ev.image || "/images/past_event_crowd.jpg"}
                                      alt={ev.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-900 block truncate max-w-xs">
                                      {ev.title}
                                    </span>
                                    <span className="text-[11px] font-mono text-slate-400 block truncate max-w-xs">
                                      /{ev.slug || ev.id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Date & Year */}
                              <td className="p-4">
                                <span className="font-semibold text-slate-800 block">
                                  {ev.dateDisplay || ev.date}
                                </span>
                                <span className="text-[11px] text-slate-400 block">{ev.time}</span>
                              </td>

                              {/* Venue & City */}
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{ev.venue}</span>
                                </div>
                                <span className="text-[11px] text-slate-500 block pl-5">
                                  {ev.city}, {ev.country}
                                </span>
                              </td>

                              {/* Attendance */}
                              <td className="p-4">
                                <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px]">
                                  {ev.capacity || "40,000+ Fans"}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>COMPLETED</span>
                                </span>
                              </td>

                              {/* Visibility */}
                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    ev.isPublished !== false
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {ev.isPublished !== false ? "Published" : "Draft"}
                                </span>
                              </td>

                              {/* Actions (Edit / Delete / View) */}
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <Link
                                    href={viewUrl}
                                    target="_blank"
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                                    title="View on Public Archive"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="hidden xl:inline">Live</span>
                                  </Link>
                                  <button
                                    onClick={() => openEditEvent(ev, "past-events")}
                                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:border-amber-300"
                                    title="Edit This Past Event"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(ev.id, ev.title, ev.slug)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:border-rose-300"
                                    title="Delete This Past Event"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Cards Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {(!isMounted || isLoading) ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse p-4 flex flex-col justify-between">
                      <div className="w-full h-32 bg-slate-100 rounded-xl" />
                      <div className="space-y-2 mt-3">
                        <div className="h-4 w-3/4 bg-slate-100 rounded" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))
                ) : pastEventsList.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No past events found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or click "Add Past Event".</p>
                  </div>
                ) : (
                  pastEventsList.map((ev) => {
                    const viewUrl = `/past-events/${ev.slug || ev.id}`;

                    return (
                      <div
                        key={ev.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-amber-300 hover:shadow-md transition-all group"
                      >
                        {/* Poster Header */}
                        <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                          <img
                            src={ev.image || "/images/past_event_crowd.jpg"}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400 text-black shadow-xs tracking-wider">
                              {ev.dateDisplay || ev.date}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-emerald-400 border border-emerald-500/30 backdrop-blur-xs uppercase">
                              COMPLETED
                            </span>
                          </div>

                          {/* Title & Venue on poster overlay */}
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h3 className="font-bold text-sm line-clamp-1 drop-shadow-xs">{ev.title}</h3>
                            <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 font-medium">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{ev.venue}, {ev.city}</span>
                            </p>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Attendance</span>
                              <span className="font-bold text-slate-800">{ev.capacity || "40,000+ Fans"}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Timing</span>
                              <span className="font-bold text-slate-800 truncate block">{ev.time || "Evening Concert"}</span>
                            </div>
                          </div>

                          {ev.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {ev.description}
                            </p>
                          )}

                          {/* Actions Footer */}
                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => openEditEvent(ev, "past-events")}
                              className="flex-1 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:border-amber-300"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Edit Event</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.title, ev.slug)}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs hover:border-rose-300"
                              title="Delete Past Event"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete</span>
                            </button>
                            <Link
                              href={viewUrl}
                              target="_blank"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="View on Public Website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: DEDICATED FULL-PAGE EVENT EDITOR (ADD & EDIT)           */}
        {/* ============================================================ */}
        {activeTab === "event-editor" && (
          <div className="space-y-6">
            {/* Top Navigation & Action Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  {/* Breadcrumbs & Back */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={handleBackFromEditor}
                      className="flex items-center gap-1.5 text-slate-600 hover:text-amber-600 font-semibold transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to {editorOrigin === "past-events" ? "Past Events Archive" : "Events Management"}</span>
                    </button>
                    <span>/</span>
                    <span className="text-slate-400">
                      {editingEvent ? "Edit Event" : "Create New Event"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {editingEvent ? `Edit: ${editingEvent.title}` : (editorOrigin === "past-events" ? "Add Past Event Archive" : "Create New Concert Event")}
                    </h2>

                    {/* Dynamic Auto-Classification Indicator */}
                    {eventForm.date && (
                      isEventPast(eventForm.date) || eventForm.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Timeline: Past Event Archive</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>Timeline: Upcoming Live Tour</span>
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {editingEvent
                      ? `Updating details for Event ID: ${editingEvent.id}. Changes reflect across the public website immediately upon saving.`
                      : "Create and publish a concert event. Form values will automatically be routed to either upcoming or past archives."}
                  </p>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(editingEvent.id, editingEvent.title, editingEvent.slug)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Permanently Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete Event</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleBackFromEditor}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const formEl = document.getElementById("eventEditorForm") as HTMLFormElement;
                      if (formEl) formEl.requestSubmit();
                    }}
                    disabled={isSavingEvent}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEvent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Event...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingEvent ? "Save & Update Event" : "Save & Publish Event"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Form Body */}
            <form id="eventEditorForm" onSubmit={handleSaveEvent} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left & Center Column (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card 1: Core Event Identity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-500" />
                        <span>1. Core Event Identity</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Headline title, URL routing slug, and descriptive editorial.</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Upcoming Event (Title) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="e.g. MUMBAI D.Y. PATIL 360 SENSORY ARENA"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Event Type & Artist Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Event Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={eventForm.eventType}
                        onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Arena Concert">Arena Concert</option>
                        <option value="Club Show">Club Show</option>
                        <option value="Wedding & Private Show">Wedding & Private Show</option>
                        <option value="Music Festival">Music Festival</option>
                        <option value="Corporate Summit">Corporate Summit</option>
                        <option value="College Fest">College Fest</option>
                        <option value="Special Showcase">Special Showcase</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Artist <span className="text-slate-400 font-normal">(Default: Dj G-Spark)</span>
                      </label>
                      <input
                        type="text"
                        value={eventForm.artist}
                        onChange={(e) => setEventForm({ ...eventForm, artist: e.target.value })}
                        placeholder="e.g. Dj G-Spark"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Slug with Auto-generate Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        URL Slug
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (eventForm.title || eventForm.city) {
                            const generated = `${(eventForm.city || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(eventForm.venue || eventForm.title || "show").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${(eventForm.date ? eventForm.date.split("-")[0] : "2026")}`;
                            setEventForm({ ...eventForm, slug: generated });
                          }
                        }}
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                      >
                        Auto-generate slug
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:border-amber-500">
                      <span className="px-3 text-xs text-slate-400 font-mono select-none">
                        /events/ or /past-events/
                      </span>
                      <input
                        type="text"
                        value={eventForm.slug}
                        onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })}
                        placeholder="mumbai-dy-patil-stadium-2026"
                        className="w-full py-2.5 pr-3 bg-transparent text-slate-900 text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Summary Column (Teaser Writeup) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="High energy arena performance featuring explosive pyrotechnics and 360-degree sensory sound..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Detailed Concert Story / Experience Writeup
                    </label>
                    <textarea
                      rows={4}
                      value={eventForm.detailedAbout}
                      onChange={(e) => setEventForm({ ...eventForm, detailedAbout: e.target.value })}
                      placeholder="Full event narrative, press release recap, stage design details, and highlights displayed on the dedicated event page..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Lineup */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Artist Lineup & Co-Performers (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={eventForm.lineup}
                      onChange={(e) => setEventForm({ ...eventForm, lineup: e.target.value })}
                      placeholder="Dj G-Spark (Headliner), MC RHYTHM, NIKITA B2B"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Card 2: Schedule & Timeline Intelligence */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>2. Schedule & Timeline Intelligence</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Date dictates automatic timeline categorization across Upcoming and Past Events.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Event Date (YYYY-MM-DD) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={eventForm.date}
                        onChange={(e) => {
                          const val = e.target.value;
                          let autoDisplay = eventForm.dateDisplay;
                          if (val) {
                            try {
                              const d = new Date(val);
                              autoDisplay = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
                            } catch {}
                          }
                          setEventForm({ ...eventForm, date: val, dateDisplay: autoDisplay });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Date Display */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Display Date String
                      </label>
                      <input
                        type="text"
                        value={eventForm.dateDisplay}
                        onChange={(e) => setEventForm({ ...eventForm, dateDisplay: e.target.value })}
                        placeholder="e.g. 24 DEC 2026 or 18 OCT 2025"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Performance Time Window
                      </label>
                      <input
                        type="text"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        placeholder="e.g. 20:00 - 02:00 IST"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Doors Open */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Doors Open Time
                      </label>
                      <input
                        type="text"
                        value={eventForm.doors}
                        onChange={(e) => setEventForm({ ...eventForm, doors: e.target.value })}
                        placeholder="e.g. 18:00 IST"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Smart Notice Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>Auto-Timeline Intelligence:</strong> Any event with an Event Date prior to today or status set to COMPLETED is automatically routed to the Past Events Archive and the homepage Past Events showcase. No separate manual migration is needed.
                    </p>
                  </div>
                </div>

                {/* Card 3: Venue & Location */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        <span>3. Venue & Geographic Location</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">Arena, stadium, city, address, and capacity metadata.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Venue */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Venue / Arena Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.venue}
                        onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                        placeholder="e.g. D.Y. Patil Stadium"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        City / State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={eventForm.city}
                        onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                        placeholder="e.g. MUMBAI or DELHI NCR"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={eventForm.country}
                        onChange={(e) => setEventForm({ ...eventForm, country: e.target.value })}
                        placeholder="e.g. INDIA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Region */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Region Filter
                      </label>
                      <select
                        value={eventForm.region}
                        onChange={(e) => setEventForm({ ...eventForm, region: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="india">India (Domestic Tour)</option>
                        <option value="international">International (Global Tour)</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Full Venue Address
                      </label>
                      <input
                        type="text"
                        value={eventForm.address}
                        onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                        placeholder="e.g. Sector 7, Nerul, Navi Mumbai, Maharashtra 400706"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Capacity / Attendance */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Crowd Capacity / Attendance
                      </label>
                      <input
                        type="text"
                        value={eventForm.capacity}
                        onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                        placeholder="e.g. 55,000 Attendance (for past) or 25,000 Capacity (for upcoming)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Side Panel, 1 col) */}
              <div className="space-y-6">
                {/* Card 4: Event Poster & Media */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>4. Poster & Artwork</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Official promotional concert artwork.</p>
                  </div>

                  <ImageUploader
                    label="Poster Image URL or Upload"
                    value={eventForm.image}
                    onChange={(url) => setEventForm({ ...eventForm, image: url })}
                  />

                  {eventForm.image && (
                    <div className="mt-3 relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={eventForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400">
                          Live Poster Preview
                        </span>
                        <h4 className="text-sm font-bold leading-tight line-clamp-1">{eventForm.title || "Untitled Show"}</h4>
                        <p className="text-[11px] text-slate-300 line-clamp-1">{eventForm.venue || "Venue"} • {eventForm.city || "City"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card 5: Publication Controls & Actions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>6. Publishing Controls</span>
                    </h3>
                  </div>

                  {/* Publish Toggle */}
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventForm.isPublished}
                      onChange={(e) => setEventForm({ ...eventForm, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Publish on Website
                      </span>
                      <span className="text-[11px] text-slate-600 block leading-tight mt-0.5">
                        When enabled, event is publicly viewable and indexed on the site.
                      </span>
                    </div>
                  </label>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isSavingEvent}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSavingEvent ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Event to Database...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-amber-400" />
                          <span>{editingEvent ? "Update Event Now" : "Publish Event Now"}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBackFromEditor}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel & Return
                    </button>

                    {editingEvent && (
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(editingEvent.id, editingEvent.title, editingEvent.slug)}
                          className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs hover:border-rose-300"
                          title="Permanently Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete Event Permanently</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: REVIEWS MODERATION                                    */}
        {/* ============================================================ */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Reviews & Ratings Moderation</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Approve, reject, or delete user reviews submitted for events and blog articles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  {reviewCounts.pending} Pending Review
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  {reviewCounts.approved} Approved
                </span>
              </div>
            </div>

            {/* Sub-Tabs & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Status Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: "pending", label: `Pending (${reviewCounts.pending})` },
                  { id: "approved", label: `Approved (${reviewCounts.approved})` },
                  { id: "rejected", label: `Rejected (${reviewCounts.rejected})` },
                  { id: "all", label: `All (${reviewCounts.total})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setReviewFilter(pill.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      reviewFilter === pill.id
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Target Type & Search */}
              <div className="flex items-center gap-3">
                <select
                  value={reviewTargetFilter}
                  onChange={(e) => setReviewTargetFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Targets</option>
                  <option value="event">Event Reviews</option>
                  <option value="article">Article Reviews</option>
                </select>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search reviewer or comment..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500 w-48 sm:w-60"
                  />
                </div>
              </div>
            </div>

            {/* Reviews Cards List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Star className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">No reviews found matching the selected filter criteria.</p>
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Top: User info & Rating */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                          {rev.userName?.charAt(0) || rev.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900">
                            {rev.userName || rev.name}
                          </span>
                          {rev.userEmail && (
                            <span className="text-[11px] text-slate-400 ml-2">
                              &lt;{rev.userEmail}&gt;
                            </span>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-500 ml-auto md:ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (rev.rating || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Target Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {rev.targetType === "article" ? "ARTICLE" : "EVENT"}:{" "}
                          {rev.eventTitle || rev.articleTitle || rev.event || "Concert"}
                        </span>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{rev.comment || rev.quote}"
                      </p>

                      <div className="text-[10px] text-slate-400 font-mono">
                        Submitted on: {new Date(rev.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {rev.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleModerateReview(rev.id, "approved")}
                            className="w-full md:w-32 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleModerateReview(rev.id, "rejected")}
                            className="w-full md:w-32 py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {rev.status === "approved" && (
                        <button
                          onClick={() => handleModerateReview(rev.id, "pending")}
                          className="w-full md:w-32 py-1.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Move to Pending</span>
                        </button>
                      )}

                      {rev.status === "rejected" && (
                        <button
                          onClick={() => handleModerateReview(rev.id, "approved")}
                          className="w-full md:w-32 py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Approve</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: LEADS & PASS CONCIERGE                                */}
        {/* ============================================================ */}
        {/* LEADS & PASS CONCIERGE                                       */}
        {/* ============================================================ */}
        {activeTab === "leads" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">Leads & Pass Concierge</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Pabbly WhatsApp Webhook Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct customer pass requests & inquiries automatically forwarded to Pabbly / WhatsApp.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads by name, phone, city..."
                  value={leadSearchQuery}
                  onChange={(e) => setLeadSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500 w-64"
                />
              </div>
            </div>

            {/* Pabbly Webhook Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 font-bold">⚡ Pabbly Webhook Listener:</span>
                <code className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-md">
                  https://connect.pabbly.com/webhook-listener/webhook/...
                </code>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Auto-Dispatches all website form leads directly to WhatsApp
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Event Requested</th>
                    <th className="p-4">Pass Details</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Date / Status</th>
                    <th className="p-4 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No pass requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hi ${lead.name}, regarding your pass request for ${lead.eventTitle || "Dj G-Spark Concert"}:`
                      )}`;

                      const formattedPrice = lead.totalPrice
                        ? typeof lead.totalPrice === "number" || !isNaN(Number(lead.totalPrice))
                          ? `₹ ${Number(lead.totalPrice).toLocaleString("en-IN")}`
                          : String(lead.totalPrice)
                        : "Concierge Quote";

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{lead.name}</span>
                            {lead.type && (
                              <span className="text-[10px] text-slate-400 uppercase font-mono">
                                {lead.type.replace(/_/g, " ")}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="block font-mono text-slate-800">{lead.phone}</span>
                            {lead.email && (
                              <span className="block text-[11px] text-slate-400">{lead.email}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-800 block">
                              {lead.eventCity || "Concert"}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {lead.eventTitle || lead.notes}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {lead.tier || "General Admission"}
                            </span>
                            <span className="block text-[11px] text-slate-500 mt-1">
                              Qty: {lead.quantity || 1}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-900">
                            {formattedPrice}
                          </td>
                          <td className="p-4 text-[11px]">
                            <span className="text-slate-500 font-mono block">
                              {new Date(lead.timestamp || Date.now()).toLocaleDateString()}
                            </span>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                              ✓ Pabbly Forwarded
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-[11px] font-bold"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                title="Call Client"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: SOCIAL MEDIA HUB (Strict 3 Channels)                  */}
        {/* ============================================================ */}
        {activeTab === "social" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h2 className="text-xl font-bold text-slate-900">Official Social Media Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage the strictly authorized social media channels: Facebook, YouTube, and Instagram.
              </p>
            </div>

            {/* Channels Grid: Facebook & YouTube */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facebook Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
                      <FacebookIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Facebook Page</h3>
                      <span className="text-[11px] text-slate-400">Official Community Channel</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialSettings.facebook?.enabled !== false}
                      onChange={(e) =>
                        setSocialSettings({
                          ...socialSettings,
                          facebook: {
                            ...socialSettings.facebook,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Official Facebook URL
                  </label>
                  <input
                    type="url"
                    value={socialSettings.facebook?.url || ""}
                    onChange={(e) =>
                      setSocialSettings({
                        ...socialSettings,
                        facebook: {
                          ...socialSettings.facebook,
                          url: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSocialSettings}
                    disabled={isSavingSocial}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isSavingSocial ? "Saving..." : "Save Facebook Settings"}
                  </button>
                </div>
              </div>

              {/* YouTube Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF0000] flex items-center justify-center">
                      <YouTubeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">YouTube Channel</h3>
                      <span className="text-[11px] text-slate-400">4K Live Sets & Music Videos</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialSettings.youtube?.enabled !== false}
                      onChange={(e) =>
                        setSocialSettings({
                          ...socialSettings,
                          youtube: {
                            ...socialSettings.youtube,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Official YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={socialSettings.youtube?.channelUrl || ""}
                    onChange={(e) =>
                      setSocialSettings({
                        ...socialSettings,
                        youtube: {
                          ...socialSettings.youtube,
                          channelUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSocialSettings}
                    disabled={isSavingSocial}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isSavingSocial ? "Saving..." : "Save YouTube Settings"}
                  </button>
                </div>
              </div>
            </div>

            {/* Instagram Integration Module Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <InstagramIntegrationModule onNotification={showToast} />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ADMIN USERS & ROLES                                   */}
        {/* ============================================================ */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Role-Based Administrator Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Granular administrative permissions governing events, review moderation, leads, and social accounts.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {adminUsers.length} Active System Accounts
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Administrator</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Permissions Assigned</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center">
                            {user.name?.charAt(0) || "A"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions?.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Recently Active"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: BLOGS & ARTICLES                                      */}
        {/* ============================================================ */}
        {activeTab === "blogs" && (
          isBlogModalOpen ? (
            <div className="space-y-6">
              {/* Header with Title and Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBlogModalOpen(false);
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Articles</span>
                  </button>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {editingBlog ? `Edit: ${editingBlog.title}` : "Create New Article / Editorial Story"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingBlog
                      ? "Modify article writeup and update changes across the public website immediately."
                      : "Write and publish a new story, music dispatch, or press release to the live website."}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBlogModalOpen(false);
                      if (typeof window !== "undefined") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const formEl = document.getElementById("blogEditorForm") as HTMLFormElement;
                      if (formEl) formEl.requestSubmit();
                    }}
                    disabled={isSavingBlog}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingBlog ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingBlog ? "Save Changes" : "Publish Article Live"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
                <form id="blogEditorForm" onSubmit={handleSaveBlog} className="space-y-6 max-w-4xl">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Article Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      placeholder="e.g. Behind The Decks: Crafting The Sound of 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Slug & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">URL Slug</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (blogForm.title) {
                              const generated = blogForm.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              setBlogForm({ ...blogForm, slug: generated });
                            }
                          }}
                          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          Auto-generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={blogForm.slug}
                        onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                        placeholder="behind-the-decks-2026"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                      <select
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="MUSIC PRODUCTION">MUSIC PRODUCTION</option>
                        <option value="TOUR DIARIES">TOUR DIARIES</option>
                        <option value="BEHIND THE SCENES">BEHIND THE SCENES</option>
                        <option value="FESTIVAL CULTURE">FESTIVAL CULTURE</option>
                        <option value="ANNOUNCEMENTS">ANNOUNCEMENTS</option>
                      </select>
                    </div>
                  </div>

                  {/* Author & Read Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Author Name</label>
                      <input
                        type="text"
                        value={blogForm.author}
                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                        placeholder="Dj G-Spark"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Read Time</label>
                      <input
                        type="text"
                        value={blogForm.readTime}
                        onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                        placeholder="e.g. 5 MIN READ"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Cover Image Uploader */}
                  <div>
                    <ImageUploader
                      label="Article Cover Image"
                      value={blogForm.image}
                      onChange={(url) => setBlogForm({ ...blogForm, image: url })}
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Short Excerpt / Teaser <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      placeholder="Brief 1-2 sentence preview shown on the main blog grid..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Full Content */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Article Content / Narrative <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={12}
                      required
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      placeholder="Write your complete article writeup here. Separate paragraphs with empty lines..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBlogModalOpen(false);
                        if (typeof window !== "undefined") {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingBlog}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingBlog ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{editingBlog ? "Save Changes" : "Publish Article Live"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Articles & Tour Announcements</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Publish editorial articles, music insights, and tour dispatches directly to the website.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                    {blogs.length} Articles
                  </span>
                  <button
                    type="button"
                    onClick={openCreateBlog}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Article</span>
                  </button>
                </div>
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700">No Articles Published Yet</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Create your first editorial story or tour announcement to show on the website.
                  </p>
                  <button
                    type="button"
                    onClick={openCreateBlog}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Article</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {blogs.map((b) => (
                    <div key={b.id || b.slug} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={b.image || "/images/past_event_crowd.jpg"}
                            alt={b.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/past_event_crowd.jpg";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-slate-900 block truncate">{b.title}</span>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                              {b.category || "MUSIC"}
                            </span>
                            <span>•</span>
                            <span>{b.dateDisplay || b.date || "Recent"}</span>
                            <span>•</span>
                            <span>{b.readTime || "5 MIN READ"}</span>
                            <span>•</span>
                            <span className="text-slate-400">by {b.author || "Dj G-Spark"}</span>
                          </div>
                          {b.excerpt && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{b.excerpt}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <Link
                          href={`/blog/${b.slug || b.id}`}
                          target="_blank"
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View Article Live"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditBlog(b)}
                          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(b.id, b.title, b.slug)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* ============================================================ */}
        {/* TAB: PHOTO GALLERY MANAGEMENT                                */}
        {/* ============================================================ */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            {/* Header & Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-slate-900">Photo Gallery Manager</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {galleryItems.length} Live Shots
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage stage, festival, and backstage photography displayed on the public website (/#gallery).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openCreateGallery}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Photo</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: `All Photos (${galleryItems.length})` },
                  { id: "live", label: `Live Stage (${galleryItems.filter((g) => g.category === "live").length})` },
                  { id: "festivals", label: `Festivals (${galleryItems.filter((g) => g.category === "festivals").length})` },
                  { id: "backstage", label: `Backstage (${galleryItems.filter((g) => g.category === "backstage").length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setGalleryCategoryFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      galleryCategoryFilter === pill.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search photo title, venue..."
                  value={gallerySearchQuery}
                  onChange={(e) => setGallerySearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Photo Cards Grid */}
            {filteredGalleryItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Photos Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No images match the current filter. Add a new stage or festival photo using the button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGalleryItems.map((photo) => (
                  <div
                    key={photo.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono tracking-wider font-bold text-amber-400 border border-white/10 uppercase">
                        {photo.category}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                          {photo.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {photo.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          {photo.src.split("/").pop()}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditGallery(photo)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit photo details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryPhoto(photo.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete photo from gallery"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: VIDEO SHOWCASE MANAGEMENT                               */}
        {/* ============================================================ */}
        {activeTab === "videos" && (
          <div className="space-y-6">
            {/* Header & Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold text-slate-900">Video Showcase Manager</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {videoItems.length} Videos
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage headline concert recordings, festival drops, and cinematic videos displayed on the public website (/#videos).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openCreateVideo}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Video</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-700">
                Displaying {filteredVideoItems.length} of {videoItems.length} Videos
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search video title, tag..."
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Videos Grid */}
            {filteredVideoItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                <Video className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Videos Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No videos match your search. Add a festival drop or 4K concert video using the button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVideoItems.map((video) => (
                  <div
                    key={video.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                      {/* Play Action */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideoUrl(video.videoSrc)}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        title="Preview video playback"
                      >
                        <div className="w-11 h-11 rounded-full bg-amber-500 group-hover:scale-110 text-slate-950 flex items-center justify-center shadow-lg transition-transform">
                          <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                        </div>
                      </button>

                      {/* Duration Badge */}
                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] tracking-wider border border-white/10">
                        {video.duration}
                      </span>
                    </div>

                    {/* Info & Actions */}
                    <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-amber-600 uppercase block mb-1">
                          {video.tag}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                          {video.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setPreviewVideoUrl(video.videoSrc)}
                          className="text-xs font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Test Play</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditVideo(video)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit video showcase details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete video from showcase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: ARTIST PROFILE                                          */}
        {/* ============================================================ */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6 max-w-3xl">
            <div className="pb-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Artist Profile Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official stage identity, bio, and booking concierge details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Stage Name</label>
                <input
                  type="text"
                  defaultValue="Dj G-Spark"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Booking Agent</label>
                <input
                  type="text"
                  defaultValue="Spark Agency Worldwide"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  defaultValue="booking@djgspark.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Concierge Phone</label>
                <input
                  type="text"
                  defaultValue="+91 95406 81934"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Artist Bio Headline</label>
                <textarea
                  rows={4}
                  defaultValue="Pioneering the hybrid signature of progressive electronic melodies and driving stadium energy. Headlining festivals and arenas worldwide."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => showToast("success", "Profile settings saved successfully!")}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}
      </section>
      {/* ============================================================ */}
      {/* MODAL: ADD GALLERY PHOTO                                     */}
      {/* ============================================================ */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingPhoto ? "Edit Gallery Photo" : "Add Photo to Live Gallery"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingPhoto ? "Update photography details on the live website (#gallery)." : "Photo will appear instantly under the website (#gallery) section."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryPhoto} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunburn Goa 55,000 Crowd"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  placeholder="e.g. Mainstage Headliner Pyro Climax"
                  value={galleryForm.subtitle}
                  onChange={(e) => setGalleryForm({ ...galleryForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Filter</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="live">Live Stage</option>
                  <option value="festivals">Festivals & Crowd</option>
                  <option value="backstage">Backstage & POV</option>
                </select>
              </div>

              <div>
                <ImageUploader
                  label="Photo Image (Upload or select)"
                  value={galleryForm.src}
                  onChange={(url) => setGalleryForm({ ...galleryForm, src: url })}
                />
              </div>

              {/* Preview */}
              {galleryForm.src && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 relative aspect-[4/3] w-full max-h-48">
                  <img src={galleryForm.src} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-xs">{galleryForm.title || "Photo Title"}</span>
                    <span className="text-amber-400 text-[10px] font-mono">{galleryForm.subtitle || "Subtitle"}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGallery}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingGallery ? "Saving..." : editingPhoto ? "Save Photo Changes" : "Add to Live Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD VIDEO SHOWCASE                                    */}
      {/* ============================================================ */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingVideo ? "Edit Video Showcase" : "Add Video to Showcase"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingVideo ? "Update showcase video details and links on the live site (#videos)." : "Supports direct MP4 videos or YouTube links on (/#videos)."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi NCR Mega Arena Sangeet & Concert Climax"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tag / Specification</label>
                  <input
                    type="text"
                    placeholder="e.g. 4K 60FPS // BASS DROP"
                    value={videoForm.tag}
                    onChange={(e) => setVideoForm({ ...videoForm, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 03:45 or 18:20"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Video Source / Link *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /images/tour_09_arena_climax.mp4 or https://youtube.com/watch?v=..."
                  value={videoForm.videoSrc}
                  onChange={(e) => setVideoForm({ ...videoForm, videoSrc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Paste a direct MP4 file URL or an official YouTube watch/embed link.
                </span>
              </div>

              <div>
                <ImageUploader
                  label="Video Thumbnail Image"
                  value={videoForm.thumbnail}
                  onChange={(url) => setVideoForm({ ...videoForm, thumbnail: url })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVideo}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingVideo ? "Saving..." : editingVideo ? "Save Video Changes" : "Publish to Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADMIN VIDEO PREVIEW PLAYER                            */}
      {/* ============================================================ */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/80 border border-white/20 text-white hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-video w-full bg-black">
              {previewVideoUrl.includes("youtube") || previewVideoUrl.includes("youtu.be") ? (
                <iframe
                  src={
                    previewVideoUrl.includes("embed")
                      ? previewVideoUrl
                      : `https://www.youtube-nocookie.com/embed/${
                          previewVideoUrl.match(/(?:youtu\.be\/|watch\?v=)([\w-]+)/)?.[1] || ""
                        }?autoplay=1`
                  }
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={previewVideoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src={previewVideoUrl} type="video/mp4" />
                  <source src={previewVideoUrl} type="video/quicktime" />
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
