import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyOAuthState,
  encryptToken,
  readInstagramDb,
  writeInstagramDb,
  getMetaConfig,
} from "@/lib/instagram-crypto";
import { InstagramReel } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawCode = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");

  const cookieStore = await cookies();
  const oauthCookie = cookieStore.get("ig_oauth_state")?.value || null;

  // 1. Handle explicit cancellation or denial from Meta/Instagram
  if (error) {
    cookieStore.delete("ig_oauth_state");
    const errMsg =
      errorDescription ||
      errorReason ||
      "Instagram authorization was cancelled or denied by user.";
    return NextResponse.redirect(
      new URL(
        `/admin?tab=instagram&error=${encodeURIComponent(errMsg)}`,
        request.url
      )
    );
  }

  // 2. Validate CSRF state
  if (!verifyOAuthState(state, oauthCookie)) {
    cookieStore.delete("ig_oauth_state");
    return NextResponse.redirect(
      new URL(
        "/admin?tab=instagram&error=Invalid+or+expired+OAuth+state.+Please+try+connecting+again.",
        request.url
      )
    );
  }

  // Clear CSRF cookie
  cookieStore.delete("ig_oauth_state");

  if (!rawCode) {
    return NextResponse.redirect(
      new URL(
        "/admin?tab=instagram&error=No+authorization+code+received+from+Instagram.",
        request.url
      )
    );
  }

  // Instagram appends '#_' to the code in the callback URI; strip it out
  const code = rawCode.replace(/#_$/, "");

  try {
    const { clientId, clientSecret, redirectUri, isConfigured } = getMetaConfig(request.url);

    if (!isConfigured) {
      throw new Error(
        "Meta App credentials missing. Please set INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET."
      );
    }

    // 3. Exchange authorization code for short-lived access token
    const tokenFormData = new URLSearchParams();
    tokenFormData.append("client_id", clientId);
    tokenFormData.append("client_secret", clientSecret);
    tokenFormData.append("grant_type", "authorization_code");
    tokenFormData.append("redirect_uri", redirectUri);
    tokenFormData.append("code", code);

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenFormData,
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      const errorMsg =
        tokenData.error_message ||
        tokenData.error?.message ||
        "Failed to exchange code for Instagram access token.";
      throw new Error(errorMsg);
    }

    let accessToken = tokenData.access_token as string;
    let instagramUserId = String(tokenData.user_id || "");
    let tokenExpiresInSeconds = 3600; // Default 1 hour for short-lived token

    // 4. Exchange short-lived token for long-lived access token (60-day validity)
    try {
      const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(
        clientSecret
      )}&access_token=${encodeURIComponent(accessToken)}`;

      const longLivedRes = await fetch(longLivedUrl, { cache: "no-store" });
      const longLivedData = await longLivedRes.json();

      if (longLivedRes.ok && longLivedData.access_token) {
        accessToken = longLivedData.access_token;
        if (longLivedData.expires_in) {
          tokenExpiresInSeconds = Number(longLivedData.expires_in);
        }
      } else {
        console.warn("Long-lived token exchange notice:", longLivedData);
      }
    } catch (llErr: any) {
      console.warn("Could not exchange for long-lived token:", llErr.message);
    }

    // 5. Fetch Real Instagram Profile (username, profile picture, account type)
    let username = "instagram_artist";
    let profilePicture = "/images/dj_hero.jpg";

    try {
      const meRes = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(
          accessToken
        )}`,
        { cache: "no-store" }
      );
      const meData = await meRes.json();

      if (meRes.ok && meData) {
        if (meData.username) username = meData.username;
        if (meData.id) instagramUserId = String(meData.id);
        if (meData.profile_picture_url) profilePicture = meData.profile_picture_url;
      }
    } catch (meErr: any) {
      console.warn("Could not fetch user profile:", meErr.message);
    }

    const now = new Date().toISOString();
    const tokenExpiresAt = Date.now() + tokenExpiresInSeconds * 1000;

    // 6. Fetch initial real Reels & Media from connected account
    const initialReels: InstagramReel[] = [];
    try {
      const mediaRes = await fetch(
        `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=30&access_token=${encodeURIComponent(
          accessToken
        )}`,
        { cache: "no-store" }
      );
      const mediaData = await mediaRes.json();

      if (mediaRes.ok && Array.isArray(mediaData.data)) {
        for (const item of mediaData.data) {
          initialReels.push({
            id: `ig-reel-${item.id}`,
            instagramMediaId: String(item.id),
            username,
            caption: item.caption || `Performance by @${username}`,
            thumbnailUrl:
              item.thumbnail_url || item.media_url || "/images/dj_hero.jpg",
            permalink:
              item.permalink || `https://www.instagram.com/reel/${item.id}/`,
            mediaType: item.media_type === "VIDEO" ? "REEL" : "IMAGE",
            publishedAt: item.timestamp || now,
            viewsDisplay: "Reel",
            likesCount: item.like_count || 0,
            isVisible: initialReels.length < 4, // Auto-select the first 4 reels
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } catch (mediaErr: any) {
      console.warn("Could not fetch initial media:", mediaErr.message);
    }



    // 7. Securely encrypt the long-lived token at rest with AES-256-GCM
    const { encrypted, iv, tag } = encryptToken(accessToken);

    const db = await readInstagramDb();

    db.connection = {
      id: db.connection?.id || `ig-conn-${Date.now()}`,
      instagramUserId,
      username,
      profilePicture,
      accessTokenEncrypted: encrypted,
      tokenIv: iv,
      tokenAuthTag: tag,
      tokenExpiresAt,
      status: "connected",
      connectedAt: now,
      lastSyncedAt: now,
      createdAt: db.connection?.createdAt || now,
      updatedAt: now,
    };

    db.settings.instagramEnabled = true;
    db.settings.updatedAt = now;

    // Account Switching Isolation:
    // Completely replace reels with the new account's reels and auto-select up to 4
    db.reels = initialReels;
    db.selectedReelIds = initialReels.filter((r) => r.isVisible).map((r) => r.id);

    // Multi-Account Extensibility (Smash Balloon Architecture)
    db.sources = db.sources || [];
    const sourceIndex = db.sources.findIndex(
      (s) => s.instagramUserId === instagramUserId || s.username === username
    );
    const sourceObj = {
      id: db.connection.id,
      instagramUserId,
      username,
      profilePicture,
      status: "connected" as const,
      connectedAt: now,
      lastSyncedAt: now,
      tokenExpiresAt,
    };
    if (sourceIndex >= 0) {
      db.sources[sourceIndex] = sourceObj;
    } else {
      db.sources.push(sourceObj);
    }
    db.activeAccountId = db.connection.id;

    await writeInstagramDb(db);

    return NextResponse.redirect(
      new URL(
        `/admin?tab=instagram&success=${encodeURIComponent(
          `Real Instagram account @${username} connected successfully with ${initialReels.length} reel(s)! Your website feed is now live.`
        )}`,
        request.url
      )
    );
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(
        `/admin?tab=instagram&error=${encodeURIComponent(
          err.message || "Failed to finalize Instagram connection."
        )}`,
        request.url
      )
    );
  }
}
