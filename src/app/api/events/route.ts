import { NextResponse } from "next/server";
import { readJsonFile, getDeletedEventIdentifiers } from "@/lib/serverData";
import { EventData } from "@/app/api/admin/events/route";
import { isEventPast, getAutoEventStatus } from "@/lib/eventsHelper";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "upcoming" | "past" | "all"

    const [allEvents, deletedSet] = await Promise.all([
      readJsonFile<EventData[]>("events.json"),
      getDeletedEventIdentifiers(),
    ]);
    
    // Only return events where isPublished is not explicitly false and not deleted
    let events = (allEvents || []).filter((ev) => {
      if (ev.isPublished === false) return false;
      if (ev.id && deletedSet.has(ev.id.toLowerCase().trim())) return false;
      if (ev.slug && deletedSet.has(ev.slug.toLowerCase().trim())) return false;
      if (ev.title && deletedSet.has(ev.title.toLowerCase().trim())) return false;
      return true;
    });

    // Auto-annotate isPast and auto status
    const annotatedEvents = events.map((ev) => {
      const past = isEventPast(ev.date);
      return {
        ...ev,
        isPast: past,
        status: past ? "COMPLETED" : (ev.status || "ONSALE NOW"),
      };
    });

    if (type === "upcoming") {
      const upcoming = annotatedEvents.filter((ev) => !ev.isPast);
      return NextResponse.json(upcoming, {
        headers: NO_STORE_HEADERS,
      });
    }

    if (type === "past") {
      const past = annotatedEvents.filter((ev) => ev.isPast);
      return NextResponse.json(past, {
        headers: NO_STORE_HEADERS,
      });
    }

    return NextResponse.json(annotatedEvents, {
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

