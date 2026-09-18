import fs from "fs/promises";
import path from "path";
import { getDb } from "./mongodb";

const DATA_DIR = path.join(process.cwd(), "src", "data");

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
        return record.data as T;
      }

      // If database collection is empty, seed from local JSON file
      const localData = await readLocalJson<T>(filename);
      await collection.updateOne(
        { _id: "current_dataset" as any },
        { $set: { data: localData, seededAt: new Date() } },
        { upsert: true }
      );
      return localData;
    }
  } catch (dbErr) {
    console.warn(`[Storage] MongoDB read failed for ${filename}, falling back to local file:`, dbErr);
  }

  // 2. Fallback to local filesystem
  return readLocalJson<T>(filename);
}

export async function writeJsonFile<T>(filename: string, content: T): Promise<void> {
  const collectionName = getCollectionName(filename);

  // 1. Try writing to MongoDB if connected
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

  // 2. Also try writing to local disk (in dev or self-hosted)
  try {
    const filePath = path.join(DATA_DIR, filename);
    const jsonString = JSON.stringify(content, null, 2);
    await fs.writeFile(filePath, jsonString, "utf-8");
  } catch (fsErr: any) {
    // On Vercel serverless functions, filesystem is read-only.
    // If MongoDB succeeded, we can safely ignore the read-only error.
    if (fsErr?.code !== "EROFS") {
      console.warn(`[Storage] Local write notice for ${filename}:`, fsErr?.message || fsErr);
    }
  }
}

async function readLocalJson<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const data = await fs.readFile(filePath, "utf-8");
  return JSON.parse(data.replace(/^\uFEFF/, "")) as T;
}
