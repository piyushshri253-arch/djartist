import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/serverData";
import { EventData } from "@/app/api/admin/events/route";
import { isEventPast } from "@/lib/eventsHelper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const city = searchParams.get("city")?.toLowerCase() || "";
    const location = searchParams.get("location")?.toLowerCase() || "";
    const year = searchParams.get("year");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const sort = searchParams.get("sort") || "latest"; // "latest" | "oldest"

    const allEvents = await readJsonFile<EventData[]>("events.json");
    
    // Auto-filter: Only events whose date has passed or are marked completed, and published
    let pastEvents = (allEvents || []).filter((ev) => {
      if (ev.isPublished === false) return false;
      return isEventPast(ev.date) || ev.status === "COMPLETED";
    });

    // Search filter
    if (query) {
      pastEvents = pastEvents.filter(
        (ev) =>
          ev.title.toLowerCase().includes(query) ||
          ev.city.toLowerCase().includes(query) ||
          ev.venue.toLowerCase().includes(query) ||
          (ev.description && ev.description.toLowerCase().includes(query))
      );
    }

    // Year filter
    if (year && year !== "all") {
      pastEvents = pastEvents.filter((ev) => ev.date && ev.date.startsWith(year));
    }

    // Date range filter
    if (fromDate) {
      pastEvents = pastEvents.filter((ev) => new Date(ev.date) >= new Date(fromDate));
    }
    if (toDate) {
      pastEvents = pastEvents.filter((ev) => new Date(ev.date) <= new Date(toDate + "T23:59:59"));
    }

    // City filter
    if (city && city !== "all") {
      pastEvents = pastEvents.filter((ev) => ev.city.toLowerCase() === city);
    }

    // Location / Place filter
    if (location && location !== "all") {
      pastEvents = pastEvents.filter(
        (ev) =>
          ev.venue.toLowerCase().includes(location) ||
          (ev.address && ev.address.toLowerCase().includes(location))
      );
    }

    // Sorting
    pastEvents.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sort === "oldest" ? timeA - timeB : timeB - timeA;
    });

    return NextResponse.json(pastEvents, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load past events" }, { status: 500 });
  }
}

