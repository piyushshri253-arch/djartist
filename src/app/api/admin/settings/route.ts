import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";

export async function GET() {
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
    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ error: "Failed to update settings: " + err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
