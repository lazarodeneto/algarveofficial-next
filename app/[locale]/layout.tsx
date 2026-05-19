import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { PublicSiteFrame } from "@/components/layout/PublicSiteFrame";
import { DeferredPublicWidgets } from "@/components/layout/DeferredPublicWidgets";
import { loadInitialLocaleMessages } from "@/i18n/server-locale";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { CookieConsentBannerWrapper } from "@/components/gdpr/CookieConsentBannerWrapper";
import {
  LOCALE_CONFIGS,
  isValidLocale,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/metadata";
import { getServerTranslations } from "@/lib/i18n/server";
import {
  CMS_GLOBAL_SETTING_KEYS,
  CMS_PAGE_BUILDER_RUNTIME_KEYS,
} from "@/lib/cms/pageBuilderRegistry";
import { fetchCmsRuntimeSettings, type RuntimeSettingRow } from "@/lib/cms/runtime-settings";
import { REQUEST_PATHNAME_HEADER_NAME } from "@/lib/i18n/route-rules";
import { stripLocaleFromPathname } from "@/lib/i18n/routing";

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
  const tx = await getServerTranslations(locale, [
    "seo.home.title",
    "seo.home.description",
  ]);

  return buildMetadata({
    title: tx["seo.home.title"] ?? "AlgarveOfficial",
    description: tx["seo.home.description"] ?? "AlgarveOfficial",
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

async function loadInitialCmsRuntimeSettings(locale: Locale) {
  try {
    return await fetchCmsRuntimeSettings({
      requestedKeys: CMS_PAGE_BUILDER_RUNTIME_KEYS,
      locale,
    });
  } catch {
    return [];
  }
}

function keepHomepageCmsRuntimeSettings(rows: RuntimeSettingRow[]): RuntimeSettingRow[] {
  return rows.map((row) => {
    if (row.key !== CMS_GLOBAL_SETTING_KEYS.pageConfigs) return row;

    try {
      const parsed = JSON.parse(row.value) as Record<string, unknown>;
      const homeConfig = parsed.home;
      return {
        ...row,
        value: JSON.stringify(homeConfig ? { home: homeConfig } : {}),
      };
    } catch {
      return {
        ...row,
        value: "{}",
      };
    }
  });
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
  const requestHeaders = await headers();
  const requestPathname = requestHeaders.get(REQUEST_PATHNAME_HEADER_NAME) ?? `/${locale}`;
  const isHomepageRequest = stripLocaleFromPathname(requestPathname) === "/";
  const [messages, initialCmsRuntimeSettings] = await Promise.all([
    loadInitialLocaleMessages(locale, { scope: isHomepageRequest ? "homepage" : "full" }),
    loadInitialCmsRuntimeSettings(locale),
  ]);
  const providerCmsRuntimeSettings = isHomepageRequest
    ? keepHomepageCmsRuntimeSettings(initialCmsRuntimeSettings)
    : initialCmsRuntimeSettings;

  const siteFrame = (
    <>
      <PublicSiteFrame>{children}</PublicSiteFrame>
      <DeferredPublicWidgets />
      <CookieConsentBannerWrapper deferInitialPrompt={isHomepageRequest} />
    </>
  );
  let framedSite = siteFrame;

  if (!isHomepageRequest) {
    const { AppLazyMotion } = await import("@/components/providers/AppLazyMotion");
    framedSite = <AppLazyMotion>{siteFrame}</AppLazyMotion>;
  }

  let providerTree: ReactNode;
  if (isHomepageRequest) {
    const { LiteAppProviders } = await import("@/components/providers/LiteAppProviders");
    providerTree = (
        <LiteAppProviders
          initialMessages={messages}
          initialCmsRuntimeSettings={providerCmsRuntimeSettings}
          locale={locale}
        >
        {framedSite}
      </LiteAppProviders>
    );
  } else {
    const { AppProviders } = await import("@/components/providers/AppProviders");
    providerTree = (
        <AppProviders
          initialMessages={messages}
          initialCmsRuntimeSettings={providerCmsRuntimeSettings}
          locale={locale}
        >
        {framedSite}
      </AppProviders>
    );
  }

  return (
    <LocaleProvider locale={locale}>
      {providerTree}
    </LocaleProvider>
  );
}
