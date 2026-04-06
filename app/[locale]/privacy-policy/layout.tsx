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
  const settings = await fetchLegalSettings("privacy_settings", locale);

  return buildLocalizedMetadata({
    locale,
    path: "/privacy-policy",
    title: settings?.meta_title || settings?.page_title || "Privacy Policy",
    description:
      settings?.meta_description ||
      "Review how AlgarveOfficial collects, uses, and protects personal data in line with GDPR and applicable law.",
  });
}

export default function PrivacyPolicyLayout({ children }: LayoutProps) {
  return children;
}
