import { getDb } from "./mongodb";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Saves uploaded image buffer to MongoDB Atlas collection `media_uploads`
 * and optionally writes to local disk if writable.
 * Returns the public access URL: `/api/uploads/${filename}`
 */
export async function saveUploadedMedia(
  buffer: Buffer,
  format: string,
  prefix = "spark"
): Promise<{ success: boolean; url: string; filename: string }> {
  const normalizedFormat = format.toLowerCase().replace("jpeg", "jpg");
  const ext = normalizedFormat.startsWith(".") ? normalizedFormat : `.${normalizedFormat}`;
  const secureId = crypto.randomBytes(16).toString("hex");
  const filename = `${prefix}_${Date.now()}_${secureId}${ext}`;
  const contentType = `image/${format === "jpg" ? "jpeg" : format}`;

  let storedInDb = false;

  // 1. Store in MongoDB Atlas (Persistent across serverless deploys & lambdas)
  try {
    const db = await getDb();
    if (db) {
      await db.collection("media_uploads").updateOne(
        { filename },
        {
          $set: {
            filename,
            contentType,
            data: buffer.toString("base64"),
            size: buffer.length,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
      storedInDb = true;
    }
  } catch (dbErr) {
    console.warn("[MediaStorage] MongoDB write warning:", dbErr);
  }

  // 2. Also attempt local filesystem write (for local development or persistent storage)
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
  } catch {
    // Read-only filesystem in serverless environments is expected
  }

  if (storedInDb) {
    return {
      success: true,
      url: `/api/uploads/${filename}`,
      filename,
    };
  }

  // Fallback to data URL if database is not reachable
  return {
    success: true,
    url: `data:${contentType};base64,${buffer.toString("base64")}`,
    filename,
  };
}

/**
 * If an image URL is a base64 `data:image/...` string, this persists it
 * into MongoDB Atlas and converts it into a permanent `/api/uploads/${filename}` URL.
 * If it is already a regular path or URL, it returns it unchanged.
 */
export async function persistMediaUrl(imageUrl: string, prefix = "spark"): Promise<string> {
  if (!imageUrl || typeof imageUrl !== "string") return imageUrl;
  const trimmed = imageUrl.trim();

  // If not a data URL, it's already a clean path/URL
  if (!trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  const match = trimmed.match(/^data:image\/(jpe?g|png|webp|gif|avif);base64,([A-Za-z0-9+/_\-=\s]+)$/i);
  if (!match) {
    return trimmed;
  }

  try {
    const rawFormat = match[1].toLowerCase();
    const base64Data = match[2].replace(/\s+/g, "");
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 12) return trimmed;

    const res = await saveUploadedMedia(buffer, rawFormat, prefix);
    return res.url;
  } catch (err) {
    console.warn("[MediaStorage] Could not auto-convert data URL to media_uploads:", err);
    return trimmed;
  }
}

/**
 * Retrieves an image buffer and its MIME type for `/api/uploads/[filename]`
 */
export async function getMediaFromStorage(
  filename: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }

  // 1. Check local disk first
  try {
    const localPath = path.join(UPLOADS_DIR, filename);
    const buffer = await fs.readFile(localPath);
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".avif"
        ? "image/avif"
        : "image/jpeg";

    return { buffer, contentType };
  } catch {}

  // 2. Fetch from MongoDB Atlas
  try {
    const db = await getDb();
    if (db) {
      const record = await db.collection("media_uploads").findOne({ filename });
      if (record && record.data) {
        const buffer = Buffer.isBuffer(record.data)
          ? record.data
          : Buffer.from(record.data, "base64");

        return {
          buffer,
          contentType: record.contentType || "image/jpeg",
        };
      }
    }
  } catch (err) {
    console.error("[MediaStorage] Error reading from MongoDB:", err);
  }

  return null;
}
