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
function mergeCollections<T extends { id: string }>(
  baseItems: T[],
  customKey: string,
  deletedKey: string
): T[] {
  if (typeof window === "undefined") return baseItems || [];

  const customItems = getLocalJson<T[]>(customKey, []);
  const deletedIds = getLocalJson<string[]>(deletedKey, []);
  const deletedSet = new Set(deletedIds);

  // 1. Filter out deleted IDs from base items
  const filteredBase = (baseItems || []).filter(
    (item) => item && item.id && !deletedSet.has(item.id)
  );

  // 2. Put custom items first (newest additions / user edits)
  const result: T[] = [];
  const customIdSet = new Set<string>();

  customItems.forEach((c) => {
    if (c && c.id && !deletedSet.has(c.id)) {
      result.push(c);
      customIdSet.add(c.id);
    }
  });

  // 3. Append remaining base items not overridden by custom
  filteredBase.forEach((b) => {
    if (!customIdSet.has(b.id)) {
      result.push(b);
    }
  });

  return result;
}

// ---------------------------------------------------------------------------
// EVENTS
// ---------------------------------------------------------------------------
export function getMergedEvents(baseEvents: any[]): any[] {
  return mergeCollections(
    baseEvents,
    STORAGE_KEYS.events.custom,
    STORAGE_KEYS.events.deleted
  );
}

export function saveCustomEvent(event: any): void {
  if (typeof window === "undefined" || !event?.id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.events.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.events.deleted, []);

  // Remove from deleted list if re-added
  const updatedDeleted = deleted.filter((id) => id !== event.id);
  setLocalJson(STORAGE_KEYS.events.deleted, updatedDeleted);

  // Update existing custom or prepend new
  const existingIdx = custom.findIndex((e) => e.id === event.id);
  let updatedCustom: any[];
  if (existingIdx >= 0) {
    updatedCustom = [...custom];
    updatedCustom[existingIdx] = { ...updatedCustom[existingIdx], ...event };
  } else {
    updatedCustom = [event, ...custom];
  }
  setLocalJson(STORAGE_KEYS.events.custom, updatedCustom);
}

export function deleteCustomEvent(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.events.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.events.deleted, []);

  // Remove from custom list
  const updatedCustom = custom.filter((e) => e.id !== id);
  setLocalJson(STORAGE_KEYS.events.custom, updatedCustom);

  // Add to deleted set
  if (!deleted.includes(id)) {
    setLocalJson(STORAGE_KEYS.events.deleted, [...deleted, id]);
  }
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

  const updatedDeleted = deleted.filter((id) => id !== blog.id);
  setLocalJson(STORAGE_KEYS.blogs.deleted, updatedDeleted);

  const existingIdx = custom.findIndex((b) => b.id === blog.id);
  let updatedCustom: any[];
  if (existingIdx >= 0) {
    updatedCustom = [...custom];
    updatedCustom[existingIdx] = { ...updatedCustom[existingIdx], ...blog };
  } else {
    updatedCustom = [blog, ...custom];
  }
  setLocalJson(STORAGE_KEYS.blogs.custom, updatedCustom);
}

export function deleteCustomBlog(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const custom = getLocalJson<any[]>(STORAGE_KEYS.blogs.custom, []);
  const deleted = getLocalJson<string[]>(STORAGE_KEYS.blogs.deleted, []);

  const updatedCustom = custom.filter((b) => b.id !== id);
  setLocalJson(STORAGE_KEYS.blogs.custom, updatedCustom);

  if (!deleted.includes(id)) {
    setLocalJson(STORAGE_KEYS.blogs.deleted, [...deleted, id]);
  }
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
