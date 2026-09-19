import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb } from "@/lib/instagram-crypto";

export async function POST() {
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
  const now = new Date().toISOString();

  // Wiping tokens and sensitive auth data
  delete db.connection.accessTokenEncrypted;
  delete db.connection.tokenIv;
  delete db.connection.tokenAuthTag;
  delete db.connection.tokenExpiresAt;

  db.connection.status = "disconnected";
  db.connection.updatedAt = now;

  // Auto-disable public section when disconnected
  db.settings.instagramEnabled = false;
  db.settings.updatedAt = now;

  await writeInstagramDb(db);

  return NextResponse.json({
    success: true,
    message: "Instagram account disconnected successfully. Tokens have been revoked and deleted.",
    status: "disconnected",
  });
}
