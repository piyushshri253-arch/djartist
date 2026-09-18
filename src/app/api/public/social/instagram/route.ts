import { NextResponse } from "next/server";
import { readInstagramDb } from "@/lib/instagram-crypto";

export async function GET() {
  const db = readInstagramDb();

  // If global section is disabled or account is not connected, return disabled state
  if (!db.settings.instagramEnabled || db.connection.status !== "connected") {
    return NextResponse.json({
      enabled: false,
      username: db.connection.username,
      totalReels: 0,
      reels: [],
    }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  }

  // Filter ONLY reels where isVisible === true
  const visibleReels = db.reels
    .filter((reel) => reel.isVisible === true)
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
    }));

  return NextResponse.json({
    enabled: true,
    account: {
      username: db.connection.username,
      profilePicture: db.connection.profilePicture,
      profileUrl: `https://instagram.com/${db.connection.username}`,
      status: db.connection.status,
      lastSyncedAt: db.connection.lastSyncedAt,
    },
    totalReels: visibleReels.length,
    reels: visibleReels,
  }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" }
  });
}
