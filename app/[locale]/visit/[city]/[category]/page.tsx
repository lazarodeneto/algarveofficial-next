import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

import Header from "@/components/layout/Header";
import {
  SUPPORTED_LOCALES,
  isValidLocale,
  type Locale,
} from "@/lib/i18n/config";
import {
  buildLocaleSwitchPathsForEntity,
  buildUniformLocalizedSlugMap,
  type CityCategoryRouteData,
} from "@/lib/i18n/localized-routing";
import {
  getCanonicalFromUrlSlug,
  getCategoryDisplayName,
  getCategoryUrlSlug,
  ALL_CANONICAL_SLUGS,
  type CanonicalCategorySlug,
} from "@/lib/seo/programmatic/category-slugs";
import {
  getAllCategoryCityCombinations,
  getCategoryCityPageDataAllowEmpty,
  isValidCitySlug,
} from "@/lib/seo/programmatic/category-city-data";
import { generateSeoContentBlock } from "@/lib/seo/programmatic/content-blocks";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildItemListSchema,
} from "@/lib/seo/programmatic/schema-builders";
import { getServerTranslations } from "@/lib/i18n/server";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import InternalLinks from "@/components/seo/InternalLinks";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface PageParams {
  locale: string;
  city: string;
  category: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

function buildCityCategoryRouteData(
  canonical: CanonicalCategorySlug,
  citySlug: string,
): CityCategoryRouteData {
  return {
    routeType: "city-category",
    citySlugs: buildUniformLocalizedSlugMap(citySlug),
    categorySlugs: Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [locale, getCategoryUrlSlug(canonical, locale)])
    ) as CityCategoryRouteData["categorySlugs"],
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const combinations = await getAllCategoryCityCombinations();

  const params: PageParams[] = [];

  for (const { categorySlug, citySlug } of combinations) {
    if (!ALL_CANONICAL_SLUGS.includes(categorySlug as CanonicalCategorySlug)) continue;

    for (const locale of SUPPORTED_LOCALES) {
      params.push({
        locale,
        city: citySlug,
        category: getCategoryUrlSlug(categorySlug as CanonicalCategorySlug, locale),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, city: rawCity, category: rawCategory } = await params;

  if (!isValidLocale(rawLocale)) return {};

  const locale = rawLocale as Locale;
  const citySlug = rawCity.toLowerCase();
  const categoryUrlSlug = rawCategory.toLowerCase();

  if (!isValidCitySlug(citySlug)) return {};

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, locale);
  if (!canonical) return {};

  const data = await getCategoryCityPageDataAllowEmpty(canonical, citySlug);
  if (!data) return {};

  const content = generateSeoContentBlock(
    locale,
    canonical,
    data.city.name,
    data.city.description ?? null,
    data.listings,
    data.totalCount,
  );
  const hasListings = data.totalCount > 0;

  const year = new Date().getFullYear();
  const categoryName = getCategoryDisplayName(canonical, locale);
  const routeData = buildCityCategoryRouteData(canonical, citySlug);
  const title =
    locale === "en" && hasListings
      ? `Best ${categoryName} in ${data.city.name}, Algarve (${year})`
      : content.metaTitle;
  const description = content.metaDescription;
  const baseMetadata = buildPageMetadata({
    title,
    description,
    image: data.city.image_url ?? undefined,
    locale,
    noIndex: !hasListings,
    localizedRoute: routeData,
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...(baseMetadata.openGraph ?? {}),
      title,
      description,
      images: data.city.image_url
        ? [{ url: data.city.image_url, width: 1200, height: 630, alt: `${data.city.name} ${categoryName}` }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      ...(baseMetadata.twitter ?? {}),
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: hasListings,
      follow: true,
      googleBot: {
        index: hasListings,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function VisitCityCategoryPage({ params }: PageProps) {
  const { locale: rawLocale, city: rawCity, category: rawCategory } = await params;

  if (!isValidLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  const citySlug = rawCity.toLowerCase();
  const categoryUrlSlug = rawCategory.toLowerCase();

  if (!isValidCitySlug(citySlug)) notFound();

  const canonical = getCanonicalFromUrlSlug(categoryUrlSlug, locale);
  if (!canonical) notFound();
  const routeData = buildCityCategoryRouteData(canonical, citySlug);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(routeData, SUPPORTED_LOCALES);

  const data = await getCategoryCityPageDataAllowEmpty(canonical, citySlug);
  if (!data) notFound();

  const content = generateSeoContentBlock(
    locale,
    canonical,
    data.city.name,
    data.city.description ?? null,
    data.listings,
    data.totalCount,
  );
  const hasListings = data.totalCount > 0;

  const programmaticRelatedCategories = data.relatedCategories.filter((category) =>
    ALL_CANONICAL_SLUGS.includes(category.slug as CanonicalCategorySlug),
  );

  const tx = await getServerTranslations(locale, [
    "nav.home",
    "nav.visit",
    "common.avgRating",
    "common.fromPrice",
    "common.inOtherCities",
    "common.moreToExploreIn",
    "common.curated",
    "common.signature",
    "common.verified",
  ]);

  const itemListSchema = buildItemListSchema(locale, canonical, data.city.name, citySlug, categoryUrlSlug, data.listings);
  const breadcrumbSchema = buildBreadcrumbSchema(locale, canonical, data.city.name, citySlug, categoryUrlSlug);
  const collectionSchema = buildCollectionPageSchema(locale, canonical, data.city.name, citySlug, categoryUrlSlug, data.totalCount);

  return (
    <>
      {itemListSchema && (
        <script
          id="schema-visit-category-itemlist"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        id="schema-visit-category-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="schema-visit-category-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="min-h-screen bg-background">
        <Header localeSwitchPaths={localeSwitchPaths} />
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          {data.city.image_url && (
            <div className="absolute inset-0 -z-10">
              <Image
                src={data.city.image_url}
                alt={`${data.city.name} ${getCategoryDisplayName(canonical, locale)}`}
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
                <li>
                  <LocaleLink
                    href={{
                      routeType: "city",
                      citySlugs: routeData.citySlugs,
                    }}
                    className="hover:text-foreground transition-colors capitalize"
                  >
                    {data.city.name}
                  </LocaleLink>
                </li>
                <li aria-hidden="true" className="select-none">/</li>
                <li className="text-foreground font-medium">{getCategoryDisplayName(canonical, locale)}</li>
              </ol>
            </nav>

            <h1 className="w-full font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              {content.h1}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                {hasListings ? `${data.totalCount} ${getCategoryDisplayName(canonical, locale).toLowerCase()}` : `${data.totalCount} listings`}
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
          <div className="w-full space-y-4">
            <p className="w-full text-base text-muted-foreground leading-relaxed">
              {content.intro}
            </p>
            <p className="w-full text-base text-muted-foreground leading-relaxed">
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
                Listings for {getCategoryDisplayName(canonical, locale)} in {data.city.name} are being added
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                This page is available so visitors can discover this topic in {data.city.name} while new listings are published. Explore the main city page or nearby city/category combinations in the meantime.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <LocaleLink
                  href={{
                    routeType: "city",
                    citySlugs: routeData.citySlugs,
                  }}
                  className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                >
                  View {data.city.name}
                </LocaleLink>
                {data.relatedCities.slice(0, 3).map((city) => (
                  <LocaleLink
                    key={city.slug}
                    href={{
                      routeType: "city-category",
                      citySlugs: buildUniformLocalizedSlugMap(city.slug),
                      categorySlugs: routeData.categorySlugs,
                    }}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {city.name}
                  </LocaleLink>
                ))}
              </div>
            </div>
          )}
        </section>

        <InternalLinks
          locale={locale}
          currentCity={citySlug}
          currentCategory={canonical}
          categoriesInCity={data.relatedCategories}
          citiesWithCategory={data.relatedCities}
          maxItems={8}
          className="app-container py-8 border-t border-border"
        />

        {data.relatedCities.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {getCategoryDisplayName(canonical, locale)} {tx["common.inOtherCities"] ?? "in other Algarve cities"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.relatedCities.map((city) => (
                <LocaleLink
                  key={city.slug}
                  href={{
                    routeType: "city-category",
                    citySlugs: buildUniformLocalizedSlugMap(city.slug),
                    categorySlugs: routeData.categorySlugs,
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

        {programmaticRelatedCategories.length > 0 && (
          <section className="app-container py-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {tx["common.moreToExploreIn"] ?? "More to explore in"} {data.city.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {programmaticRelatedCategories.map((category) => {
                const categoryCanonical = category.slug as CanonicalCategorySlug;
                const localizedCategorySlug = getCategoryUrlSlug(categoryCanonical, locale);

                return (
                  <LocaleLink
                    key={category.slug}
                    href={{
                      routeType: "city-category",
                      citySlugs: routeData.citySlugs,
                      categorySlugs: Object.fromEntries(
                        SUPPORTED_LOCALES.map((supportedLocale) => [
                          supportedLocale,
                          getCategoryUrlSlug(categoryCanonical, supportedLocale),
                        ]),
                      ),
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {getCategoryDisplayName(categoryCanonical, locale)}
                    <span className="text-xs opacity-60">({category.count})</span>
                  </LocaleLink>
                );
              })}
            </div>
          </section>
        )}

        <section className="app-container py-8 border-t border-border">
          <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
            {content.closingParagraph}
          </p>
        </section>

        {data.listings.length > 0 && (
          <section className="app-container py-8 border-t border-border bg-gradient-to-b from-primary/5 to-transparent">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-serif font-semibold mb-3">
                Get More Visibility in {data.city.name}
              </h2>
              <p className="text-muted-foreground mb-6">
                Stand out from the competition. Upgrade your listing to reach more customers searching for {getCategoryDisplayName(canonical, locale).toLowerCase()} in {data.city.name}.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <LocaleLink 
                  href={`/partner?category=${canonical}&city=${citySlug}&type=upgrade`}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Upgrade Your Listing
                </LocaleLink>
                <LocaleLink 
                  href={`/partner`}
                  className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Get Featured
                </LocaleLink>
              </div>
            </div>
          </section>
        )}

        <section className="app-container py-8 border-t border-border bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold mb-4">
              Find the best {getCategoryDisplayName(canonical, locale)} in {data.city.name}
            </h2>
            <p className="text-muted-foreground mb-6">
              Discover curated listings for {getCategoryDisplayName(canonical, locale).toLowerCase()} in {data.city.name}. From local favorites to premium experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <LocaleLink 
                href={`/partner`}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                List Your Business
              </LocaleLink>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
