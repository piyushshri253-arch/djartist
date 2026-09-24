import { NextResponse } from "next/server";
import { readJsonFile, getDeletedEventIdentifiers } from "@/lib/serverData";
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

    const [allEvents, dedicatedPastEvents, deletedSet] = await Promise.all([
      readJsonFile<EventData[]>("events.json").catch(() => []),
      readJsonFile<any[]>("past-events.json").catch(() => []),
      getDeletedEventIdentifiers(),
    ]);

    const isDeleted = (ev: any) => {
      if (!ev) return true;
      if (ev.id && deletedSet.has(String(ev.id).toLowerCase().trim())) return true;
      if (ev.slug && deletedSet.has(String(ev.slug).toLowerCase().trim())) return true;
      if (ev.title && deletedSet.has(String(ev.title).toLowerCase().trim())) return true;
      return false;
    };
    
    const eventsList = (Array.isArray(allEvents) ? allEvents : []).filter((e) => !isDeleted(e));

    // Auto-filter: Only events whose date has passed or are marked completed, and published
    let pastEvents = eventsList.filter((ev) => {
      if (ev.isPublished === false) return false;
      return isEventPast(ev.date) || ev.status === "COMPLETED";
    });

    // Merge dedicated past events if not already included and not deleted
    if (Array.isArray(dedicatedPastEvents) && dedicatedPastEvents.length > 0) {
      const existingKeys = new Set(pastEvents.map((e) => e.slug || e.id));
      for (const d of dedicatedPastEvents) {
        if (!isDeleted(d) && !existingKeys.has(d.slug) && !existingKeys.has(d.id)) {
          pastEvents.push({
            ...d,
            status: "COMPLETED",
            isPublished: true,
          });
          existingKeys.add(d.slug || d.id);
        }
      }
    }

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

