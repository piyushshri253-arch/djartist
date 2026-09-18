import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { PlatformSocialConfig } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await readJsonFile<PlatformSocialConfig>("social_settings.json");
    return NextResponse.json(settings, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read social settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(admin, "social_media.instagram.manage") && admin.role !== "Super Admin" && admin.role !== "Social Media Admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await req.json();
    const current = await readJsonFile<PlatformSocialConfig>("social_settings.json");

    const updated: PlatformSocialConfig = {
      facebook: {
        ...current.facebook,
        ...(body.facebook || {}),
      },
      youtube: {
        ...current.youtube,
        ...(body.youtube || {}),
      },
      instagram: {
        ...current.instagram,
        ...(body.instagram || {}),
      },
    };

    await writeJsonFile("social_settings.json", updated);

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update social settings" }, { status: 500 });
  }
}
