"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  Check,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  Trash2,
  Film,
  Plus,
  LayoutGrid,
  List,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  Globe,
  Radio,
  Share2,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";
import { InstagramConnection, InstagramReel, SocialMediaSettings } from "@/types";

interface InstagramIntegrationModuleProps {
  onNotification?: (type: "success" | "error", text: string) => void;
}

export function InstagramIntegrationModule({
  onNotification,
}: InstagramIntegrationModuleProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Fast Direct Add by Link
  const [inputUrl, setInputUrl] = useState("");
  const [inputCaption, setInputCaption] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Action states
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [isTogglingMaster, setIsTogglingMaster] = useState(false);
  const [previewReel, setPreviewReel] = useState<InstagramReel | null>(null);

  // Data states
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [settings, setSettings] = useState<SocialMediaSettings>({
    id: "social-settings-1",
    instagramEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // View & Filter states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "live" | "library">("all");

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
      if (Array.isArray(data.reels)) {
        setReels(data.reels);
        const activeIds = data.reels
          .filter((r: InstagramReel) => r.isVisible)
          .map((r: InstagramReel) => r.id);
        setSelectedIds(activeIds);
      }
    } catch (err: any) {
      console.error(err);
      notify("error", err.message || "Failed to load Instagram data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleData();
  }, []);

  // 1. Add Instagram Reel / Post by Link
  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) {
      notify("error", "Please paste an Instagram Reel or Post link.");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/social/instagram/reels/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl,
          caption: inputCaption.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add Instagram reel.");
      }

      notify(
        "success",
        data.message || "Instagram Reel added successfully to your library!"
      );

      setInputUrl("");
      setInputCaption("");

      if (Array.isArray(data.reels)) {
        setReels(data.reels);
        const activeIds = data.reels
          .filter((r: InstagramReel) => r.isVisible)
          .map((r: InstagramReel) => r.id);
        setSelectedIds(activeIds);
      }

      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Failed to add reel");
    } finally {
      setIsAdding(false);
    }
  };

  // 2. Toggle Live on Website for a single Reel (Strict max 4)
  const handleToggleLive = async (reel: InstagramReel) => {
    const isCurrentlyLive = selectedIds.includes(reel.id);
    const nextLiveState = !isCurrentlyLive;

    if (nextLiveState && selectedIds.length >= 4) {
      notify(
        "error",
        "Maximum 4 reels can be live on the website. Please unselect an active reel first."
      );
      return;
    }

    setActionInProgressId(reel.id);

    // Optimistic update
    const updatedSelectedIds = nextLiveState
      ? [...selectedIds, reel.id]
      : selectedIds.filter((id) => id !== reel.id);
    setSelectedIds(updatedSelectedIds);
    setReels((prev) =>
      prev.map((r) => (r.id === reel.id ? { ...r, isVisible: nextLiveState } : r))
    );

    try {
      const res = await fetch(`/api/admin/social/instagram/reels/${reel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextLiveState }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update reel status.");
      }

      notify(
        "success",
        nextLiveState
          ? "Reel is now LIVE on your website!"
          : "Reel removed from website showcase."
      );
    } catch (err: any) {
      notify("error", err.message || "Failed to update reel");
      await fetchModuleData();
    } finally {
      setActionInProgressId(null);
    }
  };

  // 3. Delete Reel from Library
  const handleDeleteReel = async (reelId: string) => {
    if (!confirm("Are you sure you want to remove this reel from your library?")) {
      return;
    }

    setActionInProgressId(reelId);
    try {
      const res = await fetch(`/api/admin/social/instagram/reels/${reelId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete reel.");
      }

      notify("success", "Instagram reel removed from library.");
      setReels((prev) => prev.filter((r) => r.id !== reelId));
      setSelectedIds((prev) => prev.filter((id) => id !== reelId));
    } catch (err: any) {
      notify("error", err.message || "Failed to delete reel");
    } finally {
      setActionInProgressId(null);
    }
  };

  // 4. Master Switch: Show Instagram Section on Website
  const handleToggleMasterSection = async () => {
    const nextState = !settings.instagramEnabled;
    setIsTogglingMaster(true);

    try {
      const res = await fetch("/api/admin/social/instagram/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramEnabled: nextState }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSettings((prev) => ({ ...prev, instagramEnabled: nextState }));
      notify(
        "success",
        nextState
          ? "Instagram section is now ENABLED on your website!"
          : "Instagram section is now HIDDEN from your website."
      );
    } catch (err: any) {
      notify("error", err.message || "Failed to update settings");
    } finally {
      setIsTogglingMaster(false);
    }
  };

  // Filtered Reels
  const filteredReels = reels.filter((r) => {
    const matchesSearch =
      r.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.permalink.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.instagramMediaId.toLowerCase().includes(searchQuery.toLowerCase());

    const isLive = selectedIds.includes(r.id);

    const matchesTab =
      filterTab === "all"
        ? true
        : filterTab === "live"
        ? isLive
        : !isLive;

    return matchesSearch && matchesTab;
  });

  const liveReelsList = reels.filter((r) => selectedIds.includes(r.id));

  if (isLoading) {
    return (
      <div className="bg-[#1F2833] border border-white/10 rounded-2xl p-12 text-center space-y-4 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto" />
        <div className="h-4 w-52 bg-white/10 mx-auto rounded" />
        <div className="h-3 w-72 bg-white/5 mx-auto rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A8D93]">
            <span>INTEGRATIONS</span>
            <span>&rsaquo;</span>
            <span className="text-[#00E5FF] font-bold">INSTAGRAM FEED &amp; REELS</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            Instagram Reels Manager
          </h1>
        </div>

        {/* Master Website Toggle */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#1F2833] border border-white/10 shadow-lg">
          <button
            type="button"
            role="switch"
            aria-checked={settings.instagramEnabled}
            disabled={isTogglingMaster}
            onClick={handleToggleMasterSection}
            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.instagramEnabled ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.instagramEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <div className="text-left pr-2">
            <span className="block text-xs font-heading font-bold text-white uppercase">
              Website Section
            </span>
            <span
              className={`text-[10px] font-mono font-bold uppercase ${
                settings.instagramEnabled ? "text-emerald-400" : "text-[#8A8D93]"
              }`}
            >
              {settings.instagramEnabled ? "ENABLED // LIVE" : "DISABLED // HIDDEN"}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. DIRECT ADD BY LINK HERO CARD (Instant Input)              */}
      {/* ============================================================ */}
      <div className="relative bg-[#1F2833] border border-[#00E5FF]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_35px_rgba(0,229,255,0.08)] overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#E1306C]/15 via-[#00E5FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                  Add Instagram Reel or Post by Link
                </h2>
                <p className="text-xs text-[#8A8D93] mt-0.5">
                  Paste any Instagram link. It automatically adds to your library. You can add as many as you want and choose up to 4 to be live on your website.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-xs font-bold uppercase w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Add</span>
            </span>
          </div>

          <form onSubmit={handleAddReel} className="space-y-3 pt-2">
            <div className="flex flex-col md:flex-row gap-3">
              {/* URL Input */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8D93]">
                  <Film className="w-4 h-4 text-[#00E5FF]" />
                </div>
                <input
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste Instagram Reel link or embed code (e.g. https://www.instagram.com/reel/... or <iframe>)"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0B0C10] border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#00E5FF] transition-all tracking-wide"
                />
              </div>

              {/* Caption Input (Optional) */}
              <div className="md:w-72">
                <input
                  type="text"
                  value={inputCaption}
                  onChange={(e) => setInputCaption(e.target.value)}
                  placeholder="Optional Title / Caption"
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#0B0C10] border border-white/15 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#00E5FF] transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAdding || !inputUrl.trim()}
                className="px-8 py-3.5 rounded-2xl bg-[#00E5FF] hover:bg-[#00cce6] text-black font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(0,229,255,0.4)] disabled:opacity-50 shrink-0 hover:scale-105"
              >
                {isAdding ? (
                  <span>Adding Reel...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Reel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. LIVE ON WEBSITE SHOWCASE TRAY (Max 4 Counter)             */}
      {/* ============================================================ */}
      <div className="bg-[#1F2833] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs font-black tracking-wider uppercase flex items-center gap-2 ${
                selectedIds.length === 4
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                  : selectedIds.length > 0
                  ? "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]"
                  : "bg-white/5 border-white/10 text-[#8A8D93]"
              }`}
            >
              {selectedIds.length === 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Radio className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              )}
              <span>Live on Website: {selectedIds.length} / 4 Reels</span>
            </div>

            <span className="text-xs text-[#8A8D93]">
              {selectedIds.length === 4 ? (
                <span className="text-emerald-400 font-bold">
                  Maximum 4 reels are live on your public homepage.
                </span>
              ) : (
                <span>
                  {4 - selectedIds.length} slot{4 - selectedIds.length !== 1 ? "s" : ""} available.
                </span>
              )}
            </span>
          </div>

          <a
            href="/#instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] hover:underline cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Website Feed</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {liveReelsList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0B0C10] border border-dashed border-white/15 text-center space-y-2">
            <Film className="w-8 h-8 text-[#8A8D93] mx-auto opacity-40" />
            <h4 className="font-heading font-bold text-white text-sm uppercase">
              No Reels Currently Live on Website
            </h4>
            <p className="text-xs text-[#8A8D93] max-w-md mx-auto">
              Add Instagram links above or click &ldquo;Make Live&rdquo; on any reel in your library below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveReelsList.map((reel) => (
              <div
                key={reel.id}
                className="p-3 rounded-2xl bg-[#0B0C10] border border-emerald-500/40 flex items-center gap-3.5 shadow-md group hover:border-emerald-500 transition-colors"
              >
                <div
                  onClick={() => setPreviewReel(reel)}
                  className="relative w-14 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 border border-white/15 flex-shrink-0 cursor-pointer flex flex-col items-center justify-center group hover:border-[#00E5FF] transition-all"
                  title="Click to preview Reel"
                >
                  <Film className="w-5 h-5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                  <span className="text-[8px] font-mono text-white/70 mt-1 uppercase font-bold">REEL</span>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    LIVE
                  </span>
                  <p className="text-xs text-white truncate font-medium mt-1">
                    {reel.caption || `Reel: ${reel.instagramMediaId}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      disabled={actionInProgressId === reel.id}
                      onClick={() => handleToggleLive(reel)}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove from Live</span>
                    </button>
                    <span className="text-white/20">&bull;</span>
                    <a
                      href={reel.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-[#00E5FF] hover:underline flex items-center gap-1"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. INSTAGRAM LIBRARY (Unlimited Storage)                     */}
      {/* ============================================================ */}
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-black text-xl text-white uppercase tracking-tight flex items-center gap-2.5">
              <span>Instagram Library</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-xs font-bold">
                {reels.length} Total Added
              </span>
            </h3>
            <p className="text-xs text-[#8A8D93] mt-0.5">
              All Instagram links you have added. Toggle &ldquo;Make Live&rdquo; to feature up to 4 on your website.
            </p>
          </div>

          {/* Search, Filter Tabs & Layout Mode */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search reels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder:text-[#8A8D93] focus:outline-none focus:border-[#00E5FF]"
              />
              <Search className="w-3.5 h-3.5 text-[#8A8D93] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#0B0C10] p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                  filterTab === "all"
                    ? "bg-white/15 text-white font-bold"
                    : "text-[#8A8D93] hover:text-white"
                }`}
              >
                All ({reels.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("live")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                  filterTab === "live"
                    ? "bg-emerald-500/20 text-emerald-400 font-bold"
                    : "text-[#8A8D93] hover:text-white"
                }`}
              >
                Live ({selectedIds.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("library")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                  filterTab === "library"
                    ? "bg-white/15 text-white font-bold"
                    : "text-[#8A8D93] hover:text-white"
                }`}
              >
                Library ({Math.max(0, reels.length - selectedIds.length)})
              </button>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-[#0B0C10] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white/15 text-white"
                    : "text-[#8A8D93] hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white/15 text-white"
                    : "text-[#8A8D93] hover:text-white"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredReels.length === 0 ? (
          <div className="bg-[#1F2833] border border-white/10 rounded-2xl p-12 text-center space-y-3">
            <InstagramIcon className="w-10 h-10 text-[#8A8D93] mx-auto opacity-50" />
            <h4 className="font-heading font-bold text-white text-base uppercase">
              No Reels Found
            </h4>
            <p className="text-xs text-[#8A8D93] max-w-md mx-auto">
              {searchQuery
                ? "No reels matched your search."
                : "Paste an Instagram Reel URL above to add your first reel!"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ============================================================ */
          /* VISUAL GRID VIEW                                             */
          /* ============================================================ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredReels.map((reel) => {
              const isLive = selectedIds.includes(reel.id);
              const isLimitReached = !isLive && selectedIds.length >= 4;

              return (
                <div
                  key={reel.id}
                  className={`group relative bg-[#1F2833] rounded-2xl overflow-hidden shadow-xl flex flex-col border transition-all duration-300 ${
                    isLive
                      ? "border-emerald-500/60 shadow-[0_0_25px_rgba(34,197,94,0.25)]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  {/* Card Header with Badges & Actions */}
                  <div className="p-3 bg-black/60 border-b border-white/10 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded bg-black/80 border border-white/15 text-[9px] font-mono uppercase tracking-wider text-[#00E5FF] font-bold flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      <span>REEL</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={reel.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white hover:text-[#00E5FF] transition-colors"
                        title="Open on Instagram"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        disabled={actionInProgressId === reel.id}
                        onClick={() => handleDeleteReel(reel.id)}
                        className="p-1.5 rounded-full bg-black/80 hover:bg-rose-600 text-white/70 hover:text-white transition-colors cursor-pointer"
                        title="Delete from Library"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Native Instagram Embed Reel Player - NO COVER PHOTO */}
                  <div className="relative aspect-[9/16] w-full min-h-[460px] bg-black">
                    <iframe
                      src={`https://www.instagram.com/reel/${reel.instagramMediaId}/embed/`}
                      className="w-full h-full border-0 absolute inset-0"
                      scrolling="no"
                      allowTransparency={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    />
                  </div>

                  {/* Ribbon If Live */}
                  {isLive && (
                    <div className="px-3 py-1.5 bg-emerald-500/20 border-y border-emerald-500/30 flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>LIVE ON WEBSITE</span>
                    </div>
                  )}

                  {/* Body & Actions */}
                  <div className="p-4 flex flex-col justify-between flex-grow space-y-3 bg-[#1F2833]">
                    <div>
                      <p className="text-xs text-white line-clamp-2 leading-relaxed font-sans font-medium">
                        {reel.caption || `Reel: ${reel.instagramMediaId}`}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8D93] mt-2">
                        <span className="text-[#00E5FF] truncate max-w-[140px]">
                          ID: {reel.instagramMediaId}
                        </span>
                        <span>
                          {new Date(reel.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Make Live / Unselect Button */}
                    <button
                      type="button"
                      disabled={actionInProgressId === reel.id || isLimitReached}
                      onClick={() => handleToggleLive(reel)}
                      className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isLive
                          ? "bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400"
                          : isLimitReached
                          ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                          : "bg-[#00E5FF] hover:bg-[#00cce6] text-black font-black shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                      }`}
                    >
                      {isLive ? (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Remove from Live</span>
                        </>
                      ) : isLimitReached ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Max 4 Live</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Make Live on Website</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================ */
          /* LIST / TABLE VIEW                                            */
          /* ============================================================ */
          <div className="bg-[#1F2833] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0B0C10] text-[#8A8D93] font-mono uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4 w-24">Preview</th>
                    <th className="p-4">Caption / Media URL</th>
                    <th className="p-4 w-32">Added</th>
                    <th className="p-4 w-36">Instagram</th>
                    <th className="p-4 w-44 text-center">Live Status</th>
                    <th className="p-4 w-16 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredReels.map((reel) => {
                    const isLive = selectedIds.includes(reel.id);
                    const isLimitReached = !isLive && selectedIds.length >= 4;

                    return (
                      <tr
                        key={reel.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isLive ? "bg-emerald-500/[0.04]" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div
                            onClick={() => setPreviewReel(reel)}
                            className="relative w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 border border-white/15 cursor-pointer group shadow-md flex flex-col items-center justify-center hover:border-[#00E5FF] transition-all flex-shrink-0"
                            title="Click to preview Reel"
                          >
                            <Film className="w-4 h-4 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                            <span className="text-[7px] font-mono text-white/70 mt-0.5 uppercase font-bold">REEL</span>
                          </div>
                        </td>

                        <td className="p-4 max-w-md">
                          <p className="font-sans text-xs text-white line-clamp-2 leading-relaxed">
                            {reel.caption || `Reel: ${reel.instagramMediaId}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#8A8D93]">
                            <span className="text-[#00E5FF]">ID: {reel.instagramMediaId}</span>
                            <span>&bull;</span>
                            <span className="truncate max-w-[200px]">{reel.permalink}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-xs text-[#8A8D93] whitespace-nowrap">
                          {new Date(reel.publishedAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <a
                            href={reel.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#F5F6FA] hover:text-[#00E5FF] text-xs font-mono transition-colors"
                          >
                            <span>Open Reel</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            disabled={actionInProgressId === reel.id || isLimitReached}
                            onClick={() => handleToggleLive(reel)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isLive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : isLimitReached
                                ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                                : "bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/25"
                            }`}
                          >
                            {isLive ? "LIVE ON WEBSITE" : isLimitReached ? "MAX 4 LIVE" : "MAKE LIVE"}
                          </button>
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={actionInProgressId === reel.id}
                            onClick={() => handleDeleteReel(reel.id)}
                            className="p-1.5 rounded-lg text-[#8A8D93] hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Reel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      {/* 4. REEL PREVIEW MODAL                                         */}
      {/* ============================================================ */}
      {previewReel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1F2833] border border-white/20 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[9/16] w-full max-h-[500px] h-[500px] rounded-xl overflow-hidden bg-black mx-auto border border-white/10 shadow-lg">
              <iframe
                src={`https://www.instagram.com/reel/${previewReel.instagramMediaId}/embed/`}
                className="w-full h-full border-0 absolute inset-0"
                scrolling="no"
                allowTransparency={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8A8D93]">
                <span className="text-[#00E5FF]">ID: {previewReel.instagramMediaId}</span>
                <span>{new Date(previewReel.publishedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-[#F5F6FA] line-clamp-3 leading-relaxed">
                {previewReel.caption || `Reel: ${previewReel.instagramMediaId}`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  handleToggleLive(previewReel);
                  setPreviewReel(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-2 cursor-pointer ${
                  selectedIds.includes(previewReel.id)
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    : "bg-[#00E5FF] text-black font-black"
                }`}
              >
                {selectedIds.includes(previewReel.id) ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Remove from Live</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Make Live on Website</span>
                  </>
                )}
              </button>

              <a
                href={previewReel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5"
              >
                <span>Watch on Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
