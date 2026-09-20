import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, getMetaConfig, sanitizeConnection } from "@/lib/instagram-crypto";

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  if (!hasPermission(admin, "social_media.instagram.manage")) {
    return NextResponse.json(
      { error: "Permission denied: Requires social_media.instagram.manage" },
      { status: 403 }
    );
  }

  const db = await readInstagramDb();
  const { isConfigured, redirectUri } = getMetaConfig(request.url);

  const sanitizedConnection = sanitizeConnection(db.connection);

  return NextResponse.json(
    {
      connection: sanitizedConnection,
      settings: db.settings,
      reels: db.reels || [],
      selectedReelIds: db.selectedReelIds || [],
      sources: db.sources || [],
      activeAccountId: db.activeAccountId || db.connection.id,
      metaConfig: {
        isConfigured,
        redirectUri,
      },
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
