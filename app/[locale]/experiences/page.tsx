import { Suspense } from "react";
import type { Metadata } from "next";

import ExperiencesClient from "@/components/experiences/ExperiencesClient";
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
    path: "/experiences",
    title: "Experiences in the Algarve",
    description: "Discover curated experiences across the Algarve — from wine tastings and boat tours to golf, wellness, and cultural adventures.",
    keywords: ["Algarve experiences", "things to do Algarve", "Algarve tours", "Algarve activities"],
  });
}

export default async function ExperiencesPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const tx = await getServerTranslations(locale, [
    "nav.home",
    "nav.experiences",
    "experiences.hero.badge",
    "experiences.hero.title",
    "experiences.hero.subtitle",
    "experiences.pillars.title",
    "experiences.pillars.outdoor.title",
    "experiences.pillars.outdoor.description",
    "experiences.pillars.gastronomy.title",
    "experiences.pillars.gastronomy.description",
    "experiences.pillars.wellness.title",
    "experiences.pillars.wellness.description",
    "experiences.pillars.culture.title",
    "experiences.pillars.culture.description",
  ]);

  const pageUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("experiences"));
  const homeUrl = buildAbsoluteRouteUrl(locale, buildStaticRouteData("home"));
  const pageTitle = tx["experiences.hero.title"] ?? "Experience the Algarve";
  const pageDescription =
    tx["experiences.hero.subtitle"] ??
    "From coastal adventures to culinary discoveries, explore unforgettable experiences across the Algarve.";
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
    { name: tx["nav.experiences"] ?? "Experiences", url: pageUrl },
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

      <div id="experiences-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <section className="rounded-lg border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur md:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
              {tx["experiences.hero.badge"] ?? "Curated Adventures"}
            </p>
            <h1 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
              {pageTitle}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {pageDescription}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title:
                    tx["experiences.pillars.outdoor.title"] ?? "Outdoor Adventures",
                  description:
                    tx["experiences.pillars.outdoor.description"] ??
                    "Surfing, kayaking, hiking, and coastal exploration.",
                },
                {
                  title:
                    tx["experiences.pillars.gastronomy.title"] ?? "Gastronomy & Wine",
                  description:
                    tx["experiences.pillars.gastronomy.description"] ??
                    "Wine tastings, seafood experiences, and local cooking classes.",
                },
                {
                  title:
                    tx["experiences.pillars.wellness.title"] ?? "Wellness & Relaxation",
                  description:
                    tx["experiences.pillars.wellness.description"] ??
                    "Spa retreats, yoga sessions, and holistic escapes.",
                },
                {
                  title:
                    tx["experiences.pillars.culture.title"] ?? "Culture & Heritage",
                  description:
                    tx["experiences.pillars.culture.description"] ??
                    "Historic villages, artisan workshops, and local traditions.",
                },
              ].map((pillar) => (
                <div key={pillar.title} className="rounded-sm border border-border/60 bg-background/70 p-5">
                  <p className="text-sm font-semibold text-foreground">{pillar.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Suspense fallback={<RouteLoadingState />}>
        <ExperiencesClient initialGlobalSettings={[]} />
      </Suspense>
    </>
  );
}
