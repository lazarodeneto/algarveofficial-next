import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n/locales";
import { isValidLocale } from "@/lib/i18n/locale-utils";
import { DEFAULT_LOCALE_USES_PREFIX } from "@/lib/i18n/default-locale-policy";
import { REQUEST_LOCALE_HEADER_NAME, isSystemBypassPath } from "@/lib/i18n/route-rules";
import { isMaintenanceIpWhitelisted } from "@/lib/maintenance";
import { getCanonicalFromUrlSlug, getCategoryUrlSlug } from "@/lib/seo/programmatic/category-slugs";

const PUBLIC_LOCALES: readonly AppLocale[] = SUPPORTED_LOCALES;
const PUBLIC_LOCALE_SET = new Set<string>(PUBLIC_LOCALES);

const MAINTENANCE_BYPASS_ROUTES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
  "/maintenance",
]);
const MAINTENANCE_ENABLED = process.env.MAINTENANCE_MODE?.trim().toLowerCase() === "true";
const MAINTENANCE_WHITELIST = process.env.MAINTENANCE_IP_WHITELIST
  ?.split(",")
  .map((value) => value.trim())
  .filter(Boolean) ?? null;
const RESERVED_ROUTE_SEGMENTS = new Set([
  "about-us",
  "admin",
  "auth",
  "blog",
  "category",
  "contact",
  "cookie-policy",
  "dashboard",
  "destinations",
  "directory",
  "events",
  "golf",
  "invest",
  "listing",
  "live",
  "login",
  "map",
  "owner",
  "partner",
  "partners",
  "pricing",
  "privacy-policy",
  "properties",
  "real-estate",
  "relocation",
  "residence",
  "signup",
  "stay",
  "terms",
  "trips",
  "visit",
]);
const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  activities: "experiences",
};

function normalizePathname(pathname: string): string {
  if (!pathname) return "/";

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (withLeadingSlash !== "/" && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  if (firstSegment && isValidLocale(firstSegment)) {
    const stripped = segments.slice(1).join("/");
    return stripped ? `/${stripped}` : "/";
  }

  return normalized;
}

function isMaintenanceBypassPath(pathname: string): boolean {
  const normalized = stripLocalePrefix(pathname);

  if (normalized.startsWith("/admin")) {
    return true;
  }

  return MAINTENANCE_BYPASS_ROUTES.has(normalized);
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstForwarded = forwardedFor.split(",")[0]?.trim();
    if (firstForwarded) return firstForwarded;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return null;
}

function isPublicLocale(locale: string | null | undefined): locale is AppLocale {
  if (!locale) return false;
  return PUBLIC_LOCALE_SET.has(locale.toLowerCase());
}

function nextWithRequestLocale(request: NextRequest, locale: AppLocale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_LOCALE_HEADER_NAME, locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function withLocalePrefix(pathname: string, locale: AppLocale): string {
  const normalized = normalizePathname(pathname);

  if (locale === DEFAULT_LOCALE && !DEFAULT_LOCALE_USES_PREFIX) {
    return normalized;
  }

  if (normalized === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

function withInternalLocalePrefix(pathname: string, locale: AppLocale): string {
  const normalized = normalizePathname(pathname);

  if (normalized === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

function isSlugLikeSegment(segment: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$/.test(segment);
}

function resolveLegacyCategoryCityRequest(
  locale: AppLocale,
  pathSegments: string[],
): { kind: "none" } | { kind: "not-found" } | { kind: "redirect"; pathname: string } {
  if (pathSegments.length !== 2 && pathSegments.length !== 3) return { kind: "none" };

  const categoryIndex = pathSegments.length === 3 ? 1 : 0;
  const cityIndex = pathSegments.length === 3 ? 2 : 1;
  const legacyCategorySegment = pathSegments[categoryIndex]?.toLowerCase() ?? "";
  const legacyCitySegment = pathSegments[cityIndex]?.toLowerCase() ?? "";
  if (RESERVED_ROUTE_SEGMENTS.has(legacyCategorySegment)) return { kind: "none" };

  const canonicalCategory = getCanonicalFromUrlSlug(
    LEGACY_CATEGORY_ALIASES[legacyCategorySegment] ?? legacyCategorySegment,
    locale,
  );

  if (
    !canonicalCategory ||
    !isSlugLikeSegment(legacyCitySegment) ||
    RESERVED_ROUTE_SEGMENTS.has(legacyCitySegment)
  ) {
    return { kind: "not-found" };
  }

  return {
    kind: "redirect",
    pathname: withLocalePrefix(`/visit/${legacyCitySegment}/${getCategoryUrlSlug(canonicalCategory, locale)}`, locale),
  };
}

function notFoundResponse() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

function redirectAnonymousAdminRequest(request: NextRequest, locale: AppLocale) {
  const loginUrl = new URL(withLocalePrefix("/login", locale), request.url);
  const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", requestedPath);
  return NextResponse.redirect(loginUrl, 307);
}

function redirectRouteAlias(request: NextRequest, locale: AppLocale, targetPathname: string) {
  const redirectUrl = new URL(withLocalePrefix(targetPathname, locale), request.url);
  redirectUrl.search = request.nextUrl.search;
  return NextResponse.redirect(redirectUrl, 308);
}

function getListingSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/listing\/([^/]+)$/);
  return match?.[1] ?? null;
}

function getGolfCourseSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/golf\/courses\/([^/]+)$/);
  return match?.[1] ?? null;
}

interface ListingSlugRedirectRow {
  listing?: { slug?: string | null; status?: string | null } | null;
}

interface GolfCourseSlugRow {
  slug?: string | null;
  status?: string | null;
  category?: { slug?: string | null } | null;
  category_data?: Record<string, unknown> | null;
}

interface GolfCourseSlugAliasRow {
  listing?: GolfCourseSlugRow | null;
}

interface GolfCourseSlugResolution {
  exists: boolean;
  canonicalSlug: string | null;
}

function isPublishedGolfCourseRow(row: GolfCourseSlugRow | null | undefined): boolean {
  if (!row?.slug) return false;
  if (row.status && row.status !== "published") return false;

  const categorySlug = row.category?.slug?.trim().toLowerCase();
  const vertical = typeof row.category_data?.vertical === "string"
    ? row.category_data.vertical.trim().toLowerCase()
    : null;
  return categorySlug === "golf" || vertical === "golf";
}

async function resolveListingSlugRedirect(slug: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) return null;

  const endpoint = new URL(`${supabaseUrl}/rest/v1/listing_slugs`);
  endpoint.searchParams.set("select", "listing:listings(slug,status)");
  endpoint.searchParams.set("slug", `eq.${slug}`);
  endpoint.searchParams.set("is_current", "eq.false");
  endpoint.searchParams.set("limit", "1");

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const rows = (await response.json()) as ListingSlugRedirectRow[];
    const listing = rows[0]?.listing ?? null;
    const canonicalSlug = listing?.status === "published" ? listing.slug?.trim() : null;
    return canonicalSlug && canonicalSlug !== slug ? canonicalSlug : null;
  } catch {
    return null;
  }
}

async function resolvePublishedGolfCourseSlug(slug: string): Promise<GolfCourseSlugResolution | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) return null;

  const endpoint = new URL(`${supabaseUrl}/rest/v1/listings`);
  endpoint.searchParams.set("select", "slug,category:categories(slug),category_data");
  endpoint.searchParams.set("slug", `eq.${slug}`);
  endpoint.searchParams.set("status", "eq.published");
  endpoint.searchParams.set("limit", "1");

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const rows = (await response.json()) as GolfCourseSlugRow[];
    const row = rows[0];
    if (row?.slug) {
      const exists = isPublishedGolfCourseRow(row);
      return { exists, canonicalSlug: exists ? row.slug : null };
    }

    const aliasEndpoint = new URL(`${supabaseUrl}/rest/v1/listing_slugs`);
    aliasEndpoint.searchParams.set(
      "select",
      "listing:listings(slug,status,category:categories(slug),category_data)",
    );
    aliasEndpoint.searchParams.set("slug", `eq.${slug}`);
    aliasEndpoint.searchParams.set("limit", "1");

    const aliasResponse = await fetch(aliasEndpoint, {
      headers: {
        apikey: supabaseKey,
        authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    });

    if (!aliasResponse.ok) return null;
    const aliasRows = (await aliasResponse.json()) as GolfCourseSlugAliasRow[];
    const listing = aliasRows[0]?.listing ?? null;
    const exists = isPublishedGolfCourseRow(listing);
    return { exists, canonicalSlug: exists ? listing?.slug?.trim() ?? null : null };
  } catch {
    return null;
  }
}

function redirectGolfCourseAliasIfNeeded(
  request: NextRequest,
  locale: AppLocale,
  slug: string,
  resolution: GolfCourseSlugResolution | null,
) {
  if (!resolution) return null;
  if (!resolution.exists) return notFoundResponse();

  const canonicalSlug = resolution.canonicalSlug?.trim();
  if (canonicalSlug && canonicalSlug !== slug) {
    return redirectRouteAlias(request, locale, `/golf/courses/${canonicalSlug}`);
  }

  return null;
}

function rewriteUnprefixedDefaultLocaleRequest(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_LOCALE_HEADER_NAME, DEFAULT_LOCALE);

  const rewriteUrl = new URL(withInternalLocalePrefix(request.nextUrl.pathname, DEFAULT_LOCALE), request.url);
  rewriteUrl.search = request.nextUrl.search;

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const normalizedPathname = normalizePathname(pathname);
  const strippedPathname = stripLocalePrefix(normalizedPathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const localeFromPath =
    firstSegment && isValidLocale(firstSegment) ? (firstSegment as AppLocale) : null;

  if (strippedPathname.startsWith("/admin") && !hasSupabaseAuthCookie(request)) {
    return redirectAnonymousAdminRequest(request, localeFromPath ?? DEFAULT_LOCALE);
  }

  if (isSystemBypassPath(normalizedPathname)) {
    return NextResponse.next();
  }

  if (MAINTENANCE_ENABLED && !isMaintenanceBypassPath(normalizedPathname)) {
    const requesterIp = getClientIp(request);
    const ipWhitelisted = isMaintenanceIpWhitelisted(requesterIp, MAINTENANCE_WHITELIST);
    if (!ipWhitelisted) {
      return NextResponse.redirect(new URL("/maintenance", request.url), 307);
    }
  }

  // Garantir /maintenance sem prefixo de locale
  if (strippedPathname === "/maintenance") {
    if (normalizedPathname === "/maintenance") {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/maintenance", request.url), 308);
  }

  const relocationAliasPath =
    strippedPathname === "/residence" || strippedPathname === "/live";

  // Requests com locale explícito no path
  if (localeFromPath) {
    // Locale inválido ou não público -> fallback para default
    if (!isPublicLocale(localeFromPath)) {
      const remainingPath = segments.slice(1).join("/");
      const destination = remainingPath
        ? `/${DEFAULT_LOCALE}/${remainingPath}`
        : `/${DEFAULT_LOCALE}`;

      return NextResponse.redirect(new URL(destination, request.url), 308);
    }

    // /{locale}/pricing -> /{locale}/partner
    if (strippedPathname === "/pricing") {
      const redirectUrl = new URL(withLocalePrefix("/partner", localeFromPath), request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }

    if (strippedPathname === "/partners") {
      return redirectRouteAlias(request, localeFromPath, "/partner");
    }

    if (relocationAliasPath) {
      return redirectRouteAlias(request, localeFromPath, "/relocation");
    }

    if (strippedPathname === "/restaurants") {
      return redirectRouteAlias(
        request,
        localeFromPath,
        `/category/${getCategoryUrlSlug("restaurants", localeFromPath)}`,
      );
    }

    const propertyAliasMatch = strippedPathname.match(/^\/properties\/([^/]+)$/);
    if (propertyAliasMatch?.[1]) {
      return redirectRouteAlias(request, localeFromPath, `/listing/${propertyAliasMatch[1]}`);
    }

    const golfCourseSlug = getGolfCourseSlugFromPath(strippedPathname);
    if (golfCourseSlug) {
      const resolution = await resolvePublishedGolfCourseSlug(golfCourseSlug);
      const response = redirectGolfCourseAliasIfNeeded(
        request,
        localeFromPath,
        golfCourseSlug,
        resolution,
      );
      if (response) return response;
    }

    const listingAliasSlug = getListingSlugFromPath(strippedPathname);
    if (listingAliasSlug) {
      const canonicalSlug = await resolveListingSlugRedirect(listingAliasSlug);
      if (canonicalSlug) {
        return redirectRouteAlias(request, localeFromPath, `/listing/${canonicalSlug}`);
      }
    }

    const legacyCategoryCityRequest =
      segments.length === 3
        ? resolveLegacyCategoryCityRequest(localeFromPath, segments)
        : { kind: "none" as const };
    if (legacyCategoryCityRequest.kind === "not-found") {
      return notFoundResponse();
    }
    if (legacyCategoryCityRequest.kind === "redirect") {
      const redirectUrl = new URL(legacyCategoryCityRequest.pathname, request.url);
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, 308);
    }

    // Serve legacy /en/... URLs instead of redirecting them back to the
    // unprefixed route. Some browsers may still have an older permanent
    // redirect cached in the opposite direction (/... -> /en/...), and
    // redirecting /en/... -> /... would create an unrecoverable loop.

    if (strippedPathname.startsWith("/admin") && !hasSupabaseAuthCookie(request)) {
      return redirectAnonymousAdminRequest(request, localeFromPath);
    }

    return nextWithRequestLocale(request, localeFromPath);
  }

  if (strippedPathname === "/pricing") {
    const redirectUrl = new URL(withLocalePrefix("/partner", DEFAULT_LOCALE), request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (strippedPathname === "/partners") {
    return redirectRouteAlias(request, DEFAULT_LOCALE, "/partner");
  }

  if (relocationAliasPath) {
    return redirectRouteAlias(request, DEFAULT_LOCALE, "/relocation");
  }

  if (strippedPathname === "/restaurants") {
    return redirectRouteAlias(
      request,
      DEFAULT_LOCALE,
      `/category/${getCategoryUrlSlug("restaurants", DEFAULT_LOCALE)}`,
    );
  }

  const propertyAliasMatch = strippedPathname.match(/^\/properties\/([^/]+)$/);
  if (propertyAliasMatch?.[1]) {
    return redirectRouteAlias(request, DEFAULT_LOCALE, `/listing/${propertyAliasMatch[1]}`);
  }

  const golfCourseSlug = getGolfCourseSlugFromPath(strippedPathname);
  if (golfCourseSlug) {
    const resolution = await resolvePublishedGolfCourseSlug(golfCourseSlug);
    const response = redirectGolfCourseAliasIfNeeded(
      request,
      DEFAULT_LOCALE,
      golfCourseSlug,
      resolution,
    );
    if (response) return response;
  }

  const listingAliasSlug = getListingSlugFromPath(strippedPathname);
  if (listingAliasSlug) {
    const canonicalSlug = await resolveListingSlugRedirect(listingAliasSlug);
    if (canonicalSlug) {
      return redirectRouteAlias(request, DEFAULT_LOCALE, `/listing/${canonicalSlug}`);
    }
  }

  if (strippedPathname.startsWith("/admin") && !hasSupabaseAuthCookie(request)) {
    return redirectAnonymousAdminRequest(request, DEFAULT_LOCALE);
  }

  const legacyCategoryCityRequest =
    segments.length === 2
      ? resolveLegacyCategoryCityRequest(DEFAULT_LOCALE, segments)
      : { kind: "none" as const };
  if (legacyCategoryCityRequest.kind === "not-found") {
    return notFoundResponse();
  }
  if (legacyCategoryCityRequest.kind === "redirect") {
    const redirectUrl = new URL(legacyCategoryCityRequest.pathname, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return rewriteUnprefixedDefaultLocaleRequest(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|images|icons|videos|.*\\..*$).*)",
  ],
};
