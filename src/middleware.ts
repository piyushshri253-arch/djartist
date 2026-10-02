import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Set noindex headers for all admin pages to prevent search engine indexing
  const isSecurityAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Public exceptions inside the admin tree
  const isLoginPageRoute = pathname === "/admin/login";
  const isLoginApiRoute = pathname === "/api/admin/auth/login";
  const isLogoutApiRoute = pathname === "/api/admin/auth/logout";
  const isInstagramCallback = pathname === "/api/admin/social/instagram/callback";

  if (isSecurityAdminPath && !isLoginPageRoute && !isLoginApiRoute && !isLogoutApiRoute && !isInstagramCallback) {
    const sessionCookie = request.cookies.get("dj_admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json(
          { error: "Unauthorized access. Authentication token required." },
          {
            status: 401,
            headers: {
              "Cache-Control": "no-store, max-age=0",
              "X-Robots-Tag": "noindex, nofollow, noarchive",
            },
          }
        );
      } else {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        return redirectRes;
      }
    }
  }

  const response = NextResponse.next();
  if (isSecurityAdminPath) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
