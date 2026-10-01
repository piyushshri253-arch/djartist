import { NextResponse } from "next/server";

/**
 * Sanitizes a string against Cross-Site Scripting (XSS), script injections,
 * malicious HTML tags, and event handlers.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";

  let cleaned = input
    // Strip script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Strip iframe, object, embed, frame tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    // Strip inline javascript handlers: onerror, onload, onclick, etc.
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^>\s]+/gi, "")
    // Strip dangerous URL schemes
    .replace(/javascript\s*:/gi, "blocked-scheme:")
    .replace(/data\s*:\s*text\/html/gi, "blocked-scheme:")
    .replace(/vbscript\s*:/gi, "blocked-scheme:")
    // Strip explicit HTML angle brackets if strictly text-based
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return cleaned.trim();
}

/**
 * Validates external or internal URLs to prevent open redirects and javascript: execution
 */
export function isSafeUrl(urlStr: unknown): boolean {
  if (typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return true;

  // Relative paths are safe
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Whitelists allowed fields from an incoming untrusted object.
 * Protects against Mass-Assignment vulnerabilities (e.g. injecting isAdmin: true).
 */
export function whitelistFields<T extends Record<string, any>>(
  input: any,
  allowedKeys: (keyof T)[]
): Partial<T> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const result: Partial<T> = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const val = input[key];
      if (typeof val === "string") {
        (result as any)[key] = sanitizeString(val);
      } else if (Array.isArray(val)) {
        (result as any)[key] = val.map((item) =>
          typeof item === "string" ? sanitizeString(item) : item
        );
      } else if (typeof val === "boolean" || typeof val === "number") {
        (result as any)[key] = val;
      }
    }
  }

  return result;
}

/**
 * Validates request origin against allowed host to mitigate CSRF attacks
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    // If neither is present, rely on SameSite cookie protection
    return true;
  }

  try {
    const originUrl = new URL(origin);
    // Allow matching host or local development
    if (originUrl.host === host) return true;
    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") return true;
    if (originUrl.hostname.endsWith(".vercel.app")) return true;
    if (originUrl.hostname.endsWith("djgspark.com")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Standard security response for unauthorized requests
 */
export function unauthorizedResponse(message = "Unauthorized access") {
  return NextResponse.json(
    { error: message },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

/**
 * Standard security response for forbidden requests
 */
export function forbiddenResponse(message = "Forbidden: Insufficient privileges") {
  return NextResponse.json(
    { error: message },
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
