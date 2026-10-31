import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { PlatformSocialConfig } from "@/types";
import { fetchYouTubeStats } from "@/lib/youtubeScraper";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await readJsonFile<PlatformSocialConfig>("social_settings.json");

    // Check if YouTube Auto-Sync is needed (once every 2 hours)
    const now = Date.now();
    const lastSync = settings.youtube?.lastAutoSyncedAt
      ? new Date(settings.youtube.lastAutoSyncedAt).getTime()
      : 0;
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    let updated = false;

    if (now - lastSync > TWO_HOURS && settings.youtube?.enabled !== false) {
      try {
        const handle = settings.youtube?.handle || settings.youtube?.channelUrl || "@djg-spark";
        const ytData = await fetchYouTubeStats(handle);

        if (ytData.success && ytData.subscribers) {
          const currentSub = settings.youtube?.subscribers || "";
          if (currentSub !== ytData.subscribers) {
            settings.youtube = {
              ...settings.youtube,
              subscribers: ytData.subscribers,
              subtext: `${ytData.subscribers} Subscribers • 4K HDR Live Sets & Official Shows Aftermovies`,
              lastAutoSyncedAt: new Date().toISOString(),
            };
            updated = true;
          } else {
            // Touch timestamp so we don't re-check on every request
            settings.youtube.lastAutoSyncedAt = new Date().toISOString();
            updated = true;
          }
        }
      } catch (ytErr) {
        console.warn("[SocialStats] YouTube background auto-sync skipped:", ytErr);
      }
    }

    if (updated) {
      // Persist to MongoDB in background
      writeJsonFile("social_settings.json", settings).catch((err) =>
        console.error("[SocialStats] Failed to persist updated social stats:", err)
      );
    }

    return NextResponse.json(settings, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[SocialStats] Error fetching public stats:", error);
    return NextResponse.json(
      { error: "Failed to load social metrics" },
      { status: 500 }
    );
  }
}
