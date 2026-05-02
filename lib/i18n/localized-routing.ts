import type { Metadata } from "next";

import { LOCALE_CONFIGS } from "@/lib/i18n/locale-definitions";
import {
  addLocaleToPathname,
  getLocaleFromPathname,
  hasLocalePrefix,
  normalizeLocale,
  stripLocaleFromPathname,
} from "@/lib/i18n/locale-utils";
import {
  getCanonicalLocalizedPathname,
  normalizePathname,
  shouldBypassLocalePrefix,
} from "@/lib/i18n/route-rules";
import { buildLocalizedPathAlternates, toAbsoluteSiteUrl } from "@/lib/i18n/seo";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "./locales";
import { buildEntityPath } from "./localized-routing.entities";
import { STATIC_ROUTE_SEGMENTS } from "./localized-routing.config";
import { buildStaticRoutePath } from "./localized-routing.static";
import {
  buildLocaleSwitchPathsForEntity,
  buildLocaleSwitchPathsForStaticRoute,
} from "./localized-routing.switcher";
import type {
  EntityRouteData,
  LocalizedRouteInput,
  LocalizedRouteOptions,
  RouteQueryInput,
  RouteQueryValue,
  StaticRouteKey,
} from "./localized-routing.types";

export * from "./locales";
export * from "./localized-routing.types";
export * from "./localized-routing.static";
export * from "./localized-routing.entities";
export * from "./localized-routing.switcher";
export * from "./localized-routing.seo";

const PASSTHROUGH_HREF_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export type LocalizedPathInput = string | LocalizedRouteInput;

export type RouteFamilyStrategy =
  | "static-localized-path"
  | "localized-entity-slug"
  | "mechanical-locale-replacement"
  | "content-identity-mapping";

export interface RouteFamilyDefinition {
  family: string;
  strategy: RouteFamilyStrategy;
  prefix?: string;
  routeKeys?: readonly string[];
  routeTypes?: readonly string[];
  switcherSource: "route-key" | "entity-data" | "pathname-fallback";
  seoSource: "route-key" | "entity-data" | "pathname-fallback";
  notes: string;
}

export const ROUTE_FAMILY_DEFINITIONS: Record<string, RouteFamilyDefinition> = {
  "static-page": {
    family: "static-page",
    strategy: "static-localized-path",
    routeKeys: [
      "home",
      "about-us",
      "blog",
      "contact",
      "cookie-policy",
      "destinations",
      "events",
      "experiences",
      "beaches",
      "golf",
      "invest",
      "map",
      "partner",
      "pricing",
      "privacy-policy",
      "properties",
      "real-estate",
      "relocation",
      "stay",
      "terms",
      "trips",
    ],
    switcherSource: "route-key",
    seoSource: "route-key",
    notes: "Static localized segments come from STATIC_ROUTE_SEGMENTS.",
  },
  listing: {
    family: "listing",
    strategy: "content-identity-mapping",
    prefix: "listing",
    routeTypes: ["listing"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "Listing detail pages resolve locale-specific slugs from structured entity data.",
  },
  "blog-post": {
    family: "blog-post",
    strategy: "content-identity-mapping",
    prefix: "blog",
    routeTypes: ["blog-post"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "Blog posts are modeled as entities even when the slug is currently identical across locales.",
  },
  destination: {
    family: "destination",
    strategy: "content-identity-mapping",
    prefix: "destinations",
    routeTypes: ["destination"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "Destination detail pages use entity route data so localized slugs can be introduced safely later.",
  },
  event: {
    family: "event",
    strategy: "content-identity-mapping",
    prefix: "events",
    routeTypes: ["event"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "Event detail pages use entity route data for switcher, canonical, and JSON-LD URLs.",
  },
  guide: {
    family: "guide",
    strategy: "content-identity-mapping",
    prefix: "guides",
    routeTypes: ["guide"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "Guides are modeled as entities backed by structured slugs from the guide config.",
  },
  city: {
    family: "city",
    strategy: "content-identity-mapping",
    prefix: "visit",
    routeTypes: ["city"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "City pages are built from city identity; today the slug is mechanically stable across locales.",
  },
  "city-category": {
    family: "city-category",
    strategy: "content-identity-mapping",
    prefix: "visit",
    routeTypes: ["city-category"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "City/category SEO pages combine a stable city identity with localized category slugs.",
  },
  category: {
    family: "category",
    strategy: "content-identity-mapping",
    prefix: "category",
    routeTypes: ["category"],
    switcherSource: "entity-data",
    seoSource: "entity-data",
    notes: "Category hub pages resolve canonical category slugs per locale from shared route data.",
  },
  "dashboard-routes": {
    family: "dashboard-routes",
    strategy: "mechanical-locale-replacement",
    routeKeys: ["/dashboard", "/owner", "/admin"],
    switcherSource: "pathname-fallback",
    seoSource: "pathname-fallback",
    notes: "Dashboard routes keep mechanical locale replacement because they do not use localized slugs.",
  },
  "auth-routes": {
    family: "auth-routes",
    strategy: "static-localized-path",
    routeKeys: ["login", "signup", "forgot-password"],
    switcherSource: "route-key",
    seoSource: "route-key",
    notes: "Auth routes use centralized static segments and retain existing prefixed paths.",
  },
};

function splitHref(href: string): { pathname: string; suffix: string } {
  const match = href.match(/^([^?#]*)(.*)$/);

  return {
    pathname: match?.[1] ?? href,
    suffix: match?.[2] ?? "",
  };
}

function normalizeHash(hash?: string | null): string {
  const normalized = String(hash ?? "").trim();
  if (!normalized) {
    return "";
  }

  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: RouteQueryValue
): void {
  if (value === null || value === undefined) {
    return;
  }

  params.append(key, String(value));
}

function normalizeQuery(query?: RouteQueryInput): string {
  if (!query) {
    return "";
  }

  if (typeof query === "string") {
    if (!query) {
      return "";
    }

    return query.startsWith("?") ? query : `?${query}`;
  }

  if (query instanceof URLSearchParams) {
    const value = query.toString();
    return value ? `?${value}` : "";
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => appendQueryValue(params, key, item));
      return;
    }

    appendQueryValue(params, key, value);
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function appendRouteOptions(path: string, options?: LocalizedRouteOptions): string {
  return `${path}${normalizeQuery(options?.query)}${normalizeHash(options?.hash)}`;
}

function isLocalizedRouteInput(value: LocalizedPathInput): value is LocalizedRouteInput {
  return typeof value === "object" && value !== null && "routeType" in value;
}

function isStaticRouteKey(value: string): value is StaticRouteKey {
  return value in STATIC_ROUTE_SEGMENTS;
}

export function isPassthroughHref(href: string): boolean {
  return (
    !href ||
    href.startsWith("#") ||
    href.startsWith("?") ||
    PASSTHROUGH_HREF_PATTERN.test(href)
  );
}

export function buildRoutePath(locale: string, route: LocalizedRouteInput): string {
  const safeLocale = normalizeLocale(locale);

  if (route.routeType === "static") {
    return buildStaticRoutePath(route.routeKey, safeLocale);
  }

  return buildEntityPath(safeLocale, route);
}

export function buildRelativeRoutePath(locale: string, route: LocalizedRouteInput): string {
  return stripLocaleFromPathname(buildRoutePath(locale, route));
}

export function buildLocaleSwitchPaths(
  route: LocalizedRouteInput,
  locales: readonly AppLocale[] = SUPPORTED_LOCALES
): Record<AppLocale, string> {
  if (route.routeType === "static") {
    return buildLocaleSwitchPathsForStaticRoute(route.routeKey, locales);
  }

  return buildLocaleSwitchPathsForEntity(route, locales);
}

export function buildRouteMetadataAlternates(
  route: LocalizedRouteInput,
  currentLocale: AppLocale,
  locales: readonly AppLocale[] = SUPPORTED_LOCALES
): Metadata["alternates"] {
  const localizedPaths = buildLocaleSwitchPaths(route, locales);

  return buildLocalizedPathAlternates(
    currentLocale,
    localizedPaths as Partial<Record<AppLocale, string>>
  );
}

export function buildAbsoluteRouteUrl(
  locale: string,
  target: LocalizedPathInput,
  options?: LocalizedRouteOptions
): string {
  return toAbsoluteSiteUrl(buildLocalizedPath(locale, target, options));
}

export function buildLocalizedPath(
  locale: string,
  target: LocalizedPathInput,
  options?: LocalizedRouteOptions
): string {
  if (isLocalizedRouteInput(target)) {
    return appendRouteOptions(buildRoutePath(locale, target), options);
  }

  if (isStaticRouteKey(target)) {
    return appendRouteOptions(
      buildStaticRoutePath(target, normalizeLocale(locale)),
      options
    );
  }

  if (isPassthroughHref(target)) {
    return target;
  }

  const safeLocale = normalizeLocale(locale);
  const { pathname, suffix } = splitHref(target);
  const normalizedPath = normalizePathname(pathname);
  const currentLocale = hasLocalePrefix(normalizedPath)
    ? getLocaleFromPathname(normalizedPath)
    : null;
  const barePath = stripLocaleFromPathname(normalizedPath);
  const canonicalBarePath = getCanonicalLocalizedPathname(barePath) ?? barePath;

  if (currentLocale) {
    return `${addLocaleToPathname(canonicalBarePath, currentLocale)}${suffix}`;
  }

  if (shouldBypassLocalePrefix(canonicalBarePath)) {
    return `${canonicalBarePath}${suffix}`;
  }

  return `${addLocaleToPathname(canonicalBarePath, safeLocale)}${suffix}`;
}

export function switchLocaleInPathname(pathname: string, nextLocale: string): string {
  const safeLocale = normalizeLocale(nextLocale);
  const { pathname: barePathname, suffix } = splitHref(pathname);
  const stripped = stripLocaleFromPathname(barePathname);
  return `${addLocaleToPathname(stripped, safeLocale)}${suffix}`;
}

export function buildStaticRouteData(routeKey: StaticRouteKey): LocalizedRouteInput {
  return {
    routeType: "static",
    routeKey,
  };
}

export function buildEntityRouteSwitchPath(
  locale: string,
  entity: EntityRouteData,
  options?: LocalizedRouteOptions
): string {
  return appendRouteOptions(buildEntityPath(normalizeLocale(locale), entity), options);
}

export function getRouteFamilyStrategy(route: LocalizedRouteInput): RouteFamilyStrategy {
  if (route.routeType === "static") {
    return "static-localized-path";
  }

  if (route.routeType === "city" || route.routeType === "city-category") {
    return "content-identity-mapping";
  }

  return "content-identity-mapping";
}

export function getLocaleHrefLabelMap(locales: readonly AppLocale[] = SUPPORTED_LOCALES) {
  return Object.fromEntries(
    locales.map((locale) => [locale, LOCALE_CONFIGS[locale].hreflang])
  ) as Record<AppLocale, string>;
}

export function getDefaultLocale(): AppLocale {
  return DEFAULT_LOCALE;
}
