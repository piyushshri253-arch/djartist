import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";
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
    const { url, caption, thumbnailUrl } = await request.json();

    if (!url || typeof url !== "string" || !url.includes("instagram.com")) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid Instagram Reel or Post link (e.g. https://www.instagram.com/reel/...)",
        },
        { status: 400 }
      );
    }

    const db = await readInstagramDb();
    const now = new Date().toISOString();

    // Extract shortcode from url e.g. /reel/C123abc/ or /p/C123abc/
    const match = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    const shortcode = match ? match[1] : `manual-${Date.now()}`;

    // Prevent duplicates
    const existing = db.reels.find(
      (r) => r.permalink.includes(shortcode) || r.instagramMediaId === shortcode
    );
    if (existing) {
      return NextResponse.json(
        { error: "This reel has already been added to your showcase." },
        { status: 400 }
      );
    }

    let resolvedTitle = caption || "Official Instagram Reel";
    let resolvedThumb = thumbnailUrl || "";

    try {
      const oembedRes = await fetch(
        `https://api.instagram.com/oembed?url=${encodeURIComponent(
          url
        )}&omitscript=true`
      );
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) resolvedTitle = oembedData.title;
        if (oembedData.thumbnail_url) resolvedThumb = oembedData.thumbnail_url;
      }
    } catch {
      // Fallback
    }

    const newReel: InstagramReel = {
      id: `ig-reel-${Date.now()}`,
      instagramMediaId: shortcode,
      username: db.connection.username || "Dj G-spark",
      caption: resolvedTitle,
      thumbnailUrl: resolvedThumb,
      permalink: url.trim(),
      mediaType: "REEL",
      publishedAt: now,
      viewsDisplay: "Verified",
      likesCount: 1,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    };

    db.reels.unshift(newReel);
    db.connection.lastSyncedAt = now;
    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      message: "Real Instagram Reel added successfully!",
      reel: newReel,
      reels: db.reels,
    });
  } catch (err: any) {
    console.error("Failed to add reel:", err);
    return NextResponse.json(
      { error: err.message || "Failed to add reel" },
      { status: 500 }
    );
  }
}
