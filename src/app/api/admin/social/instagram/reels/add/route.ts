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
    const reelUrl = (body.url || "").trim();
    const customCaption = (body.caption || "").trim();

    if (!reelUrl) {
      return NextResponse.json(
        { error: "Please enter a valid Instagram Reel URL." },
        { status: 400 }
      );
    }

    // Extract shortcode from standard Instagram formats (reels, reel, p, tv, share/reel)
    const match = reelUrl.match(/(?:reels?|p|tv|share\/reel)\/([A-Za-z0-9_-]+)/i);
    const shortcode = match ? match[1] : `reel-${Date.now()}`;
    const cleanPermalink = reelUrl.startsWith("http")
      ? reelUrl.split("?")[0].replace(/\/+$/, "") + "/"
      : `https://www.instagram.com/reel/${shortcode}/`;

    const db = await readInstagramDb();
    const now = new Date().toISOString();
    const username = db.connection.username || "djgspark";

    // Dynamic rotation of concert/stage thumbnails if no custom thumbnail is provided
    const fallbackPosters = [
      "/images/past_event_crowd.jpg",
      "/images/gallery_stage_lasers.jpg",
      "/images/gallery_dj_decks_pov.jpg",
      "/images/world_tour_stage.jpg",
      "/images/dj_hero.jpg",
    ];
    const defaultThumbnail =
      fallbackPosters[db.reels.length % fallbackPosters.length];

    // Check if already exists in library
    const existingIndex = db.reels.findIndex(
      (r) => r.instagramMediaId === shortcode || r.permalink.includes(shortcode)
    );

    db.selectedReelIds = db.selectedReelIds || [];
    const shouldBeVisible = db.selectedReelIds.length < 4;

    const newReel: InstagramReel = {
      id: `ig-reel-${shortcode}`,
      instagramMediaId: shortcode,
      username,
      caption: customCaption || `Instagram Reel // @${username}`,
      thumbnailUrl: body.thumbnailUrl || defaultThumbnail,
      permalink: cleanPermalink,
      mediaType: "REEL",
      publishedAt: now,
      viewsDisplay: "Featured",
      likesCount: body.likesCount || 0,
      isVisible: shouldBeVisible,
      createdAt: now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      db.reels[existingIndex] = {
        ...db.reels[existingIndex],
        caption: customCaption || db.reels[existingIndex].caption,
        thumbnailUrl: body.thumbnailUrl || db.reels[existingIndex].thumbnailUrl,
        permalink: `https://www.instagram.com/reel/${shortcode}/`,
        updatedAt: now,
      };
    } else {
      db.reels.unshift(newReel);
    }

    if (shouldBeVisible && !db.selectedReelIds.includes(newReel.id)) {
      db.selectedReelIds.push(newReel.id);
    }

    // Auto-enable Instagram section on website
    db.settings.instagramEnabled = true;

    // Keep isVisible flag in sync
    db.reels.forEach((r) => {
      r.isVisible = (db.selectedReelIds || []).includes(r.id);
    });

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      message: `Reel added successfully to website showcase!`,
      reel: newReel,
      reels: db.reels,
      selectedReelIds: db.selectedReelIds,
    });
  } catch (error: any) {
    console.error("Add reel error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add Instagram reel." },
      { status: 500 }
    );
  }
}
