/**
 * Request Routing Layer (Proxy)
 *
 * Responsibilities:
 * 1. Detect preferred locale from cookie or Accept-Language
 * 2. Redirect unlocalized paths to locale-prefixed versions
 * 3. Normalize trailing slashes for SEO consistency
 * 4. Guard against malformed double-locale-prefix paths
 * 5. Skip API routes, Next internals, and static asset/file requests
 * 6. Pass locale-derived document language headers downstream
 *
 * NOTE:
 * - params.locale remains the route source of truth
 * - headers are only supplemental for root layout / document attributes
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  LOCALE_CONFIGS,
} from "@/lib/i18n/config";

const UNLOCALIZED_PREFIXES = [
  "/api",
  "/_next",
  "/static",
  "/favicon",
  "/robots",
  "/sitemap",
];

const PUBLIC_SEO_PAGES = new Set([
  "destinations",
  "about-us",
  "blog",
  "contact",
  "cookie-policy",
  "events",
  "invest",
  "map",
  "partner",
  "privacy-policy",
  "real-estate",
  "terms",
]);

function isSupportedLocale(value?: string | null): value is string {
  return (
    !!value &&
    SUPPORTED_LOCALES.includes(value as (typeof SUPPORTED_LOCALES)[number])
  );
}

function isFileRequest(pathname: string): boolean {
  return /\.[a-z0-9]+$/i.test(pathname);
}

function isUnlocalizedRoute(pathname: string): boolean {
  if (UNLOCALIZED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  if (isFileRequest(pathname)) {
    return true;
  }

  return false;
}

function getPreferredLocale(_request: NextRequest): string {
  // Only English is supported — always return the default locale
  return DEFAULT_LOCALE;
}

function buildRequestHeaders(request: NextRequest, locale: string): Headers {
  const headers = new Headers(request.headers);

  headers.set("x-locale", locale);
  headers.set(
    "x-html-lang",
    LOCALE_CONFIGS[locale as keyof typeof LOCALE_CONFIGS]?.hreflang ?? "en-GB",
  );

  return headers;
}

function redirectTo(
  request: NextRequest,
  pathname: string,
  status: 301 | 307 | 308,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, status);
}

function nextWithLocaleHeaders(request: NextRequest, locale: string) {
  return NextResponse.next({
    request: {
      headers: buildRequestHeaders(request, locale),
    },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isUnlocalizedRoute(pathname)) {
    return nextWithLocaleHeaders(request, DEFAULT_LOCALE);
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;
  const secondSegment = segments[1]?.toLowerCase() ?? null;
  const hasValidLocalePrefix = isSupportedLocale(firstSegment);
  const currentLocale = getLocaleFromPathname(pathname);

  if (hasValidLocalePrefix && isSupportedLocale(secondSegment)) {
    return new NextResponse(null, { status: 404 });
  }

  if (hasValidLocalePrefix && currentLocale) {
    if (pathname !== "/" && pathname.endsWith("/")) {
      const normalized = pathname.slice(0, -1);
      return redirectTo(request, normalized, 308);
    }

    return nextWithLocaleHeaders(request, currentLocale);
  }

  const locale = getPreferredLocale(request);

  if (pathname === "/") {
    return redirectTo(request, `/${locale}`, 307);
  }

  const localizedPath = `/${locale}${pathname}`;
  const pageSlug = segments[0]?.toLowerCase() ?? "";
  const isPublicSeoPage = PUBLIC_SEO_PAGES.has(pageSlug);
  const status = isPublicSeoPage ? 301 : 307;

  return redirectTo(request, localizedPath, status);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except the most obvious Next internals.
     * Fine-grained skipping for files/assets is handled inside proxy().
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
