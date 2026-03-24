/**
 * Internationalization Middleware
 *
 * Responsibilities:
 * 1. Detect user's preferred language from Accept-Language header
 * 2. Redirect "/" to "/[locale]/"
 * 3. Set "x-locale" header for server components
 * 4. Skip API routes and static assets
 *
 * Usage:
 * This is an ALTERNATIVE middleware. Your current middleware.ts (for Supabase)
 * should be preserved. You can merge these together if needed.
 *
 * OPTION A: Replace current middleware
 * OPTION B: Create this as a separate layer (proxy pattern)
 * OPTION C: Merge with existing middleware
 *
 * We recommend OPTION B or C.
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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip unlocalized routes
  if (UNLOCALIZED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip if path already has a locale prefix
  const locale = getLocaleFromPathname(pathname);
  if (locale !== DEFAULT_LOCALE || SUPPORTED_LOCALES.includes(pathname.split("/")[1] ?? "")) {
    // Path has valid locale, just set header and continue
    const response = NextResponse.next();
    response.headers.set("x-locale", locale);
    return response;
  }

  // Handle root "/" - redirect to locale-specific URL
  if (pathname === "/") {
    const acceptLanguage = request.headers.get("accept-language");
    const detectedLocale = resolveLocaleFromAcceptLanguage(acceptLanguage);
    const response = NextResponse.redirect(new URL(`/${detectedLocale}/`, request.url));
    response.headers.set("x-locale", detectedLocale);
    return response;
  }

  // Handle root-level pages without locale (e.g., "/about")
  // Redirect to default locale version
  const response = NextResponse.redirect(
    new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url)
  );
  response.headers.set("x-locale", DEFAULT_LOCALE);
  return response;
}

export const config = {
  // Match all pathnames except static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - .git folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.git).*)",
  ],
};
