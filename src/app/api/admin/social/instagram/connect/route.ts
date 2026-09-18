import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { generateOAuthState } from "@/lib/instagram-crypto";

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  if (!hasPermission(admin, "social_media.instagram.manage")) {
    return NextResponse.json({ error: "Permission denied: Requires social_media.instagram.manage" }, { status: 403 });
  }

  const { state, signedCookie } = generateOAuthState();

  const cookieStore = await cookies();
  cookieStore.set("ig_oauth_state", signedCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const origin = request.headers.get("origin") || request.headers.get("referer") || "http://localhost:3002";
  const urlObj = new URL(origin);
  const appUrl = `${urlObj.protocol}//${urlObj.host}`;
  const redirectUri = `${appUrl}/api/admin/social/instagram/callback`;

  let authUrl: string;

  if (clientId && clientId !== "demo") {
    // Official Meta / Instagram Graph API OAuth 2.0 Authorization URL
    authUrl = `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=user_profile,user_media&response_type=code&state=${encodeURIComponent(state)}`;
  } else {
    // Sandbox / Development OAuth Consent Simulation
    authUrl = `/api/admin/social/instagram/sandbox-consent?state=${encodeURIComponent(state)}`;
  }

  return NextResponse.json({
    authUrl,
    mode: clientId ? "production" : "sandbox",
  });
}
