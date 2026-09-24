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
// Client-side localStorage overrides are disabled and purged so all devices
// see the exact same live database state.
// ---------------------------------------------------------------------------
function clearEventLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.events.custom);
    localStorage.removeItem(STORAGE_KEYS.events.deleted);
  } catch {
    // ignore
  }
}

export function getMergedEvents(baseEvents: any[]): any[] {
  clearEventLocalStorage();
  return Array.isArray(baseEvents) ? baseEvents : [];
}

export function saveCustomEvent(_event: any): void {
  clearEventLocalStorage();
}

export function deleteCustomEvent(_id: string, _slug?: string, _title?: string): void {
  clearEventLocalStorage();
}

// ---------------------------------------------------------------------------
// BLOGS
// ---------------------------------------------------------------------------
export function getMergedBlogs(baseBlogs: any[]): any[] {
  return mergeCollections(
    baseBlogs,
    STORAGE_KEYS.blogs.custom,
    STORAGE_KEYS.blogs.deleted
  );
}

export function saveCustomBlog(blog: any): void {
  if (typeof window === "undefined" || !blog?.id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.blogs.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.blogs.deleted, []);

  const identifiers = [blog.id, blog.slug, blog.title]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase().trim());
  const updatedDeleted = deleted.filter(
    (id) => !identifiers.includes(String(id).toLowerCase().trim())
  );
  setLocalJson(STORAGE_KEYS.blogs.deleted, updatedDeleted);

  const existingIdx = custom.findIndex(
    (b) =>
      b.id === blog.id ||
      (blog.slug && b.slug === blog.slug) ||
      (blog.title && b.title?.toLowerCase().trim() === blog.title.toLowerCase().trim())
  );
  let updatedCustom: any[];
  if (existingIdx >= 0) {
    updatedCustom = [...custom];
    updatedCustom[existingIdx] = { ...updatedCustom[existingIdx], ...blog };
  } else {
    updatedCustom = [blog, ...custom];
  }
  setLocalJson(STORAGE_KEYS.blogs.custom, updatedCustom);
}

export function deleteCustomBlog(id: string, slug?: string, title?: string): void {
  if (typeof window === "undefined" || !id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.blogs.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.blogs.deleted, []);

  const keysToDelete = [id, slug, title]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase().trim());

  const updatedCustom = custom.filter((b) => {
    if (b.id && keysToDelete.includes(String(b.id).toLowerCase().trim())) return false;
    if (b.slug && keysToDelete.includes(String(b.slug).toLowerCase().trim())) return false;
    if (b.title && keysToDelete.includes(String(b.title).toLowerCase().trim())) return false;
    return true;
  });
  setLocalJson(STORAGE_KEYS.blogs.custom, updatedCustom);

  const newDeleted = Array.from(new Set([...deleted, ...keysToDelete]));
  setLocalJson(STORAGE_KEYS.blogs.deleted, newDeleted);
}

// ---------------------------------------------------------------------------
// GALLERY (PHOTOS)
// ---------------------------------------------------------------------------
export function getMergedGallery(baseGallery: any[]): any[] {
  return mergeCollections(
    baseGallery,
    STORAGE_KEYS.gallery.custom,
    STORAGE_KEYS.gallery.deleted
  );
}

export function saveCustomGallery(photo: any): void {
  if (typeof window === "undefined" || !photo?.id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.gallery.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.gallery.deleted, []);

  const updatedDeleted = deleted.filter((id) => id !== photo.id);
  setLocalJson(STORAGE_KEYS.gallery.deleted, updatedDeleted);

  const existingIdx = custom.findIndex((p) => p.id === photo.id);
  let updatedCustom: any[];
  if (existingIdx >= 0) {
    updatedCustom = [...custom];
    updatedCustom[existingIdx] = { ...updatedCustom[existingIdx], ...photo };
  } else {
    updatedCustom = [photo, ...custom];
  }
  setLocalJson(STORAGE_KEYS.gallery.custom, updatedCustom);
}

export function deleteCustomGallery(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.gallery.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.gallery.deleted, []);

  const updatedCustom = custom.filter((p) => p.id !== id);
  setLocalJson(STORAGE_KEYS.gallery.custom, updatedCustom);

  if (!deleted.includes(id)) {
    setLocalJson(STORAGE_KEYS.gallery.deleted, [...deleted, id]);
  }
}

// ---------------------------------------------------------------------------
// VIDEOS
// ---------------------------------------------------------------------------
export function getMergedVideos(baseVideos: any[]): any[] {
  return mergeCollections(
    baseVideos,
    STORAGE_KEYS.videos.custom,
    STORAGE_KEYS.videos.deleted
  );
}

export function saveCustomVideo(video: any): void {
  if (typeof window === "undefined" || !video?.id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.videos.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.videos.deleted, []);

  const updatedDeleted = deleted.filter((id) => id !== video.id);
  setLocalJson(STORAGE_KEYS.videos.deleted, updatedDeleted);

  const existingIdx = custom.findIndex((v) => v.id === video.id);
  let updatedCustom: any[];
  if (existingIdx >= 0) {
    updatedCustom = [...custom];
    updatedCustom[existingIdx] = { ...updatedCustom[existingIdx], ...video };
  } else {
    updatedCustom = [video, ...custom];
  }
  setLocalJson(STORAGE_KEYS.videos.custom, updatedCustom);
}

export function deleteCustomVideo(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.videos.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.videos.deleted, []);

  const updatedCustom = custom.filter((v) => v.id !== id);
  setLocalJson(STORAGE_KEYS.videos.custom, updatedCustom);

  if (!deleted.includes(id)) {
    setLocalJson(STORAGE_KEYS.videos.deleted, [...deleted, id]);
  }
}
