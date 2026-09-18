import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/serverData";
import { VideoShowcaseItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await readJsonFile<VideoShowcaseItem[]>("videos.json");
    return NextResponse.json(items || [], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json([], { status: 500 });
  }
}
