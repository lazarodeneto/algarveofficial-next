import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";

import Header from "@/components/layout/Header";
import {
  SUPPORTED_LOCALES,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import {
  buildLocaleSwitchPathsForEntity,
  buildUniformLocalizedSlugMap,
  type CityRouteData,
} from "@/lib/i18n/localized-routing";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import {
  getAllProgrammaticCitySlugs,
  getCityPageData,
  isValidCitySlug,
} from "@/lib/seo/programmatic/category-city-data";
import {
  generateCitySeoContentBlock,
} from "@/lib/seo/programmatic/content-blocks";
import {
  buildVisitCityBreadcrumbSchema,
  buildVisitCityCategoryItemListSchema,
  buildVisitCityCollectionPageSchema,
  buildVisitCityItemListSchema,
} from "@/lib/seo/programmatic/schema-builders";
import {
  ALL_CANONICAL_SLUGS,
  getCategoryDisplayName,
  type CanonicalCategorySlug,
  getCategoryUrlSlug,
} from "@/lib/seo/programmatic/category-slugs";

interface PageParams {
  locale: string;
  city: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export const revalidate = 60;

function buildCityRouteData(citySlug: string): CityRouteData {
  return {
    routeType: "city",
    citySlugs: buildUniformLocalizedSlugMap(citySlug),
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const citySlugs = await getAllProgrammaticCitySlugs();

  return SUPPORTED_LOCALES.flatMap((locale) =>
    citySlugs.map((city) => ({
      locale,
      city,
    })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, city: rawCity } = await params;

  if (!isValidLocale(rawLocale)) return {};

  const locale = rawLocale as Locale;
  const citySlug = rawCity.toLowerCase();
  if (!isValidCitySlug(citySlug)) return {};

  const data = await getCityPageData(citySlug);
  if (!data) return {};

  const programmaticCategories = data.relatedCategories.filter((category) =>
    ALL_CANONICAL_SLUGS.includes(category.slug as CanonicalCategorySlug),
  );

  const topCategoryNames = programmaticCategories
    .slice(0, 4)
    .map((category) => getCategoryDisplayName(category.slug as CanonicalCategorySlug, locale));

  const content = generateCitySeoContentBlock(
    locale,
    data.city.name,
    data.city.description ?? null,
    data.listings,
    topCategoryNames,
    data.totalCount,
  );
  const hasListings = data.totalCount > 0;

  return buildPageMetadata({
    locale,
    title: content.metaTitle,
    description: content.metaDescription,
    image: data.city.image_url ?? undefined,
    noIndex: !hasListings,
    keywords: [
      `${data.city.name} Algarve`,
      `things to do in ${data.city.name}`,
      ...topCategoryNames.map((name) => `${name} ${data.city.name}`),
    ],
    localizedRoute: buildCityRouteData(citySlug),
  });
}

export default async function VisitCityPage({ params }: PageProps) {
  const { locale: rawLocale, city: rawCity } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const citySlug = rawCity.toLowerCase();
  const cityRouteData = buildCityRouteData(citySlug);

  if (!isValidCitySlug(citySlug)) {
    notFound();
  }

  const data = await getCityPageData(citySlug);
  if (!data) {
    notFound();
  }

  const programmaticCategories = data.relatedCategories.filter((category) =>
    ALL_CANONICAL_SLUGS.includes(category.slug as CanonicalCategorySlug),
  );

  const topCategoryNames = programmaticCategories
    .slice(0, 4)
    .map((category) => getCategoryDisplayName(category.slug as CanonicalCategorySlug, locale));

  const content = generateCitySeoContentBlock(
    locale,
    data.city.name,
    data.city.description ?? null,
    data.listings,
    topCategoryNames,
    data.totalCount,
  );
  const hasListings = data.totalCount > 0;

  const tx = await getServerTranslations(locale, [
    "nav.home",
    "nav.visit",
    "common.avgRating",
    "common.curated",
    "common.fromPrice",
    "common.signature",
    "common.verified",
  ]);

  const itemListSchema = buildVisitCityItemListSchema(locale, data.city.name, citySlug, data.listings);
  const categoryItemListSchema = buildVisitCityCategoryItemListSchema(
    locale,
    data.city.name,
    citySlug,
    programmaticCategories.map((category) => ({
      slug: category.slug as CanonicalCategorySlug,
      name: category.name,
      count: category.count,
    })),
  );
  const breadcrumbSchema = buildVisitCityBreadcrumbSchema(locale, data.city.name, citySlug);
  const collectionSchema = buildVisitCityCollectionPageSchema(locale, data.city.name, citySlug, data.totalCount);

  return (
    <>
      {itemListSchema && (
        <Script
          id="schema-visit-city-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      {categoryItemListSchema && (
        <Script
          id="schema-visit-city-category-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryItemListSchema) }}
        />
      )}
      <Script
        id="schema-visit-city-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="schema-visit-city-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="min-h-screen bg-background">
        <Header localeSwitchPaths={buildLocaleSwitchPathsForEntity(cityRouteData, SUPPORTED_LOCALES)} />
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          {data.city.image_url && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={data.city.image_url}
                alt={data.city.name}
                fill
                className="object-cover opacity-15"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
            </div>
          )}
          <div className="app-container pt-[calc(6rem+10px)] pb-12 md:pt-[calc(6.5rem+10px)] md:pb-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <LocaleLink href="/" className="hover:text-foreground transition-colors">
                    {tx["nav.home"] ?? "Home"}
                  </LocaleLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li>
                  <LocaleLink href="/stay" className="hover:text-foreground transition-colors">
                    {tx["nav.visit"] ?? "Visit"}
                  </LocaleLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li className="text-foreground font-medium capitalize">{data.city.name}</li>
              </ol>
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              {content.h1}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                {hasListings ? `${data.totalCount} curated listings` : `${data.totalCount} listings`}
              </span>
              {data.listings.some((listing) => listing.google_rating) && (
                <span>
                  ★{" "}
                  {(
                    data.listings
                      .filter((listing) => listing.google_rating)
                      .reduce((sum, listing) => sum + (listing.google_rating ?? 0), 0) /
                    data.listings.filter((listing) => listing.google_rating).length
                  ).toFixed(1)}{" "}
                  {tx["common.avgRating"] ?? "avg rating"}
                </span>
              )}
              <span>{data.city.name}, Algarve, Portugal</span>
            </div>
          </div>
        </section>

        <section className="app-container py-8">
          <div className="max-w-4xl space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed">
              {content.intro}
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              {content.bodyParagraph}
            </p>
          </div>
        </section>

        <section className="app-container py-4 pb-12">
          {data.listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} tx={tx} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Listings for {data.city.name} are being added
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                This page is available so visitors can discover {data.city.name} while new listings are published. In the meantime, you can explore the main Visit directory or jump into active category pages below.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <LocaleLink href="/stay" className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors">
                  Browse all of Visit
                </LocaleLink>
                {programmaticCategories.slice(0, 3).map((category) => (
                  <LocaleLink
                    key={category.slug}
                    href={{
                      routeType: "city-category",
                      citySlugs: cityRouteData.citySlugs,
                      categorySlugs: Object.fromEntries(
                        SUPPORTED_LOCALES.map((supportedLocale) => [
                          supportedLocale,
                          getCategoryUrlSlug(
                            category.slug as CanonicalCategorySlug,
                            supportedLocale,
                          ),
                        ]),
                      ),
                    }}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {getCategoryDisplayName(category.slug as CanonicalCategorySlug, locale)}
                  </LocaleLink>
                ))}
              </div>
            </div>
          )}
        </section>

        {programmaticCategories.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Explore more in {data.city.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {programmaticCategories.map((category) => (
                <LocaleLink
                  key={category.slug}
                  href={{
                    routeType: "city-category",
                    citySlugs: cityRouteData.citySlugs,
                    categorySlugs: Object.fromEntries(
                      SUPPORTED_LOCALES.map((supportedLocale) => [
                        supportedLocale,
                        getCategoryUrlSlug(
                          category.slug as CanonicalCategorySlug,
                          supportedLocale,
                        ),
                      ]),
                    ),
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {getCategoryDisplayName(category.slug as CanonicalCategorySlug, locale)}
                  <span className="text-xs opacity-60">({category.count})</span>
                </LocaleLink>
              ))}
            </div>
          </section>
        )}

        {data.relatedCities.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Related Algarve cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.relatedCities.map((city) => (
                <LocaleLink
                  key={city.slug}
                  href={{
                    routeType: "city",
                    citySlugs: buildUniformLocalizedSlugMap(city.slug),
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {city.name}
                  <span className="text-xs opacity-60">({city.count})</span>
                </LocaleLink>
              ))}
            </div>
          </section>
        )}

        <section className="app-container py-8 border-t border-border">
          <p className="max-w-4xl text-sm text-muted-foreground leading-relaxed">
            {content.closingParagraph}
          </p>
        </section>
      </main>
    </>
  );
}
