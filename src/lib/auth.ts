import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@djgspark.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "SparkAdmin2026!";
const SESSION_SECRET = process.env.SESSION_SECRET || "spark-super-secret-key-dj-2026-prod";
const COOKIE_NAME = "dj_admin_session";

export interface AdminUser {
  email: string;
  role: string;
  name: string;
  permissions: string[];
}

/**
 * Creates a signed token containing user data and expiration timestamp
 */
export function createSessionToken(email: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
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

    const [payload, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("base64url");

    if (signature !== expectedSig) return { valid: false };

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
 * Validates login credentials
 */
export function validateCredentials(emailInput: string, passwordInput: string): boolean {
  return (
    emailInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    passwordInput === ADMIN_PASSWORD
  );
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
    name: "DJ G Spark Management",
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

export { COOKIE_NAME };
