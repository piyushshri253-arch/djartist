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

    // Extract shortcode from standard Instagram formats (e.g. instagram.com/reel/C3abc123/ or /p/C3abc123/)
    const match = reelUrl.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
    const shortcode = match ? match[1] : `custom-${Date.now()}`;

    const db = await readInstagramDb();
    const now = new Date().toISOString();
    const username = db.connection.username || "instagram_artist";

    // Check if already exists
    const existingIndex = db.reels.findIndex(
      (r) => r.instagramMediaId === shortcode || r.permalink === reelUrl
    );

    const newReel: InstagramReel = {
      id: `ig-reel-${shortcode}`,
      instagramMediaId: shortcode,
      username,
      caption: customCaption || `Performance Reel by @${username}`,
      thumbnailUrl: body.thumbnailUrl || "/images/dj_hero.jpg",
      permalink: reelUrl.startsWith("http") ? reelUrl : `https://www.instagram.com/reel/${shortcode}/`,
      mediaType: "REEL",
      publishedAt: now,
      viewsDisplay: "Featured Reel",
      likesCount: body.likesCount || 0,
      isVisible: true, // newly added reels are selected
      createdAt: now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      db.reels[existingIndex] = newReel;
    } else {
      db.reels.unshift(newReel);
    }

    // Ensure selectedReelIds contains this reel (strictly enforce max 4)
    db.selectedReelIds = db.selectedReelIds || [];
    if (!db.selectedReelIds.includes(newReel.id)) {
      if (db.selectedReelIds.length >= 4) {
        db.selectedReelIds = [newReel.id, ...db.selectedReelIds.slice(0, 3)];
      } else {
        db.selectedReelIds.push(newReel.id);
      }
    }

    // Update isVisible flag on all reels according to selectedReelIds
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
