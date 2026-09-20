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
  AlertTriangle,
  Copy,
  HelpCircle,
  Save,
  Film,
  Square,
  ArrowRight,
  Plus,
  LayoutGrid,
  List,
  ShieldCheck,
  Layers,
  Heart,
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [isTogglingWebsite, setIsTogglingWebsite] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isSetupGuideModalOpen, setIsSetupGuideModalOpen] = useState(false);
  const [previewReel, setPreviewReel] = useState<InstagramReel | null>(null);

  // Add Reel by Link Modal
  const [isAddReelModalOpen, setIsAddReelModalOpen] = useState(false);
  const [inputReelUrl, setInputReelUrl] = useState("");
  const [inputReelCaption, setInputReelCaption] = useState("");
  const [isAddingReel, setIsAddingReel] = useState(false);

  // Meta configuration from server
  const [metaConfig, setMetaConfig] = useState<{
    isConfigured: boolean;
    redirectUri: string;
  }>({
    isConfigured: false,
    redirectUri: "",
  });

  // Data states
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [settings, setSettings] = useState<SocialMediaSettings>({
    id: "social-settings-1",
    instagramEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [reels, setReels] = useState<InstagramReel[]>([]);

  // Selection states (Strictly max 4 reels)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedSelectedIds, setSavedSelectedIds] = useState<string[]>([]);

  // View & Filter states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "selected" | "available">("all");
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
      if (Array.isArray(data.reels)) {
        setReels(data.reels);
        const activeIds = data.reels
          .filter((r: InstagramReel) => r.isVisible)
          .map((r: InstagramReel) => r.id);
        setSelectedIds(activeIds);
        setSavedSelectedIds(activeIds);
      }
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
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + "?tab=instagram"
        );
      }
      if (errorMsg) {
        notify("error", errorMsg);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + "?tab=instagram"
        );
      }
    }
  }, []);

  // 1. Trigger Official Meta / Instagram OAuth Flow (Zero Password Forms)
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
          throw new Error(
            data.error || "Meta App credentials are not configured in environment variables."
          );
        }
        throw new Error(data.error || "Failed to initialize Instagram authorization");
      }

      // Redirect to official Meta OAuth login screen
      window.location.href = data.authUrl;
    } catch (err: any) {
      setIsConnecting(false);
      notify("error", err.message || "Connection initialization failed");
    }
  };

  // 2. Disconnect Instagram Account (Full Revocation & Wipe)
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setIsDisconnectModalOpen(false);

    // Optimistic state transition
    setConnection({
      id: "",
      instagramUserId: "",
      username: "",
      profilePicture: "",
      status: "disconnected",
      createdAt: "",
      updatedAt: new Date().toISOString(),
    });
    setReels([]);
    setSelectedIds([]);
    setSavedSelectedIds([]);

    try {
      const res = await fetch("/api/admin/social/instagram/disconnect", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.warn("Disconnect notice:", data.error);
      }

      notify(
        "success",
        "Instagram account disconnected! You can now connect a new account."
      );
    } catch (err: any) {
      console.warn("Disconnect error:", err);
      notify("success", "Instagram account disconnected.");
    } finally {
      setIsDisconnecting(false);
      await fetchModuleData();
    }
  };

  // 3. Toggle "Show Selected Reels on Website" Switch
  const handleToggleWebsiteDisplay = async () => {
    if (!connection || connection.status !== "connected") {
      notify("error", "Please connect an active Instagram account before enabling website display.");
      return;
    }

    const nextState = !settings.instagramEnabled;
    setIsTogglingWebsite(true);

    try {
      const res = await fetch("/api/admin/social/instagram/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramEnabled: nextState }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update display setting");
      }

      setSettings((prev) => ({ ...prev, instagramEnabled: nextState }));
      notify(
        "success",
        nextState
          ? "Instagram Reels section is now LIVE on your public website!"
          : "Instagram Reels section is now HIDDEN from your website."
      );
    } catch (err: any) {
      notify("error", err.message || "Failed to update display settings");
    } finally {
      setIsTogglingWebsite(false);
    }
  };

  // 4. Sync Instagram Media from Meta API (Non-destructive to selections)
  const handleSyncInstagram = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/social/instagram/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "TOKEN_EXPIRED") {
          notify(
            "error",
            "Instagram authorization has expired or was revoked. Please reconnect your account."
          );
          await fetchModuleData();
          return;
        }
        if (data.code === "RATE_LIMIT_EXCEEDED") {
          notify(
            "error",
            "Meta API rate limit reached. Please wait a few minutes before syncing again."
          );
          return;
        }
        if (data.code === "PERMISSIONS_ERROR") {
          notify(
            "error",
            "Missing Instagram permissions. Please ensure your account is a Professional account."
          );
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

  // 5. Toggle Reel Selection (Strict Max 4 Enforced)
  const handleToggleReelSelection = (reelId: string) => {
    if (selectedIds.includes(reelId)) {
      setSelectedIds(selectedIds.filter((id) => id !== reelId));
    } else {
      if (selectedIds.length >= 4) {
        notify(
          "error",
          "Maximum 4 reels can be selected for website display. Please unselect another reel first."
        );
        return;
      }
      setSelectedIds([...selectedIds, reelId]);
    }
  };

  // 6. Remove Reel from Selected
  const handleRemoveFromSelected = (reelId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== reelId));
  };

  // 7. Save Selected Reels
  const handleSaveSelectedReels = async () => {
    if (selectedIds.length > 4) {
      notify("error", "Maximum 4 reels can be selected.");
      return;
    }

    setIsSavingSelection(true);
    try {
      const res = await fetch("/api/admin/social/instagram/reels/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedReelIds: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save selected reels");
      }

      setSavedSelectedIds(selectedIds);
      if (Array.isArray(data.reels)) {
        setReels(data.reels);
      }
      notify(
        "success",
        data.message || `Saved! ${selectedIds.length} of 4 reels are now active on your website.`
      );
    } catch (err: any) {
      notify("error", err.message || "Failed to save selected reels");
    } finally {
      setIsSavingSelection(false);
    }
  };

  // 8. Add Reel by Link
  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputReelUrl.trim()) return;

    setIsAddingReel(true);
    try {
      const res = await fetch("/api/admin/social/instagram/reels/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputReelUrl.trim(),
          caption: inputReelCaption.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add reel");
      }

      notify("success", data.message || "Instagram Reel added successfully!");
      setInputReelUrl("");
      setInputReelCaption("");
      setIsAddReelModalOpen(false);
      await fetchModuleData();
    } catch (err: any) {
      notify("error", err.message || "Failed to add reel");
    } finally {
      setIsAddingReel(false);
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

  // Computed Values
  const isConnected = connection?.status === "connected" && !!connection?.username;
  const isExpired = connection?.status === "expired";
  const hasUnsavedChanges =
    selectedIds.length !== savedSelectedIds.length ||
    selectedIds.some((id) => !savedSelectedIds.includes(id)) ||
    savedSelectedIds.some((id) => !selectedIds.includes(id));

  // Filtered Reels
  const filteredReels = reels.filter((r) => {
    const matchesSearch =
      r.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.instagramMediaId.includes(searchQuery);

    const isSelected = selectedIds.includes(r.id) || selectedIds.includes(r.instagramMediaId);

    const matchesVisibility =
      filterVisibility === "all"
        ? true
        : filterVisibility === "selected"
        ? isSelected
        : !isSelected;

    return matchesSearch && matchesVisibility;
  });

  // Selected Reel Objects
  const selectedReelsList = reels.filter(
    (r) => selectedIds.includes(r.id) || selectedIds.includes(r.instagramMediaId)
  );

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
            <span className="text-[#00E5FF] font-bold">INSTAGRAM FEED (SMASH BALLOON STANDARD)</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            Instagram Feed &amp; Reels
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsSetupGuideModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-[#00E5FF] hover:border-[#00E5FF]/40 transition-all cursor-pointer w-fit"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Meta Setup Guide</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* EXPIRED TOKEN BANNER                                         */}
      {/* ============================================================ */}
      {isExpired && (
        <div className="relative bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-white text-base uppercase">
                Instagram Authorization Expired or Revoked
              </h3>
              <p className="text-xs text-[#F5F6FA]/80 mt-1 max-w-2xl leading-relaxed">
                Meta invalidated the session for @{connection?.username || "account"} (Error 190). Please click below to reconnect your account and restore automatic sync.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectInstagram}
            disabled={isConnecting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-heading font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? "animate-spin" : ""}`} />
            <span>{isConnecting ? "Redirecting..." : "Reconnect Account"}</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. DISCONNECTED VIEW: SMASH BALLOON STYLE SETUP CARD         */}
      {/* ============================================================ */}
      {!isConnected ? (
        <div className="relative bg-[#1F2833] border border-white/15 rounded-3xl p-6 sm:p-12 shadow-2xl overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-[450px] h-[450px] bg-gradient-to-bl from-[#833ab4]/25 via-[#fd1d1d]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            {/* Instagram Official Icon */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-[0_0_40px_rgba(225,48,108,0.5)] mx-auto">
              <InstagramIcon className="w-12 h-12 text-white" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#00E5FF] font-mono text-xs uppercase">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span>OFFICIAL META OAUTH 2.0 INTEGRATION</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Connect an Instagram Account
              </h2>
              <p className="text-xs sm:text-sm text-[#8A8D93] max-w-xl mx-auto leading-relaxed">
                Connect your official Instagram account to automatically import reels and videos into your website feed.
              </p>
            </div>

            {/* Smash Balloon Account Options Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-[#0B0C10] border border-emerald-500/30 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                    Business / Creator
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8D93] leading-normal">
                  Full support for Instagram Reels, videos, likes, captions, and 60-day auto-refreshing access tokens.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0C10] border border-white/15 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white uppercase">
                    Personal Account
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#8A8D93]">
                    Basic
                  </span>
                </div>
                <p className="text-[11px] text-[#8A8D93] leading-normal">
                  Standard photo and video feeds. Easily upgrade to a Creator account for free in the Instagram mobile app.
                </p>
              </div>
            </div>

            {/* Prominent Smash Balloon Style "Connect Instagram" Button */}
            <div className="space-y-4 pt-2">
              <button
                type="button"
                onClick={handleConnectInstagram}
                disabled={isConnecting}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(225,48,108,0.5)] transition-all cursor-pointer disabled:opacity-50 mx-auto hover:scale-105"
              >
                <InstagramIcon className="w-5 h-5 text-white" />
                <span>{isConnecting ? "Redirecting to Meta Login..." : "Connect an Instagram Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8A8D93]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>We never ask for or store your Instagram password. Authenticate directly with Meta.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* 2. CONNECTED VIEW: ACCOUNT BANNER & FEED CONTROLS            */
        /* ============================================================ */
        <>
          {/* Account Profile Card */}
          <div className="relative bg-[#1F2833] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E1306C]/10 via-[#F77737]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Account Identity */}
              <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex-shrink-0 shadow-[0_0_25px_rgba(225,48,108,0.35)]">
                  <img
                    src={connection?.profilePicture || "/images/dj_hero.jpg"}
                    alt={connection?.username || "Instagram Profile"}
                    className="w-full h-full object-cover rounded-[14px] bg-black"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                      @{connection?.username}
                    </h3>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>CONNECTED</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8A8D93] mt-2 font-mono">
                    <span className="text-[#00E5FF] font-semibold">
                      {connection?.accountType || "Business / Creator"}
                    </span>
                    <span>&bull;</span>
                    <span className="text-white/70">
                      ID: {connection?.instagramUserId || "N/A"}
                    </span>
                    <span>&bull;</span>
                    <a
                      href={`https://instagram.com/${connection?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-[#00E5FF] hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-bold">
                      {connection?.tokenDaysRemaining !== null &&
                      connection?.tokenDaysRemaining !== undefined
                        ? `${connection.tokenDaysRemaining} days token active`
                        : "60-Day Meta Token Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAddReelModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  title="Add any Instagram Reel to website showcase by pasting its link"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reel by Link</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncInstagram}
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  title="Fetch latest reels from Meta API while preserving your current 4 selected reels"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#00E5FF]" : ""}`} />
                  <span>{isSyncing ? "Sync Instagram..." : "Sync Instagram"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDisconnectModalOpen(true)}
                  disabled={isDisconnecting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  title="Disconnect current account and allow switching to a different Instagram ID"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings & Selection Controls Bar */}
          <div className="bg-[#1F2833] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-white/10">
              {/* "Show Selected Reels on Website" Switch Toggle */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.instagramEnabled}
                  disabled={isTogglingWebsite}
                  onClick={handleToggleWebsiteDisplay}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.instagramEnabled ? "bg-emerald-500" : "bg-white/20"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      settings.instagramEnabled ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-sm text-white uppercase tracking-wider">
                      Show Selected Reels on Website
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        settings.instagramEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/10 text-[#8A8D93] border border-white/15"
                      }`}
                    >
                      {settings.instagramEnabled ? "ENABLED // LIVE" : "DISABLED // HIDDEN"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8D93] mt-0.5">
                    When enabled, the curated 1-4 reels below will be displayed in the public #instagram homepage section.
                  </p>
                </div>
              </div>

              {/* Selection Counter & Save Button */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div
                  className={`px-4 py-2 rounded-xl border font-mono text-xs font-black tracking-wider uppercase flex items-center gap-2 ${
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
                    <Film className="w-4 h-4 text-[#00E5FF]" />
                  )}
                  <span>{selectedIds.length} / 4 Reels Selected</span>
                </div>

                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unsaved</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveSelectedReels}
                    disabled={isSavingSelection}
                    className={`px-5 py-2 rounded-xl font-heading font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                      hasUnsavedChanges
                        ? "bg-[#00E5FF] hover:bg-[#00B4D8] text-black shadow-[0_0_25px_rgba(0,229,255,0.4)]"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                    }`}
                  >
                    {isSavingSelection ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingSelection ? "Saving..." : "Save Selection"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Showcase Tray (Currently Selected for Website) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8A8D93] uppercase font-bold tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00E5FF]" />
                  <span>Website Showcase Tray ({selectedReelsList.length} of 4)</span>
                </span>
                <span className="text-[11px] font-mono text-[#8A8D93]">
                  {4 - selectedReelsList.length} slot{4 - selectedReelsList.length !== 1 ? "s" : ""} remaining
                </span>
              </div>

              {selectedReelsList.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#0B0C10] border border-dashed border-white/15 text-center text-xs text-[#8A8D93]">
                  No reels selected yet. Click the &ldquo;Select for Website&rdquo; button on up to 4 reels from the feed below.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {selectedReelsList.map((reel) => (
                    <div
                      key={reel.id}
                      className="p-2.5 rounded-xl bg-[#0B0C10] border border-emerald-500/30 flex items-center gap-3 shadow-md"
                    >
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={reel.thumbnailUrl || "/images/dj_hero.jpg"}
                          alt={reel.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate font-medium">
                          {reel.caption || `Reel from @${reel.username}`}
                        </p>
                        <p className="text-[10px] font-mono text-[#8A8D93] mt-0.5">
                          {new Date(reel.publishedAt).toLocaleDateString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromSelected(reel.id)}
                          className="text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. VISUAL FEED / GRID OF AUTHORIZED MEDIA                    */}
          {/* ============================================================ */}
          <div className="space-y-5">
            {/* Feed Header with View Mode Switcher and Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-black text-xl text-white uppercase tracking-tight flex items-center gap-2.5">
                  <span>Authorized Instagram Media</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-xs font-bold">
                    {reels.length} Total
                  </span>
                </h3>
                <p className="text-xs text-[#8A8D93] mt-0.5">
                  Browse and select up to 4 reels or videos to showcase on your website.
                </p>
              </div>

              {/* View Switcher, Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <input
                    type="text"
                    placeholder="Search captions..."
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
                    onClick={() => setFilterVisibility("all")}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                      filterVisibility === "all"
                        ? "bg-white/15 text-white font-bold"
                        : "text-[#8A8D93] hover:text-white"
                    }`}
                  >
                    All ({reels.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterVisibility("selected")}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                      filterVisibility === "selected"
                        ? "bg-emerald-500/20 text-emerald-400 font-bold"
                        : "text-[#8A8D93] hover:text-white"
                    }`}
                  >
                    Selected ({selectedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterVisibility("available")}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors cursor-pointer ${
                      filterVisibility === "available"
                        ? "bg-white/15 text-white font-bold"
                        : "text-[#8A8D93] hover:text-white"
                    }`}
                  >
                    Available ({Math.max(0, reels.length - selectedIds.length)})
                  </button>
                </div>

                {/* Layout Mode Toggle (Grid vs List) */}
                <div className="flex items-center gap-1 bg-[#0B0C10] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white/15 text-white"
                        : "text-[#8A8D93] hover:text-white"
                    }`}
                    title="Visual Grid View (Smash Balloon)"
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
                  No Instagram Media Found
                </h4>
                <p className="text-xs text-[#8A8D93] max-w-md mx-auto">
                  {searchQuery
                    ? "No media matched your search filter."
                    : "No posts were returned from this account yet. Click Sync Instagram above to fetch fresh media or add a reel by link."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* ============================================================ */
              /* SMASH BALLOON VISUAL GRID VIEW                               */
              /* ============================================================ */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredReels.map((reel) => {
                  const isSelected =
                    selectedIds.includes(reel.id) ||
                    selectedIds.includes(reel.instagramMediaId);
                  const isLimitReached = !isSelected && selectedIds.length >= 4;

                  return (
                    <div
                      key={reel.id}
                      className={`group relative bg-[#1F2833] rounded-2xl overflow-hidden shadow-xl flex flex-col border transition-all duration-300 ${
                        isSelected
                          ? "border-emerald-500/50 shadow-[0_0_25px_rgba(34,197,94,0.2)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Vertical Media Thumbnail 9:16 */}
                      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
                        <img
                          src={reel.thumbnailUrl || "/images/dj_hero.jpg"}
                          alt={reel.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50 group-hover:via-black/10 transition-colors" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/15 text-[9px] font-mono uppercase tracking-wider text-[#00E5FF] font-bold flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            <span>{reel.mediaType || "REEL"}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {reel.likesCount ? (
                              <span className="px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90 flex items-center gap-1">
                                <Heart className="w-3 h-3 text-[#ff3366] fill-[#ff3366]" />
                                <span>{Number(reel.likesCount).toLocaleString()}</span>
                              </span>
                            ) : null}

                            <a
                              href={reel.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white hover:text-[#00E5FF] transition-colors"
                              title="Open on Instagram"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Center Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setPreviewReel(reel)}
                            className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-transform hover:scale-110 cursor-pointer shadow-lg"
                            title="Preview Reel"
                          >
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          </button>
                        </div>

                        {/* Selected Indicator Ribbon */}
                        {isSelected && (
                          <div className="absolute bottom-3 left-3 right-3 z-10">
                            <span className="w-full py-1 rounded-lg bg-emerald-500 text-black font-mono text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>FEATURED ON WEBSITE</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content & Action Controls */}
                      <div className="p-4 flex flex-col justify-between flex-grow space-y-3 bg-[#1F2833]">
                        <div>
                          <p className="text-xs text-white line-clamp-2 leading-relaxed font-sans font-medium">
                            {reel.caption || `Reel from @${reel.username}`}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8D93] mt-2">
                            <span className="text-[#00E5FF]">@{reel.username}</span>
                            <span>
                              {new Date(reel.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Select Button */}
                        <button
                          type="button"
                          disabled={isLimitReached}
                          onClick={() => handleToggleReelSelection(reel.id)}
                          className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400"
                              : isLimitReached
                              ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                              : "bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/40 text-[#00E5FF]"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Unselect</span>
                            </>
                          ) : isLimitReached ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Max 4 Selected</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Select for Website</span>
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
                        <th className="p-4 w-16 text-center">Select</th>
                        <th className="p-4 w-24">Preview</th>
                        <th className="p-4">Caption / Media</th>
                        <th className="p-4 w-32">Published</th>
                        <th className="p-4 w-36">Instagram</th>
                        <th className="p-4 w-40 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredReels.map((reel) => {
                        const isSelected =
                          selectedIds.includes(reel.id) ||
                          selectedIds.includes(reel.instagramMediaId);
                        const isLimitReached = !isSelected && selectedIds.length >= 4;

                        return (
                          <tr
                            key={reel.id}
                            className={`hover:bg-white/[0.02] transition-colors ${
                              isSelected ? "bg-emerald-500/[0.04]" : ""
                            }`}
                          >
                            <td className="p-4 text-center">
                              <button
                                type="button"
                                disabled={isLimitReached}
                                onClick={() => handleToggleReelSelection(reel.id)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                                    : isLimitReached
                                    ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
                                    : "bg-[#0B0C10] text-[#8A8D93] hover:text-white border border-white/20 hover:border-[#00E5FF]"
                                }`}
                                title={
                                  isSelected
                                    ? "Click to deselect"
                                    : isLimitReached
                                    ? "Max 4 reels selected"
                                    : "Click to select"
                                }
                              >
                                {isSelected ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 opacity-50" />
                                )}
                              </button>
                            </td>

                            <td className="p-4">
                              <div
                                onClick={() => setPreviewReel(reel)}
                                className="relative w-14 h-20 rounded-lg overflow-hidden bg-black border border-white/15 cursor-pointer group shadow-md flex-shrink-0"
                              >
                                <img
                                  src={reel.thumbnailUrl || "/images/dj_hero.jpg"}
                                  alt={reel.caption}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-white fill-white" />
                                </div>
                              </div>
                            </td>

                            <td className="p-4 max-w-md">
                              <p className="font-sans text-xs text-white line-clamp-2 leading-relaxed">
                                {reel.caption || `Reel from @${reel.username}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#8A8D93]">
                                <span className="text-[#00E5FF]">@{reel.username}</span>
                                <span>&bull;</span>
                                <span>ID: {reel.instagramMediaId.slice(0, 12)}</span>
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

                            <td className="p-4 text-right whitespace-nowrap">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase shadow-sm">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>ON WEBSITE</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#8A8D93] font-mono text-[10px] uppercase">
                                  <span>AVAILABLE</span>
                                </span>
                              )}
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
        </>
      )}

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
                {previewReel.caption || `Reel from @${previewReel.username}`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              {selectedIds.includes(previewReel.id) ? (
                <button
                  type="button"
                  onClick={() => handleRemoveFromSelected(previewReel.id)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-2 bg-rose-500/15 text-rose-400 border border-rose-500/30 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove from Website</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={selectedIds.length >= 4}
                  onClick={() => handleToggleReelSelection(previewReel.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-2 cursor-pointer ${
                    selectedIds.length >= 4
                      ? "bg-white/5 text-white/40 cursor-not-allowed"
                      : "bg-[#00E5FF] text-black font-black"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedIds.length >= 4 ? "Max 4 Selected" : "Select for Website"}</span>
                </button>
              )}

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
      {/* 5. DISCONNECT CONFIRMATION MODAL                              */}
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
                Disconnecting will revoke active Meta tokens, clear cached reels, and remove current website selections. Account B will be completely isolated with its own media and selections.
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
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase shadow-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDisconnecting ? "Disconnecting..." : "Yes, Disconnect Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. META DEVELOPER SETUP GUIDE MODAL                           */}
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
                  Meta&apos;s official APIs require the Instagram account to be a <strong>Professional Account</strong> (either <strong>Creator</strong> or <strong>Business</strong>). You can switch any personal account to Professional for free in 1 tap inside the Instagram mobile app: <em>Settings &rarr; Account &rarr; Switch to Professional Account</em>.
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
      {/* 7. ADD REEL BY LINK MODAL                                     */}
      {/* ============================================================ */}
      {isAddReelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#1F2833] border border-[#00E5FF]/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-white text-base uppercase">
                    Add Reel by Link
                  </h3>
                  <p className="text-xs text-[#8A8D93]">Paste any Instagram Reel URL to feature on website</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReelModalOpen(false)}
                className="p-1 rounded-lg text-[#8A8D93] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddReel} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-mono text-[#F5F6FA] uppercase">
                  Instagram Reel URL <span className="text-[#00E5FF]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={inputReelUrl}
                  onChange={(e) => setInputReelUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/C3example123/"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-mono text-[#8A8D93] uppercase">
                  Caption / Title (Optional)
                </label>
                <input
                  type="text"
                  value={inputReelCaption}
                  onChange={(e) => setInputReelCaption(e.target.value)}
                  placeholder="e.g. Live Festival Performance at Sunburn Arena"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0C10] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddReelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingReel || !inputReelUrl.trim()}
                  className="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00cce6] text-black font-heading font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {isAddingReel ? "Adding Reel..." : "Add to Showcase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
