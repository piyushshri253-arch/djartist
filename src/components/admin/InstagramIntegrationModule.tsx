"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  RefreshCw,
  ExternalLink,
  Eye,
  Check,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Share2,
  Lock,
  Layers,
  Sliders,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { InstagramConnection, InstagramReel, SocialMediaSettings } from "@/types";

interface InstagramIntegrationModuleProps {
  onNotification?: (type: "success" | "error", text: string) => void;
}

export function InstagramIntegrationModule({ onNotification }: InstagramIntegrationModuleProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddReelModalOpen, setIsAddReelModalOpen] = useState(false);
  const [previewReel, setPreviewReel] = useState<InstagramReel | null>(null);

  // Connect Real Account Form States
  const [connectMode, setConnectMode] = useState<"token" | "username" | "oauth">("token");
  const [inputToken, setInputToken] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [isSubmittingConnect, setIsSubmittingConnect] = useState(false);

  // Add Reel Form States
  const [reelUrlInput, setReelUrlInput] = useState("");
  const [reelCaptionInput, setReelCaptionInput] = useState("");
  const [isSubmittingReel, setIsSubmittingReel] = useState(false);

  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [settings, setSettings] = useState<SocialMediaSettings>({
    id: "social-settings-1",
    instagramEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [reels, setReels] = useState<InstagramReel[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [togglingReelId, setTogglingReelId] = useState<string | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [isTogglingMaster, setIsTogglingMaster] = useState(false);

  // Toast Helper
  const notify = (type: "success" | "error", text: string) => {
    if (onNotification) {
      onNotification(type, text);
    }
  };

  // Fetch Instagram Module State
  const fetchModuleData = async () => {
    try {
      const res = await fetch("/api/admin/social/instagram", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load Instagram settings");
      }
      const data = await res.json();
      if (data.connection) setConnection(data.connection);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.reels)) setReels(data.reels);
    } catch (err: any) {
      console.error(err);
      notify("error", err.message || "Failed to load Instagram integration data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleData();

    // Check query params for OAuth success or error
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const successMsg = params.get("success");
      const errorMsg = params.get("error");
      if (successMsg) {
        notify("success", successMsg);
        // Clean URL params without reloading
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=instagram");
      }
      if (errorMsg) {
        notify("error", errorMsg);
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=instagram");
      }
    }
  }, []);

  // 1. Connect Real Account (Token or Username)
  const handleRealConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingConnect(true);

    try {
      if (connectMode === "oauth") {
        const res = await fetch("/api/admin/social/instagram/connect", { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.authUrl) throw new Error(data.error || "OAuth failed");
        window.location.href = data.authUrl;
        return;
      }

      const payload =
        connectMode === "token"
          ? { accessToken: inputToken.trim() }
          : { username: inputUsername.trim() };

      const res = await fetch("/api/admin/social/instagram/token-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect Instagram");

      notify("success", data.message || "Real Instagram account connected!");
      setIsConnectModalOpen(false);
      setInputToken("");
      setInputUsername("");
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Connection failed");
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  // 1b. Add Reel by URL
  const handleAddReelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelUrlInput.trim()) return;

    setIsSubmittingReel(true);
    try {
      const res = await fetch("/api/admin/social/instagram/reel-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: reelUrlInput.trim(),
          caption: reelCaptionInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add reel");

      notify("success", "Instagram reel added to your showcase!");
      setIsAddReelModalOpen(false);
      setReelUrlInput("");
      setReelCaptionInput("");
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Failed to add reel");
    } finally {
      setIsSubmittingReel(false);
    }
  };

  // 1c. Delete Reel
  const handleDeleteReel = async (id: string) => {
    if (!window.confirm("Remove this reel from your website showcase?")) return;

    setDeletingReelId(id);
    try {
      const res = await fetch(`/api/admin/social/instagram/reels/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete reel");

      setReels((prev) => prev.filter((r) => r.id !== id && r.instagramMediaId !== id));
      notify("success", "Reel removed from showcase.");
    } catch (err: any) {
      notify("error", err.message || "Failed to delete reel");
    } finally {
      setDeletingReelId(null);
    }
  };

  // 1d. Trigger Official OAuth Connect
  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/admin/social/instagram/connect", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.authUrl) {
        throw new Error(data.error || "Failed to initialize Instagram authorization");
      }

      // Redirect admin to Meta / Instagram OAuth consent screen
      window.location.href = data.authUrl;
    } catch (err: any) {
      setIsConnecting(false);
      notify("error", err.message || "Connection initialization failed");
    }
  };

  // 2. Disconnect Instagram Account
  const handleDisconnectConfirm = async () => {
    setIsDisconnectModalOpen(false);
    try {
      const res = await fetch("/api/admin/social/instagram/disconnect", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to disconnect Instagram");
      }

      notify("success", "Instagram account disconnected. Tokens revoked.");
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Disconnect failed");
    }
  };

  // 3. Manual Sync Instagram
  const handleSyncInstagram = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/social/instagram/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync Instagram reels");
      }

      notify("success", data.message || `Synced ${data.totalReels || 0} reels successfully without duplicates!`);
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Master Section Visibility Toggle
  const handleToggleMasterSection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextEnabled = e.target.checked;
    setIsTogglingMaster(true);
    try {
      const res = await fetch("/api/admin/social/instagram/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramEnabled: nextEnabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update Instagram section visibility");
      }

      setSettings(data.settings);
      notify("success", data.message || `Instagram section is now ${nextEnabled ? "ENABLED" : "HIDDEN"} on the website.`);
    } catch (err: any) {
      notify("error", err.message || "Failed to toggle section visibility");
    } finally {
      setIsTogglingMaster(false);
    }
  };

  // 5. Individual Reel Visibility Toggle
  const handleToggleReelVisibility = async (reel: InstagramReel) => {
    const nextVisible = !reel.isVisible;
    setTogglingReelId(reel.id);
    try {
      const res = await fetch(`/api/admin/social/instagram/reels/${reel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisible }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update reel visibility");
      }

      setReels((prev) =>
        prev.map((r) => (r.id === reel.id ? { ...r, isVisible: nextVisible } : r))
      );
      notify("success", `Reel set to ${nextVisible ? "SHOW ON WEBSITE" : "HIDDEN FROM WEBSITE"}.`);
    } catch (err: any) {
      notify("error", err.message || "Failed to toggle reel");
    } finally {
      setTogglingReelId(null);
    }
  };

  // Filtered Reels List
  const filteredReels = reels.filter((r) => {
    const matchesSearch =
      r.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility =
      filterVisibility === "all"
        ? true
        : filterVisibility === "visible"
        ? r.isVisible === true
        : r.isVisible === false;
    return matchesSearch && matchesVisibility;
  });

  const visibleCount = reels.filter((r) => r.isVisible).length;
  const isConnected = connection?.status === "connected";

  if (isLoading) {
    return (
      <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-10 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto" />
        <div className="h-4 w-48 bg-white/10 mx-auto rounded" />
        <div className="h-3 w-64 bg-white/5 mx-auto rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
        <span>SETTINGS</span>
        <span>&rsaquo;</span>
        <span>SOCIAL MEDIA</span>
        <span>&rsaquo;</span>
        <span className="text-[#00B4D8] font-bold">INSTAGRAM INTEGRATION</span>
      </div>

      {/* ============================================================ */}
      {/* 1. INSTAGRAM CONNECT CARD                                     */}
      {/* ============================================================ */}
      <div className="relative bg-[#0c0c12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle Instagram Gradient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E1306C]/10 via-[#F77737]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          {/* Identity & Status */}
          <div className="flex items-center gap-5">
            {/* Instagram Official Logo Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-[0_0_30px_rgba(225,48,108,0.35)] flex-shrink-0">
              <InstagramIcon className="w-9 h-9 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                  Instagram Integration
                </h3>

                {/* Connection Status Badge */}
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>🟢 CONNECTED</span>
                  </span>
                ) : connection?.status === "expired" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>🟡 EXPIRED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>🔴 NOT CONNECTED</span>
                  </span>
                )}
              </div>

              {/* Connected Account Details */}
              {isConnected && connection ? (
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#888888] mt-2 font-mono">
                  <span className="text-white font-bold">@{connection.username}</span>
                  <span>&bull;</span>
                  <a
                    href={`https://instagram.com/${connection.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E1306C] hover:underline flex items-center gap-1"
                  >
                    <span>Visit Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-[#AAAAAA]">
                    <Clock className="w-3 h-3 text-[#00E5FF]" />
                    <span>Last Synced: {new Date(connection.lastSyncedAt || Date.now()).toLocaleTimeString()}</span>
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#888888] mt-1 font-sans">
                  Connect your official Meta Instagram account to securely sync reels and display them on your website.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Connect / Disconnect / Sync */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {isConnected ? (
              <>
                {/* Sync Instagram Button */}
                <button
                  type="button"
                  onClick={handleSyncInstagram}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                  title="Fetch latest available reels from Instagram"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#00E5FF] ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Instagram"}</span>
                </button>

                {/* Disconnect Instagram Button */}
                <button
                  type="button"
                  onClick={() => setIsAddReelModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                  title="Add an individual Instagram Reel link"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reel Link</span>
                </button>

                {/* Disconnect Instagram Button */}
                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Disconnect Instagram
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-heading font-black text-xs tracking-wider uppercase hover:opacity-90 transition-all shadow-[0_0_25px_rgba(225,48,108,0.4)] flex items-center gap-2.5 cursor-pointer"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Connect Real Instagram Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Instagram Section Master Switch */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-[#00B4D8] font-bold block mb-0.5">
              Website Master Control
            </span>
            <h4 className="font-heading font-bold text-sm sm:text-base text-white uppercase">
              Instagram Section Visibility on Website
            </h4>
            <p className="text-xs text-[#888888] font-sans">
              Master switch controlling whether the &quot;Follow Us on Instagram&quot; section is displayed on the public homepage.
            </p>
          </div>

          <label className={`relative inline-flex items-center gap-3 cursor-pointer px-5 py-3 rounded-xl border transition-all ${
            settings.instagramEnabled && isConnected
              ? "bg-[#0f1f14] border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              : "bg-[#14141c] border-white/10"
          }`}>
            <input
              type="checkbox"
              checked={settings.instagramEnabled && isConnected}
              disabled={!isConnected || isTogglingMaster}
              onChange={handleToggleMasterSection}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[15px] after:left-[23px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22c55e]"></div>
            <div className="select-none text-left">
              <span className={`text-xs font-mono font-bold tracking-wider uppercase block ${
                settings.instagramEnabled && isConnected ? "text-[#22c55e]" : "text-[#777777]"
              }`}>
                {settings.instagramEnabled && isConnected ? "🟢 SHOW ON WEBSITE" : "⚪ HIDE FROM WEBSITE"}
              </span>
              <span className="text-[10px] text-[#666666] font-mono">
                {!isConnected ? "Requires connected account" : settings.instagramEnabled ? "Visible to public visitors" : "Hidden from public website"}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. INSTAGRAM REELS MANAGEMENT SECTION                         */}
      {/* ============================================================ */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-tight flex items-center gap-3">
              <span>Instagram Reels</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00B4D8]">
                {visibleCount} Live on Website &bull; {reels.length} Total Synced
              </span>
            </h3>
            <p className="text-xs text-[#888888]">
              Manage which reels appear on your public website. Click &quot;Show on Website&quot; or &quot;Hide&quot; on any reel below.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl px-4 py-2 pl-9 text-xs text-white placeholder:text-[#555555] focus:outline-none focus:border-[#E1306C]"
              />
              <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1 bg-[#12121a] p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilterVisibility("all")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterVisibility === "all" ? "bg-white/15 text-white font-bold" : "text-[#777777] hover:text-white"
                }`}
              >
                All ({reels.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterVisibility("visible")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterVisibility === "visible" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-[#777777] hover:text-white"
                }`}
              >
                Visible ({visibleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterVisibility("hidden")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterVisibility === "hidden" ? "bg-red-500/20 text-red-400 font-bold" : "text-[#777777] hover:text-white"
                }`}
              >
                Hidden ({reels.length - visibleCount})
              </button>
            </div>
          </div>
        </div>

        {/* Reels Table / Grid View */}
        {filteredReels.length === 0 ? (
          <div className="bg-[#0c0c12] border border-white/10 rounded-2xl p-12 text-center">
            <InstagramIcon className="w-10 h-10 text-[#555555] mx-auto mb-3" />
            <h4 className="font-heading font-bold text-white text-base uppercase">No Reels Found</h4>
            <p className="text-xs text-[#888888] mt-1">
              {searchQuery ? "No reels matched your search filter." : "Click 'Sync Instagram' above to import your reels."}
            </p>
          </div>
        ) : (
          <div className="bg-[#0c0c12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#14141c] text-[#888888] font-mono uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4 w-28">Reel</th>
                    <th className="p-4">Caption / Content</th>
                    <th className="p-4 w-32">Published</th>
                    <th className="p-4 w-36">Instagram URL</th>
                    <th className="p-4 w-28">Status</th>
                    <th className="p-4 w-44 text-right">Show on Website</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredReels.map((reel) => {
                    const isToggling = togglingReelId === reel.id;

                    return (
                      <tr
                        key={reel.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          reel.isVisible ? "bg-white/[0.01]" : "opacity-75"
                        }`}
                      >
                        {/* 1. Thumbnail + Preview Trigger */}
                        <td className="p-4">
                          <div
                            onClick={() => setPreviewReel(reel)}
                            className="relative w-16 h-24 rounded-lg overflow-hidden bg-black border border-white/15 cursor-pointer group shadow-md flex-shrink-0"
                          >
                            <img
                              src={reel.thumbnailUrl || "/images/past_event_crowd.jpg"}
                              alt={reel.caption}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                              <Play className="w-5 h-5 text-white fill-white drop-shadow-md group-hover:scale-125 transition-transform" />
                            </div>
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[8px] text-[#22c55e] font-bold">
                              {reel.viewsDisplay || "REEL"}
                            </span>
                          </div>
                        </td>

                        {/* 2. Caption / Content */}
                        <td className="p-4 max-w-md">
                          <p className="font-sans text-xs text-white line-clamp-2 leading-relaxed">
                            {reel.caption}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#777777]">
                            <span className="text-[#00B4D8]">@{reel.username}</span>
                            <span>&bull;</span>
                            <span>ID: {reel.instagramMediaId.slice(0, 10)}...</span>
                          </div>
                        </td>

                        {/* 3. Published Date */}
                        <td className="p-4 font-mono text-xs text-[#AAAAAA] whitespace-nowrap">
                          {new Date(reel.publishedAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* 4. Instagram URL */}
                        <td className="p-4 whitespace-nowrap">
                          <a
                            href={reel.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#CCCCCC] hover:text-[#E1306C] text-xs font-mono transition-colors"
                          >
                            <span>Open Reel</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        {/* 5. Status */}
                        <td className="p-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SYNCED</span>
                          </span>
                        </td>

                        {/* 6. Website Visibility Toggle Button & Delete */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => handleToggleReelVisibility(reel)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer ${
                                reel.isVisible
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                  : "bg-white/5 text-[#777777] border border-white/10 hover:border-white/25 hover:text-white"
                              }`}
                            >
                              {isToggling ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : reel.isVisible ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              <span>{reel.isVisible ? "ON (SHOW)" : "OFF (HIDE)"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReel(reel.id)}
                              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                              title="Delete reel from showcase"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. REEL PREVIEW MODAL                                         */}
      {/* ============================================================ */}
      {previewReel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1F2833] border border-white/20 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[9/16] w-full max-h-[440px] rounded-xl overflow-hidden bg-black mx-auto border border-white/10 shadow-lg">
              <img
                src={previewReel.thumbnailUrl || "/images/past_event_crowd.jpg"}
                alt={previewReel.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 flex items-center justify-center">
                <a
                  href={previewReel.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-[#E1306C] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                  title="Watch on Instagram"
                >
                  <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                <span className="text-[#00B4D8]">@{previewReel.username}</span>
                <span>{new Date(previewReel.publishedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-[#CCCCCC] line-clamp-3 leading-relaxed">
                {previewReel.caption}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={() => handleToggleReelVisibility(previewReel)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-2 ${
                  previewReel.isVisible
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-white/10 text-white border border-white/15"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Website Status: {previewReel.isVisible ? "VISIBLE" : "HIDDEN"}</span>
              </button>

              <a
                href={previewReel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. DISCONNECT CONFIRMATION MODAL                              */}
      {/* ============================================================ */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1F2833] border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-heading font-black text-xl text-white uppercase">
                Disconnect Instagram Account?
              </h3>
              <p className="text-xs text-[#AAAAAA] mt-2 leading-relaxed">
                This will revoke encrypted access tokens from the server and automatically hide the Instagram section from the public website until reconnected.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsDisconnectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnectConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase shadow-lg transition-colors"
              >
                Yes, Disconnect Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CONNECT REAL ACCOUNT MODAL                                */}
      {/* ============================================================ */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#0e0e16] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#12121c]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-md">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Connect Real Instagram Account</h3>
                  <p className="text-xs text-[#888888]">Link your official creator or business profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1.5 rounded-lg text-[#888888] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRealConnectSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto text-left">
              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 border border-white/10 rounded-xl text-xs font-mono font-semibold text-center">
                <button
                  type="button"
                  onClick={() => setConnectMode("token")}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    connectMode === "token" ? "bg-white/20 text-white font-bold" : "text-[#777777] hover:text-white"
                  }`}
                >
                  Meta Token
                </button>
                <button
                  type="button"
                  onClick={() => setConnectMode("username")}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    connectMode === "username" ? "bg-white/20 text-white font-bold" : "text-[#777777] hover:text-white"
                  }`}
                >
                  @Username
                </button>
                <button
                  type="button"
                  onClick={() => setConnectMode("oauth")}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    connectMode === "oauth" ? "bg-white/20 text-white font-bold" : "text-[#777777] hover:text-white"
                  }`}
                >
                  Meta OAuth
                </button>
              </div>

              {/* Mode: Meta Token */}
              {connectMode === "token" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono text-[#00B4D8] font-bold block mb-1">
                      Instagram Graph API User Access Token *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      placeholder="Paste your Instagram Graph API User Access Token (EAA...)..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E1306C] font-mono resize-none"
                    />
                  </div>
                  <div className="p-3 bg-[#00E5FF]/10 border border-[#00E5FF]/25 rounded-xl text-[11px] text-[#FFB37C] space-y-1">
                    <p className="font-bold">⚡ Live Instagram API Sync:</p>
                    <p className="text-[10px] leading-relaxed">
                      The server connects directly to <code>graph.instagram.com/me</code>, fetches your real handle, and imports your live Instagram reels into your showcase automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Mode: Direct Username */}
              {connectMode === "username" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono text-[#00B4D8] font-bold block mb-1">
                      Official Instagram Username *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888] font-mono text-sm">@</span>
                      <input
                        type="text"
                        required
                        value={inputUsername}
                        onChange={(e) => setInputUsername(e.target.value)}
                        placeholder="djgspark"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E1306C] font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#888888]">
                    Sets your profile handle on the website. You can then paste your real reel links using &quot;Add Reel Link&quot; to show your real clips.
                  </p>
                </div>
              )}

              {/* Mode: Official OAuth */}
              {connectMode === "oauth" && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs text-[#CCCCCC]">
                  <p className="font-bold text-white">Official Meta Authorization Flow</p>
                  <p className="text-[11px] text-[#888888]">
                    You will be redirected to the official Meta / Instagram dialog to authorize access to your Instagram creator profile and media.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#888888] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingConnect}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-heading font-black text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingConnect ? "Connecting..." : connectMode === "oauth" ? "Continue to Meta" : "Verify & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ADD REEL LINK MODAL                                       */}
      {/* ============================================================ */}
      {isAddReelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-[#0e0e16] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto text-left">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#12121c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Add Real Instagram Reel Link</h3>
              </div>
              <button
                onClick={() => setIsAddReelModalOpen(false)}
                className="p-1 text-[#888888] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReelSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-mono text-[#00B4D8] font-bold block mb-1">Instagram Reel or Post URL *</label>
                <input
                  type="url"
                  required
                  value={reelUrlInput}
                  onChange={(e) => setReelUrlInput(e.target.value)}
                  placeholder="https://www.instagram.com/reel/Cxxxxxxxxx/"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF] font-mono"
                />
              </div>

              <div>
                <label className="font-mono text-[#00B4D8] font-bold block mb-1">Caption / Description (Optional)</label>
                <textarea
                  rows={3}
                  value={reelCaptionInput}
                  onChange={(e) => setReelCaptionInput(e.target.value)}
                  placeholder="e.g. 55,000 Hands In The Air — Sunburn Festival Sunset Drop! 🔥"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00E5FF] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddReelModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-[#888888] hover:text-white font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReel}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReel ? "Adding..." : "Add to Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
