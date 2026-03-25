/**
 * Request Routing Layer (Proxy)
 *
 * Responsibilities:
 * 1. Detect user's preferred language from Accept-Language header or cookie
 * 2. Redirect unlocalized paths to locale-prefixed versions
 * 3. Normalize trailing slashes for SEO consistency
 * 4. Guard against double-locale-prefix bugs
 * 5. Skip API routes and static assets
 *
 * NOTE: Does NOT set x-locale header (we use params.locale from routing instead)
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n/config";

/**
 * Routes that should NOT be locale-prefixed
 */
const UNLOCALIZED_ROUTES = ["/api", "/_next", "/static", "/favicon", "/robots", "/sitemap"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip unlocalized routes (API, static assets, etc.)
  if (UNLOCALIZED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get current locale from pathname
  const currentLocale = getLocaleFromPathname(pathname);
  const firstSegment = pathname.split("/")[1]?.toLowerCase();
  const hasValidLocale = firstSegment && SUPPORTED_LOCALES.includes(firstSegment as any);

  // ✅ GUARD: If path already has valid locale prefix, do nothing
  if (hasValidLocale) {
    // Normalize trailing slash for locale-only paths: /en → /en/
    if (pathname.split("/").filter(Boolean).length === 1) {
      return NextResponse.redirect(new URL(`/${firstSegment}/`, request.url));
    }

    // Normalize trailing slash for other paths: /en/map/ → /en/map
    if (pathname !== "/" && pathname.endsWith("/")) {
      return NextResponse.redirect(
        new URL(pathname.slice(0, -1), request.url)
      );
    }

    return NextResponse.next();
  }

  // Detect which locale to use
  let locale: string = DEFAULT_LOCALE;

  // Try to get from cookie first (user preference)
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as any)) {
    locale = cookieLocale as string;
  }
  // Then try Accept-Language header
  else if (pathname === "/") {
    const acceptLanguage = request.headers.get("accept-language");
    locale = resolveLocaleFromAcceptLanguage(acceptLanguage);
  }

  // ✅ HANDLE: Root path "/" → redirect to locale-specific root
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}/`, request.url));
  }

  // ✅ REDIRECT: Unlocalized path → add locale prefix
  // Example: /map → /en/map
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  // Match all pathnames except static files and API routes
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
