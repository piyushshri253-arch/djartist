import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";

export interface EventData {
  id: string;
  slug: string;
  title: string;
  city: string;
  country: string;
  region: string;
  venue: string;
  address?: string;
  date: string;
  dateDisplay: string;
  time: string;
  doors?: string;
  capacity: string;
  status: string;
  statusClass?: string;
  priceFrom: string;
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await readJsonFile<EventData[]>("events.json");
  return NextResponse.json(events);
}

// POST create a new upcoming event
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      city,
      country,
      region,
      venue,
      address,
      date,
      dateDisplay,
      time,
      doors,
      capacity,
      status,
      priceFrom,
      priceINR,
      priceUSD,
      showPrice,
      isPublished,
      currency,
      image,
      description,
      detailedAbout,
      lineup,
      ticketCategories,
    } = body;

    if (!title || !city || !venue) {
      return NextResponse.json(
        { error: "Title, city, and venue are required" },
        { status: 400 }
      );
    }

    const events = await readJsonFile<EventData[]>("events.json");

    const slug =
      body.slug?.trim() ||
      `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${venue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-2026`;

    const statusClass =
      status?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "selling-fast";

    // Format display price string from INR / USD if not explicit
    let resolvedPriceFrom = priceFrom;
    if (!resolvedPriceFrom) {
      if (priceINR && priceUSD) {
        resolvedPriceFrom = `₹ ${String(priceINR).replace(/[^0-9,]/g, "")} / $ ${String(priceUSD).replace(/[^0-9,]/g, "")}`;
      } else if (priceINR) {
        resolvedPriceFrom = `₹ ${String(priceINR).replace(/[^0-9,]/g, "")}`;
      } else if (priceUSD) {
        resolvedPriceFrom = `$ ${String(priceUSD).replace(/[^0-9,]/g, "")}`;
      } else {
        resolvedPriceFrom = "₹ 2,499";
      }
    }

    const newEvent: EventData = {
      id: `EV-${city.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`,
      slug,
      title,
      city,
      country: country || "INDIA",
      region: region || "india",
      venue,
      address: address || `${venue}, ${city}`,
      date: date || "2026-11-20",
      dateDisplay: dateDisplay || "20 NOV 2026",
      time: time || "20:00 - 02:00 IST",
      doors: doors || "18:00 IST",
      capacity: capacity || "25,000",
      status: status || "SELLING FAST",
      statusClass,
      priceFrom: resolvedPriceFrom,
      priceINR: priceINR || "2,499",
      priceUSD: priceUSD || "45",
      showPrice: showPrice !== undefined ? Boolean(showPrice) : true,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      currency: currency || "BOTH",
      image: image || "/images/past_event_crowd.jpg",
      description: description || `Dj G-Spark Live Concert in ${city} at ${venue}.`,
      detailedAbout: detailedAbout || description || "",
      lineup: Array.isArray(lineup)
        ? lineup
        : typeof lineup === "string"
        ? lineup.split(",").map((s) => s.trim())
        : ["Dj G-Spark (Headline Extended Set)"],
      ticketCategories: Array.isArray(ticketCategories) ? ticketCategories : undefined,
    };

    events.push(newEvent);
    await writeJsonFile("events.json", events);

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PUT edit an existing event
export async function PUT(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const events = await readJsonFile<EventData[]>("events.json");
    const index = events.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const current = events[index];

    let resolvedPriceFrom = body.priceFrom ?? current.priceFrom;
    if (body.priceINR !== undefined || body.priceUSD !== undefined) {
      const inrVal = body.priceINR ?? current.priceINR;
      const usdVal = body.priceUSD ?? current.priceUSD;
      if (inrVal && usdVal) {
        resolvedPriceFrom = `₹ ${String(inrVal).replace(/[^0-9,]/g, "")} / $ ${String(usdVal).replace(/[^0-9,]/g, "")}`;
      } else if (inrVal) {
        resolvedPriceFrom = `₹ ${String(inrVal).replace(/[^0-9,]/g, "")}`;
      } else if (usdVal) {
        resolvedPriceFrom = `$ ${String(usdVal).replace(/[^0-9,]/g, "")}`;
      }
    }

    events[index] = {
      ...current,
      title: body.title ?? current.title,
      slug: body.slug ?? current.slug,
      city: body.city ?? current.city,
      country: body.country ?? current.country,
      region: body.region ?? current.region,
      venue: body.venue ?? current.venue,
      address: body.address ?? current.address,
      date: body.date ?? current.date,
      dateDisplay: body.dateDisplay ?? current.dateDisplay,
      time: body.time ?? current.time,
      doors: body.doors ?? current.doors,
      capacity: body.capacity ?? current.capacity,
      status: body.status ?? current.status,
      statusClass: body.status
        ? body.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : current.statusClass,
      priceFrom: resolvedPriceFrom,
      priceINR: body.priceINR ?? current.priceINR,
      priceUSD: body.priceUSD ?? current.priceUSD,
      showPrice: body.showPrice !== undefined ? Boolean(body.showPrice) : (current.showPrice ?? true),
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : (current.isPublished ?? true),
      currency: body.currency ?? current.currency,
      image: body.image ?? current.image,
      description: body.description ?? current.description,
      detailedAbout: body.detailedAbout ?? current.detailedAbout,
      lineup: Array.isArray(body.lineup)
        ? body.lineup
        : typeof body.lineup === "string"
        ? body.lineup.split(",").map((s: string) => s.trim())
        : current.lineup,
      ticketCategories: body.ticketCategories ?? current.ticketCategories,
    };

    await writeJsonFile("events.json", events);
    return NextResponse.json({ success: true, event: events[index] });
  } catch (error) {
    console.error("Edit event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE an event
export async function DELETE(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const events = await readJsonFile<EventData[]>("events.json");
    const filtered = events.filter((e) => e.id !== id);

    if (filtered.length === events.length) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await writeJsonFile("events.json", filtered);
    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
