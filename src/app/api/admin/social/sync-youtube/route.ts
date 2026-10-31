import { NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/serverData";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { PlatformSocialConfig } from "@/types";
import { fetchYouTubeStats } from "@/lib/youtubeScraper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const current = await readJsonFile<PlatformSocialConfig>("social_settings.json");
    const handle = current.youtube?.handle || current.youtube?.channelUrl || "@djg-spark";

    const ytData = await fetchYouTubeStats(handle);
    if (!ytData.success || !ytData.subscribers) {
      return NextResponse.json(
        {
          success: false,
          error: ytData.error || "Could not fetch YouTube statistics right now. Please try again.",
        },
        { status: 502 }
      );
    }

    const updated: PlatformSocialConfig = {
      ...current,
      youtube: {
        ...current.youtube,
        subscribers: ytData.subscribers,
        subtext: `${ytData.subscribers} Subscribers • 4K HDR Live Sets & Official Shows Aftermovies`,
        lastAutoSyncedAt: new Date().toISOString(),
      },
    };

    await writeJsonFile("social_settings.json", updated);

    return NextResponse.json({
      success: true,
      message: `YouTube synced successfully! Found ${ytData.subscribers} subscribers.`,
      subscribers: ytData.subscribers,
      settings: updated,
    });
  } catch (err: any) {
    console.error("[SyncYouTube] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
