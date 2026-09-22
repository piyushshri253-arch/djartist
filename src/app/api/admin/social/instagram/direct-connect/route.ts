import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";
import { InstagramReel } from "@/types";

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const rawUsername = body.username || "";
    const cleanUsername = rawUsername.replace(/^@/, "").trim();

    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram username." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const tokenExpiresAt = Date.now() + 60 * 24 * 60 * 60 * 1000;

    const db = await readInstagramDb();

    delete db.connection.accessTokenEncrypted;
    delete db.connection.tokenIv;
    delete db.connection.tokenAuthTag;

    db.connection = {
      id: `ig-conn-${Date.now()}`,
      instagramUserId: `ig-user-${cleanUsername}`,
      username: cleanUsername,
      profilePicture: body.profilePicture || "/images/dj_hero.jpg",
      status: "connected",
      tokenExpiresAt,
      connectedAt: now,
      lastSyncedAt: now,
      createdAt: db.connection?.createdAt || now,
      updatedAt: now,
    };

    db.settings.instagramEnabled = true;
    db.settings.updatedAt = now;

    const initialReels: InstagramReel[] = [];
    if (Array.isArray(body.reelUrls) && body.reelUrls.length > 0) {
      body.reelUrls.forEach((url: string, index: number) => {
        if (!url || typeof url !== "string") return;
        const match = url.match(/(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i);
        const shortcode = match ? match[1] : "";
        if (!shortcode) return;
        initialReels.push({
          id: `ig-reel-${shortcode}`,
          instagramMediaId: shortcode,
          username: cleanUsername,
          caption: `Reel // @${cleanUsername}`,
          thumbnailUrl: "",
          permalink: url.startsWith("http") ? url : `https://www.instagram.com/reel/${shortcode}/`,
          mediaType: "REEL",
          publishedAt: now,
          viewsDisplay: "Featured",
          likesCount: 0,
          isVisible: index < 4,
          createdAt: now,
          updatedAt: now,
        });
      });
      db.reels = initialReels;
      db.selectedReelIds = initialReels.filter((r) => r.isVisible).map((r) => r.id);
    } else {
      // Retain existing real reels if any
      initialReels.push(...(db.reels || []));
    }

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      message: `Instagram account @${cleanUsername} connected successfully!`,
      connection: {
        username: cleanUsername,
        status: "connected",
        connectedAt: now,
      },
      reels: initialReels,
    });
  } catch (error: any) {
    console.error("Direct connect error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect Instagram account." },
      { status: 500 }
    );
  }
}
