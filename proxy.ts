/**
 * Request Routing Layer (Proxy)
 *
 * Responsibilities:
 * 1. Detect preferred locale from cookie or Accept-Language
 * 2. Redirect unlocalized paths to locale-prefixed versions
 * 3. Normalize trailing slashes for SEO consistency
 * 4. Guard against malformed double-locale-prefix paths
 * 5. Skip API routes, Next internals, and static asset/file requests
 *
 * NOTE:
 * - params.locale remains the route source of truth
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LANGUAGE_MAP,
  getLocaleFromPathname,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n/config";

const UNLOCALIZED_PREFIXES = [
  "/api",
  "/_next",
  "/static",
  "/favicon",
  "/robots",
  "/sitemap",
];

const UNLOCALIZED_CANONICAL_PATHS = new Set([
  "/signup",
  "/forgot-password",
  "/maintenance",
]);

const PUBLIC_SEO_PAGES = new Set([
  "destinations",
  "about-us",
  "blog",
  "contact",
  "cookie-policy",
  "events",
  "experiences",
  "golf",
  "invest",
  "map",
  "partner",
  "privacy-policy",
  "properties",
  "real-estate",
  "residence",
  "stay",
  "terms",
]);

const LOCALE_SEGMENT_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

function isSupportedLocale(value?: string | null): value is string {
  return (
    !!value &&
    SUPPORTED_LOCALES.includes(value as (typeof SUPPORTED_LOCALES)[number])
  );
}

function looksLikeLocaleSegment(value?: string | null): boolean {
  return !!value && LOCALE_SEGMENT_PATTERN.test(value);
}

function resolveLocaleAliasSegment(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (isSupportedLocale(normalized)) {
    return null;
  }

  const mapped = LOCALE_LANGUAGE_MAP[normalized];
  return isSupportedLocale(mapped) ? mapped : null;
}

function resolveLocaleLikeSegment(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  return resolveLocaleAliasSegment(normalized);
}

export function getLocalizedPathFromLocaleAlias(pathname: string): string | null {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;
  const mappedLocale = resolveLocaleAliasSegment(firstSegment);

  if (!mappedLocale) {
    return null;
  }

  return buildPathnameFromSegments([mappedLocale, ...segments.slice(1)]);
}

export function getLocalizedPathFromNestedLocaleAlias(pathname: string): string | null {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;

  if (!isSupportedLocale(firstSegment)) {
    return null;
  }

  const secondSegment = segments[1]?.toLowerCase() ?? null;
  const mappedLocale = resolveLocaleAliasSegment(secondSegment);

  if (!mappedLocale) {
    return null;
  }

  return buildPathnameFromSegments([mappedLocale, ...segments.slice(2)]);
}

export function getLocalizedPathFromLegacyVisitLocaleAlias(pathname: string): string | null {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;
  const secondSegment = segments[1]?.toLowerCase() ?? null;

  if (!isSupportedLocale(firstSegment) || secondSegment !== "visit") {
    return null;
  }

  const localeLikeSegment = segments[2]?.toLowerCase() ?? null;
  const resolvedLocale = resolveLocaleLikeSegment(localeLikeSegment);

  if (!resolvedLocale) {
    return null;
  }

  return buildPathnameFromSegments([resolvedLocale, ...segments.slice(3)]);
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

function normalizePathname(pathname: string): string {
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function buildPathnameFromSegments(segments: string[]): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function isUnlocalizedCanonicalPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  if (UNLOCALIZED_CANONICAL_PATHS.has(normalizedPathname)) {
    return true;
  }

  const segments = normalizedPathname.split("/").filter(Boolean);
  if (segments.length === 2 && segments[0]?.toLowerCase() === "real-estate") {
    return true;
  }

  return false;
}

export function getUnlocalizedCanonicalPathFromRequestPath(pathname: string): string | null {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;
  const hasValidLocalePrefix = isSupportedLocale(firstSegment);

  if (hasValidLocalePrefix) {
    const pathWithoutLocale = buildPathnameFromSegments(segments.slice(1));
    return isUnlocalizedCanonicalPath(pathWithoutLocale) ? pathWithoutLocale : null;
  }

  return isUnlocalizedCanonicalPath(normalizedPathname) ? normalizedPathname : null;
}

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  const resolved = resolveLocaleFromAcceptLanguage(acceptLanguage);

  return isSupportedLocale(resolved) ? resolved : DEFAULT_LOCALE;
}

function redirectTo(
  request: NextRequest,
  pathname: string,
  status: 301 | 302 | 307 | 308,
  options?: {
    varyByLocaleSignals?: boolean;
  },
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url, status);

  if (options?.varyByLocaleSignals) {
    response.headers.set("Vary", "Accept-Language, Cookie");
  }

  return response;
}

export function proxy(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;
  const pathname = normalizePathname(rawPathname);

  if (isUnlocalizedRoute(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;
  const secondSegment = segments[1]?.toLowerCase() ?? null;
  const aliasedLocalizedPath = getLocalizedPathFromLocaleAlias(pathname);
  const nestedAliasedLocalizedPath = getLocalizedPathFromNestedLocaleAlias(pathname);
  const legacyVisitAliasedLocalizedPath = getLocalizedPathFromLegacyVisitLocaleAlias(pathname);
  const hasValidLocalePrefix = isSupportedLocale(firstSegment);
  const currentLocale = getLocaleFromPathname(pathname);
  const unlocalizedPath = getUnlocalizedCanonicalPathFromRequestPath(pathname);

  if (aliasedLocalizedPath) {
    return redirectTo(request, aliasedLocalizedPath, 308);
  }

  if (nestedAliasedLocalizedPath) {
    return redirectTo(request, nestedAliasedLocalizedPath, 308);
  }

  if (legacyVisitAliasedLocalizedPath) {
    return redirectTo(request, legacyVisitAliasedLocalizedPath, 308);
  }

  if (!hasValidLocalePrefix && looksLikeLocaleSegment(firstSegment)) {
    return new NextResponse(null, { status: 404 });
  }

  if (hasValidLocalePrefix && isSupportedLocale(secondSegment)) {
    return new NextResponse(null, { status: 404 });
  }

  if (hasValidLocalePrefix && unlocalizedPath) {
    return redirectTo(request, unlocalizedPath, 307);
  }

  if (hasValidLocalePrefix && currentLocale) {
    if (rawPathname !== "/" && rawPathname.endsWith("/")) {
      return redirectTo(request, pathname, 308);
    }

    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);

  if (pathname === "/") {
    return redirectTo(request, `/${locale}`, 302, {
      varyByLocaleSignals: true,
    });
  }

  if (unlocalizedPath) {
    return NextResponse.next();
  }

  const localizedPath = `/${locale}${pathname}`;
  const pageSlug = segments[0]?.toLowerCase() ?? "";
  const isPublicSeoPage = PUBLIC_SEO_PAGES.has(pageSlug);
  const status = isPublicSeoPage ? 301 : 307;

  return redirectTo(request, localizedPath, status);
}

export const config = {
  matcher: [
    {
      /*
       * Run on all paths except the most obvious Next internals.
       * Fine-grained skipping for files/assets is handled inside proxy().
       * Skip client-side route prefetches so viewport-visible links do not
       * trigger proxy work before a user actually navigates.
       */
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
