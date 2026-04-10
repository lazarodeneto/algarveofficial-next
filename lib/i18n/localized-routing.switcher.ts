import type { AppLocale } from "./locales";
import type { EntityRouteData, StaticRouteKey } from "./localized-routing.types";
import { buildStaticRoutePath } from "./localized-routing.static";
import { buildEntityPath } from "./localized-routing.entities";

export function buildLocaleSwitchPathsForStaticRoute(
  routeKey: StaticRouteKey,
  locales: readonly AppLocale[]
): Record<AppLocale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, buildStaticRoutePath(routeKey, locale)])
  ) as Record<AppLocale, string>;
}

export function buildLocaleSwitchPathsForEntity(
  entity: EntityRouteData,
  locales: readonly AppLocale[]
): Record<AppLocale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, buildEntityPath(locale, entity)])
  ) as Record<AppLocale, string>;
}
