import { NextResponse } from "next/server";
import { readInstagramDb } from "@/lib/instagram-crypto";

export async function GET() {
  const db = await readInstagramDb();

  // If global section is explicitly disabled by admin, return disabled
  if (db.settings.instagramEnabled === false) {
    return NextResponse.json({
      enabled: false,
      username: db.connection.username || "Dj G-Spark",
      totalReels: 0,
      reels: [],
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  }

  // Filter ONLY reels where isVisible === true, capped strictly at maximum 4
  const visibleReels = db.reels
    .filter((reel) => reel.isVisible === true)
    .slice(0, 4)
    .map((reel) => ({
      id: reel.id,
      instagramMediaId: reel.instagramMediaId,
      username: reel.username,
      caption: reel.caption,
      thumbnailUrl: reel.thumbnailUrl,
      permalink: reel.permalink,
      mediaType: reel.mediaType,
      publishedAt: reel.publishedAt,
      viewsDisplay: reel.viewsDisplay || "Viral",
      likesCount: reel.likesCount || 0,
      commentsCount: reel.commentsCount || 0,
    }));

  return NextResponse.json({
    enabled: visibleReels.length > 0,
    account: {
      username: db.connection.username || "Dj G-Spark",
      profilePicture: db.connection.profilePicture || "/images/dj_hero.jpg",
      profileUrl: db.connection.username
        ? `https://instagram.com/${db.connection.username}`
        : "https://instagram.com/djgspark",
      status: "connected",
      lastSyncedAt: db.connection.lastSyncedAt,
    },
    totalReels: visibleReels.length,
    reels: visibleReels,
  }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" }
  });
}
