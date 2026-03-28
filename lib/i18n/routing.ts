import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n/config";

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const PASSTHROUGH_HREF_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const FILE_REQUEST_PATTERN = /\.[a-z0-9]+$/i;
const UNLOCALIZED_PREFIXES = ["/api", "/auth", "/_next", "/static"];

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function splitHref(href: string): { pathname: string; suffix: string } {
  const match = href.match(/^([^?#]*)(.*)$/);

  return {
    pathname: match?.[1] ?? href,
    suffix: match?.[2] ?? "",
  };
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isValidLocale(
  locale: string | null | undefined,
): locale is AppLocale {
  return !!locale && SUPPORTED_LOCALES.includes(locale as AppLocale);
}

export function normalizeLocale(locale: string | null | undefined): AppLocale {
  if (isValidLocale(locale)) return locale;
  return DEFAULT_LOCALE as AppLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) return "/";

  const first = segments[0]?.toLowerCase();
  if (isValidLocale(first)) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return normalized;
}

export function getLocaleFromPathnameSafe(pathname: string): AppLocale {
  const segments = normalizePathname(pathname).split("/").filter(Boolean);
  const first = segments[0]?.toLowerCase();

  return normalizeLocale(first);
}

export function hasLocalePrefix(pathname: string): boolean {
  const first = normalizePathname(pathname).split("/").filter(Boolean)[0]?.toLowerCase();

  return !!first && isValidLocale(first);
}

export function isPassthroughHref(href: string): boolean {
  return (
    !href ||
    href.startsWith("#") ||
    href.startsWith("?") ||
    PASSTHROUGH_HREF_PATTERN.test(href)
  );
}

export function shouldBypassLocalePrefix(pathname: string): boolean {
  const normalized = normalizePathname(pathname);

  if (UNLOCALIZED_PREFIXES.some((prefix) => matchesPrefix(normalized, prefix))) {
    return true;
  }

  return FILE_REQUEST_PATTERN.test(normalized);
}

export function buildLocalizedPath(locale: string, href: string): string {
  if (isPassthroughHref(href)) {
    return href;
  }

  const safeLocale = normalizeLocale(locale);
  const { pathname, suffix } = splitHref(href);
  const normalizedPath = normalizePathname(pathname);

  if (hasLocalePrefix(normalizedPath) || shouldBypassLocalePrefix(normalizedPath)) {
    return `${normalizedPath}${suffix}`;
  }

  const stripped = stripLocaleFromPathname(normalizedPath);
  const localizedPath = stripped === "/" ? `/${safeLocale}` : `/${safeLocale}${stripped}`;

  return `${localizedPath}${suffix}`;
}

export function switchLocaleInPathname(
  pathname: string,
  nextLocale: string,
): string {
  const safeLocale = normalizeLocale(nextLocale);
  const { pathname: barePathname, suffix } = splitHref(pathname);
  const stripped = stripLocaleFromPathname(barePathname);
  const localizedPath = stripped === "/" ? `/${safeLocale}` : `/${safeLocale}${stripped}`;

  return `${localizedPath}${suffix}`;
}
