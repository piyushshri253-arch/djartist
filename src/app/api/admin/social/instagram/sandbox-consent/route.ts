import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meta &bull; Authorize Instagram Account</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #000000; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #121212; border: 1px solid #262626; border-radius: 16px; width: 100%; max-width: 440px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); margin-bottom: 20px; }
    .logo-badge svg { width: 32px; height: 32px; fill: white; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p.subtitle { font-size: 13px; color: #a8a8a8; line-height: 1.5; margin-bottom: 24px; }
    .app-box { background: #1a1a1a; border: 1px solid #333333; border-radius: 10px; padding: 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .app-avatar { width: 42px; height: 42px; border-radius: 50%; background: #262626; object-fit: cover; }
    .app-info { flex: 1; }
    .app-name { font-size: 14px; font-weight: 600; color: #ffffff; }
    .app-handle { font-size: 12px; color: #888888; font-family: monospace; }
    .permissions { margin-bottom: 28px; }
    .perm-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888888; margin-bottom: 12px; }
    .perm-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #dbdbdb; margin-bottom: 10px; line-height: 1.4; }
    .perm-check { color: #0095f6; font-size: 14px; }
    .actions { display: flex; flex-direction: column; gap: 10px; }
    .btn-auth { background: #0095f6; color: #ffffff; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; text-decoration: none; transition: background 0.2s; }
    .btn-auth:hover { background: #1877f2; }
    .btn-cancel { background: transparent; color: #a8a8a8; border: 1px solid #333333; border-radius: 8px; padding: 10px; font-size: 13px; text-align: center; text-decoration: none; transition: color 0.2s; }
    .btn-cancel:hover { color: #ffffff; border-color: #555555; }
    .disclaimer { font-size: 11px; color: #737373; text-align: center; margin-top: 18px; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">
      <svg viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
    <h1>Authorize Instagram Account</h1>
    <p class="subtitle"><strong>DJ G Spark Website Admin</strong> is requesting permission to access your Instagram profile and public reels.</p>

    <div class="app-box">
      <img src="/images/dj_hero.jpg" alt="DJ G Spark" class="app-avatar" />
      <div class="app-info">
        <div class="app-name">DJ G Spark Official</div>
        <div class="app-handle">@djgspark.music &bull; Verified Creator</div>
      </div>
    </div>

    <div class="permissions">
      <div class="perm-title">Permissions Requested</div>
      <div class="perm-item">
        <span class="perm-check">&check;</span>
        <span>Access profile info (username, profile photo, follower reach)</span>
      </div>
      <div class="perm-item">
        <span class="perm-check">&check;</span>
        <span>Read public reels and videos to display on your official tour website</span>
      </div>
    </div>

    <div class="actions">
      <a href="/api/admin/social/instagram/callback?code=sandbox_code_${Date.now()}&state=${encodeURIComponent(state)}" class="btn-auth">
        Authorize @djgspark.music
      </a>
      <a href="/api/admin/social/instagram/callback?error=access_denied&error_description=User+cancelled+authorization&state=${encodeURIComponent(state)}" class="btn-cancel">
        Cancel
      </a>
    </div>

    <p class="disclaimer">
      Meta Platforms, Inc. &bull; By clicking Authorize, you grant read-only access to showcase your official content on djgspark.com.
    </p>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
