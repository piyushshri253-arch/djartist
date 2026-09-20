import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/auth";
import { readInstagramDb, writeInstagramDb, decryptToken } from "@/lib/instagram-crypto";

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

  // 1. Attempt token revocation with Meta if token is present
  if (
    db.connection.accessTokenEncrypted &&
    db.connection.tokenIv &&
    db.connection.tokenAuthTag
  ) {
    try {
      const plainToken = decryptToken(
        db.connection.accessTokenEncrypted,
        db.connection.tokenIv,
        db.connection.tokenAuthTag
      );
      if (plainToken) {
        await fetch(
          `https://graph.facebook.com/v21.0/me/permissions?access_token=${encodeURIComponent(
            plainToken
          )}`,
          { method: "DELETE" }
        ).catch(() => {});
      }
    } catch {
      // Ignore network errors on revocation
    }
  }

  // Wiping tokens and sensitive auth data
  delete db.connection.accessTokenEncrypted;
  delete db.connection.tokenIv;
  delete db.connection.tokenAuthTag;
  delete db.connection.tokenExpiresAt;

  // 2. Clear account identity & purge reels so they never mix with next connected account
  db.connection.status = "disconnected";
  db.connection.username = "";
  db.connection.instagramUserId = "";
  db.connection.profilePicture = "";
  db.connection.updatedAt = now;

  // 3. Clear reels and selection
  db.reels = [];
  db.selectedReelIds = [];

  // 4. Auto-disable public section when disconnected
  db.settings.instagramEnabled = false;
  db.settings.updatedAt = now;

  await writeInstagramDb(db);

  return NextResponse.json({
    success: true,
    message: "Instagram account disconnected successfully. Tokens have been revoked and deleted.",
    status: "disconnected",
  });
}
