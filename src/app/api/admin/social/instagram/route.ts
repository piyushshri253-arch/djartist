import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb } from "@/lib/instagram-crypto";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  if (!hasPermission(admin, "social_media.instagram.manage")) {
    return NextResponse.json({ error: "Permission denied: Requires social_media.instagram.manage" }, { status: 403 });
  }

  const db = readInstagramDb();

  // Strictly sanitize sensitive credentials before sending to admin UI
  const sanitizedConnection = {
    id: db.connection.id,
    instagramUserId: db.connection.instagramUserId,
    username: db.connection.username,
    profilePicture: db.connection.profilePicture,
    status: db.connection.status,
    connectedAt: db.connection.connectedAt,
    lastSyncedAt: db.connection.lastSyncedAt,
    tokenExpiresAt: db.connection.tokenExpiresAt,
    createdAt: db.connection.createdAt,
    updatedAt: db.connection.updatedAt,
  };

  return NextResponse.json({
    connection: sanitizedConnection,
    settings: db.settings,
    reels: db.reels,
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}
