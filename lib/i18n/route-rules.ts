import { stripLocaleFromPathname } from "@/lib/i18n/locale-utils";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const REQUEST_LOCALE_HEADER_NAME = "x-algarve-locale";

export const SYSTEM_UNLOCALIZED_PREFIXES = [
  "/api",
  "/_next",
  "/static",
  "/favicon",
  "/robots",
  "/sitemap",
] as const;

export const CANONICAL_UNLOCALIZED_PATHS = new Set([
  "/maintenance",
]);

export const AUTH_ROUTE_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/auth/reset-password",
] as const;

const CANONICAL_LOCALIZED_ALIAS_ROUTES = [
  { source: "/directory", target: "/stay" },
  { source: "/visit", target: "/stay" },
  { source: "/live", target: "/residence" },
] as const;

export const PUBLIC_SEO_PAGES = new Set([
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
  "pricing",
  "privacy-policy",
  "properties",
  "real-estate",
  "residence",
  "stay",
  "terms",
]);

export function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (withLeadingSlash !== "/" && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

export function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isFileRequest(pathname: string): boolean {
  return /\.[a-z0-9]+$/i.test(pathname);
}

export function isSystemBypassPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return (
    SYSTEM_UNLOCALIZED_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix)) ||
    isFileRequest(normalized)
  );
}

export function isCanonicalUnlocalizedPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return CANONICAL_UNLOCALIZED_PATHS.has(normalized);
}

export function getCanonicalUnlocalizedPath(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  const barePath = stripLocaleFromPathname(normalized);
  return isCanonicalUnlocalizedPath(barePath) ? barePath : null;
}

export function shouldBypassLocalePrefix(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return isSystemBypassPath(normalized) || isCanonicalUnlocalizedPath(normalized);
}

export function isAuthRoutePath(pathname: string): boolean {
  const normalized = stripLocaleFromPathname(normalizePathname(pathname));
  return AUTH_ROUTE_PATHS.some((route) => matchesPrefix(normalized, route));
}

export function getCanonicalLocalizedPathname(pathname: string): string | null {
  const normalized = stripLocaleFromPathname(normalizePathname(pathname));

  for (const route of CANONICAL_LOCALIZED_ALIAS_ROUTES) {
    if (normalized === route.source) {
      return route.target;
    }
  }

  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 2 && segments[0]?.toLowerCase() === "real-estate") {
    return `/listing/${segments[1]}`;
  }

  return null;
}
