import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dj_admin_session";

export interface AdminUser {
  email: string;
  role: string;
  name: string;
  permissions: string[];
}

// Global in-memory session version for instant multi-device revocation ("Logout from all devices")
let currentSessionVersion = 1;

export function revokeAllSessions(): void {
  currentSessionVersion += 1;
}

export function getCurrentSessionVersion(): number {
  return currentSessionVersion;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[SECURITY CRITICAL] SESSION_SECRET must be configured in production environment variables.");
    }
    return "spark-session-secret-hardened-2026-fallback-salt";
  }
  return secret;
}

/**
 * Validates password strength according to enterprise security policy:
 * - Minimum 10 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one numeric digit
 * - At least one special symbol
 */
export function validatePasswordPolicy(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 10) {
    return { valid: false, message: "Password must be at least 10 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one numeric digit." };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character." };
  }
  return { valid: true };
}

/**
 * Creates a signed token containing user data, session version, and expiration timestamp
 */
export function createSessionToken(email: string): string {
  const secret = getSessionSecret();
  const sessionId = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = Buffer.from(
    JSON.stringify({
      email,
      sessionId,
      sessionVersion: currentSessionVersion,
      expiresAt,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Verifies the signed session token, checks expiration, and validates session version
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

    // Timing-safe signature verification to prevent side-channel attacks
    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedSigBuffer.length) return { valid: false };
    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) return { valid: false };

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!data.expiresAt || data.expiresAt < Date.now()) {
      return { valid: false };
    }

    // Reject tokens created before a session revocation event
    if (data.sessionVersion && data.sessionVersion < currentSessionVersion) {
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
    record.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
    record.attempts = 0;
  }
  loginAttempts.set(ip, record);
}

export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}

// ---------------------------------------------------------------------------
// TWO-FACTOR AUTHENTICATION (2FA / MFA)
// Supports RFC 6238 TOTP (Google Authenticator) or static Admin MFA PIN
// ---------------------------------------------------------------------------
function base32Decode(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/[^A-Z2-7]/g, "");
  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

export function generateTotp(secretBase32: string, timeStep = 30, windowOffset = 0): string {
  try {
    const key = base32Decode(secretBase32);
    const counter = Math.floor(Date.now() / 1000 / timeStep) + windowOffset;
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(BigInt(counter), 0);
    const hmac = crypto.createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    return String(code).padStart(6, "0");
  } catch {
    return "";
  }
}

export function isMfaConfigured(): boolean {
  return Boolean(
    (process.env.ADMIN_MFA_SECRET || process.env.ADMIN_2FA_SECRET || "").trim() ||
    (process.env.ADMIN_MFA_PIN || process.env.ADMIN_2FA_PIN || "").trim()
  );
}

export function verifyMfa(mfaCodeInput: string): boolean {
  const cleanCode = (mfaCodeInput || "").trim().replace(/\s+/g, "");
  if (!cleanCode) return false;

  // 1. Static Secure Secondary PIN check
  const staticPin = (process.env.ADMIN_MFA_PIN || process.env.ADMIN_2FA_PIN || "").trim();
  if (staticPin) {
    if (cleanCode.length === staticPin.length && crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(staticPin))) {
      return true;
    }
  }

  // 2. RFC 6238 TOTP Check (Google / Microsoft / Apple Authenticator)
  const totpSecret = (process.env.ADMIN_MFA_SECRET || process.env.ADMIN_2FA_SECRET || "").trim();
  if (totpSecret) {
    for (const offset of [0, -1, 1]) {
      const expected = generateTotp(totpSecret, 30, offset);
      if (expected && cleanCode.length === expected.length && crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expected))) {
        return true;
      }
    }
  }

  return false;
}

export { COOKIE_NAME };
