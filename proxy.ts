/**
 * Request Routing Layer (Proxy)
 *
 * Responsibilities:
 * 1. Detect user's preferred language from Accept-Language header or cookie
 * 2. Redirect unlocalized paths to locale-prefixed versions
 * 3. Normalize trailing slashes for SEO consistency
 * 4. Guard against double-locale-prefix bugs
 * 5. Skip API routes and static assets
 * 6. Pass locale-derived document language to the root layout
 *
 * NOTE: params.locale remains the route source of truth; headers are only for root document attrs.
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  LOCALE_CONFIGS,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n/config";

/**
 * Routes that should NOT be locale-prefixed
 */
const UNLOCALIZED_ROUTES = ["/api", "/_next", "/static", "/favicon", "/robots", "/sitemap"];

/**
 * Public SEO pages that should use 301 redirects (preserve page rank)
 */
const PUBLIC_SEO_PAGES = [
  "destinations", "about-us", "blog", "contact", "cookie-policy",
  "events", "invest", "map", "partner", "privacy-policy", "real-estate", "terms"
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const attachLocaleHeaders = (locale: string) => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", locale);
    requestHeaders.set("x-html-lang", LOCALE_CONFIGS[locale as keyof typeof LOCALE_CONFIGS]?.hreflang ?? "en-GB");
    return requestHeaders;
  };

  // Skip unlocalized routes (API, static assets, etc.)
  if (UNLOCALIZED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next({
      request: {
        headers: attachLocaleHeaders(DEFAULT_LOCALE),
      },
    });
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

    // ✅ CRITICAL: Block double-prefix bug (/en/en/map, /pt-pt/pt-pt/map)
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 1) {
      const secondSegment = segments[1]?.toLowerCase();
      // If second segment is also a valid locale, reject as malformed
      if (secondSegment && SUPPORTED_LOCALES.includes(secondSegment as any)) {
        return new NextResponse(null, { status: 404 });
      }
    }

    // Normalize trailing slash for other paths: /en/map/ → /en/map
    if (pathname !== "/" && pathname.endsWith("/")) {
      return NextResponse.redirect(
        new URL(pathname.slice(0, -1), request.url)
      );
    }

    return NextResponse.next({
      request: {
        headers: attachLocaleHeaders(currentLocale),
      },
    });
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
    return NextResponse.redirect(new URL(`/${locale}/`, request.url), 307);
  }

  // ✅ REDIRECT: Unlocalized path → add locale prefix
  // Example: /map → /en/map
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  // Use 301 (permanent) for public SEO pages to preserve page rank
  // Use 307 (temporary) for private routes
  const isPublicPage = PUBLIC_SEO_PAGES.some(page => pathname === `/${page}` || pathname.startsWith(`/${page}/`));
  const statusCode = isPublicPage ? 301 : 307;

  return NextResponse.redirect(newUrl, statusCode);
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
