import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES, isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import {
  buildLocaleSwitchPathsForEntity,
  buildStaticRouteData,
  buildUniformLocalizedSlugMap,
  type CategoryRouteData,
  type CityCategoryRouteData,
  type CityRouteData,
  type GuideRouteData,
} from "@/lib/i18n/localized-routing";
import { getCategoryDisplayName, getCategoryUrlSlug, ALL_CANONICAL_SLUGS, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import { getServerTranslations } from "@/lib/i18n/server";
import {
  fetchCityTranslations,
  fetchListingTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

const GUIDES_CONFIG = {
  "best-restaurants-in-lagos": {
    targetCity: "lagos",
    targetCategory: "restaurants",
  },
  "golf-in-vilamoura": {
    targetCity: "vilamoura",
    targetCategory: "golf",
  },
  "beaches-in-tavira": {
    targetCity: "tavira",
    targetCategory: "beaches",
  },
  "things-to-do-in-albufeira": {
    targetCity: "albufeira",
    targetCategory: "experiences",
  },
  "family-attractions-in-albufeira": {
    targetCity: "albufeira",
    targetCategory: "family-attractions",
  },
  "wellness-spas-in-lagos": {
    targetCity: "lagos",
    targetCategory: "wellness-spas",
  },
  "shopping-in-lagos": {
    targetCity: "lagos",
    targetCategory: "shopping",
  },
  "real-estate-in-quinta-do-lago": {
    targetCity: "quinta-do-lago",
    targetCategory: "real-estate",
  },
  "beach-clubs-in-albufeira": {
    targetCity: "albufeira",
    targetCategory: "beach-clubs",
  },
  "experiences-in-faro": {
    targetCity: "faro",
    targetCategory: "experiences",
  },
};

function interpolateTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  );
}

function getTranslationOrThrow(
  tx: Record<string, string>,
  key: string,
): string {
  const value = tx[key];
  if (!value) {
    throw new Error(`Missing translation for "${key}"`);
  }

  return value;
}

function getGuideTitle(tx: Record<string, string>, slug: string): string {
  return getTranslationOrThrow(tx, `guides.pages.${slug}.title`);
}

function getGuideDescription(tx: Record<string, string>, slug: string): string {
  return getTranslationOrThrow(tx, `guides.pages.${slug}.description`);
}

function getLocalizedText(
  localizedValue: string | null | undefined,
  fallbackValue: string | null | undefined,
): string | null | undefined {
  return localizedValue?.trim() || fallbackValue;
}

function buildGuideRouteData(slug: string): GuideRouteData {
  return {
    routeType: "guide",
    slugs: buildUniformLocalizedSlugMap(slug),
  };
}

function buildGuideCategoryRouteData(
  category: CanonicalCategorySlug,
): CategoryRouteData {
  return {
    routeType: "category",
    slugs: Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [locale, getCategoryUrlSlug(category, locale)])
    ) as CategoryRouteData["slugs"],
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of Object.keys(GUIDES_CONFIG)) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const guide = GUIDES_CONFIG[slug as keyof typeof GUIDES_CONFIG];
  const tx = await getServerTranslations(locale);
  
  if (!guide) {
    return buildPageMetadata({
      title: getTranslationOrThrow(tx, "guides.notFoundTitle"),
      description: getTranslationOrThrow(tx, "guides.notFoundDescription"),
      localizedPath: `/guides/${slug}`,
      locale,
      noIndex: true,
      noFollow: true,
    });
  }
  
  return buildPageMetadata({
    title: getGuideTitle(tx, slug),
    description: getGuideDescription(tx, slug),
    localizedRoute: buildGuideRouteData(slug),
    locale,
  });
}

export default async function GuidePage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);
  const guide = GUIDES_CONFIG[slug as keyof typeof GUIDES_CONFIG];
  
  if (!guide) notFound();
  
  const supabase = createPublicServerClient();
  
  const { data: cityData } = await supabase
    .from("cities")
    .select("id, slug, name")
    .eq("slug", guide.targetCity)
    .single();
  
  const { data: catData } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("slug", guide.targetCategory)
    .single();
  
  if (!cityData || !catData) notFound();
  
  const { data: listingsData } = await supabase
    .from("listings")
    .select("id, slug, name, short_description, featured_image_url, tier, is_curated, google_rating, google_review_count, price_from, price_currency, website_url, cities(slug, name)")
    .eq("status", "published")
    .eq("city_id", cityData.id)
    .eq("category_id", catData.id)
    .order("is_curated", { ascending: false })
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(20) as { data: any[] };

  let cityName = cityData.name;
  let listings = (listingsData ?? []) as any[];

  if (contentLocale !== "en") {
    const [cityTranslations, listingTranslations] = await Promise.all([
      fetchCityTranslations(contentLocale, [cityData.id]),
      fetchListingTranslations(
        contentLocale,
        listings.map((listing) => listing.id),
      ),
    ]);

    const cityTranslation = cityTranslations[0];
    const listingTranslationMap = new Map(
      listingTranslations.map((translation) => [translation.listing_id, translation]),
    );

    cityName = getLocalizedText(cityTranslation?.name, cityData.name) ?? cityData.name;
    listings = listings.map((listing) => {
      const listingTranslation = listingTranslationMap.get(listing.id);

      return {
        ...listing,
        name: getLocalizedText(listingTranslation?.title, listing.name) ?? listing.name,
        short_description: getLocalizedText(
          listingTranslation?.short_description,
          listing.short_description,
        ),
      };
    });
  }
  
  const guideRouteData = buildGuideRouteData(slug);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(guideRouteData, SUPPORTED_LOCALES);
  const categoryRouteData = buildGuideCategoryRouteData(guide.targetCategory as CanonicalCategorySlug);
  const cityRouteData: CityRouteData = {
    routeType: "city",
    citySlugs: buildUniformLocalizedSlugMap(guide.targetCity),
  };
  const cityCategoryRouteData: CityCategoryRouteData = {
    routeType: "city-category",
    citySlugs: cityRouteData.citySlugs,
    categorySlugs: categoryRouteData.slugs,
  };
  const tx = await getServerTranslations(locale);
  const categoryName = getCategoryDisplayName(
    guide.targetCategory as CanonicalCategorySlug,
    locale,
  );
  const guideTitle = getGuideTitle(tx, slug);
  const guideDescription = getGuideDescription(tx, slug);
  
  return (
    <>
      <Header localeSwitchPaths={localeSwitchPaths} />
      <main className="min-h-screen pt-20">
        <section className="bg-gradient-to-b from-background/60 to-background py-12">
          <div className="app-container">
            <nav
              aria-label={getTranslationOrThrow(tx, "guides.breadcrumbLabel")}
              className="mb-4 text-sm text-muted-foreground"
            >
              <ol className="flex gap-2">
                <li>
                  <LocaleLink href={buildStaticRouteData("home")}>
                    {getTranslationOrThrow(tx, "nav.home")}
                  </LocaleLink>
                </li>
                <li>/</li>
                <li><LocaleLink href={cityRouteData}>{cityName}</LocaleLink></li>
                <li>/</li>
                <li>
                  <LocaleLink href={cityCategoryRouteData}>
                    {categoryName}
                  </LocaleLink>
                </li>
              </ol>
            </nav>
            
            <h1 className="font-serif text-4xl md:text-5xl mb-4">{guideTitle}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{guideDescription}</p>
          </div>
        </section>
        
        <section className="app-container py-8">
          <h2 className="text-xl font-semibold mb-4">
            {interpolateTemplate(
              getTranslationOrThrow(tx, "guides.topCategoryInCity"),
              {
                category: categoryName,
                city: cityName,
              },
            )}
          </h2>
          
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} tx={tx} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {getTranslationOrThrow(tx, "guides.moreListingsComingSoon")}
            </p>
          )}
        </section>

        <section className="app-container py-8 border-t bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold mb-4">
              {interpolateTemplate(
                getTranslationOrThrow(tx, "guides.findBestInCity"),
                {
                  category: categoryName,
                  city: cityName,
                },
              )}
            </h2>
            <p className="text-muted-foreground mb-6">
              {interpolateTemplate(
                getTranslationOrThrow(tx, "guides.browseAllInCity"),
                {
                  category: categoryName.toLowerCase(),
                  city: cityName,
                },
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <LocaleLink 
                href={cityCategoryRouteData}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {interpolateTemplate(
                  getTranslationOrThrow(tx, "guides.viewAllInCity"),
                  {
                    category: categoryName,
                    city: cityName,
                  },
                )}
              </LocaleLink>
              <LocaleLink 
                href={buildStaticRouteData("partner")}
                className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {getTranslationOrThrow(tx, "guides.listYourBusiness")}
              </LocaleLink>
            </div>
          </div>
        </section>

        {(listings as any[])?.some((l: any) => l.tier && l.tier !== 'free') && (
          <section className="app-container py-8 border-t">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-serif font-semibold mb-4">
                {interpolateTemplate(
                  getTranslationOrThrow(tx, "guides.getFeaturedInCity"),
                {
                  city: cityName,
                },
              )}
            </h2>
              <p className="text-muted-foreground mb-6">
                {interpolateTemplate(
                  getTranslationOrThrow(tx, "guides.standOutInCity"),
                {
                  category: categoryName.toLowerCase(),
                  city: cityName,
                },
              )}
            </p>
              <div className="flex flex-wrap justify-center gap-4">
                <LocaleLink 
                  href={`/partner?category=${guide.targetCategory}`}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {getTranslationOrThrow(tx, "guides.upgradeYourListing")}
                </LocaleLink>
                <LocaleLink 
                  href={buildStaticRouteData("partner")}
                  className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  {getTranslationOrThrow(tx, "guides.getFeatured")}
                </LocaleLink>
              </div>
            </div>
          </section>
        )}
        
        <section className="app-container py-8 border-t">
          <h2 className="text-xl font-semibold mb-4">
            {interpolateTemplate(
              getTranslationOrThrow(tx, "guides.exploreMoreInCity"),
              {
                city: cityName,
              },
            )}
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_CANONICAL_SLUGS.slice(0, 8).map((cat) => {
              const relatedCategoryRouteData: CityCategoryRouteData = {
                routeType: "city-category",
                citySlugs: cityRouteData.citySlugs,
                categorySlugs: buildGuideCategoryRouteData(cat).slugs,
              };
              return (
                <LocaleLink
                  key={cat}
                  href={relatedCategoryRouteData}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80"
                >
                  {interpolateTemplate(
                    getTranslationOrThrow(tx, "guides.categoryInCity"),
                    {
                      category: getCategoryDisplayName(cat, locale),
                      city: cityName,
                    },
                  )}
                </LocaleLink>
              );
            })}
          </div>
        </section>
        
        <section className="app-container py-8 border-t">
          <h2 className="text-xl font-semibold mb-4">
            {getTranslationOrThrow(tx, "guides.relatedGuides")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(GUIDES_CONFIG)
              .filter(([s]) => s !== slug)
              .slice(0, 4)
              .map(([guideSlug]) => (
                <LocaleLink
                  key={guideSlug}
                  href={buildGuideRouteData(guideSlug)}
                  className="block p-4 rounded-xl border border-border hover:border-primary/50"
                >
                  <span className="font-medium">{getGuideTitle(tx, guideSlug)}</span>
                </LocaleLink>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
