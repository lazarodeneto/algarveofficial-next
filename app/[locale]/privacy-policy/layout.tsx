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
  const settings = await fetchLegalSettings("privacy_settings", locale);
  const localizedSettings =
    locale === DEFAULT_LOCALE || (settings && settings.id !== "default") ? settings : null;
  const translations = await getServerTranslations(locale, [
    "nav.privacy",
    "footer.privacyPolicy",
  ]);
  const translatedTitle =
    translations["nav.privacy"] ??
    translations["footer.privacyPolicy"] ??
    "AlgarveOfficial";

  return buildPageMetadata({
    locale,
    localizedRoute: buildStaticRouteData("privacy-policy"),
    title: localizedSettings?.meta_title || localizedSettings?.page_title ?? translatedTitle,
    description:
      localizedSettings?.meta_description ||
      localizedSettings?.introduction ?? translatedTitle,
  });
}

export default function PrivacyPolicyLayout({ children }: LayoutProps) {
  return children;
}
