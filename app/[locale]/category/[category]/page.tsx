import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SUPPORTED_LOCALES, isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import {
  buildLocalizedPath,
  buildLocaleSwitchPathsForEntity,
  buildStaticRouteData,
  buildUniformLocalizedSlugMap,
  type CategoryRouteData,
  type CityCategoryRouteData,
} from "@/lib/i18n/localized-routing";
import { getCategoryDisplayName, getCategoryUrlSlug, ALL_CANONICAL_SLUGS, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import { getServerTranslations } from "@/lib/i18n/server";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/advanced/schema-builders";
import {
  getPublicCategoryCityCounts,
  getPublicCategoryCounts,
  getPublicListings,
  getPublicRoutableCategorySlugs,
  resolvePublicCategoryRoute,
} from "@/lib/public-data";
import {
  buildCategoryPageMetaCopy,
  hasNonCanonicalCategorySearchParams,
  type CategorySearchParams,
} from "@/lib/seo/category-page-metadata";
import type { ProgrammaticListing } from "@/lib/seo/programmatic/category-city-data";

interface PageParams {
  locale: string;
  category: string;
}

interface PageProps {
  params: Promise<PageParams>;
  searchParams?: Promise<CategorySearchParams>;
}

export const revalidate = 60;

function formatTemplate(
  template: string | undefined,
  replacements: Record<string, string>,
): string {
  if (!template) {
    return "";
  }

  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

function isProgrammaticCategorySlug(slug: string): slug is CanonicalCategorySlug {
  return (ALL_CANONICAL_SLUGS as readonly string[]).includes(slug);
}

function getCategoryDisplayNameForSlug(categorySlug: string, locale: typeof SUPPORTED_LOCALES[number], fallbackName: string) {
  return isProgrammaticCategorySlug(categorySlug)
    ? getCategoryDisplayName(categorySlug, locale)
    : fallbackName;
}

function buildCategoryRouteData(
  canonical: string,
): CategoryRouteData {
  return {
    routeType: "category",
    slugs: Object.fromEntries(
      SUPPORTED_LOCALES.map((supportedLocale) => [
        supportedLocale,
        isProgrammaticCategorySlug(canonical)
          ? getCategoryUrlSlug(canonical, supportedLocale)
          : canonical,
      ]),
    ) as CategoryRouteData["slugs"],
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];
  const canonicalSlugs = await getPublicRoutableCategorySlugs();
  for (const canonical of canonicalSlugs) {
    for (const locale of SUPPORTED_LOCALES) {
      params.push({
        locale,
        category: isProgrammaticCategorySlug(canonical)
          ? getCategoryUrlSlug(canonical, locale)
          : canonical,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, category: rawCategory } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const resolution = await resolvePublicCategoryRoute(rawCategory, locale);
  if (!resolution.ok) {
    return buildPageMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      localizedPath: `/category/${rawCategory}`,
      locale,
      noIndex: true,
      noFollow: true,
    });
  }
  
  const canonical = resolution.category.canonicalSlug;
  const categoryName = getCategoryDisplayNameForSlug(canonical, locale, resolution.category.name);
  const [resolvedSearchParams, categoryCounts] = await Promise.all([
    searchParams?.then((value) => value ?? {}) ?? Promise.resolve({}),
    getPublicCategoryCounts(),
  ]);
  const listingCount =
    categoryCounts.byCanonicalCategorySlug[canonical] ??
    categoryCounts.byCanonicalCategoryId[resolution.category.id] ??
    0;
  const metaCopy = buildCategoryPageMetaCopy({
    categoryName,
    locale,
    listingCount,
  });
  const routeData = buildCategoryRouteData(canonical);

  return buildPageMetadata({
    title: metaCopy.title,
    description: metaCopy.description,
    keywords: metaCopy.keywords,
    localizedRoute: routeData,
    locale,
    noIndex: hasNonCanonicalCategorySearchParams(resolvedSearchParams) || listingCount === 0,
  });
}

export default async function CategoryHubPage({ params }: PageProps) {
  const { locale: rawLocale, category: rawCategory } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const resolution = await resolvePublicCategoryRoute(rawCategory, locale);
  if (!resolution.ok) {
    if (resolution.reason === "redirect_required" && resolution.redirectTo) {
      permanentRedirect(resolution.redirectTo);
    }
    notFound();
  }

  const catData = resolution.category;
  const canonicalSlug = catData.canonicalSlug;
  
  const listingData = catData.memberIds.length > 0
    ? await getPublicListings({
        categoryIds: catData.memberIds,
        locale,
        limit: 50,
        includeReviewsSummary: false,
      })
    : [];

  const safeListingsForLocale: ProgrammaticListing[] = listingData.map((listing) => ({
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    short_description: listing.shortDescription,
    featured_image_url: listing.imageUrl,
    tier: listing.tier,
    is_curated: listing.isCurated,
    google_rating: listing.reviews.googleRating,
    google_review_count: listing.reviews.googleReviewCount,
    price_from: listing.priceFrom,
    price_currency: listing.priceCurrency,
    website_url: listing.websiteUrl,
    city_slug: listing.city?.slug ?? "",
    city_name: listing.city?.name ?? "",
    category_slug: listing.category?.slug ?? canonicalSlug,
    category_name: listing.category?.name ?? getCategoryDisplayNameForSlug(canonicalSlug, locale, catData.name),
  }));
  
  const topCities = await getPublicCategoryCityCounts({
    categoryIds: catData.memberIds,
    locale,
    limit: 12,
  });
  
  const categoryName = getCategoryDisplayNameForSlug(canonicalSlug, locale, catData.name);
  const categoryRouteData = buildCategoryRouteData(canonicalSlug);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(categoryRouteData, SUPPORTED_LOCALES);
  const categoryPath = buildLocalizedPath(locale, categoryRouteData);
  const itemListSchema = buildItemListSchema(
    categoryName,
    safeListingsForLocale.map((listing) => ({
      name: listing.name,
      url: buildLocalizedPath(locale, `/listing/${listing.slug}`),
      description: listing.short_description ?? undefined,
      image: listing.featured_image_url ?? undefined,
    })),
    categoryPath,
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: buildLocalizedPath(locale, buildStaticRouteData("home")) },
    { name: categoryName, url: categoryPath },
  ]);

  const tx = await getServerTranslations(locale, [
    "common.signature",
    "common.verified",
    "common.curated",
    "common.fromPrice",
    "guides.getFeatured",
    "guides.listYourBusiness",
    "guides.upgradeYourListing",
    "categoryHub.heroTitle",
    "categoryHub.heroDescription",
    "categoryHub.topCities",
    "categoryHub.featured",
    "categoryHub.visibilityTitle",
    "categoryHub.visibilityDescription",
    "categoryHub.bottomTitle",
    "categoryHub.bottomDescription",
  ]);
  const templateValues = { category: categoryName };
  const heroTitle = formatTemplate(tx["categoryHub.heroTitle"], templateValues);
  const heroDescription = formatTemplate(tx["categoryHub.heroDescription"], templateValues);
  const topCitiesTitle = formatTemplate(tx["categoryHub.topCities"], templateValues);
  const featuredTitle = formatTemplate(tx["categoryHub.featured"], templateValues);
  const visibilityTitle = tx["categoryHub.visibilityTitle"] ?? "";
  const visibilityDescription = formatTemplate(
    tx["categoryHub.visibilityDescription"],
    templateValues,
  );
  const bottomTitle = formatTemplate(tx["categoryHub.bottomTitle"], templateValues);
  const bottomDescription = formatTemplate(
    tx["categoryHub.bottomDescription"],
    templateValues,
  );

  return (
    <>
      <script
        id="schema-category-item-list"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        id="schema-category-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header localeSwitchPaths={localeSwitchPaths} />
      <main id="main-content" className="min-h-screen pt-20">
        <section className="bg-gradient-to-b from-background/60 to-background py-12">
          <div className="app-container">
            <h1 className="font-serif text-4xl md:text-5xl mb-4">
              {heroTitle}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {heroDescription}
            </p>
          </div>
        </section>
        
        <section className="app-container py-8">
          <h2 className="text-xl font-semibold mb-4">
            {topCitiesTitle}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {topCities.map((city) => (
              <LocaleLink
                key={city.slug}
                href={{
                  routeType: "city-category",
                  citySlugs: buildUniformLocalizedSlugMap(city.slug),
                  categorySlugs: categoryRouteData.slugs,
                } satisfies CityCategoryRouteData}
                className="block p-4 rounded-xl border border-border hover:border-primary/50 transition-colors text-center"
              >
                <span className="font-medium">{city.name}</span>
                <span className="block text-sm text-muted-foreground">
                  {city.count} {categoryName.toLowerCase()}
                </span>
              </LocaleLink>
            ))}
          </div>
        </section>
        
        {safeListingsForLocale.length > 0 && (
          <section className="app-container py-8">
            <h2 className="text-xl font-semibold mb-4">
              {featuredTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {safeListingsForLocale.slice(0, 12).map((listing) => (
                <ListingCard key={listing.id} listing={listing} tx={tx} />
              ))}
            </div>
          </section>
        )}

        {safeListingsForLocale.length > 0 && (
          <section className="app-container py-8 border-t border-border bg-gradient-to-b from-primary/5 to-transparent">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-serif font-semibold mb-3">
                {visibilityTitle}
              </h2>
              <p className="text-muted-foreground mb-6">
                {visibilityDescription}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <LocaleLink 
                  href={`/partner?category=${canonicalSlug}`}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {tx["guides.upgradeYourListing"]}
                </LocaleLink>
                <LocaleLink 
                  href={buildStaticRouteData("partner")}
                  className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  {tx["guides.getFeatured"]}
                </LocaleLink>
              </div>
            </div>
          </section>
        )}

        <section className="app-container py-8 border-t border-border bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold mb-4">
              {bottomTitle}
            </h2>
            <p className="text-muted-foreground mb-6">
              {bottomDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <LocaleLink 
                href={buildStaticRouteData("partner")}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {tx["guides.listYourBusiness"]}
              </LocaleLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
