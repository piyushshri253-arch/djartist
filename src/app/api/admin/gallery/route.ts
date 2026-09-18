import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { GalleryItem } from "@/types";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Returns all gallery items
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = (await readJsonFile<GalleryItem[]>("gallery.json")) || [];
    return NextResponse.json(items, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Admin gallery fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

// POST: Add new gallery photo
export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { src, title, subtitle, category } = body;

    if (!src || !title) {
      return NextResponse.json(
        { error: "Image source and title are required" },
        { status: 400 }
      );
    }

    const items = (await readJsonFile<GalleryItem[]>("gallery.json")) || [];
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      src: src.trim(),
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "Live Performance",
      category: ["live", "festivals", "backstage"].includes(category)
        ? category
        : "live",
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await writeJsonFile("gallery.json", items);

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Admin gallery add error:", error);
    return NextResponse.json({ error: "Failed to add gallery photo" }, { status: 500 });
  }
}

// DELETE: Remove a gallery photo by ID
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
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    const items = (await readJsonFile<GalleryItem[]>("gallery.json")) || [];
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await writeJsonFile("gallery.json", filtered);
    return NextResponse.json({ success: true, message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Admin gallery delete error:", error);
    return NextResponse.json({ error: "Failed to delete gallery photo" }, { status: 500 });
  }
}
