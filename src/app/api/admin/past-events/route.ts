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

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      year,
      city,
      country,
      venue,
      date,
      dateDisplay,
      attendance,
      image,
      excerpt,
      description,
      highlights,
      tracklist,
    } = body;

    if (!title || !city || !year) {
      return NextResponse.json({ error: "Title, city, and year are required" }, { status: 400 });
    }

    const pastEvents = await readJsonFile<PastEventData[]>("past-events.json");

    const slug =
      body.slug?.trim() ||
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${year}`;

    const newPastEvent: PastEventData = {
      id: `PAST-${city.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${year}`,
      slug,
      title,
      year: String(year),
      city,
      country: country || "INDIA",
      venue: venue || `${city} Mainstage Arena`,
      date: date || `${year}-12-01`,
      dateDisplay: dateDisplay || `DEC ${year}`,
      attendance: attendance || "40,000+ Fans",
      image: image || "/images/past_event_crowd.jpg",
      excerpt: excerpt || `Legendary concert night in ${city}.`,
      description: description || `Dj G-Spark delivered an unforgettable headline set in ${city}.`,
      highlights: Array.isArray(highlights)
        ? highlights
        : typeof highlights === "string"
        ? highlights.split("\n").map((s) => s.trim()).filter(Boolean)
        : ["Full stadium attendance", "Volumetric laser show"],
      tracklist: Array.isArray(tracklist)
        ? tracklist
        : typeof tracklist === "string"
        ? tracklist.split("\n").map((s) => s.trim()).filter(Boolean)
        : ["01. Dj G-Spark - Spark Theory (Live Intro VIP)"],
    };

    pastEvents.unshift(newPastEvent);
    await writeJsonFile("past-events.json", pastEvents);
    await unmarkDeletedEvent([newPastEvent.id, newPastEvent.slug, newPastEvent.title]);

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
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Past event ID is required" }, { status: 400 });
    }

    const pastEvents = await readJsonFile<PastEventData[]>("past-events.json");
    const index = pastEvents.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Past event not found" }, { status: 404 });
    }

    const current = pastEvents[index];
    pastEvents[index] = {
      ...current,
      title: body.title ?? current.title,
      slug: body.slug ?? current.slug,
      year: body.year ? String(body.year) : current.year,
      city: body.city ?? current.city,
      country: body.country ?? current.country,
      venue: body.venue ?? current.venue,
      date: body.date ?? current.date,
      dateDisplay: body.dateDisplay ?? current.dateDisplay,
      attendance: body.attendance ?? current.attendance,
      image: body.image ?? current.image,
      excerpt: body.excerpt ?? current.excerpt,
      description: body.description ?? current.description,
      highlights: Array.isArray(body.highlights)
        ? body.highlights
        : typeof body.highlights === "string"
        ? body.highlights.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : current.highlights,
      tracklist: Array.isArray(body.tracklist)
        ? body.tracklist
        : typeof body.tracklist === "string"
        ? body.tracklist.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : current.tracklist,
    };

    await writeJsonFile("past-events.json", pastEvents);

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
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
