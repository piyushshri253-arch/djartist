import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { generateOAuthState, getMetaConfig } from "@/lib/instagram-crypto";

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  if (!hasPermission(admin, "social_media.instagram.manage")) {
    return NextResponse.json(
      { error: "Permission denied: Requires social_media.instagram.manage" },
      { status: 403 }
    );
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

  const { clientId, clientSecret, redirectUri, isConfigured } = getMetaConfig(request.url);

  if (!isConfigured) {
    return NextResponse.json(
      {
        error: "Meta / Instagram App credentials are not configured in environment variables.",
        code: "META_CREDENTIALS_MISSING",
        details:
          "Please add INSTAGRAM_CLIENT_ID (or META_APP_ID) and INSTAGRAM_CLIENT_SECRET (or META_APP_SECRET) to your .env.local or Vercel Environment Variables.",
        requiredRedirectUri: redirectUri,
        requiredScope: "instagram_business_basic",
      },
      { status: 400 }
    );
  }

  // Official Meta Instagram Login OAuth 2.0 Authorization Endpoint
  // enable_fb_login=0 and force_reauth=true force the direct Instagram username/password login screen
  const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_reauth=true&force_authentication=1&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=instagram_business_basic&response_type=code&state=${encodeURIComponent(
    state
  )}`;

  return NextResponse.json({
    success: true,
    authUrl,
    redirectUri,
  });
}

