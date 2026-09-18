import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { VideoShowcaseItem } from "@/types";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Returns all video showcase items
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = (await readJsonFile<VideoShowcaseItem[]>("videos.json")) || [];
    return NextResponse.json(items, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Admin videos fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

// POST: Add new video
export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, tag, duration, thumbnail, videoSrc } = body;

    if (!title || !videoSrc) {
      return NextResponse.json(
        { error: "Video title and video source/URL are required" },
        { status: 400 }
      );
    }

    const items = (await readJsonFile<VideoShowcaseItem[]>("videos.json")) || [];
    const newItem: VideoShowcaseItem = {
      id: `vid-${Date.now()}`,
      title: title.trim(),
      tag: tag ? tag.trim() : "4K CINEMATIC // ARENA DROP",
      duration: duration ? duration.trim() : "03:30",
      thumbnail: thumbnail ? thumbnail.trim() : "/images/past_event_crowd.jpg",
      videoSrc: videoSrc.trim(),
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await writeJsonFile("videos.json", items);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Admin videos add error:", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}

// DELETE: Remove a video by ID
export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const items = (await readJsonFile<VideoShowcaseItem[]>("videos.json")) || [];
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await writeJsonFile("videos.json", filtered);
    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("Admin videos delete error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
