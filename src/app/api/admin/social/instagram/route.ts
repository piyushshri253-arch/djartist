import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, getMetaConfig } from "@/lib/instagram-crypto";

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

  let tokenDaysRemaining: number | null = null;
  if (db.connection.tokenExpiresAt) {
    const msRemaining = db.connection.tokenExpiresAt - Date.now();
    tokenDaysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  }

  // Strictly sanitize sensitive credentials before sending to admin UI
  // NEVER send accessToken, accessTokenEncrypted, tokenIv, or tokenAuthTag to client
  const sanitizedConnection = {
    id: db.connection.id,
    instagramUserId: db.connection.instagramUserId,
    username: db.connection.username,
    profilePicture: db.connection.profilePicture || "/images/dj_hero.jpg",
    status: db.connection.status,
    connectedAt: db.connection.connectedAt,
    lastSyncedAt: db.connection.lastSyncedAt,
    tokenExpiresAt: db.connection.tokenExpiresAt,
    tokenDaysRemaining,
    createdAt: db.connection.createdAt,
    updatedAt: db.connection.updatedAt,
  };

  return NextResponse.json(
    {
      connection: sanitizedConnection,
      settings: db.settings,
      reels: db.reels,
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
