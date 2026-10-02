import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { VideoShowcaseItem } from "@/types";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { sanitizeString, isSafeUrl, validateOrigin, unauthorizedResponse } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Returns all video showcase items
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return unauthorizedResponse();
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

const PROHIBITED_PATTERN = /\b(porn|sex|pussy|boobs|fuck|fucking|bitch|dick|cock|nude|naked|xxx|casino|viagra|cialis)\b/i;

function hasProhibitedContent(obj: any): boolean {
  if (!obj) return false;
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return PROHIBITED_PATTERN.test(str);
}

// POST: Add new video
export async function POST(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { title, tag, duration, thumbnail, videoSrc } = body;

    if (!title || !videoSrc) {
      return NextResponse.json(
        { error: "Video title and video source/URL are required" },
        { status: 400 }
      );
    }

    if (!isSafeUrl(videoSrc)) {
      return NextResponse.json({ error: "Invalid or unsafe video URL" }, { status: 400 });
    }

    const thumbUrl = thumbnail ? thumbnail.trim() : "/images/past_event_crowd.jpg";
    if (!isSafeUrl(thumbUrl)) {
      return NextResponse.json({ error: "Invalid thumbnail URL" }, { status: 400 });
    }

    if (hasProhibitedContent(body)) {
      return NextResponse.json(
        { error: "Content contains prohibited or explicit language." },
        { status: 400 }
      );
    }

    const items = (await readJsonFile<VideoShowcaseItem[]>("videos.json")) || [];
    const cleanTitle = sanitizeString(title).slice(0, 150);
    const cleanTag = sanitizeString(tag || "4K CINEMATIC // ARENA DROP").slice(0, 50);
    const cleanDuration = sanitizeString(duration || "03:30").slice(0, 20);

    const newItem: VideoShowcaseItem = {
      id: `vid-${Date.now()}`,
      title: cleanTitle,
      tag: cleanTag,
      duration: cleanDuration,
      thumbnail: thumbUrl,
      videoSrc: videoSrc.trim(),
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await writeJsonFile("videos.json", items);

    await logAdminAction({
      action: "UPLOAD_IMAGE",
      adminEmail: admin.email,
      resource: newItem.id,
      status: "SUCCESS",
      details: { title: newItem.title, type: "video" },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Admin videos add error:", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}

// DELETE: Remove a video by ID
export async function DELETE(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return unauthorizedResponse();
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
    const cleanId = String(id).trim().toLowerCase();
    const filtered = items.filter((item) => {
      const itemId = String(item.id || "").trim().toLowerCase();
      const itemTitle = String(item.title || "").trim().toLowerCase();
      return itemId !== cleanId && itemTitle !== cleanId;
    });

    if (filtered.length === items.length) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await writeJsonFile("videos.json", filtered);

    await logAdminAction({
      action: "DELETE_IMAGE",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { type: "video" },
    });

    return NextResponse.json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    console.error("Admin videos delete error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}

// PUT: Edit existing video
export async function PUT(req: Request) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { id, title, tag, duration, thumbnail, videoSrc } = body;

    if (!id || !title || !videoSrc) {
      return NextResponse.json(
        { error: "Video ID, title, and video source/URL are required" },
        { status: 400 }
      );
    }

    if (!isSafeUrl(videoSrc)) {
      return NextResponse.json({ error: "Invalid or unsafe video URL" }, { status: 400 });
    }

    if (thumbnail && !isSafeUrl(thumbnail.trim())) {
      return NextResponse.json({ error: "Invalid thumbnail URL" }, { status: 400 });
    }

    if (hasProhibitedContent(body)) {
      return NextResponse.json(
        { error: "Content contains prohibited or explicit language." },
        { status: 400 }
      );
    }

    const items = (await readJsonFile<VideoShowcaseItem[]>("videos.json")) || [];
    const cleanId = String(id).trim().toLowerCase();
    const index = items.findIndex((i) => String(i.id || "").trim().toLowerCase() === cleanId);

    if (index === -1) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const cleanTitle = sanitizeString(title).slice(0, 150);
    const cleanTag = tag ? sanitizeString(tag).slice(0, 50) : items[index].tag;
    const cleanDuration = duration ? sanitizeString(duration).slice(0, 20) : items[index].duration;
    const thumbUrl = thumbnail ? thumbnail.trim() : items[index].thumbnail;

    const updatedItem: VideoShowcaseItem = {
      ...items[index],
      title: cleanTitle,
      tag: cleanTag,
      duration: cleanDuration,
      thumbnail: thumbUrl,
      videoSrc: videoSrc.trim(),
    };

    items[index] = updatedItem;
    await writeJsonFile("videos.json", items);

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Admin videos update error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}
