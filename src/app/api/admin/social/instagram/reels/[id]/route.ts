import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();
    const { isVisible } = body;

    if (typeof isVisible !== "boolean") {
      return NextResponse.json(
        { error: "Field 'isVisible' must be a boolean" },
        { status: 400 }
      );
    }

    const db = await readInstagramDb();
    const reelIndex = db.reels.findIndex(
      (r) => r.id === id || r.instagramMediaId === id
    );

    if (reelIndex === -1) {
      return NextResponse.json(
        { error: `Reel with id '${id}' not found` },
        { status: 404 }
      );
    }

    if (isVisible) {
      const currentVisibleCount = db.reels.filter(
        (r) => r.isVisible && r.id !== id && r.instagramMediaId !== id
      ).length;
      if (currentVisibleCount >= 4) {
        return NextResponse.json(
          {
            error:
              "Maximum 4 reels can be selected for website display. Please deselect an existing reel first.",
            code: "MAX_SELECTION_REACHED",
          },
          { status: 400 }
        );
      }
    }

    db.reels[reelIndex].isVisible = isVisible;
    db.reels[reelIndex].updatedAt = new Date().toISOString();

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      reel: db.reels[reelIndex],
      message: `Reel visibility set to ${
        isVisible ? "SHOW ON WEBSITE" : "HIDDEN FROM WEBSITE"
      }. (Note: Reel remains untouched on Instagram).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update reel visibility" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const db = await readInstagramDb();
    const beforeCount = db.reels.length;
    db.reels = db.reels.filter((r) => r.id !== id && r.instagramMediaId !== id);

    if (db.reels.length === beforeCount) {
      return NextResponse.json(
        { error: `Reel with id '${id}' not found` },
        { status: 404 }
      );
    }

    db.selectedReelIds = (db.selectedReelIds || []).filter(
      (reelId) => reelId !== id && !reelId.includes(id)
    );

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      message: "Instagram reel removed from website showcase.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to remove reel" },
      { status: 500 }
    );
  }
}
