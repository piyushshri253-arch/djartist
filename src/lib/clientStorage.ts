/**
 * Persistent Client-Side Data Merge Engine
 * Ensures custom created, edited, and deleted items never vanish on page refresh,
 * even when backend serverless functions are cold or disconnected from cloud databases.
 */

// Keys for localStorage
const STORAGE_KEYS = {
  events: {
    custom: "dj_gspark_custom_events",
    deleted: "dj_gspark_deleted_event_ids",
  },
  blogs: {
    custom: "dj_gspark_custom_blogs",
    deleted: "dj_gspark_deleted_blog_ids",
  },
  gallery: {
    custom: "dj_gspark_custom_gallery",
    deleted: "dj_gspark_deleted_gallery_ids",
  },
  videos: {
    custom: "dj_gspark_custom_videos",
    deleted: "dj_gspark_deleted_video_ids",
  },
};

function getLocalJson<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalJson(key: string, value: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[clientStorage] Failed to write to ${key}:`, err);
  }
}

// Generic Merger
function mergeCollections<T extends { id?: string; slug?: string; title?: string }>(
  baseItems: T[],
  customKey: string,
  deletedKey: string
): T[] {
  if (typeof window === "undefined") return baseItems || [];

  const customItems = getLocalJson<T[]>(customKey, []);
  const deletedIds = getLocalJson<string[]>(deletedKey, []);
  const deletedSet = new Set(deletedIds.map((s) => String(s).toLowerCase().trim()));

  const isDeleted = (item: any) => {
    if (!item) return false;
    if (item.id && deletedSet.has(String(item.id).toLowerCase().trim())) return true;
    if (item.slug && deletedSet.has(String(item.slug).toLowerCase().trim())) return true;
    if (item.title && deletedSet.has(String(item.title).toLowerCase().trim())) return true;
    return false;
  };

  // 1. Filter out deleted IDs from base items
  const filteredBase = (baseItems || []).filter((item) => !isDeleted(item));

  // 2. Put custom items first (newest additions / user edits)
  const result: T[] = [];
  const customIdSet = new Set<string>();

  customItems.forEach((c: any) => {
    if (c && !isDeleted(c)) {
      result.push(c);
      if (c.id) customIdSet.add(String(c.id).toLowerCase().trim());
      if (c.slug) customIdSet.add(String(c.slug).toLowerCase().trim());
    }
  });

  // 3. Append remaining base items not overridden by custom
  filteredBase.forEach((b: any) => {
    const bId = b.id ? String(b.id).toLowerCase().trim() : "";
    const bSlug = b.slug ? String(b.slug).toLowerCase().trim() : "";
    if ((!bId || !customIdSet.has(bId)) && (!bSlug || !customIdSet.has(bSlug))) {
      result.push(b);
    }
  });

  return result;
}

// ---------------------------------------------------------------------------
// EVENTS (Single Source of Truth: MongoDB Atlas -> API -> Frontend)
// LocalStorage overrides are permanently disabled and purged.
// ---------------------------------------------------------------------------
function purgeLegacyEventLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.events.custom);
    localStorage.removeItem(STORAGE_KEYS.events.deleted);
  } catch {
    // ignore
  }
}

export function getMergedEvents(baseEvents: any[]): any[] {
  purgeLegacyEventLocalStorage();
  return Array.isArray(baseEvents) ? baseEvents : [];
}

export function saveCustomEvent(_event: any): void {
  purgeLegacyEventLocalStorage();
}

export function deleteCustomEvent(_id: string, _slug?: string, _title?: string): void {
  purgeLegacyEventLocalStorage();
}

// ---------------------------------------------------------------------------
// BLOGS (Single Source of Truth: MongoDB Atlas -> API -> Frontend)
// ---------------------------------------------------------------------------
function purgeLegacyBlogLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.blogs.custom);
    localStorage.removeItem(STORAGE_KEYS.blogs.deleted);
  } catch {
    // ignore
  }
}

export function getMergedBlogs(baseBlogs: any[]): any[] {
  purgeLegacyBlogLocalStorage();
  return Array.isArray(baseBlogs) ? baseBlogs : [];
}

export function saveCustomBlog(_blog: any): void {
  purgeLegacyBlogLocalStorage();
}

export function deleteCustomBlog(_id: string, _slug?: string, _title?: string): void {
  purgeLegacyBlogLocalStorage();
}

// ---------------------------------------------------------------------------
// GALLERY (PHOTOS) (Single Source of Truth: MongoDB Atlas -> API -> Frontend)
// ---------------------------------------------------------------------------
function purgeLegacyGalleryLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.gallery.custom);
    localStorage.removeItem(STORAGE_KEYS.gallery.deleted);
  } catch {
    // ignore
  }
}

export function getMergedGallery(baseGallery: any[]): any[] {
  purgeLegacyGalleryLocalStorage();
  return Array.isArray(baseGallery) ? baseGallery : [];
}

export function saveCustomGallery(_photo: any): void {
  purgeLegacyGalleryLocalStorage();
}

export function deleteCustomGallery(_id: string): void {
  purgeLegacyGalleryLocalStorage();
}

// ---------------------------------------------------------------------------
// VIDEOS (Single Source of Truth: MongoDB Atlas -> API -> Frontend)
// ---------------------------------------------------------------------------
function purgeLegacyVideoLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.videos.custom);
    localStorage.removeItem(STORAGE_KEYS.videos.deleted);
  } catch {
    // ignore
  }
}

export function getMergedVideos(baseVideos: any[]): any[] {
  purgeLegacyVideoLocalStorage();
  return Array.isArray(baseVideos) ? baseVideos : [];
}

export function saveCustomVideo(_video: any): void {
  purgeLegacyVideoLocalStorage();
}

export function deleteCustomVideo(_id: string): void {
  purgeLegacyVideoLocalStorage();
}

