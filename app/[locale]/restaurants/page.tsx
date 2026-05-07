import { notFound, permanentRedirect } from "next/navigation";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";
import { getCategoryUrlSlug } from "@/lib/seo/programmatic/category-slugs";

interface RestaurantsAliasPageProps {
  params: Promise<{ locale: string }>;
}

export default async function RestaurantsAliasPage({
  params,
}: RestaurantsAliasPageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  permanentRedirect(buildLocalizedPath(locale, `/category/${getCategoryUrlSlug("restaurants", locale)}`));
}
