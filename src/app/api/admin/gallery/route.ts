import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { GalleryItem } from "@/types";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { sanitizeString, isSafeUrl, validateOrigin, unauthorizedResponse } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Returns all gallery items
export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return unauthorizedResponse();
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

const PROHIBITED_PATTERN = /\b(porn|sex|pussy|boobs|fuck|fucking|bitch|dick|cock|nude|naked|xxx|casino|viagra|cialis)\b/i;

function hasProhibitedContent(obj: any): boolean {
  if (!obj) return false;
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return PROHIBITED_PATTERN.test(str);
}

// POST: Add new gallery photo
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
    const { src, title, subtitle, category } = body;

    if (!src || !title) {
      return NextResponse.json(
        { error: "Image source and title are required" },
        { status: 400 }
      );
    }

    if (!isSafeUrl(src)) {
      return NextResponse.json({ error: "Invalid image source URL" }, { status: 400 });
    }

    if (hasProhibitedContent(body)) {
      return NextResponse.json(
        { error: "Content contains prohibited or explicit language." },
        { status: 400 }
      );
    }

    const items = (await readJsonFile<GalleryItem[]>("gallery.json")) || [];
    const cleanTitle = sanitizeString(title).slice(0, 150);
    const cleanSubtitle = sanitizeString(subtitle || "Live Performance").slice(0, 150);
    const cleanCategory = ["live", "festivals", "backstage"].includes(category) ? category : "live";

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      src: src.trim(),
      title: cleanTitle,
      subtitle: cleanSubtitle,
      category: cleanCategory,
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await writeJsonFile("gallery.json", items);

    await logAdminAction({
      action: "UPLOAD_IMAGE",
      adminEmail: admin.email,
      resource: newItem.id,
      status: "SUCCESS",
      details: { title: newItem.title },
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Admin gallery add error:", error);
    return NextResponse.json({ error: "Failed to add gallery photo" }, { status: 500 });
  }
}

// DELETE: Remove a gallery photo by ID
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
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    const items = (await readJsonFile<GalleryItem[]>("gallery.json")) || [];
    const cleanId = String(id).trim().toLowerCase();
    const filtered = items.filter((item) => {
      const itemId = String(item.id || "").trim().toLowerCase();
      const itemSrc = String(item.src || "").trim().toLowerCase();
      const itemTitle = String(item.title || "").trim().toLowerCase();
      return itemId !== cleanId && itemSrc !== cleanId && itemTitle !== cleanId;
    });

    if (filtered.length === items.length) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await writeJsonFile("gallery.json", filtered);

    await logAdminAction({
      action: "DELETE_IMAGE",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, message: "Photo deleted successfully" });
  } catch (error) {
    console.error("Admin gallery delete error:", error);
    return NextResponse.json({ error: "Failed to delete gallery photo" }, { status: 500 });
  }
}

// PUT: Edit existing gallery photo
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
    const { id, src, title, subtitle, category } = body;

    if (!id || !src || !title) {
      return NextResponse.json(
        { error: "Photo ID, image source, and title are required" },
        { status: 400 }
      );
    }

    if (!isSafeUrl(src)) {
      return NextResponse.json({ error: "Invalid image source URL" }, { status: 400 });
    }

    if (hasProhibitedContent(body)) {
      return NextResponse.json(
        { error: "Content contains prohibited or explicit language." },
        { status: 400 }
      );
    }

    const items = (await readJsonFile<GalleryItem[]>("gallery.json")) || [];
    const cleanId = String(id).trim().toLowerCase();
    const index = items.findIndex((i) => String(i.id || "").trim().toLowerCase() === cleanId);

    if (index === -1) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const cleanTitle = sanitizeString(title).slice(0, 150);
    const cleanSubtitle = sanitizeString(subtitle || items[index].subtitle).slice(0, 150);
    const cleanCategory = ["live", "festivals", "backstage"].includes(category)
      ? category
      : items[index].category || "live";

    const updatedItem: GalleryItem = {
      ...items[index],
      src: src.trim(),
      title: cleanTitle,
      subtitle: cleanSubtitle,
      category: cleanCategory,
    };

    items[index] = updatedItem;
    await writeJsonFile("gallery.json", items);

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Admin gallery update error:", error);
    return NextResponse.json({ error: "Failed to update gallery photo" }, { status: 500 });
  }
}
