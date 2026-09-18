import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/serverData";
import { GalleryItem } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await readJsonFile<GalleryItem[]>("gallery.json");
    return NextResponse.json(items || [], {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json([], { status: 500 });
  }
}
