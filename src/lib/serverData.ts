import fs from "fs/promises";
import path from "path";
import { getDb } from "./mongodb";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const TMP_DIR = process.platform === "win32" ? DATA_DIR : "/tmp";

// Global in-memory storage so updates persist across serverless function calls in Node.js
const globalWithStore = global as typeof globalThis & {
  __sparkMemoryStore?: Map<string, any>;
};
if (!globalWithStore.__sparkMemoryStore) {
  globalWithStore.__sparkMemoryStore = new Map<string, any>();
}
const memoryStore = globalWithStore.__sparkMemoryStore;

function getCollectionName(filename: string): string {
  return filename.replace(/\.json$/i, "").replace(/[^a-zA-Z0-9_]/g, "_");
}

export async function readJsonFile<T>(filename: string): Promise<T> {
  const collectionName = getCollectionName(filename);

  // 1. Primary Source of Truth: MongoDB Atlas
  try {
    const db = await getDb();
    if (db) {
      const collection = db.collection(collectionName);
      const record = await collection.findOne({ _id: "current_dataset" as any });

      if (record && record.data !== undefined) {
        memoryStore.set(filename, record.data);
        return record.data as T;
      }

      // If database collection does not have current_dataset yet, seed once from local JSON file
      const localData = await readLocalJson<T>(filename);
      await collection.updateOne(
        { _id: "current_dataset" as any },
        { $set: { data: localData, seededAt: new Date() } },
        { upsert: true }
      );
      memoryStore.set(filename, localData);
      return localData;
    }
  } catch (dbErr) {
    console.warn(`[Storage] MongoDB read failed for ${filename}, falling back:`, dbErr);
  }

  // 2. Check in-memory store
  if (memoryStore.has(filename)) {
    return memoryStore.get(filename) as T;
  }

  // 3. Try reading from /tmp (writable on Vercel serverless)
  try {
    const tmpFilePath = path.join(TMP_DIR, filename);
    const tmpData = await fs.readFile(tmpFilePath, "utf-8");
    const parsed = JSON.parse(tmpData.replace(/^\uFEFF/, "")) as T;
    memoryStore.set(filename, parsed);
    return parsed;
  } catch {
    // /tmp file does not exist yet, fallback to bundled static file
  }

  // 4. Fallback to bundled local filesystem (src/data/...)
  const fallbackData = await readLocalJson<T>(filename);
  memoryStore.set(filename, fallbackData);
  return fallbackData;
}

export async function writeJsonFile<T>(filename: string, content: T): Promise<void> {
  const collectionName = getCollectionName(filename);

  // 1. Write to MongoDB Atlas FIRST (Primary Source of Truth)
  if (process.env.MONGODB_URI) {
    const db = await getDb();
    if (!db) {
      throw new Error(`[Storage] Cannot connect to MongoDB Atlas to write ${filename}`);
    }
    const collection = db.collection(collectionName);
    await collection.updateOne(
      { _id: "current_dataset" as any },
      { $set: { data: content, updatedAt: new Date() } },
      { upsert: true }
    );
  }

  // 2. Update in-memory store after DB write succeeds
  memoryStore.set(filename, content);

  // 3. Try writing to /tmp (writable on Vercel serverless)
  try {
    const tmpFilePath = path.join(TMP_DIR, filename);
    await fs.writeFile(tmpFilePath, JSON.stringify(content, null, 2), "utf-8");
  } catch {
    // ignore /tmp error if any
  }

  // 4. Also try writing to local disk (in dev or self-hosted)
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
  } catch {
    // On Vercel serverless functions, filesystem is read-only.
  }
}

async function readLocalJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data.replace(/^\uFEFF/, "")) as T;
}

// ---------------------------------------------------------------------------
// EVENTS PERMANENT DELETION & SYNC ENGINE
// ---------------------------------------------------------------------------

export async function getDeletedEventIdentifiers(): Promise<Set<string>> {
  try {
    const list = await readJsonFile<string[]>("deleted_events.json");
    if (Array.isArray(list)) {
      return new Set(list.map((s) => String(s).toLowerCase().trim()));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export async function unmarkDeletedEvent(identifiers: (string | undefined | null)[]): Promise<void> {
  try {
    const current = await readJsonFile<string[]>("deleted_events.json").catch(() => []);
    if (!Array.isArray(current) || current.length === 0) return;
    const toRemove = new Set(
      identifiers.filter(Boolean).map((s) => String(s).toLowerCase().trim())
    );
    const updated = current.filter((id) => !toRemove.has(String(id).toLowerCase().trim()));
    if (updated.length !== current.length) {
      await writeJsonFile("deleted_events.json", updated);
    }
  } catch (err) {
    console.warn("[Storage] Failed to unmark deleted event:", err);
  }
}

export async function purgeEventEverywhere(
  id: string,
  slug?: string,
  title?: string
): Promise<{ success: boolean; removedCount: number }> {
  const targets = new Set<string>();
  if (id && id.trim()) targets.add(id.toLowerCase().trim());
  if (slug && slug.trim()) targets.add(slug.toLowerCase().trim());
  if (title && title.trim()) targets.add(title.toLowerCase().trim());

  let totalRemoved = 0;

  const matches = (item: any) => {
    if (!item) return false;
    const itemId = item.id ? String(item.id).toLowerCase().trim() : "";
    const itemSlug = item.slug ? String(item.slug).toLowerCase().trim() : "";
    const itemTitle = item.title ? String(item.title).toLowerCase().trim() : "";

    const isMatch =
      (itemId && targets.has(itemId)) ||
      (itemSlug && targets.has(itemSlug)) ||
      (itemTitle && targets.has(itemTitle));

    if (isMatch) {
      if (itemId) targets.add(itemId);
      if (itemSlug) targets.add(itemSlug);
      if (itemTitle) targets.add(itemTitle);
    }
    return isMatch;
  };

  // 1. Purge from events.json
  try {
    const events = await readJsonFile<any[]>("events.json");
    if (Array.isArray(events)) {
      const filtered = events.filter((e) => !matches(e));
      if (filtered.length !== events.length) {
        totalRemoved += (events.length - filtered.length);
        await writeJsonFile("events.json", filtered);
      }
    }
  } catch (err) {
    console.warn("[Storage] Error purging from events.json:", err);
  }

  // 2. Purge from past-events.json
  try {
    const pastEvents = await readJsonFile<any[]>("past-events.json");
    if (Array.isArray(pastEvents)) {
      const filtered = pastEvents.filter((e) => !matches(e));
      if (filtered.length !== pastEvents.length) {
        totalRemoved += (pastEvents.length - filtered.length);
        await writeJsonFile("past-events.json", filtered);
      }
    }
  } catch (err) {
    console.warn("[Storage] Error purging from past-events.json:", err);
  }

  // 3. Record all targets permanently in deleted_events.json
  try {
    const currentDeleted = await readJsonFile<string[]>("deleted_events.json").catch(() => []);
    const deletedList = Array.isArray(currentDeleted) ? currentDeleted : [];
    const mergedDeletedSet = new Set(deletedList.map((s) => String(s).toLowerCase().trim()));
    targets.forEach((t) => mergedDeletedSet.add(t));
    await writeJsonFile("deleted_events.json", Array.from(mergedDeletedSet));
  } catch (err) {
    console.warn("[Storage] Error recording deleted_events.json:", err);
  }

  return { success: true, removedCount: totalRemoved };
}

// ---------------------------------------------------------------------------
// BLOGS PERMANENT DELETION & SYNC ENGINE
// ---------------------------------------------------------------------------

export async function getDeletedBlogIdentifiers(): Promise<Set<string>> {
  try {
    const list = await readJsonFile<string[]>("deleted_blogs.json");
    if (Array.isArray(list)) {
      return new Set(list.map((s) => String(s).toLowerCase().trim()));
    }
  } catch {
    // ignore
  }
  return new Set();
}

export async function unmarkDeletedBlog(identifiers: (string | undefined | null)[]): Promise<void> {
  try {
    const current = await readJsonFile<string[]>("deleted_blogs.json").catch(() => []);
    if (!Array.isArray(current) || current.length === 0) return;
    const toRemove = new Set(
      identifiers.filter(Boolean).map((s) => String(s).toLowerCase().trim())
    );
    const updated = current.filter((id) => !toRemove.has(String(id).toLowerCase().trim()));
    if (updated.length !== current.length) {
      await writeJsonFile("deleted_blogs.json", updated);
    }
  } catch (err) {
    console.warn("[Storage] Failed to unmark deleted blog:", err);
  }
}

export async function purgeBlogEverywhere(
  id: string,
  slug?: string,
  title?: string
): Promise<{ success: boolean; removedCount: number }> {
  const targets = new Set<string>();
  if (id && id.trim()) targets.add(id.toLowerCase().trim());
  if (slug && slug.trim()) targets.add(slug.toLowerCase().trim());
  if (title && title.trim()) targets.add(title.toLowerCase().trim());

  let totalRemoved = 0;

  const matches = (item: any) => {
    if (!item) return false;
    const itemId = item.id ? String(item.id).toLowerCase().trim() : "";
    const itemSlug = item.slug ? String(item.slug).toLowerCase().trim() : "";
    const itemTitle = item.title ? String(item.title).toLowerCase().trim() : "";

    const isMatch =
      (itemId && targets.has(itemId)) ||
      (itemSlug && targets.has(itemSlug)) ||
      (itemTitle && targets.has(itemTitle));

    if (isMatch) {
      if (itemId) targets.add(itemId);
      if (itemSlug) targets.add(itemSlug);
      if (itemTitle) targets.add(itemTitle);
    }
    return isMatch;
  };

  try {
    const blogs = await readJsonFile<any[]>("blog.json");
    if (Array.isArray(blogs)) {
      const filtered = blogs.filter((b) => !matches(b));
      if (filtered.length !== blogs.length) {
        totalRemoved += (blogs.length - filtered.length);
        await writeJsonFile("blog.json", filtered);
      }
    }
  } catch (err) {
    console.warn("[Storage] Error purging from blog.json:", err);
  }

  try {
    const currentDeleted = await readJsonFile<string[]>("deleted_blogs.json").catch(() => []);
    const deletedList = Array.isArray(currentDeleted) ? currentDeleted : [];
    const mergedDeletedSet = new Set(deletedList.map((s) => String(s).toLowerCase().trim()));
    targets.forEach((t) => mergedDeletedSet.add(t));
    await writeJsonFile("deleted_blogs.json", Array.from(mergedDeletedSet));
  } catch (err) {
    console.warn("[Storage] Error recording deleted_blogs.json:", err);
  }

  return { success: true, removedCount: totalRemoved };
}

