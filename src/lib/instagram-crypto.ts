import crypto from "crypto";
import fs from "fs";
import path from "path";
import { InstagramDatabase, InstagramConnection, InstagramReel, SocialMediaSettings } from "@/types";

const ENCRYPTION_KEY_RAW = process.env.INSTAGRAM_ENCRYPTION_KEY || process.env.SESSION_SECRET || "spark-super-secret-key-dj-2026-prod-instagram";
// Derive a strictly 32-byte key for AES-256-GCM
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_KEY_RAW).digest();

const STATE_SECRET = process.env.INSTAGRAM_STATE_SECRET || "spark-instagram-oauth-state-secret-2026";
const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "instagram.json");

/**
 * Encrypts a sensitive access token using AES-256-GCM
 */
export function encryptToken(plainText: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    tag,
  };
}

/**
 * Decrypts an access token using AES-256-GCM
 */
export function decryptToken(encryptedHex: string, ivHex: string, tagHex: string): string | null {
  try {
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt Instagram access token:", error);
    return null;
  }
}

/**
 * Generates a signed CSRF state token for OAuth 2.0
 */
export function generateOAuthState(): { state: string; signedCookie: string } {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const payload = `${nonce}:${timestamp}`;
  const signature = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("hex");
  const signedCookie = `${payload}:${signature}`;
  const state = Buffer.from(signedCookie).toString("base64url");

  return { state, signedCookie };
}

/**
 * Validates the returned OAuth state against the stored cookie
 */
export function verifyOAuthState(stateParam: string | null, cookieValue: string | null): boolean {
  if (!stateParam || !cookieValue) return false;

  try {
    const decoded = Buffer.from(stateParam, "base64url").toString("utf-8");
    if (decoded !== cookieValue) return false;

    const parts = decoded.split(":");
    if (parts.length !== 3) return false;

    const [nonce, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // State expired after 15 minutes
    if (isNaN(timestamp) || Date.now() - timestamp > 15 * 60 * 1000) {
      return false;
    }

    const payload = `${nonce}:${timestamp}`;
    const expectedSig = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

/**
 * Default Instagram database seed
 */
export function getDefaultInstagramDb(): InstagramDatabase {
  return {
    connection: {
      id: "ig-conn-initial",
      instagramUserId: "",
      username: "",
      profilePicture: "",
      status: "disconnected",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    settings: {
      id: "social-settings-1",
      instagramEnabled: false,
      autoSyncIntervalHours: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    reels: [],
  };
}

/**
 * Reads Instagram Database from file or initializes if missing
 */
export function readInstagramDb(): InstagramDatabase {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const defaultDb = getDefaultInstagramDb();
      writeInstagramDb(defaultDb);
      return defaultDb;
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
    return JSON.parse(raw) as InstagramDatabase;
  } catch (error) {
    console.error("Error reading instagram.json, returning default:", error);
    return getDefaultInstagramDb();
  }
}

/**
 * Writes Instagram Database to file atomically
 */
export function writeInstagramDb(data: InstagramDatabase): void {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = `${DATA_FILE_PATH}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, DATA_FILE_PATH);
}
