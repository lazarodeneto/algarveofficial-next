import { permanentRedirect } from "next/navigation";

import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/localized-routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RealEstateAliasPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isValidLocale(rawLocale) ? rawLocale : "en") as Locale;
  permanentRedirect(buildLocalizedPath(locale, "/properties"));
}
