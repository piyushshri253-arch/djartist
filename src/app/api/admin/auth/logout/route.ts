import { NextResponse } from "next/server";
import { COOKIE_NAME, getAuthenticatedAdmin, revokeAllSessions } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  let logoutAll = false;

  try {
    const body = await request.json().catch(() => ({}));
    logoutAll = Boolean(body?.logoutAll);
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

  const response = NextResponse.json({
    success: true,
    message: logoutAll ? "Logged out from all devices" : "Logged out successfully",
  });

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
