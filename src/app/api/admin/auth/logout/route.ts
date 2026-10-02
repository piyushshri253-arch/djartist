import { NextResponse } from "next/server";
import { COOKIE_NAME, getAuthenticatedAdmin, revokeAllSessions } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function performLogout(request: Request) {
  const admin = await getAuthenticatedAdmin();
  let logoutAll = false;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      logoutAll = Boolean(body?.logoutAll);
    }
  } catch {}

  if (logoutAll) {
    revokeAllSessions();
  }

  if (admin) {
    await logAdminAction({
      action: logoutAll ? "SESSION_REVOKED" : "LOGOUT",
      adminEmail: admin.email,
      status: "SUCCESS",
      details: { logoutAll },
    });
  }

  // Redirect to home page ("/") on logout
  const homeUrl = new URL("/", request.url);
  const acceptHeader = request.headers.get("accept") || "";
  const wantsJson = acceptHeader.includes("application/json") && !acceptHeader.includes("text/html");

  const response = wantsJson
    ? NextResponse.json({
        success: true,
        message: logoutAll ? "Logged out from all devices" : "Logged out successfully",
        redirectUrl: "/",
      })
    : NextResponse.redirect(homeUrl, { status: 303 });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}

export async function POST(request: Request) {
  return performLogout(request);
}

export async function GET(request: Request) {
  return performLogout(request);
}
