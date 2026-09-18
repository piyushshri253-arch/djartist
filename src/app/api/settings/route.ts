import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/serverData";

export async function GET() {
  try {
    const settings = await readJsonFile<any>("settings.json");
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("Error reading settings:", err);
    return NextResponse.json({}, { status: 500 });
  }
}
