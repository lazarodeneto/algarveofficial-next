import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getCanonicalFromUrlSlug } from "@/lib/seo/programmatic/category-slugs";
import { isValidCitySlug } from "@/lib/seo/programmatic/category-city-data";
import { buildLocalizedAliasMetadata } from "@/lib/seo/metadata-builders";

const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  "about-us",
  "admin",
  "auth",
  "blog",
  "contact",
  "cookie-policy",
  "dashboard",
  "destinations",
  "directory",
  "events",
  "invest",
  "listing",
  "live",
  "login",
  "map",
  "owner",
  "partner",
  "pricing",
  "privacy-policy",
  "real-estate",
  "residence",
  "terms",
  "trips",
  "visit",
]);

interface PageProps {
  params: Promise<{
    locale: string;
    city: string;
    category: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, city: rawCity, category: rawCategory } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const city = rawCity.toLowerCase();
  const category = rawCategory.toLowerCase();

  return buildLocalizedAliasMetadata({
    locale,
    canonicalPath: `/visit/${city}/${category}`,
    title: "Redirecting",
    description: "Redirecting to the canonical city category page.",
    noIndex: true,
  });
}

export default async function LegacyCityCategoryPage({ params }: PageProps) {
  const { locale: rawLocale, city: rawCity, category: rawCategory } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const city = rawCity.toLowerCase();
  const category = rawCategory.toLowerCase();

  if (
    RESERVED_TOP_LEVEL_SEGMENTS.has(city) ||
    !isValidCitySlug(city) ||
    !getCanonicalFromUrlSlug(category, locale)
  ) {
    notFound();
  }

  permanentRedirect(`/${locale}/visit/${city}/${category}`);
}
