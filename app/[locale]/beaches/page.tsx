import { Suspense } from "react";
import type { Metadata } from "next";

import BeachesClient from "@/components/beaches/BeachesClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildStaticRouteData,
} from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/schemaBuilders.js";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;
  return buildLocalizedMetadata({
    locale,
    path: "/beaches",
    title: "Beaches in the Algarve",
    description: "Discover curated Algarve beaches and beach clubs — from hidden coves to premium seaside escapes.",
    keywords: ["Algarve beaches", "beach clubs Algarve", "best beaches Algarve", "Algarve coast"],
  });
}

export default async function BeachesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const tx = await getServerTranslations(locale, [
    "nav.home",
    "nav.beaches",
    "categories.beaches",
    "beachesPage.heroTitle",
    "beachesPage.heroDescription",
  ]);

  const pageUrl = buildAbsoluteRouteUrl(locale, "/beaches");
  const homeUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("home"));
  const pageTitle = tx["nav.beaches"] ?? tx["categories.beaches"] ?? "Beaches";
  const heroTitle = tx["beachesPage.heroTitle"] ?? "Beaches in the Algarve";
  const heroDescription =
    tx["beachesPage.heroDescription"] ??
    "Discover golden sands, turquoise water, and premium beach clubs curated for AlgarveOfficial visitors.";
  const pageDescription = "Explore curated beaches and beach clubs across the Algarve.";
  const pageSchema = buildWebPageSchema({
    type: "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: pageUrl,
    image: `${SITE_URL}/og-image.png`,
    siteUrl: SITE_URL,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: tx["nav.home"] ?? "Home", url: homeUrl },
    { name: pageTitle, url: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div id="beaches-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {pageTitle}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {heroDescription}
            </p>
          </section>
        </main>
      </div>

      <Suspense fallback={<RouteLoadingState />}>
        <BeachesClient initialGlobalSettings={[]} />
      </Suspense>
    </>
  );
}
