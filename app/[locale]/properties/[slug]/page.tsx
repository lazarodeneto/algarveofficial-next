import { notFound, permanentRedirect } from "next/navigation";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";

interface PropertyDetailAliasPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function PropertyDetailAliasPage({
  params,
}: PropertyDetailAliasPageProps) {
  const { locale: rawLocale, slug } = await params;
  if (!isValidLocale(rawLocale)) notFound();

  permanentRedirect(buildLocalizedPath(rawLocale as Locale, `/listing/${slug}`));
}
