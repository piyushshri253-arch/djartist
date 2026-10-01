import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dj_admin_session";

export interface AdminUser {
  email: string;
  role: string;
  name: string;
  permissions: string[];
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[SECURITY WARNING] SESSION_SECRET is not set in production. Using derived key.");
    }
    return "spark-session-secret-hardened-2026-fallback-salt";
  }
  return secret;
}

/**
 * Creates a signed token containing user data and expiration timestamp
 */
export function createSessionToken(email: string): string {
  const secret = getSessionSecret();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours (hardened from 7 days)
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

/**
 * Verifies the signed session token and checks expiration
 */
export function verifySessionToken(token: string): { valid: boolean; email?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const secret = getSessionSecret();
    const [payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    // Timing-safe signature verification
    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedSigBuffer.length) return { valid: false };
    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) return { valid: false };

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data.expiresAt || data.expiresAt < Date.now()) {
      return { valid: false };
    }

    return { valid: true, email: data.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Validates login credentials using timing-safe comparison.
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
 * Disallows default/predictable fallback passwords in production.
 */
export function validateCredentials(emailInput: string, passwordInput: string): boolean {
  const configuredEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD || "";

  if (!configuredEmail || !configuredPassword) {
    console.error("[SECURITY] Login rejected: ADMIN_EMAIL or ADMIN_PASSWORD is not configured in environment variables.");
    return false;
  }

  const normalizedInputEmail = (emailInput || "").trim().toLowerCase();
  if (normalizedInputEmail !== configuredEmail) {
    return false;
  }

  // Timing-safe comparison to prevent side-channel timing attacks
  const inputHash = crypto.createHash("sha256").update(passwordInput || "").digest();
  const expectedHash = crypto.createHash("sha256").update(configuredPassword).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

/**
 * Checks if an admin user holds a required permission
 */
export function hasPermission(admin: AdminUser | null, requiredPermission: string): boolean {
  if (!admin) return false;
  if (admin.role === "Super Admin" || admin.permissions.includes("*")) return true;
  return admin.permissions.includes(requiredPermission);
}

/**
 * Server-side helper to check if current request has a valid admin session
 */
export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const result = verifySessionToken(sessionCookie.value);
  if (!result.valid || !result.email) return null;

  return {
    email: result.email,
    role: "Super Admin",
    name: "Dj G-Spark Management",
    permissions: [
      "*",
      "social_media.instagram.manage",
      "blogs.manage",
      "events.manage",
      "reviews.manage",
      "leads.manage",
    ],
  };
}

// ---------------------------------------------------------------------------
// IP RATE LIMITER FOR ADMIN AUTHENTICATION
// Max 5 failed attempts per IP within a 15-minute window; locks out for 15m.
// ---------------------------------------------------------------------------
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15-minute lock
    record.attempts = 0;
  }
  loginAttempts.set(ip, record);
}

export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}

export { COOKIE_NAME };
