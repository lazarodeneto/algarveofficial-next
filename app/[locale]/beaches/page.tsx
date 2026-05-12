import { Suspense } from "react";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";

import BeachesClient from "@/components/beaches/BeachesClient";
import { RouteLoadingState } from "@/components/layout/RouteLoadingState";
import { Button } from "@/components/ui/Button";
import { LiveStyleHero } from "@/components/sections/LiveStyleHero";
import { HeroBackgroundMedia } from "@/components/sections/HeroBackgroundMedia";
import { PageHeroImage } from "@/components/sections/PageHeroImage";
import {
  STANDARD_PUBLIC_HERO_WRAPPER_CLASS,
  STANDARD_PUBLIC_NO_HERO_SPACER_CLASS,
} from "@/components/sections/hero-layout";
import { ArrowRight } from "lucide-react";
import { DEFAULT_LOCALE, isValidLocale, type Locale } from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildLocalizedPath,
  buildStaticRouteData,
} from "@/lib/i18n/localized-routing";
import { buildCategoryRouteData } from "@/lib/public-route-builders";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/seo/metadata-builders";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo/schemaBuilders.js";
import { buildItemListSchema as buildAdvancedItemListSchema } from "@/lib/seo/advanced/schema-builders";
import { getPublicListingsByCategory } from "@/lib/public-data/listings";
import { CMS_PAGE_BUILDER_RUNTIME_KEYS } from "@/lib/cms/pageBuilderRegistry";
import { fetchCmsRuntimeSettings } from "@/lib/cms/runtime-settings";
import {
  getNullableRuntimePageText,
  getRuntimePageConfig,
  getRuntimePageText,
  isRuntimeSectionEnabled,
} from "@/lib/cms/public-page-runtime";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://algarveofficial.com";

export const revalidate = 60;

async function loadBeachesRuntimeSettings(locale: Locale) {
  try {
    const draft = await draftMode();
    return await fetchCmsRuntimeSettings({
      requestedKeys: CMS_PAGE_BUILDER_RUNTIME_KEYS,
      locale,
      includeDraft: draft.isEnabled,
    });
  } catch {
    return [];
  }
}

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
  const [tx, runtimeSettings, beachListings] = await Promise.all([
    getServerTranslations(locale, [
      "nav.home",
      "nav.beaches",
      "categories.beaches",
      "beachesPage.heroTitle",
      "beachesPage.heroDescription",
      "experiences.hero.ctaPrimary",
      "experiences.hero.ctaSecondary",
    ]),
    loadBeachesRuntimeSettings(locale),
    getPublicListingsByCategory("beaches", {
      locale,
      limit: 24,
      includeReviewsSummary: false,
    }),
  ]);
  const beachesConfig = getRuntimePageConfig(runtimeSettings, "beaches");

  const pageUrl = buildAbsoluteRouteUrl(locale, "/beaches");
  const homeUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("home"));
  const experiencesHref = buildLocalizedPath(
    locale,
    buildCategoryRouteData("experiences") ?? buildStaticRouteData("experiences"),
  );
  const pageTitle = tx["nav.beaches"] ?? tx["categories.beaches"] ?? "Beaches";
  const heroTitle = getRuntimePageText(
    beachesConfig,
    "hero.title",
    tx["beachesPage.heroTitle"] ?? "Beaches in the Algarve",
  );
  const heroDescription = getRuntimePageText(
    beachesConfig,
    "hero.subtitle",
    tx["beachesPage.heroDescription"] ??
      "Discover golden sands, turquoise water, and premium beach clubs curated for AlgarveOfficial visitors.",
  );
  const heroBadge = getRuntimePageText(beachesConfig, "hero.badge", pageTitle);
  const heroAlt = getRuntimePageText(beachesConfig, "hero.alt", heroTitle);
  const heroEnabled = isRuntimeSectionEnabled(beachesConfig, "hero", true);
  const heroMediaType = getRuntimePageText(beachesConfig, "hero.mediaType", "image");
  const heroImageUrl = getNullableRuntimePageText(beachesConfig, "hero.imageUrl") ?? "";
  const heroVideoUrl = getNullableRuntimePageText(beachesConfig, "hero.videoUrl") ?? "";
  const heroYoutubeUrl = getNullableRuntimePageText(beachesConfig, "hero.youtubeUrl") ?? "";
  const heroPosterUrl = getNullableRuntimePageText(beachesConfig, "hero.posterUrl") ?? "";
  const primaryCta = getRuntimePageText(
    beachesConfig,
    "hero.cta.primary",
    tx["experiences.hero.ctaPrimary"] ?? "Explore",
  );
  const secondaryCta = getRuntimePageText(
    beachesConfig,
    "hero.cta.secondary",
    tx["experiences.hero.ctaSecondary"] ?? "Contact",
  );
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
  const itemListSchema = buildAdvancedItemListSchema(
    pageTitle,
    beachListings.map((listing) => ({
      name: listing.name,
      url: buildLocalizedPath(locale, `/listing/${listing.slug}`),
      description: listing.shortDescription ?? undefined,
      image: listing.imageUrl ?? undefined,
    })),
    buildLocalizedPath(locale, "/beaches"),
  );

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
      <script
        id="schema-beaches-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div id="beaches-server-shell" className="min-h-screen bg-background text-foreground">
        {!heroEnabled ? (
          <div className={STANDARD_PUBLIC_NO_HERO_SPACER_CLASS} aria-hidden="true" />
        ) : (
          <section className={STANDARD_PUBLIC_HERO_WRAPPER_CLASS}>
            <LiveStyleHero
              className="min-h-[19rem] rounded-none shadow-sm sm:min-h-[20rem] md:min-h-[22rem]"
              badge={heroBadge}
              title={heroTitle}
              subtitle={heroDescription}
              media={
                <HeroBackgroundMedia
                  mediaType={heroMediaType}
                  imageUrl={heroImageUrl}
                  videoUrl={heroVideoUrl}
                  youtubeUrl={heroYoutubeUrl}
                  posterUrl={heroPosterUrl}
                  alt={heroAlt}
                  fallback={<PageHeroImage page="beaches" alt={heroAlt} />}
                />
              }
              ctas={
                <>
                  <Link href={experiencesHref}>
                    <Button variant="gold" size="lg">
                      {primaryCta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="heroOutline" size="lg">
                      {secondaryCta}
                    </Button>
                  </Link>
                </>
              }
            />
          </section>
        )}
      </div>

      <Suspense fallback={<RouteLoadingState />}>
        <BeachesClient initialGlobalSettings={runtimeSettings} locale={locale} />
      </Suspense>
    </>
  );
}
