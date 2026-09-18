import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb, encryptToken } from "@/lib/instagram-crypto";
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
    const { accessToken, username: customUsername } = body;

    const now = new Date().toISOString();
    const db = readInstagramDb();

    // Mode 1: Connect via Real Access Token (Meta Graph API)
    if (accessToken && typeof accessToken === "string" && accessToken.trim()) {
      const cleanToken = accessToken.trim();

      // Test token with official Instagram Graph API /me endpoint
      const meRes = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${encodeURIComponent(
          cleanToken
        )}`
      );
      const meData = await meRes.json();

      if (!meRes.ok || meData.error) {
        return NextResponse.json(
          {
            error:
              meData.error?.message ||
              "Invalid Instagram Access Token. Could not authenticate with Meta Graph API.",
          },
          { status: 400 }
        );
      }

      const instagramUserId = String(meData.id || `ig-${Date.now()}`);
      const username = String(meData.username || customUsername || "instagram_user");

      // Fetch user's real reels and media from Instagram
      let realReels: InstagramReel[] = [];
      try {
        const mediaRes = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${encodeURIComponent(
            cleanToken
          )}`
        );
        const mediaData = await mediaRes.json();

        if (Array.isArray(mediaData.data)) {
          realReels = mediaData.data.map((item: any, idx: number) => ({
            id: `ig-reel-${Date.now()}-${idx}`,
            instagramMediaId: String(item.id),
            username: username,
            caption: item.caption || `Instagram Post by @${username}`,
            thumbnailUrl: item.thumbnail_url || item.media_url || "/images/gallery_crowd_hands.jpg",
            permalink: item.permalink || `https://www.instagram.com/${username}/`,
            mediaType: item.media_type === "VIDEO" ? "REEL" : "IMAGE",
            publishedAt: item.timestamp || now,
            viewsDisplay: "Live",
            likesCount: 0,
            isVisible: true,
            createdAt: now,
            updatedAt: now,
          }));
        }
      } catch (mediaErr) {
        console.warn("Could not fetch media items with token:", mediaErr);
      }

      // Encrypt token securely with AES-256-GCM
      const { encrypted, iv, tag } = encryptToken(cleanToken);

      db.connection = {
        id: `ig-conn-${Date.now()}`,
        instagramUserId,
        username,
        profilePicture: "/images/DJ-G-SPARK-Light.png",
        accessTokenEncrypted: encrypted,
        tokenIv: iv,
        tokenAuthTag: tag,
        tokenExpiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
        status: "connected",
        connectedAt: now,
        lastSyncedAt: now,
        createdAt: db.connection?.createdAt || now,
        updatedAt: now,
      };

      db.settings.instagramEnabled = true;
      db.settings.updatedAt = now;
      if (realReels.length > 0) {
        db.reels = realReels;
      }

      writeInstagramDb(db);

      return NextResponse.json({
        success: true,
        message: `Real Instagram account @${username} connected successfully with ${realReels.length} reel(s)!`,
        connection: db.connection,
        totalReels: realReels.length,
        reels: db.reels,
      });
    }

    // Mode 2: Connect via Real Username directly
    if (customUsername && typeof customUsername === "string" && customUsername.trim()) {
      const cleanUser = customUsername.trim().replace(/^@/, "");

      db.connection = {
        id: `ig-conn-${Date.now()}`,
        instagramUserId: `real-${Date.now()}`,
        username: cleanUser,
        profilePicture: "/images/DJ-G-SPARK-Light.png",
        status: "connected",
        connectedAt: now,
        lastSyncedAt: now,
        createdAt: db.connection?.createdAt || now,
        updatedAt: now,
      };

      db.settings.instagramEnabled = true;
      db.settings.updatedAt = now;

      writeInstagramDb(db);

      return NextResponse.json({
        success: true,
        message: `Real Instagram profile @${cleanUser} connected successfully! You can now link your real reels.`,
        connection: db.connection,
        totalReels: db.reels.length,
        reels: db.reels,
      });
    }

    return NextResponse.json(
      { error: "Please provide either a Meta Access Token or your real Instagram @username." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Token connect error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to connect real Instagram account" },
      { status: 500 }
    );
  }
}
