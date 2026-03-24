import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Note: Most redirect logic moved to next.config.ts > redirects()
// This middleware is kept minimal for locale detection (if needed in future)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🛑 Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Return as-is (redirects handled by next.config.ts)
  return NextResponse.next();
}

// Only run middleware for non-static paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};