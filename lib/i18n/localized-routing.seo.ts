import type { AppLocale } from "./locales";
import type { EntityRouteData } from "./localized-routing.types";
import { buildAlternatePaths, buildEntityPath } from "./localized-routing.entities";

export function buildCanonicalPath(
  locale: AppLocale,
  entity: EntityRouteData
): string {
  return buildEntityPath(locale, entity);
}

export function buildHreflangAlternates(
  entity: EntityRouteData,
  locales: readonly AppLocale[],
  currentLocale: AppLocale
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const { canonical, alternates } = buildAlternatePaths(entity, locales, currentLocale);

  return {
    canonical,
    languages: alternates,
  };
}
