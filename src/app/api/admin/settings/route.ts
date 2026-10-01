import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { validateOrigin, unauthorizedResponse } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const settings = await readJsonFile<any>("settings.json");
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    let currentSettings: any = {};
    try {
      currentSettings = await readJsonFile<any>("settings.json");
    } catch {
      currentSettings = {};
    }

    const updatedSettings = {
      ...currentSettings,
      profile: body.profile ? { ...currentSettings.profile, ...body.profile } : currentSettings.profile,
      instagram: body.instagram ? { ...currentSettings.instagram, ...body.instagram } : currentSettings.instagram,
    };

    await writeJsonFile("settings.json", updatedSettings);

    await logAdminAction({
      action: "UPDATE_SETTINGS",
      adminEmail: admin.email,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
