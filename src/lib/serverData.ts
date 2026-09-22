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

  // 1. Try reading from MongoDB if connected
  try {
    const db = await getDb();
    if (db) {
      const collection = db.collection(collectionName);
      const record = await collection.findOne({ _id: "current_dataset" as any });

      if (record && record.data !== undefined) {
        memoryStore.set(filename, record.data);
        return record.data as T;
      }

      // If database collection is empty, seed from local JSON file
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

  // 2. Check in-memory store (instant & reliable for serverless runtime)
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

  // 1. Update in-memory store immediately
  memoryStore.set(filename, content);

  // 2. Try writing to MongoDB if connected
  try {
    const db = await getDb();
    if (db) {
      const collection = db.collection(collectionName);
      await collection.updateOne(
        { _id: "current_dataset" as any },
        { $set: { data: content, updatedAt: new Date() } },
        { upsert: true }
      );
    }
  } catch (dbErr) {
    console.warn(`[Storage] MongoDB write failed for ${filename}:`, dbErr);
  }

  // 3. Try writing to /tmp (writable on Vercel serverless)
  try {
    const tmpFilePath = path.join(TMP_DIR, filename);
    await fs.writeFile(tmpFilePath, JSON.stringify(content, null, 2), "utf-8");
  } catch (tmpErr) {
    // ignore /tmp error if any
  }

  // 4. Also try writing to local disk (in dev or self-hosted)
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
  } catch (fsErr: any) {
    // On Vercel serverless functions, filesystem is read-only.
    // In-memory and /tmp have already been updated safely.
  }
}

async function readLocalJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data.replace(/^\uFEFF/, "")) as T;
}
