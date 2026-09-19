import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";

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
    const { selectedReelIds } = body;

    if (!Array.isArray(selectedReelIds)) {
      return NextResponse.json(
        { error: "Field 'selectedReelIds' must be an array of reel IDs" },
        { status: 400 }
      );
    }

    if (selectedReelIds.length > 4) {
      return NextResponse.json(
        {
          error: "Maximum 4 reels can be selected for website display. Please deselect an existing reel first.",
          code: "MAX_SELECTION_EXCEEDED",
        },
        { status: 400 }
      );
    }

    const db = await readInstagramDb();
    if (db.connection.status !== "connected") {
      return NextResponse.json(
        { error: "Instagram account is not connected. Please connect first." },
        { status: 400 }
      );
    }

    const selectedSet = new Set(selectedReelIds.map((id) => String(id)));
    const now = new Date().toISOString();

    // Update isVisible flag for every reel in the library
    db.reels = db.reels.map((reel) => {
      const isSelected =
        selectedSet.has(reel.id) || selectedSet.has(reel.instagramMediaId);
      return {
        ...reel,
        isVisible: isSelected,
        updatedAt: isSelected !== reel.isVisible ? now : reel.updatedAt,
      };
    });

    db.selectedReelIds = selectedReelIds;
    if (selectedReelIds.length > 0) {
      db.settings.instagramEnabled = true;
    }
    db.settings.updatedAt = now;

    await writeInstagramDb(db);

    const activeCount = db.reels.filter((r) => r.isVisible).length;

    return NextResponse.json({
      success: true,
      message: `Selected reels saved successfully! ${activeCount} of 4 reels are now active on your website.`,
      selectedCount: activeCount,
      selectedReelIds,
      reels: db.reels,
    });
  } catch (err: any) {
    console.error("Save selected reels error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save selected reels" },
      { status: 500 }
    );
  }
}
