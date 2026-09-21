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
    const { instagramEnabled } = body;

    if (typeof instagramEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Field 'instagramEnabled' must be a boolean" },
        { status: 400 }
      );
    }

    const db = await readInstagramDb();



    db.settings.instagramEnabled = instagramEnabled;
    db.settings.updatedAt = new Date().toISOString();

    await writeInstagramDb(db);

    return NextResponse.json({
      success: true,
      settings: db.settings,
      message: `Instagram section is now ${
        instagramEnabled ? "ENABLED" : "HIDDEN"
      } on the website.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
