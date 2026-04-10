import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "./locales";
import type {
  AlternatePathMap,
  EntityRouteData,
  LocalizedSlugMap,
} from "./localized-routing.types";
import { ENTITY_ROUTE_PREFIX } from "./localized-routing.config";

function getRequiredSlug(slugs: LocalizedSlugMap, locale: AppLocale): string {
  const slug = slugs[locale];
  if (!slug) {
    throw new Error(`Missing localized slug for locale "${locale}"`);
  }
  return slug;
}

export function buildUniformLocalizedSlugMap(
  slug: string,
  locales: readonly AppLocale[] = SUPPORTED_LOCALES
): Record<AppLocale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, slug])
  ) as Record<AppLocale, string>;
}

export function buildLocalizedSlugMapWithFallback(
  slugs: LocalizedSlugMap,
  fallbackSlug: string,
  locales: readonly AppLocale[] = SUPPORTED_LOCALES
): Record<AppLocale, string> {
  const fallback = slugs[DEFAULT_LOCALE] ?? fallbackSlug;

  return Object.fromEntries(
    locales.map((locale) => [locale, slugs[locale] ?? fallback])
  ) as Record<AppLocale, string>;
}

export function buildEntityPath(
  locale: AppLocale,
  entity: EntityRouteData
): string {
  switch (entity.routeType) {
    case "listing":
    case "blog-post":
    case "destination":
    case "event":
    case "guide":
    case "category": {
      const prefix = ENTITY_ROUTE_PREFIX[entity.routeType];
      const slug = getRequiredSlug(entity.slugs, locale);
      return `/${locale}/${prefix}/${slug}`;
    }

    case "city": {
      const citySlug = getRequiredSlug(entity.citySlugs, locale);
      return `/${locale}/${ENTITY_ROUTE_PREFIX.city}/${citySlug}`;
    }

    case "city-category": {
      const citySlug = getRequiredSlug(entity.citySlugs, locale);
      const categorySlug = getRequiredSlug(entity.categorySlugs, locale);
      return `/${locale}/${ENTITY_ROUTE_PREFIX["city-category"]}/${citySlug}/${categorySlug}`;
    }

    default: {
      const exhaustive: never = entity;
      throw new Error(`Unhandled route type: ${String(exhaustive)}`);
    }
  }
}

export function buildAlternatePaths(
  entity: EntityRouteData,
  locales: readonly AppLocale[],
  canonicalLocale: AppLocale
): AlternatePathMap {
  const alternates: Record<AppLocale, string> = {} as Record<AppLocale, string>;

  for (const locale of locales) {
    alternates[locale] = buildEntityPath(locale, entity);
  }

  return {
    canonical: alternates[canonicalLocale],
    alternates,
  };
}
