import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { AppProviders } from "@/components/providers/AppProviders";
import { PublicSiteFrame } from "@/components/layout/PublicSiteFrame";
import { loadInitialLocaleMessages } from "@/i18n/server-locale";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { CookieConsentBannerWrapper } from "@/components/gdpr/CookieConsentBannerWrapper";
import { FloatingCookieSettingsButton } from "@/components/gdpr/FloatingCookieSettingsButton";
import { WhatsAppChatButtonWrapper } from "@/components/ui/WhatsAppChatButtonWrapper";
import {
  LOCALE_CONFIGS,
  isValidLocale,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/metadata";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// ✅ Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const localeConfig = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS.en;

  return buildMetadata({
    title: "AlgarveOfficial | Premium Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
    path: "/",
    localeCode: locale,
    locale: localeConfig.dateLocale,
  });
}

// ✅ Static locale segments for build optimization
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  // ✅ CRITICAL: Get locale from route params (source of truth)
  const locale = localeParam as Locale;

  // ✅ Get locale config
  const localeConfig = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS.en;
  void localeConfig;
  const messages = await loadInitialLocaleMessages(locale);

  return (
    <LocaleProvider locale={locale}>
      <AppProviders initialMessages={messages}>
        <PublicSiteFrame>{children}</PublicSiteFrame>
        <WhatsAppChatButtonWrapper />
        <FloatingCookieSettingsButton />
        <CookieConsentBannerWrapper />
      </AppProviders>
    </LocaleProvider>
  );
}
