import type { Metadata } from "next";

import { LocalizedNotFoundState } from "@/components/layout/LocalizedNotFoundState";
import { LOCALE_CONFIGS } from "@/lib/i18n/config";
import { buildStaticRoutePath } from "@/lib/i18n/localized-routing";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const tx = await getServerTranslations(locale, [
    "notFound.metaTitle",
    "notFound.metaDescription",
  ]);

  return buildMetadata({
    title: tx["notFound.metaTitle"],
    description: tx["notFound.metaDescription"],
    path: "/404",
    noIndex: true,
    noFollow: true,
    localeCode: locale,
    locale: LOCALE_CONFIGS[locale].dateLocale,
  });
}

export default async function NotFound() {
  const locale = await getRequestLocale();

  return (
    <LocalizedNotFoundState
      homeHref={buildStaticRoutePath("home", locale)}
      beachesHref={buildStaticRoutePath("beaches", locale)}
      mapHref={buildStaticRoutePath("map", locale)}
      experiencesHref={buildStaticRoutePath("experiences", locale)}
    />
  );
}
