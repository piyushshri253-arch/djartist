import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";
import { InstagramReel } from "@/types";

function extractInstagramShortcode(input: string): string | null {
  if (!input || typeof input !== "string") return null;
  const str = input.trim();

  // 1. Check for iframe or blockquote embed code
  const embedMatch = str.match(
    /(?:permalink|src)=["']https?:\/\/(?:www\.)?instagram\.com\/(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i
  );
  if (embedMatch) return embedMatch[1];

  // 2. Check for standard URL
  const urlMatch = str.match(/(?:reels?|p|tv|share\/reel)\/([A-Za-z0-9_-]+)/i);
  if (urlMatch) return urlMatch[1];

  // 3. Raw shortcode (alphanumeric, 5-30 chars)
  if (/^[A-Za-z0-9_-]{5,30}$/.test(str)) return str;

  return null;
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const rawInput = (body.url || body.embedCode || body.shortcode || "").trim();
    const customCaption = (body.caption || "").trim();

    if (!rawInput) {
      return NextResponse.json(
        { error: "Please enter an Instagram Reel link or embed code." },
        { status: 400 }
      );
    }

    const shortcode = extractInstagramShortcode(rawInput);
    if (!shortcode) {
      return NextResponse.json(
        {
          error:
            "Invalid Instagram link or embed code. Please paste a link like https://www.instagram.com/reel/... or an embed code.",
        },
        { status: 400 }
      );
    }

    const db = await readInstagramDb();
    const now = new Date().toISOString();
    const username = db.connection.username || "djgspark";
    const canonicalUrl = `https://www.instagram.com/reel/${shortcode}/`;

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
      thumbnailUrl: "", // No dummy cover photo
      permalink: canonicalUrl,
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
        instagramMediaId: shortcode,
        caption: customCaption || db.reels[existingIndex].caption,
        permalink: canonicalUrl,
        updatedAt: now,
      };
      if (shouldBeVisible && !db.selectedReelIds.includes(db.reels[existingIndex].id)) {
        db.selectedReelIds.push(db.reels[existingIndex].id);
      }
    } else {
      db.reels.unshift(newReel);
      if (shouldBeVisible && !db.selectedReelIds.includes(newReel.id)) {
        db.selectedReelIds.push(newReel.id);
      }
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
      message: `Reel added successfully!`,
      reel: existingIndex >= 0 ? db.reels[existingIndex] : newReel,
      reels: db.reels,
      selectedReelIds: db.selectedReelIds,
    });
  } catch (error: any) {
    console.error("Error adding reel:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add reel" },
      { status: 500 }
    );
  }
}
