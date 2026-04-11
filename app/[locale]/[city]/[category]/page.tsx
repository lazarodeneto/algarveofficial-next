import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { resolveLegacyCategoryCityRoute } from "@/lib/seo/programmatic/legacy-category-city-route";
import { buildLocalizedAliasMetadata } from "@/lib/seo/metadata-builders";

interface PageProps {
  params: Promise<{
    locale: string;
    city: string;
    category: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, city: legacyCategory, category: legacyCity } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  const match = resolveLegacyCategoryCityRoute(locale, legacyCategory, legacyCity);
  if (!match) {
    return {};
  }

  return buildLocalizedAliasMetadata({
    locale,
    canonicalPath: match.canonicalPath,
    title: "Redirecting",
    description: "Redirecting to the canonical city category page.",
    noIndex: true,
  });
}

export default async function LegacyCityCategoryPage({ params }: PageProps) {
  const { locale: rawLocale, city: legacyCategory, category: legacyCity } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const match = resolveLegacyCategoryCityRoute(locale, legacyCategory, legacyCity);
  if (!match) {
    notFound();
  }

  permanentRedirect(`/${locale}${match.canonicalPath}`);
}
