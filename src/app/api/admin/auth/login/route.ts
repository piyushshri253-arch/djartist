import { NextResponse } from "next/server";
import {
  validateCredentials,
  createSessionToken,
  COOKIE_NAME,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/auth";
import { validateOrigin } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 0. CSRF / Origin Validation
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    // 1. IP Rate Limiting Check
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0] : realIp || "127.0.0.1").trim();

    const rateLimit = checkLoginRateLimit(clientIp);
    if (!rateLimit.allowed) {
      await logAdminAction({
        action: "FAILED_LOGIN",
        adminEmail: "rate_limited",
        ip: clientIp,
        status: "FAILURE",
        details: { reason: "Rate limited" },
      });

      return NextResponse.json(
        {
          error: `Too many failed login attempts from this IP. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds || 900),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      recordFailedLogin(clientIp);
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Validate Credentials with Timing-Safe verification
    const isValid = validateCredentials(email, password);
    if (!isValid) {
      recordFailedLogin(clientIp);
      await logAdminAction({
        action: "FAILED_LOGIN",
        adminEmail: String(email).slice(0, 50),
        ip: clientIp,
        status: "FAILURE",
      });

      return NextResponse.json(
        { error: "Invalid email or password. Access denied." },
        { status: 401 }
      );
    }

    // 3. Clear rate limit record on successful login
    recordSuccessfulLogin(clientIp);

    await logAdminAction({
      action: "LOGIN",
      adminEmail: email,
      ip: clientIp,
      status: "SUCCESS",
    });

    const token = createSessionToken(email);
    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user: {
        email,
        name: "Dj G-Spark Management",
        role: "Super Admin",
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication service error" }, { status: 500 });
  }
}
