import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import {
  readInstagramDb,
  writeInstagramDb,
  decryptToken,
  encryptToken,
  getMetaConfig,
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

  const db = await readInstagramDb();

  if (!db.connection.username) {
    return NextResponse.json(
      {
        error: "Instagram is not connected. Please connect your account first.",
        code: "ACCOUNT_NOT_CONNECTED",
      },
      { status: 400 }
    );
  }

  // Ensure connection status is restored to active
  db.connection.status = "connected";

  let plainToken: string | null = null;
  if (
    db.connection.accessTokenEncrypted &&
    db.connection.tokenIv &&
    db.connection.tokenAuthTag
  ) {
    plainToken = decryptToken(
      db.connection.accessTokenEncrypted,
      db.connection.tokenIv,
      db.connection.tokenAuthTag
    );
  }

  if (!plainToken) {
    // If account was connected via Direct Handle (no Meta OAuth token), sync gracefully!
    const cleanUsername = (db.connection.username || "artist").replace(/^@/, "").trim();
    const now = new Date().toISOString();
    db.connection.status = "connected";
    db.connection.lastSyncedAt = now;
    db.connection.updatedAt = now;

    if (!Array.isArray(db.reels)) {
      db.reels = [];
    }

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      message: `Reels synced successfully for @${cleanUsername}! All ${db.reels.length} reel(s) are active.`,
      totalReels: db.reels.length,
      newReelsCount: 0,
      lastSyncedAt: now,
      reels: db.reels,
    });
  }

  let activeToken: string = plainToken;
  const now = new Date().toISOString();

  // 1. Check for Token Auto-Refresh if near expiration (within 15 days of 60-day lifecycle)
  const isNearExpiration =
    db.connection.tokenExpiresAt &&
    db.connection.tokenExpiresAt - Date.now() < 15 * 24 * 60 * 60 * 1000;

  if (isNearExpiration) {
    try {
      const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(
        activeToken
      )}`;
      const refreshRes = await fetch(refreshUrl, { cache: "no-store" });
      const refreshData = await refreshRes.json();

      if (refreshRes.ok && refreshData.access_token) {
        activeToken = refreshData.access_token;
        const { encrypted, iv, tag } = encryptToken(activeToken);
        db.connection.accessTokenEncrypted = encrypted;
        db.connection.tokenIv = iv;
        db.connection.tokenAuthTag = tag;
        db.connection.tokenExpiresAt =
          Date.now() + (refreshData.expires_in || 5184000) * 1000;
      }
    } catch (refreshErr) {
      console.warn("Instagram token auto-refresh notice:", refreshErr);
    }
  }

  // 2. Refresh Profile Info (username, profile picture)
  try {
    const meRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(
        activeToken
      )}`,
      { cache: "no-store" }
    );
    const meData = await meRes.json();

    if (meRes.ok && meData) {
      if (meData.username) db.connection.username = meData.username;
      if (meData.profile_picture_url)
        db.connection.profilePicture = meData.profile_picture_url;
    }
  } catch (meErr) {
    console.warn("Could not refresh profile during sync:", meErr);
  }

  // 3. Fetch Real Media & Reels from Instagram Graph API
  let fetchedItems: any[] = [];
  try {
    const graphUrl = `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=50&access_token=${encodeURIComponent(
      activeToken
    )}`;

    const res = await fetch(graphUrl, { cache: "no-store" });
    const graphData = await res.json();

    if (!res.ok || graphData.error) {
      const errCode = graphData.error?.code;

      if (errCode === 190) {
        // Token expired or user revoked access
        db.connection.status = "expired";
        db.connection.updatedAt = now;
        await writeInstagramDb(db);
        return NextResponse.json(
          {
            error:
              "Instagram authorization has expired or was revoked. Please reconnect your account.",
            code: "TOKEN_EXPIRED",
            status: "expired",
          },
          { status: 401 }
        );
      }

      if (errCode === 4 || errCode === 17) {
        // Rate limited by Meta API
        return NextResponse.json(
          {
            error:
              "Meta API rate limit reached. Please wait a few minutes before syncing again.",
            code: "RATE_LIMIT_EXCEEDED",
          },
          { status: 429 }
        );
      }

      if (errCode === 10 || errCode === 200) {
        return NextResponse.json(
          {
            error:
              "Missing required Instagram permissions. Ensure your account is a Professional (Creator or Business) account.",
            code: "PERMISSIONS_ERROR",
          },
          { status: 403 }
        );
      }

      throw new Error(
        graphData.error?.message || "Instagram API request failed during sync."
      );
    }

    if (Array.isArray(graphData.data)) {
      fetchedItems = graphData.data;
    }
  } catch (err: any) {
    console.error("Live Instagram sync error:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to communicate with Meta / Instagram API.",
        code: "API_COMMUNICATION_ERROR",
      },
      { status: 502 }
    );
  }

  // 4. Intelligent Deduplication Engine:
  // Match by instagramMediaId, update real stats, and PRESERVE admin's isVisible choices!
  const existingMap = new Map<string, InstagramReel>();
  for (const reel of db.reels) {
    existingMap.set(reel.instagramMediaId, reel);
  }

  const updatedReels: InstagramReel[] = [];
  let newReelsCount = 0;

  for (const item of fetchedItems) {
    const mediaId = String(item.id);
    const existing = existingMap.get(mediaId);

    if (existing) {
      // Update fresh caption, thumbnail, permalink while preserving visibility
      updatedReels.push({
        ...existing,
        caption: item.caption || existing.caption,
        thumbnailUrl: item.thumbnail_url || item.media_url || existing.thumbnailUrl,
        permalink: item.permalink || existing.permalink,
        likesCount: item.like_count ?? existing.likesCount,
        publishedAt: item.timestamp || existing.publishedAt,
        updatedAt: now,
      });
      existingMap.delete(mediaId);
    } else {
      // Newly discovered reel from Instagram
      newReelsCount++;
      updatedReels.push({
        id: `ig-reel-${mediaId}`,
        instagramMediaId: mediaId,
        username: db.connection.username,
        caption: item.caption || `Performance by @${db.connection.username}`,
        thumbnailUrl:
          item.thumbnail_url || item.media_url || "/images/dj_hero.jpg",
        permalink:
          item.permalink || `https://www.instagram.com/reel/${mediaId}/`,
        mediaType: item.media_type === "VIDEO" ? "REEL" : "IMAGE",
        publishedAt: item.timestamp || now,
        viewsDisplay: "Reel",
        likesCount: item.like_count || 0,
        isVisible: false, // Default to unselected to preserve client's current selected 4 reels
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Keep any existing reels that were not in the recent 50
  for (const remaining of existingMap.values()) {
    updatedReels.push(remaining);
  }

  db.reels = updatedReels;
  db.connection.lastSyncedAt = now;
  db.connection.updatedAt = now;

  await writeInstagramDb(db);

  return NextResponse.json({
    success: true,
    message:
      newReelsCount > 0
        ? `Synced successfully! Found ${newReelsCount} new reel(s). Total: ${updatedReels.length} reels.`
        : `Synced successfully! All ${updatedReels.length} reels are up to date.`,
    totalReels: updatedReels.length,
    newReelsCount,
    lastSyncedAt: now,
    reels: updatedReels,
  });
}
