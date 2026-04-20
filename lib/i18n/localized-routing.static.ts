import type { AppLocale } from "./locales";
import type { StaticRouteKey } from "./localized-routing.types";
import { STATIC_ROUTE_SEGMENTS } from "./localized-routing.config";
import { addLocaleToPathname } from "./locale-utils";

export function buildStaticRoutePath(
  routeKey: StaticRouteKey,
  locale: AppLocale
): string {
  const segment = STATIC_ROUTE_SEGMENTS[routeKey];
  const barePath = segment ? `/${segment}` : "/";
  return addLocaleToPathname(barePath, locale);
}
