export interface EventTicketTier {
  name: string;
  description: string;
  priceINR?: string | number;
  priceUSD?: string | number;
  badge?: string;
  perks?: string[];
}

export interface EventItem {
  id: string;
  slug?: string;
  title: string;
  city: string;
  country: string;
  region?: string;
  venue: string;
  place?: string;
  address?: string;
  date: string;
  dateDisplay?: string;
  date_display?: string;
  time: string;
  doors?: string;
  type?: string;
  priceFrom?: string;
  price_from?: number;
  priceINR?: string | number;
  priceUSD?: string | number;
  showPrice?: boolean;
  isPublished?: boolean;
  currency?: "INR" | "USD" | "BOTH";
  capacity?: string | number;
  status: string;
  statusClass?: string;
  image: string;
  poster?: string;
  badge?: string;
  lineup: string[];
  description: string;
  detailedAbout?: string;
  ticketCategories?: EventTicketTier[];
  createdAt?: string;
  updatedAt?: string;
  reviewsCount?: number;
  averageRating?: number;
  isPast?: boolean;
}

export interface PastEventItem {
  id: string;
  title: string;
  city: string;
  venue: string;
  year: string;
  date_display: string;
  attendance: number;
  summary: string;
  highlight_track: string;
  image: string;
  recording_track_id?: string;
}

export interface TrackItem {
  id: string;
  title: string;
  album: string;
  genre: string;
  duration: string;
  durationSec: number;
  bpm: number;
  key: string;
  cover: string;
  audioUrl: string;
  streams: string;
  synthPreset?: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  categorySlug?: string;
  dateDisplay: string;
  readTime: string;
  author: string;
  authorRole?: string;
  image: string;
  excerpt: string;
  content: string;
}

export interface BookingSubmission {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: string;
  budget: string;
  message: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  userName?: string;
  role: string;
  organization?: string;
  initials: string;
  rating: number;
  badge: string;
  badgeColor?: string;
  event: string;
  quote: string;
  comment?: string;
  date: string;
  category: "promoter" | "critic" | "fan" | "reader" | "attendee" | "all";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  targetType?: "event" | "article" | "general";
  articleSlug?: string;
  articleTitle?: string;
  eventId?: string;
  eventSlug?: string;
  eventTitle?: string;
  userEmail?: string;
}

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Event Admin" | "Review Admin" | "Social Media Admin" | "Lead Admin";
  permissions: string[];
  status: "active" | "inactive";
  avatar?: string;
  createdAt: string;
  lastLogin?: string | null;
}

export interface PlatformSocialConfig {
  facebook: {
    url: string;
    enabled: boolean;
  };
  youtube: {
    channelUrl: string;
    enabled: boolean;
  };
  instagram: {
    enabled: boolean;
    connected: boolean;
    username: string;
    accountName?: string;
    profilePicture?: string;
    profileUrl?: string;
    lastSyncedAt?: string | null;
  };
}

export interface InstagramReelItem {
  id: string;
  title: string;
  views: string;
  likes: string;
  videoSrc: string;
  thumbnail: string;
  reelUrl: string;
  tag?: string;
  date?: string;
}

export interface InstagramSettings {
  connected: boolean;
  enabled: boolean;
  handle: string;
  profileUrl: string;
  followers: string;
  totalViews: string;
  bioSnippet: string;
  selectedReelIds: string[];
  reels: InstagramReelItem[];
  mediaLibrary: InstagramReelItem[];
}

// ============================================================
// Official Meta / Instagram Module Models
// ============================================================
export interface InstagramConnection {
  id: string;
  instagramUserId: string;
  username: string;
  profilePicture: string;
  accessTokenEncrypted?: string;
  tokenIv?: string;
  tokenAuthTag?: string;
  tokenExpiresAt?: number;
  connectedAt?: string;
  lastSyncedAt?: string;
  status: "connected" | "disconnected" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface InstagramReel {
  id: string;
  instagramMediaId: string;
  username: string;
  caption: string;
  thumbnailUrl: string;
  permalink: string;
  mediaType: "VIDEO" | "REEL" | "IMAGE";
  publishedAt: string;
  viewsDisplay?: string;
  likesCount?: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaSettings {
  id: string;
  instagramEnabled: boolean;
  autoSyncIntervalHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InstagramDatabase {
  connection: InstagramConnection;
  settings: SocialMediaSettings;
  reels: InstagramReel[];
}

// ============================================================
// Gallery & Video Showcase Management
// ============================================================
export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: "live" | "festivals" | "backstage";
  createdAt?: string;
}

export interface VideoShowcaseItem {
  id: string;
  title: string;
  tag: string;
  duration: string;
  thumbnail: string;
  videoSrc: string;
  createdAt?: string;
}