import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import { fetchLegalSettings } from "@/lib/legal/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const settings = await fetchLegalSettings("terms_settings", locale);

  return buildLocalizedMetadata({
    locale,
    path: "/terms",
    title: settings?.meta_title || settings?.page_title || "Terms of Service",
    description:
      settings?.meta_description ||
      "Review AlgarveOfficial's terms governing platform access, listings, content, and user responsibilities.",
  });
}

export default function TermsLayout({ children }: LayoutProps) {
  return children;
}
