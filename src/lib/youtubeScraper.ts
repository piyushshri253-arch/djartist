/**
 * YouTube Public Channel Scraper (No API Key Required)
 * Safely fetches public subscriber metrics from channel HTML without requiring Google Cloud API keys.
 */

export interface YouTubePublicStats {
  success: boolean;
  subscribers?: string;
  handle?: string;
  fetchedAt?: string;
  error?: string;
}

export async function fetchYouTubeStats(channelUrlOrHandle: string = "@djg-spark"): Promise<YouTubePublicStats> {
  try {
    let handle = channelUrlOrHandle.trim();
    if (handle.includes("youtube.com/")) {
      const match = handle.match(/youtube\.com\/(@[a-zA-Z0-9_.-]+)/i);
      if (match) {
        handle = match[1];
      }
    }
    if (!handle.startsWith("@")) {
      handle = `@${handle}`;
    }

    const targetUrl = `https://www.youtube.com/${handle}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { success: false, error: `YouTube returned status ${res.status}` };
    }

    const html = await res.text();

    // Strategy 1: "X.XK subscribers" pattern
    const regex1 = /([0-9.]+[KM]?)\s+subscribers/i;
    const match1 = html.match(regex1);

    // Strategy 2: subscriberCountText JSON token
    const regex2 = /"subscriberCountText":\{[^}]*"simpleText":"([^"]+)"/;
    const match2 = html.match(regex2);

    let rawSubText = "";
    if (match1 && match1[1]) {
      rawSubText = match1[1];
    } else if (match2 && match2[1]) {
      const clean = match2[1].replace(/subscribers/i, "").trim();
      rawSubText = clean;
    }

    if (!rawSubText) {
      return { success: false, error: "Could not parse subscriber count from page" };
    }

    // Format e.g. "41.5K" -> "41.5K+"
    const formatted = rawSubText.endsWith("+") ? rawSubText : `${rawSubText}+`;

    return {
      success: true,
      subscribers: formatted,
      handle,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.name === "AbortError" ? "Fetch timed out" : err?.message || "Unknown error",
    };
  }
}
