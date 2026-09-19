"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  ExternalLink,
  Check,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Share2,
  Lock,
  Sliders,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Info,
  Key,
  ShieldCheck,
  ArrowRight,
  HelpCircle
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
  const [isSetupGuideModalOpen, setIsSetupGuideModalOpen] = useState(false);
  const [isTokenConnectModalOpen, setIsTokenConnectModalOpen] = useState(false);
  const [isAddReelModalOpen, setIsAddReelModalOpen] = useState(false);
  const [previewReel, setPreviewReel] = useState<InstagramReel | null>(null);

  // Meta configuration from server
  const [metaConfig, setMetaConfig] = useState<{
    isConfigured: boolean;
    redirectUri: string;
  }>({
    isConfigured: false,
    redirectUri: "",
  });

  // Token Connect Form
  const [inputToken, setInputToken] = useState("");
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);

  // Manual Reel Form
  const [reelUrlInput, setReelUrlInput] = useState("");
  const [reelCaptionInput, setReelCaptionInput] = useState("");
  const [isSubmittingReel, setIsSubmittingReel] = useState(false);

  // Data states
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [settings, setSettings] = useState<SocialMediaSettings>({
    id: "social-settings-1",
    instagramEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [reels, setReels] = useState<InstagramReel[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [togglingReelId, setTogglingReelId] = useState<string | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [isTogglingMaster, setIsTogglingMaster] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

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
      if (data.metaConfig) setMetaConfig(data.metaConfig);
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
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=instagram");
      }
      if (errorMsg) {
        notify("error", errorMsg);
        window.history.replaceState({}, document.title, window.location.pathname + "?tab=instagram");
      }
    }
  }, []);

  // 1. Trigger Official Meta / Instagram OAuth Flow
  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/admin/social/instagram/connect", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.authUrl) {
        if (data.code === "META_CREDENTIALS_MISSING") {
          setIsSetupGuideModalOpen(true);
          throw new Error(data.error || "Meta App credentials are not configured in environment variables.");
        }
        throw new Error(data.error || "Failed to initialize Instagram authorization");
      }

      // Open official Meta / Instagram OAuth consent screen
      window.location.href = data.authUrl;
    } catch (err: any) {
      setIsConnecting(false);
      notify("error", err.message || "Connection initialization failed");
    }
  };

  // 2. Connect via Long-Lived Access Token (For direct Meta Token usage)
  const handleTokenConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;

    setIsSubmittingToken(true);
    try {
      const res = await fetch("/api/admin/social/instagram/token-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: inputToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect Instagram with token");

      notify("success", data.message || "Real Instagram account connected successfully!");
      setIsTokenConnectModalOpen(false);
      setInputToken("");
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Token connection failed");
    } finally {
      setIsSubmittingToken(false);
    }
  };

  // 3. Disconnect Instagram Account
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

      notify("success", "Instagram account disconnected. Encrypted tokens removed.");
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Disconnect failed");
    }
  };

  // 4. Manual Sync Instagram
  const handleSyncInstagram = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/social/instagram/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "TOKEN_EXPIRED") {
          notify("error", "Instagram session has expired or was revoked. Please click 'Connect Instagram' to reconnect.");
          await fetchModuleData();
          return;
        }
        if (data.code === "RATE_LIMIT_EXCEEDED") {
          notify("error", "Meta API rate limit reached. Please wait a few minutes before syncing again.");
          return;
        }
        if (data.code === "PERMISSIONS_ERROR") {
          notify("error", "Missing Instagram permissions (instagram_business_basic). Please ensure your account is a Professional account.");
          return;
        }
        throw new Error(data.error || "Failed to sync Instagram reels");
      }

      notify("success", data.message || `Synced ${data.totalReels || 0} reels successfully!`);
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Master Section Visibility Toggle
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
      notify("success", `Instagram section is now ${nextEnabled ? "ENABLED" : "HIDDEN"} on the website.`);
    } catch (err: any) {
      notify("error", err.message || "Failed to toggle section visibility");
    } finally {
      setIsTogglingMaster(false);
    }
  };

  // 6. Individual Reel Visibility Toggle (Show on Website / Hide from Website)
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

  // 7. Remove Reel from Website Showcase
  const handleDeleteReel = async (id: string) => {
    if (!window.confirm("Remove this reel from your website showcase? (This will NEVER delete the reel from Instagram).")) return;

    setDeletingReelId(id);
    try {
      const res = await fetch(`/api/admin/social/instagram/reels/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete reel");

      setReels((prev) => prev.filter((r) => r.id !== id && r.instagramMediaId !== id));
      notify("success", "Reel removed from website showcase.");
    } catch (err: any) {
      notify("error", err.message || "Failed to delete reel");
    } finally {
      setDeletingReelId(null);
    }
  };

  // Copy redirect URI helper
  const handleCopyRedirect = () => {
    if (metaConfig.redirectUri) {
      navigator.clipboard.writeText(metaConfig.redirectUri);
      setCopiedRedirect(true);
      setTimeout(() => setCopiedRedirect(false), 2000);
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
      <div className="bg-[#1F2833] border border-white/10 rounded-2xl p-10 text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto" />
        <div className="h-4 w-48 bg-white/10 mx-auto rounded" />
        <div className="h-3 w-64 bg-white/5 mx-auto rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8A8D93]">
          <span>SETTINGS</span>
          <span>&rsaquo;</span>
          <span>SOCIAL MEDIA</span>
          <span>&rsaquo;</span>
          <span className="text-[#00E5FF] font-bold">META &bull; INSTAGRAM INTEGRATION</span>
        </div>

        <button
          type="button"
          onClick={() => setIsSetupGuideModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Meta Setup Guide</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. INSTAGRAM CONNECT CARD                                     */}
      {/* ============================================================ */}
      <div className="relative bg-[#1F2833] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle Instagram Gradient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E1306C]/10 via-[#F77737]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          {/* Identity & Status */}
          <div className="flex items-center gap-5">
            {/* Instagram Profile Picture or Logo */}
            {isConnected && connection?.profilePicture ? (
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex-shrink-0 shadow-[0_0_25px_rgba(225,48,108,0.35)]">
                <img
                  src={connection.profilePicture}
                  alt={connection.username}
                  className="w-full h-full object-cover rounded-[14px] bg-black"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-[0_0_30px_rgba(225,48,108,0.35)] flex-shrink-0">
                <InstagramIcon className="w-9 h-9 text-white" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                  Instagram Account
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
                    <span>🟡 EXPIRED (PLEASE RECONNECT)</span>
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
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8D93] mt-2 font-mono">
                  <span className="text-white font-bold text-sm">@{connection.username}</span>
                  <span>&bull;</span>
                  <a
                    href={`https://instagram.com/${connection.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00E5FF] hover:underline flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-[#F5F6FA]/80">
                    <Clock className="w-3 h-3 text-[#00E5FF]" />
                    <span>Connected: {new Date(connection.connectedAt || connection.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 font-bold">
                    {connection.tokenDaysRemaining !== null && connection.tokenDaysRemaining !== undefined
                      ? `${connection.tokenDaysRemaining} days token remaining`
                      : "60-Day Meta Token Active"}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#8A8D93] mt-1 font-sans">
                  Connect your real Meta/Instagram Professional account using official OAuth 2.0 to securely sync Reels and display them on your website.
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
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  title="Fetch latest real reels from Instagram"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#00E5FF] ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Instagram"}</span>
                </button>

                {/* Disconnect Instagram Button */}
                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Disconnect Instagram
                </button>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Official Connect Instagram Button */}
                <button
                  type="button"
                  onClick={handleConnectInstagram}
                  disabled={isConnecting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-heading font-black text-xs tracking-wider uppercase hover:opacity-95 hover:scale-[1.02] transition-all shadow-[0_0_25px_rgba(225,48,108,0.4)] flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>{isConnecting ? "Opening Meta..." : "Connect Instagram"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* 2. Manual Token Connect Option (For developer testing / System user tokens) */}
                <button
                  type="button"
                  onClick={() => setIsTokenConnectModalOpen(true)}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Connect via Meta Graph API Token"
                >
                  <Key className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Meta Token</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Instagram Section Master Switch */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-[#00E5FF] font-bold block mb-0.5">
              Website Master Control
            </span>
            <h4 className="font-heading font-bold text-sm sm:text-base text-white uppercase">
              Instagram Section Visibility on Website
            </h4>
            <p className="text-xs text-[#8A8D93] font-sans">
              Master switch controlling whether the &quot;Follow Us on Instagram&quot; section appears on your public homepage.
            </p>
          </div>

          <label className={`relative inline-flex items-center gap-3 cursor-pointer px-5 py-3 rounded-xl border transition-all ${
            settings.instagramEnabled && isConnected
              ? "bg-[#0B0C10] border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
              : "bg-[#0B0C10] border-white/10"
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
                settings.instagramEnabled && isConnected ? "text-[#22c55e]" : "text-[#8A8D93]"
              }`}>
                {settings.instagramEnabled && isConnected ? "🟢 SHOW ON WEBSITE" : "⚪ HIDE FROM WEBSITE"}
              </span>
              <span className="text-[10px] text-[#8A8D93] font-mono">
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
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF]">
                {visibleCount} Live on Website &bull; {reels.length} Total Synced
              </span>
            </h3>
            <p className="text-xs text-[#8A8D93]">
              Manage which real Instagram Reels are displayed on your website. Toggle &quot;Show on Website&quot; or &quot;Hide from Website&quot; on any reel below.
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
                className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-2 pl-9 text-xs text-white placeholder:text-[#8A8D93] focus:outline-none focus:border-[#00E5FF]"
              />
              <Search className="w-3.5 h-3.5 text-[#8A8D93] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1 bg-[#0B0C10] p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setFilterVisibility("all")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterVisibility === "all" ? "bg-white/15 text-white font-bold" : "text-[#8A8D93] hover:text-white"
                }`}
              >
                All ({reels.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterVisibility("visible")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterVisibility === "visible" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-[#8A8D93] hover:text-white"
                }`}
              >
                Visible ({visibleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterVisibility("hidden")}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                  filterVisibility === "hidden" ? "bg-red-500/20 text-red-400 font-bold" : "text-[#8A8D93] hover:text-white"
                }`}
              >
                Hidden ({reels.length - visibleCount})
              </button>
            </div>
          </div>
        </div>

        {/* Reels Table / Grid View */}
        {filteredReels.length === 0 ? (
          <div className="bg-[#1F2833] border border-white/10 rounded-2xl p-12 text-center">
            <InstagramIcon className="w-10 h-10 text-[#8A8D93] mx-auto mb-3" />
            <h4 className="font-heading font-bold text-white text-base uppercase">No Reels Found</h4>
            <p className="text-xs text-[#8A8D93] mt-1">
              {searchQuery
                ? "No reels matched your search filter."
                : isConnected
                ? "Click 'Sync Instagram' above to import your reels from Meta."
                : "Connect your Instagram account to sync your reels automatically."}
            </p>
          </div>
        ) : (
          <div className="bg-[#1F2833] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0B0C10] text-[#8A8D93] font-mono uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="p-4 w-28">Reel</th>
                    <th className="p-4">Caption / Content</th>
                    <th className="p-4 w-32">Published</th>
                    <th className="p-4 w-36">Instagram URL</th>
                    <th className="p-4 w-28">Status</th>
                    <th className="p-4 w-52 text-right">Website Visibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredReels.map((reel) => {
                    const isToggling = togglingReelId === reel.id;

                    return (
                      <tr
                        key={reel.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          reel.isVisible ? "bg-white/[0.01]" : "opacity-60"
                        }`}
                      >
                        {/* 1. Thumbnail + Preview Trigger */}
                        <td className="p-4">
                          <div
                            onClick={() => setPreviewReel(reel)}
                            className="relative w-16 h-24 rounded-lg overflow-hidden bg-black border border-white/15 cursor-pointer group shadow-md flex-shrink-0"
                            title="Click to preview reel"
                          >
                            <img
                              src={reel.thumbnailUrl || "/images/dj_hero.jpg"}
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
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#8A8D93]">
                            <span className="text-[#00E5FF]">@{reel.username}</span>
                            <span>&bull;</span>
                            <span>ID: {reel.instagramMediaId.slice(0, 12)}</span>
                          </div>
                        </td>

                        {/* 3. Published Date */}
                        <td className="p-4 font-mono text-xs text-[#8A8D93] whitespace-nowrap">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#F5F6FA] hover:text-[#00E5FF] text-xs font-mono transition-colors"
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

                        {/* 6. Website Visibility Toggle Button */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isToggling}
                              onClick={() => handleToggleReelVisibility(reel)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 cursor-pointer ${
                                reel.isVisible
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                  : "bg-white/5 text-[#8A8D93] border border-white/10 hover:border-white/25 hover:text-white"
                              }`}
                              title={
                                reel.isVisible
                                  ? "Visible on website. Click to hide (does NOT delete from Instagram)."
                                  : "Hidden from website. Click to show on website."
                              }
                            >
                              {isToggling ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : reel.isVisible ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              <span>{reel.isVisible ? "Show on Website" : "Hide from Website"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReel(reel.id)}
                              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                              title="Remove reel from website showcase only"
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
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[9/16] w-full max-h-[440px] rounded-xl overflow-hidden bg-black mx-auto border border-white/10 shadow-lg">
              <img
                src={previewReel.thumbnailUrl || "/images/dj_hero.jpg"}
                alt={previewReel.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 flex items-center justify-center">
                <a
                  href={previewReel.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                  title="Watch on Instagram"
                >
                  <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#8A8D93]">
                <span className="text-[#00E5FF]">@{previewReel.username}</span>
                <span>{new Date(previewReel.publishedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-[#F5F6FA] line-clamp-3 leading-relaxed">
                {previewReel.caption}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={() => handleToggleReelVisibility(previewReel)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-2 cursor-pointer ${
                  previewReel.isVisible
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-white/10 text-white border border-white/15"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{previewReel.isVisible ? "Show on Website" : "Hide from Website"}</span>
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
              <p className="text-xs text-[#8A8D93] mt-2 leading-relaxed">
                This will revoke and delete encrypted access tokens from the server and hide the Instagram section from the public website until reconnected.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsDisconnectModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-mono uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnectConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase shadow-lg transition-colors cursor-pointer"
              >
                Yes, Disconnect Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. META DEVELOPER SETUP GUIDE MODAL                           */}
      {/* ============================================================ */}
      {isSetupGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0B0C10] border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#1F2833]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-md">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Meta Developer App Setup Instructions</h3>
                  <p className="text-xs text-[#8A8D93]">Configure official Meta OAuth credentials for Instagram</p>
                </div>
              </div>
              <button
                onClick={() => setIsSetupGuideModalOpen(false)}
                className="p-1.5 rounded-lg text-[#8A8D93] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-left text-xs font-sans text-[#F5F6FA]">
              {/* Step 1 */}
              <div className="p-4 bg-[#1F2833] rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#00E5FF]">
                  <span>STEP 1: CREATE APP ON META DEVELOPERS</span>
                </div>
                <p className="text-[#8A8D93] leading-relaxed">
                  Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">developers.facebook.com</a> &rarr; <strong>My Apps</strong> &rarr; <strong>Create App</strong> &rarr; Select <strong>Other</strong> / <strong>Business</strong>.
                </p>
                <p className="text-[#8A8D93] leading-relaxed">
                  In the App Dashboard, add the product: <strong>Instagram API with Instagram Login</strong> (or <strong>Instagram Graph API</strong>).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-[#1F2833] rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#00E5FF]">
                  <span>STEP 2: CONFIGURE VALID OAUTH REDIRECT URI</span>
                </div>
                <p className="text-[#8A8D93] leading-relaxed">
                  Under <strong>Instagram &rarr; API setup with Instagram Login</strong> (or <strong>Facebook Login &rarr; Settings</strong>), paste this exact URL into <strong>Valid OAuth Redirect URIs</strong>:
                </p>

                <div className="flex items-center gap-2 p-2.5 bg-[#0B0C10] rounded-lg border border-white/15 font-mono text-[11px]">
                  <span className="truncate select-all text-emerald-400">
                    {metaConfig.redirectUri || "https://djart.vercel.app/api/admin/social/instagram/callback"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRedirect}
                    className="ml-auto px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedRedirect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRedirect ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-[#1F2833] rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#00E5FF]">
                  <span>STEP 3: ADD ENVIRONMENT VARIABLES</span>
                </div>
                <p className="text-[#8A8D93] leading-relaxed">
                  Copy your <strong>App ID</strong> and <strong>App Secret</strong> from <strong>Settings &rarr; Basic</strong>, and add them to your <code className="bg-black/40 px-1 py-0.5 rounded text-white">.env.local</code> and Vercel Project Environment Variables:
                </p>

                <div className="p-3 bg-[#0B0C10] rounded-lg border border-white/15 font-mono text-[11px] text-white space-y-1">
                  <div>INSTAGRAM_CLIENT_ID=your_meta_app_id</div>
                  <div>INSTAGRAM_CLIENT_SECRET=your_meta_app_secret</div>
                  <div>INSTAGRAM_REDIRECT_URI={metaConfig.redirectUri || "https://djart.vercel.app/api/admin/social/instagram/callback"}</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-[#1F2833] rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#00E5FF]">
                  <span>STEP 4: INSTAGRAM PROFESSIONAL ACCOUNT REQUIREMENT</span>
                </div>
                <p className="text-[#8A8D93] leading-relaxed">
                  Meta's official APIs require the Instagram account to be a <strong>Professional Account</strong> (either <strong>Creator</strong> or <strong>Business</strong>). You can switch any personal account to Professional for free in 1 tap inside the Instagram mobile app: <em>Settings &rarr; Account &rarr; Switch to Professional Account</em>.
                </p>
                <p className="text-emerald-400 font-mono text-[11px]">
                  &check; Required Meta scope requested: <code>instagram_business_basic</code>
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-[#1F2833] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSetupGuideModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-heading font-bold text-xs uppercase cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. META GRAPH API TOKEN CONNECT MODAL                         */}
      {/* ============================================================ */}
      {isTokenConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1F2833] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="font-heading font-bold text-white text-base uppercase">Connect via Meta Token</h3>
              </div>
              <button
                onClick={() => setIsTokenConnectModalOpen(false)}
                className="p-1 rounded-lg text-[#8A8D93] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8A8D93] leading-relaxed">
              If you have a real Meta User Access Token (from Meta Graph API Explorer or System User), paste it below. The server will authenticate directly with <code>graph.instagram.com/me</code> and import your profile &amp; reels.
            </p>

            <form onSubmit={handleTokenConnectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#00E5FF] font-bold block mb-1">
                  Meta Instagram Access Token *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Paste real Instagram Graph API Access Token..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/10 text-white text-xs focus:outline-none focus:border-[#00E5FF] font-mono resize-none"
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsTokenConnectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingToken || !inputToken.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-xs font-mono font-bold uppercase shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingToken ? "Authenticating..." : "Connect Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
