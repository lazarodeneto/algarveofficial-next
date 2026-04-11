import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildStaticRouteData } from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { fetchLegalSettings } from "@/lib/legal/server";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const settings = await fetchLegalSettings("terms_settings", locale);
  const localizedSettings =
    locale === DEFAULT_LOCALE || (settings && settings.id !== "default") ? settings : null;
  const translations = await getServerTranslations(locale, [
    "nav.terms",
    "footer.termsOfService",
  ]);
  const translatedTitle =
    translations["nav.terms"] ??
    translations["footer.termsOfService"] ??
    "AlgarveOfficial";

  return buildPageMetadata({
    locale,
    localizedRoute: buildStaticRouteData("terms"),
    title: localizedSettings?.meta_title || localizedSettings?.page_title || translatedTitle,
    description:
      localizedSettings?.meta_description ||
      localizedSettings?.introduction ||
      translatedTitle,
  });
}

export default function TermsLayout({ children }: LayoutProps) {
  return children;
}
