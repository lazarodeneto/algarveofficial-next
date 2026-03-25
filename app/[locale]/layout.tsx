import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { AppProviders } from "@/components/providers/AppProviders";
import { PublicSiteFrame } from "@/components/layout/PublicSiteFrame";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { CookieConsentBannerWrapper } from "@/components/gdpr/CookieConsentBannerWrapper";
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
  const locale = isValidLocale(localeParam) ? localeParam : "en";

  return buildMetadata({
    title: "AlgarveOfficial | Luxury Villas, Golf & Restaurants",
    description:
      "Discover the Algarve's finest villas, restaurants and golf courses — curated by experts who know every corner of Portugal's most prestigious coast.",
    path: "/",
  });
}

// ✅ Force dynamic rendering to prevent cache poisoning
export const dynamic = "force-dynamic";

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

  // ✅ CRITICAL: Get locale from route params (source of truth)
  const locale = isValidLocale(localeParam)
    ? (localeParam as Locale)
    : ("en" as Locale);

  // ✅ CRITICAL: Block invalid locales from being accessed
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  // ✅ Optional: Set cookie for UX (only for subsequent requests, never for rendering)
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // ✅ Get locale config
  const localeConfig = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS.en;
  const htmlLang = localeConfig?.hreflang ?? "en-GB";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body>
        {/* ✅ CRITICAL: LocaleProvider syncs i18n to match URL locale */}
        <LocaleProvider locale={locale}>
          <AppProviders locale={locale}>
            <PublicSiteFrame>{children}</PublicSiteFrame>
            <CookieConsentBannerWrapper />
          </AppProviders>
        </LocaleProvider>
      </body>
    </html>
  );
}