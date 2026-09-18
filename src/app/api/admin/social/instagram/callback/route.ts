import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyOAuthState, encryptToken, readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const cookieStore = await cookies();
  const oauthCookie = cookieStore.get("ig_oauth_state")?.value || null;

  // Handle explicit cancellation or denial from Instagram
  if (error) {
    cookieStore.delete("ig_oauth_state");
    return NextResponse.redirect(
      new URL(`/admin?tab=instagram&error=${encodeURIComponent(errorDescription || "Instagram authorization was cancelled.")}`, request.url)
    );
  }

  // Validate CSRF state
  if (!verifyOAuthState(state, oauthCookie)) {
    cookieStore.delete("ig_oauth_state");
    return NextResponse.redirect(
      new URL("/admin?tab=instagram&error=Invalid+or+expired+OAuth+state.+Please+try+again.", request.url)
    );
  }

  // Clear CSRF cookie
  cookieStore.delete("ig_oauth_state");

  try {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

    let accessToken = "";
    let instagramUserId = "17841400000000001";
    let username = "djgspark.music";
    let profilePicture = "/images/dj_hero.jpg";

    if (clientId && clientSecret && !code?.startsWith("sandbox_code_")) {
      // Production Meta OAuth Exchange
      const origin = new URL(request.url).origin;
      const redirectUri = `${origin}/api/admin/social/instagram/callback`;

      const tokenFormData = new URLSearchParams();
      tokenFormData.append("client_id", clientId);
      tokenFormData.append("client_secret", clientSecret);
      tokenFormData.append("grant_type", "authorization_code");
      tokenFormData.append("redirect_uri", redirectUri);
      tokenFormData.append("code", code || "");

      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        body: tokenFormData,
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_message || "Failed to exchange authorization code for token");
      }

      accessToken = tokenData.access_token;
      instagramUserId = String(tokenData.user_id || instagramUserId);

      // Exchange short-lived token for 60-day long-lived token
      try {
        const longLivedRes = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${accessToken}`
        );
        const longLivedData = await longLivedRes.json();
        if (longLivedData.access_token) {
          accessToken = longLivedData.access_token;
        }
      } catch (err) {
        console.warn("Could not exchange for long-lived token, continuing with standard token:", err);
      }

      // Fetch user profile info
      try {
        const userRes = await fetch(
          `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
        );
        const userData = await userRes.json();
        if (userData.username) {
          username = userData.username;
        }
      } catch (err) {
        console.warn("Could not fetch user profile details:", err);
      }
    } else {
      // Sandbox / Simulated Authorized Credentials
      accessToken = `IGQWRP_SECURE_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    }

    // Encrypt access token at rest using AES-256-GCM
    const { encrypted, iv, tag } = encryptToken(accessToken);

    const db = readInstagramDb();
    const now = new Date().toISOString();

    db.connection = {
      id: db.connection?.id || `ig-conn-${Date.now()}`,
      instagramUserId,
      username,
      profilePicture,
      accessTokenEncrypted: encrypted,
      tokenIv: iv,
      tokenAuthTag: tag,
      tokenExpiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
      status: "connected",
      connectedAt: now,
      lastSyncedAt: now,
      createdAt: db.connection?.createdAt || now,
      updatedAt: now,
    };

    // Auto-enable section upon connecting
    db.settings.instagramEnabled = true;
    db.settings.updatedAt = now;

    writeInstagramDb(db);

    return NextResponse.redirect(
      new URL("/admin?tab=instagram&success=Instagram+account+connected+successfully!", request.url)
    );
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/admin?tab=instagram&error=${encodeURIComponent(err.message || "Failed to finalize Instagram connection")}`, request.url)
    );
  }
}
