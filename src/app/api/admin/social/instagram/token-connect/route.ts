import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import {
  readInstagramDb,
  writeInstagramDb,
  encryptToken,
} from "@/lib/instagram-crypto";
import { InstagramReel } from "@/types";

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

  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken || typeof accessToken !== "string" || !accessToken.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid Meta / Instagram Graph API Access Token." },
        { status: 400 }
      );
    }

    const cleanToken = accessToken.trim();
    const now = new Date().toISOString();

    // 1. Authenticate with official Meta Graph API
    const meRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(
        cleanToken
      )}`,
      { cache: "no-store" }
    );
    const meData = await meRes.json();

    if (!meRes.ok || meData.error) {
      return NextResponse.json(
        {
          error:
            meData.error?.message ||
            "Invalid Instagram Access Token. Could not authenticate with Meta Graph API.",
          code: "META_AUTH_FAILED",
        },
        { status: 400 }
      );
    }

    const instagramUserId = String(meData.id);
    const username = String(meData.username || "instagram_user");
    const profilePicture = meData.profile_picture_url || "/images/dj_hero.jpg";

    // 2. Fetch real media and reels from the connected account
    const realReels: InstagramReel[] = [];
    try {
      const mediaRes = await fetch(
        `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=50&access_token=${encodeURIComponent(
          cleanToken
        )}`,
        { cache: "no-store" }
      );
      const mediaData = await mediaRes.json();

      if (mediaRes.ok && Array.isArray(mediaData.data)) {
        for (const item of mediaData.data) {
          realReels.push({
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
            isVisible: realReels.length < 4, // Auto-select the first 4 reels
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    } catch (mediaErr) {
      console.warn("Could not fetch media items with token:", mediaErr);
    }

    // If no media items were returned via API, keep existing real reels
    if (realReels.length === 0) {
      const existingDb = await readInstagramDb();
      realReels.push(...(existingDb.reels || []));
    }

    // 3. Encrypt access token securely at rest with AES-256-GCM
    const { encrypted, iv, tag } = encryptToken(cleanToken);

    const db = await readInstagramDb();

    db.connection = {
      id: `ig-conn-${Date.now()}`,
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

    db.settings.instagramEnabled = true;
    db.settings.updatedAt = now;

    // Completely replace reels with the new account's reels and auto-select up to 4
    db.reels = realReels;
    db.selectedReelIds = realReels.filter((r) => r.isVisible).map((r) => r.id);

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      message: `Real Instagram account @${username} connected successfully with ${realReels.length} reel(s)! Your website feed is now live.`,
      connection: {
        id: db.connection.id,
        instagramUserId: db.connection.instagramUserId,
        username: db.connection.username,
        profilePicture: db.connection.profilePicture,
        status: db.connection.status,
        connectedAt: db.connection.connectedAt,
        lastSyncedAt: db.connection.lastSyncedAt,
      },
      totalReels: realReels.length,
      reels: db.reels,
    });
  } catch (err: any) {
    console.error("Token connect error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to connect Instagram account" },
      { status: 500 }
    );
  }
}
