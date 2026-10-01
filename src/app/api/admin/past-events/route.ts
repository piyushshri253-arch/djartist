import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";
import {
  readJsonFile,
  writeJsonFile,
  getDeletedEventIdentifiers,
  purgeEventEverywhere,
  unmarkDeletedEvent,
} from "@/lib/serverData";
import { sanitizeString, isSafeUrl, validateOrigin, unauthorizedResponse } from "@/lib/security";
import { logAdminAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROHIBITED_PATTERN = /\b(porn|sex|pussy|boobs|fuck|fucking|bitch|dick|cock|nude|naked|xxx|casino|viagra|cialis)\b/i;

function hasProhibitedContent(obj: any): boolean {
  if (!obj) return false;
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return PROHIBITED_PATTERN.test(str);
}

export interface PastEventData {
  id: string;
  slug: string;
  title: string;
  year: string;
  city: string;
  country: string;
  venue: string;
  date: string;
  dateDisplay: string;
  attendance: string;
  image: string;
  excerpt: string;
  description: string;
  highlights: string[];
  tracklist: string[];
}

// GET all past events
export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  const [pastEvents, deletedSet] = await Promise.all([
    readJsonFile<PastEventData[]>("past-events.json"),
    getDeletedEventIdentifiers(),
  ]);
  const activePastEvents = (pastEvents || []).filter((e) => {
    if (e.id && deletedSet.has(e.id.toLowerCase().trim())) return false;
    if (e.slug && deletedSet.has(e.slug.toLowerCase().trim())) return false;
    if (e.title && deletedSet.has(e.title.toLowerCase().trim())) return false;
    return true;
  });
  return NextResponse.json(activePastEvents, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}

// POST create a past event recap
export async function POST(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const rawBody = await request.json();
    if (hasProhibitedContent(rawBody)) {
      return NextResponse.json({ error: "Content contains prohibited or explicit language." }, { status: 400 });
    }

    const title = sanitizeString(rawBody.title).slice(0, 200);
    const city = sanitizeString(rawBody.city).slice(0, 100);
    const year = sanitizeString(rawBody.year || "2026").slice(0, 10);
    const country = sanitizeString(rawBody.country || "INDIA").slice(0, 50);
    const venue = sanitizeString(rawBody.venue || `${city} Mainstage Arena`).slice(0, 200);
    const date = sanitizeString(rawBody.date || `${year}-12-01`).slice(0, 20);
    const dateDisplay = sanitizeString(rawBody.dateDisplay || `DEC ${year}`).slice(0, 50);
    const attendance = sanitizeString(rawBody.attendance || "40,000+ Fans").slice(0, 50);
    const excerpt = sanitizeString(rawBody.excerpt || `Legendary concert night in ${city}.`).slice(0, 500);
    const description = sanitizeString(rawBody.description || `Dj G-Spark delivered an unforgettable headline set in ${city}.`).slice(0, 3000);

    const imageUrl = rawBody.image?.trim() || "/images/past_event_crowd.jpg";
    if (!isSafeUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    if (!title || !city || !year) {
      return NextResponse.json({ error: "Title, city, and year are required" }, { status: 400 });
    }

    const pastEvents = await readJsonFile<PastEventData[]>("past-events.json");

    const slug =
      sanitizeString(rawBody.slug)?.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 120) ||
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}`;

    const newPastEvent: PastEventData = {
      id: `PAST-${city.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${year}-${Date.now().toString().slice(-4)}`,
      slug,
      title,
      year: String(year),
      city,
      country,
      venue,
      date,
      dateDisplay,
      attendance,
      image: imageUrl,
      excerpt,
      description,
      highlights: Array.isArray(rawBody.highlights)
        ? rawBody.highlights.map((h: any) => sanitizeString(h).slice(0, 150)).filter(Boolean)
        : ["Full stadium attendance", "Volumetric laser show"],
      tracklist: Array.isArray(rawBody.tracklist)
        ? rawBody.tracklist.map((t: any) => sanitizeString(t).slice(0, 150)).filter(Boolean)
        : ["01. Dj G-Spark - Spark Theory (Live Intro VIP)"],
    };

    pastEvents.unshift(newPastEvent);
    await writeJsonFile("past-events.json", pastEvents);
    await unmarkDeletedEvent([newPastEvent.id, newPastEvent.slug, newPastEvent.title]);

    await logAdminAction({
      action: "CREATE_EVENT",
      adminEmail: admin.email,
      resource: newPastEvent.id,
      status: "SUCCESS",
      details: { title: newPastEvent.title, type: "past_event" },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/events");
      revalidatePath("/past-events");
      revalidatePath(`/past-events/${newPastEvent.slug}`);
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json({ success: true, event: newPastEvent }, { status: 201 });
  } catch (error) {
    console.error("Create past event error:", error);
    return NextResponse.json({ error: "Failed to create past event" }, { status: 500 });
  }
}

// PUT edit an existing past event
export async function PUT(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const rawBody = await request.json();
    if (hasProhibitedContent(rawBody)) {
      return NextResponse.json({ error: "Content contains prohibited or explicit language." }, { status: 400 });
    }
    const { id } = rawBody;

    if (!id) {
      return NextResponse.json({ error: "Past event ID is required" }, { status: 400 });
    }

    const pastEvents = await readJsonFile<PastEventData[]>("past-events.json");
    const index = pastEvents.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Past event not found" }, { status: 404 });
    }

    const current = pastEvents[index];
    const safeImage = rawBody.image ? rawBody.image.trim() : current.image;
    if (!isSafeUrl(safeImage)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    pastEvents[index] = {
      ...current,
      title: rawBody.title ? sanitizeString(rawBody.title).slice(0, 200) : current.title,
      slug: rawBody.slug ? sanitizeString(rawBody.slug).replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 120) : current.slug,
      year: rawBody.year ? sanitizeString(String(rawBody.year)).slice(0, 10) : current.year,
      city: rawBody.city ? sanitizeString(rawBody.city).slice(0, 100) : current.city,
      country: rawBody.country ? sanitizeString(rawBody.country).slice(0, 50) : current.country,
      venue: rawBody.venue ? sanitizeString(rawBody.venue).slice(0, 200) : current.venue,
      date: rawBody.date ? sanitizeString(rawBody.date).slice(0, 20) : current.date,
      dateDisplay: rawBody.dateDisplay ? sanitizeString(rawBody.dateDisplay).slice(0, 50) : current.dateDisplay,
      attendance: rawBody.attendance ? sanitizeString(rawBody.attendance).slice(0, 50) : current.attendance,
      image: safeImage,
      excerpt: rawBody.excerpt ? sanitizeString(rawBody.excerpt).slice(0, 500) : current.excerpt,
      description: rawBody.description ? sanitizeString(rawBody.description).slice(0, 3000) : current.description,
      highlights: Array.isArray(rawBody.highlights)
        ? rawBody.highlights.map((s: any) => sanitizeString(s).slice(0, 150)).filter(Boolean)
        : current.highlights,
      tracklist: Array.isArray(rawBody.tracklist)
        ? rawBody.tracklist.map((s: any) => sanitizeString(s).slice(0, 150)).filter(Boolean)
        : current.tracklist,
    };

    await writeJsonFile("past-events.json", pastEvents);

    await logAdminAction({
      action: "UPDATE_EVENT",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { title: pastEvents[index].title, type: "past_event" },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/events");
      revalidatePath("/past-events");
      revalidatePath(`/past-events/${pastEvents[index].slug}`);
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json({ success: true, event: pastEvents[index] });
  } catch (error) {
    console.error("Edit past event error:", error);
    return NextResponse.json({ error: "Failed to update past event" }, { status: 500 });
  }
}

// DELETE a past event
export async function DELETE(request: Request) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug") || undefined;
    const title = searchParams.get("title") || undefined;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await purgeEventEverywhere(id, slug, title);

    await logAdminAction({
      action: "DELETE_EVENT",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { slug, title, type: "past_event" },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/events");
      revalidatePath("/past-events");
      if (slug) revalidatePath(`/past-events/${slug}`);
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json({ success: true, message: "Past event permanently deleted" });
  } catch (error) {
    console.error("Delete past event error:", error);
    return NextResponse.json({ error: "Failed to delete past event" }, { status: 500 });
  }
}
