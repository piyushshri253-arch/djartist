import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";

export async function PATCH(request: Request) {
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
    const { reelId, isVisible } = body;

    if (!reelId || typeof isVisible !== "boolean") {
      return NextResponse.json(
        { error: "Required fields: reelId (string) and isVisible (boolean)" },
        { status: 400 }
      );
    }

    const db = await readInstagramDb();
    const reelIndex = db.reels.findIndex(
      (r) => r.id === reelId || r.instagramMediaId === reelId
    );

    if (reelIndex === -1) {
      return NextResponse.json(
        { error: `Reel with id '${reelId}' not found` },
        { status: 404 }
      );
    }

    if (isVisible) {
      const currentVisibleCount = db.reels.filter(
        (r) => r.isVisible && r.id !== reelId && r.instagramMediaId !== reelId
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
      }. (Reel remains untouched on Instagram).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update reel visibility" },
      { status: 500 }
    );
  }
}
