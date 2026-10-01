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

// Security content moderation filter
const PROHIBITED_PATTERN = /\b(porn|sex|pussy|boobs|fuck|fucking|bitch|dick|cock|nude|naked|xxx|casino|viagra|cialis)\b/i;

function hasProhibitedContent(obj: any): boolean {
  if (!obj) return false;
  const str = typeof obj === "string" ? obj : JSON.stringify(obj);
  return PROHIBITED_PATTERN.test(str);
}

export interface EventData {
  id: string;
  slug: string;
  title: string;
  eventType?: string;
  artist?: string;
  city: string;
  country: string;
  region: string;
  venue: string;
  address?: string;
  date: string;
  dateDisplay: string;
  time: string;
  doors?: string;
  capacity?: string;
  status: string;
  statusClass?: string;
  priceFrom?: string;
  priceINR?: string | number;
  priceUSD?: string | number;
  showPrice?: boolean;
  isPublished?: boolean;
  currency?: "INR" | "USD" | "BOTH";
  image: string;
  description: string;
  detailedAbout?: string;
  lineup: string[];
  ticketCategories?: any[];
}

// GET all upcoming events
export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  const [events, deletedSet] = await Promise.all([
    readJsonFile<EventData[]>("events.json"),
    getDeletedEventIdentifiers(),
  ]);

  const activeEvents = (events || []).filter((e) => {
    if (e.id && deletedSet.has(e.id.toLowerCase().trim())) return false;
    if (e.slug && deletedSet.has(e.slug.toLowerCase().trim())) return false;
    if (e.title && deletedSet.has(e.title.toLowerCase().trim())) return false;
    return true;
  });

  return NextResponse.json(activeEvents, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}

// POST create a new upcoming event
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
      return NextResponse.json(
        { error: "Event content contains prohibited or explicit language." },
        { status: 400 }
      );
    }

    const title = sanitizeString(rawBody.title).slice(0, 200);
    const city = sanitizeString(rawBody.city).slice(0, 100);
    const venue = sanitizeString(rawBody.venue).slice(0, 200);
    const description = sanitizeString(rawBody.description).slice(0, 3000);
    const detailedAbout = sanitizeString(rawBody.detailedAbout).slice(0, 5000);
    const artist = sanitizeString(rawBody.artist || "Dj G-Spark").slice(0, 100);
    const address = sanitizeString(rawBody.address || `${venue}, ${city}`).slice(0, 250);
    const eventType = sanitizeString(rawBody.eventType || "Arena Concert").slice(0, 100);
    const status = sanitizeString(rawBody.status || "SELLING FAST").slice(0, 50);
    const date = sanitizeString(rawBody.date || "2026-11-20").slice(0, 20);
    const dateDisplay = sanitizeString(rawBody.dateDisplay || "20 NOV 2026").slice(0, 50);
    const time = sanitizeString(rawBody.time || "20:00 - 02:00 IST").slice(0, 50);
    const doors = sanitizeString(rawBody.doors || "18:00 IST").slice(0, 50);
    const capacity = sanitizeString(rawBody.capacity || "25,000").slice(0, 50);

    const imageUrl = rawBody.image?.trim() || "/images/past_event_crowd.jpg";
    if (!isSafeUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid or unsafe image URL" }, { status: 400 });
    }

    if (!title || !city || !venue) {
      return NextResponse.json(
        { error: "Title, city, and venue are required" },
        { status: 400 }
      );
    }

    const events = await readJsonFile<EventData[]>("events.json");

    const slug =
      sanitizeString(rawBody.slug)?.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 120) ||
      `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${venue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-2026`;

    const statusClass =
      status.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "selling-fast";

    let resolvedPriceFrom = sanitizeString(rawBody.priceFrom);
    if (!resolvedPriceFrom) {
      if (rawBody.priceINR && rawBody.priceUSD) {
        resolvedPriceFrom = `₹ ${String(rawBody.priceINR).replace(/[^0-9,]/g, "")} / $ ${String(rawBody.priceUSD).replace(/[^0-9,]/g, "")}`;
      } else if (rawBody.priceINR) {
        resolvedPriceFrom = `₹ ${String(rawBody.priceINR).replace(/[^0-9,]/g, "")}`;
      } else if (rawBody.priceUSD) {
        resolvedPriceFrom = `$ ${String(rawBody.priceUSD).replace(/[^0-9,]/g, "")}`;
      } else {
        resolvedPriceFrom = "By VIP Reservation";
      }
    }

    const safeId = `EV-${city.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newEvent: EventData = {
      id: safeId,
      slug,
      title,
      eventType,
      artist,
      city,
      country: sanitizeString(rawBody.country || "INDIA").slice(0, 50),
      region: sanitizeString(rawBody.region || "india").slice(0, 50),
      venue,
      address,
      date,
      dateDisplay,
      time,
      doors,
      capacity,
      status,
      statusClass,
      priceFrom: resolvedPriceFrom,
      priceINR: rawBody.priceINR ? String(rawBody.priceINR).slice(0, 20) : "",
      priceUSD: rawBody.priceUSD ? String(rawBody.priceUSD).slice(0, 20) : "",
      showPrice: rawBody.showPrice !== undefined ? Boolean(rawBody.showPrice) : false,
      isPublished: rawBody.isPublished !== undefined ? Boolean(rawBody.isPublished) : true,
      currency: rawBody.currency || "BOTH",
      image: imageUrl,
      description: description || `Dj G-Spark Live Concert in ${city} at ${venue}.`,
      detailedAbout: detailedAbout || description || "",
      lineup: Array.isArray(rawBody.lineup)
        ? rawBody.lineup.map((l: any) => sanitizeString(l).slice(0, 100)).filter(Boolean)
        : [artist || "Dj G-Spark (Headliner Extended Set)"],
    };

    events.unshift(newEvent);
    await writeJsonFile("events.json", events);
    await unmarkDeletedEvent([newEvent.id, newEvent.slug, newEvent.title]);

    await logAdminAction({
      action: "CREATE_EVENT",
      adminEmail: admin.email,
      resource: newEvent.id,
      status: "SUCCESS",
      details: { title: newEvent.title, city: newEvent.city },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/events");
      revalidatePath(`/events/${newEvent.slug}`);
      revalidatePath("/past-events");
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json(
      { success: true, event: newEvent },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PUT edit an existing event
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
    const { id } = rawBody;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    if (hasProhibitedContent(rawBody)) {
      return NextResponse.json(
        { error: "Event content contains prohibited or explicit language." },
        { status: 400 }
      );
    }

    const events = await readJsonFile<EventData[]>("events.json");
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const current = events[index];

    let resolvedPriceFrom = rawBody.priceFrom ? sanitizeString(rawBody.priceFrom) : current.priceFrom;
    if (rawBody.priceINR !== undefined || rawBody.priceUSD !== undefined) {
      const inrVal = rawBody.priceINR ?? current.priceINR;
      const usdVal = rawBody.priceUSD ?? current.priceUSD;
      if (inrVal && usdVal) {
        resolvedPriceFrom = `₹ ${String(inrVal).replace(/[^0-9,]/g, "")} / $ ${String(usdVal).replace(/[^0-9,]/g, "")}`;
      } else if (inrVal) {
        resolvedPriceFrom = `₹ ${String(inrVal).replace(/[^0-9,]/g, "")}`;
      } else if (usdVal) {
        resolvedPriceFrom = `$ ${String(usdVal).replace(/[^0-9,]/g, "")}`;
      }
    }

    const safeImage = rawBody.image ? rawBody.image.trim() : current.image;
    if (!isSafeUrl(safeImage)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    events[index] = {
      ...current,
      title: rawBody.title ? sanitizeString(rawBody.title).slice(0, 200) : current.title,
      eventType: rawBody.eventType ? sanitizeString(rawBody.eventType).slice(0, 100) : current.eventType,
      artist: rawBody.artist ? sanitizeString(rawBody.artist).slice(0, 100) : current.artist,
      slug: rawBody.slug ? sanitizeString(rawBody.slug).replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 120) : current.slug,
      city: rawBody.city ? sanitizeString(rawBody.city).slice(0, 100) : current.city,
      country: rawBody.country ? sanitizeString(rawBody.country).slice(0, 50) : current.country,
      region: rawBody.region ? sanitizeString(rawBody.region).slice(0, 50) : current.region,
      venue: rawBody.venue ? sanitizeString(rawBody.venue).slice(0, 200) : current.venue,
      address: rawBody.address ? sanitizeString(rawBody.address).slice(0, 250) : current.address,
      date: rawBody.date ? sanitizeString(rawBody.date).slice(0, 20) : current.date,
      dateDisplay: rawBody.dateDisplay ? sanitizeString(rawBody.dateDisplay).slice(0, 50) : current.dateDisplay,
      time: rawBody.time ? sanitizeString(rawBody.time).slice(0, 50) : current.time,
      doors: rawBody.doors ? sanitizeString(rawBody.doors).slice(0, 50) : current.doors,
      capacity: rawBody.capacity ? sanitizeString(rawBody.capacity).slice(0, 50) : current.capacity,
      status: rawBody.status ? sanitizeString(rawBody.status).slice(0, 50) : current.status,
      statusClass: rawBody.status
        ? sanitizeString(rawBody.status).toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : current.statusClass,
      priceFrom: resolvedPriceFrom,
      priceINR: rawBody.priceINR ? String(rawBody.priceINR).slice(0, 20) : current.priceINR,
      priceUSD: rawBody.priceUSD ? String(rawBody.priceUSD).slice(0, 20) : current.priceUSD,
      showPrice: rawBody.showPrice !== undefined ? Boolean(rawBody.showPrice) : current.showPrice,
      isPublished: rawBody.isPublished !== undefined ? Boolean(rawBody.isPublished) : current.isPublished,
      currency: rawBody.currency || current.currency,
      image: safeImage,
      description: rawBody.description ? sanitizeString(rawBody.description).slice(0, 3000) : current.description,
      detailedAbout: rawBody.detailedAbout ? sanitizeString(rawBody.detailedAbout).slice(0, 5000) : current.detailedAbout,
      lineup: Array.isArray(rawBody.lineup)
        ? rawBody.lineup.map((l: any) => sanitizeString(l).slice(0, 100)).filter(Boolean)
        : current.lineup,
    };

    await writeJsonFile("events.json", events);

    await logAdminAction({
      action: "UPDATE_EVENT",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { title: events[index].title },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/events");
      revalidatePath(`/events/${events[index].slug}`);
      revalidatePath("/past-events");
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json(
      { success: true, event: events[index] },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    console.error("Edit event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE an event
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
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    await purgeEventEverywhere(id, slug, title);

    await logAdminAction({
      action: "DELETE_EVENT",
      adminEmail: admin.email,
      resource: id,
      status: "SUCCESS",
      details: { slug, title },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/events");
      if (slug) revalidatePath(`/events/${slug}`);
      revalidatePath("/past-events");
      if (slug) revalidatePath(`/past-events/${slug}`);
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json(
      { success: true, message: "Event permanently deleted" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
