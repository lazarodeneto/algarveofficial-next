import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { buildStaticRouteData } from "@/lib/i18n/localized-routing";
import { getCookiePolicyContent } from "@/lib/legal/cookie-policy-content";
import { fetchLegalSettings } from "@/lib/legal/server";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const settings = await fetchLegalSettings("cookie_settings", locale);
  const localizedSettings =
    locale === DEFAULT_LOCALE || (settings && settings.id !== "default") ? settings : null;
  const fallbackContent = getCookiePolicyContent(locale);

  return buildPageMetadata({
    locale,
    localizedRoute: buildStaticRouteData("cookie-policy"),
    title: (localizedSettings?.meta_title || localizedSettings?.page_title) ?? fallbackContent.pageTitle,
    description:
      (localizedSettings?.meta_description ||
      localizedSettings?.introduction) ?? fallbackContent.metaDescription,
  });
}

export default function CookiePolicyLayout({ children }: LayoutProps) {
  return children;
}
