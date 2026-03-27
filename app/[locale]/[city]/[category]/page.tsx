import { notFound, permanentRedirect } from "next/navigation";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { getCanonicalFromUrlSlug } from "@/lib/seo/programmatic/category-slugs";
import { isValidCitySlug } from "@/lib/seo/programmatic/category-city-data";

interface PageProps {
  params: Promise<{
    locale: string;
    city: string;
    category: string;
  }>;
}

export default async function LegacyCityCategoryPage({ params }: PageProps) {
  const { locale: rawLocale, city: rawCity, category: rawCategory } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const city = rawCity.toLowerCase();
  const category = rawCategory.toLowerCase();

  if (!isValidCitySlug(city) || !getCanonicalFromUrlSlug(category, locale)) {
    notFound();
  }

  permanentRedirect(`/${locale}/visit/${city}/${category}`);
}
