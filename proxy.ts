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
  DEFAULT_LOCALE,
  LOCALE_LANGUAGE_MAP,
} from "@/lib/i18n/config";
import {
  getCanonicalLocalizedPathname,
  getCanonicalUnlocalizedPath,
  isSystemBypassPath,
  LOCALE_COOKIE_NAME,
  REQUEST_LOCALE_HEADER_NAME,
  normalizePathname,
  PUBLIC_SEO_PAGES,
} from "@/lib/i18n/route-rules";
import {
  getLocaleFromPathname,
  hasLocalePrefix,
  isValidLocale,
  resolveLocaleFromAcceptLanguage,
} from "@/lib/i18n/locale-utils";
import { resolveLegacyCategoryCityRoute } from "@/lib/seo/programmatic/legacy-category-city-route";

const LOCALE_SEGMENT_PATTERN = /^[a-z]{2}(?:-[a-z]{2})?$/i;

function looksLikeLocaleSegment(value?: string | null): boolean {
  return !!value && LOCALE_SEGMENT_PATTERN.test(value);
}

function resolveLocaleAliasSegment(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (isValidLocale(normalized)) {
    return null;
  }

  const mapped = LOCALE_LANGUAGE_MAP[normalized];
  return isValidLocale(mapped) ? mapped : null;
}

function resolveLocaleLikeSegment(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  if (isValidLocale(normalized)) {
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

  if (!isValidLocale(firstSegment)) {
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

  if (!isValidLocale(firstSegment) || secondSegment !== "visit") {
    return null;
  }

  const localeLikeSegment = segments[2]?.toLowerCase() ?? null;
  const resolvedLocale = resolveLocaleLikeSegment(localeLikeSegment);

  if (!resolvedLocale) {
    return null;
  }

  return buildPathnameFromSegments([resolvedLocale, ...segments.slice(3)]);
}

function buildPathnameFromSegments(segments: string[]): string {
  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

export function getUnlocalizedCanonicalPathFromRequestPath(pathname: string): string | null {
  return getCanonicalUnlocalizedPath(pathname);
}

function getPreferredLocale(request: NextRequest): string {
  const requestedPath =
    request.nextUrl.searchParams.get("next") ||
    request.nextUrl.searchParams.get("from");
  if (requestedPath?.startsWith("/") && hasLocalePrefix(requestedPath)) {
    return getLocaleFromPathname(requestedPath);
  }

  const localeHint = request.nextUrl.searchParams.get("locale")?.toLowerCase();
  if (isValidLocale(localeHint)) {
    return localeHint;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  const resolved = resolveLocaleFromAcceptLanguage(acceptLanguage);

  return isValidLocale(resolved) ? resolved : DEFAULT_LOCALE;
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

function continueWithLocale(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_LOCALE_HEADER_NAME, locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function proxy(request: NextRequest) {
  const rawPathname = request.nextUrl.pathname;
  const pathname = normalizePathname(rawPathname);

  if (isSystemBypassPath(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase() ?? null;
  const secondSegment = segments[1]?.toLowerCase() ?? null;
  const thirdSegment = segments[2]?.toLowerCase() ?? null;
  const aliasedLocalizedPath = getLocalizedPathFromLocaleAlias(pathname);
  const nestedAliasedLocalizedPath = getLocalizedPathFromNestedLocaleAlias(pathname);
  const legacyVisitAliasedLocalizedPath = getLocalizedPathFromLegacyVisitLocaleAlias(pathname);
  const hasValidLocalePrefix = isValidLocale(firstSegment);
  const currentLocale = getLocaleFromPathname(pathname);
  const canonicalLocalizedPath = getCanonicalLocalizedPathname(pathname);
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

  if (hasValidLocalePrefix && isValidLocale(secondSegment)) {
    return new NextResponse(null, { status: 404 });
  }

  if (hasValidLocalePrefix && currentLocale && secondSegment && thirdSegment) {
    const legacyCategoryCityRoute = resolveLegacyCategoryCityRoute(
      currentLocale,
      secondSegment,
      thirdSegment,
    );

    if (legacyCategoryCityRoute) {
      return redirectTo(request, `/${currentLocale}${legacyCategoryCityRoute.canonicalPath}`, 308);
    }
  }

  if (hasValidLocalePrefix && unlocalizedPath) {
    return redirectTo(request, unlocalizedPath, 307);
  }

  if (hasValidLocalePrefix && canonicalLocalizedPath) {
    return redirectTo(request, `/${currentLocale}${canonicalLocalizedPath}`, 308);
  }

  if (hasValidLocalePrefix && currentLocale) {
    if (rawPathname !== "/" && rawPathname.endsWith("/")) {
      return redirectTo(request, pathname, 308);
    }

    return continueWithLocale(request, currentLocale);
  }

  const locale = getPreferredLocale(request);

  if (pathname === "/") {
    return redirectTo(request, `/${locale}`, 302, {
      varyByLocaleSignals: true,
    });
  }

  if (canonicalLocalizedPath) {
    return redirectTo(request, `/${locale}${canonicalLocalizedPath}`, 307, {
      varyByLocaleSignals: true,
    });
  }

  if (unlocalizedPath) {
    return continueWithLocale(request, DEFAULT_LOCALE);
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
