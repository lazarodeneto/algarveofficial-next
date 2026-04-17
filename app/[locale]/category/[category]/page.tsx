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
} from "@/lib/i18n/localized-routing";
import { getCategoryDisplayName, getCategoryUrlSlug, getCanonicalFromUrlSlug, ALL_CANONICAL_SLUGS, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import { getServerTranslations } from "@/lib/i18n/server";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import { generateSeoContentBlock } from "@/lib/seo/programmatic/content-blocks";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";

interface PageParams {
  locale: string;
  category: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export const revalidate = 60;
export const dynamic = "force-dynamic";

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

function buildCategoryRouteData(
  canonical: CanonicalCategorySlug,
): CategoryRouteData {
  return {
    routeType: "category",
    slugs: Object.fromEntries(
      SUPPORTED_LOCALES.map((supportedLocale) => [
        supportedLocale,
        getCategoryUrlSlug(canonical, supportedLocale),
      ]),
    ) as CategoryRouteData["slugs"],
  };
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const params: PageParams[] = [];
  for (const canonical of ALL_CANONICAL_SLUGS) {
    for (const locale of SUPPORTED_LOCALES) {
      params.push({
        locale,
        category: getCategoryUrlSlug(canonical, locale),
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, category: rawCategory } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const canonical = getCanonicalFromUrlSlug(rawCategory.toLowerCase(), locale);
  if (!canonical) {
    return buildPageMetadata({
      title: "Category Not Found",
      description: "The requested category could not be found.",
      localizedPath: `/category/${rawCategory}`,
      locale,
      noIndex: true,
      noFollow: true,
    });
  }
  
  const categoryName = getCategoryDisplayName(canonical, locale);
  
  const metaTitles: Record<string, string> = {
    en: `${categoryName} in the Algarve | AlgarveOfficial`,
    "pt-pt": `${categoryName} no Algarve | AlgarveOfficial`,
    fr: `${categoryName} en Algarve | AlgarveOfficial`,
    de: `${categoryName} an der Algarve | AlgarveOfficial`,
    es: `${categoryName} en el Algarve | AlgarveOfficial`,
    it: `${categoryName} in Algarve | AlgarveOfficial`,
    nl: `${categoryName} in de Algarve | AlgarveOfficial`,
    sv: `${categoryName} i Algarve | AlgarveOfficial`,
    no: `${categoryName} i Algarve | AlgarveOfficial`,
    da: `${categoryName} i Algarve | AlgarveOfficial`,
  };
  
  const metaDescriptions: Record<string, string> = {
    en: `Discover the best ${categoryName.toLowerCase()} in the Algarve. Curated local recommendations on AlgarveOfficial.`,
    "pt-pt": `Descubra os melhores ${categoryName.toLowerCase()} no Algarve. Recomendações locais seleccionadas no AlgarveOfficial.`,
    fr: `Découvrez les meilleures ${categoryName.toLowerCase()} en Algarve. Recommandations locales sur AlgarveOfficial.`,
    de: `Entdecken Sie die besten ${categoryName.toLowerCase()} an der Algarve. Lokale Empfehlungen auf AlgarveOfficial.`,
    es: `Descubre los mejores ${categoryName.toLowerCase()} en el Algarve. Recomendaciones locales en AlgarveOfficial.`,
    it: `Scopri i migliori ${categoryName.toLowerCase()} in Algarve. Raccomandazioni locali su AlgarveOfficial.`,
    nl: `Ontdek de beste ${categoryName.toLowerCase()} in de Algarve. Lokale aanbevelingen op AlgarveOfficial.`,
    sv: `Upptäck de bästa ${categoryName.toLowerCase()} i Algarve. Lokala rekommendationer på AlgarveOfficial.`,
    no: `Oppdag de beste ${categoryName.toLowerCase()} i Algarve. Lokale anbefalinger på AlgarveOfficial.`,
    da: `Opdag de bedste ${categoryName.toLowerCase()} i Algarve. Lokale anbefalinger på AlgarveOfficial.`,
  };

  const routeData = buildCategoryRouteData(canonical);

  return buildPageMetadata({
    title: metaTitles[locale] ?? metaTitles.en,
    description: metaDescriptions[locale] ?? metaDescriptions.en,
    localizedRoute: routeData,
    locale,
  });
}

export default async function CategoryHubPage({ params }: PageProps) {
  const { locale: rawLocale, category: rawCategory } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  const canonicalSlug = getCanonicalFromUrlSlug(rawCategory.toLowerCase(), locale);
  if (!canonicalSlug) notFound();

  const supabase = createPublicServerClient();

  const { data: catData } = await supabase
    .from("categories")
    .select("id, slug, name")
    .eq("slug", canonicalSlug)
    .single();
  
  if (!catData) notFound();
  
  const { data: cityData } = await supabase
    .from("cities")
    .select("id, slug, name")
    .eq("is_active", true);
  
  const { data: listingData } = await supabase
    .from("listings")
    .select("id, slug, name, short_description, featured_image_url, tier, is_curated, google_rating, google_review_count, price_from, price_currency, website_url, city_id, cities(slug, name)")
    .eq("status", "published")
    .eq("category_id", catData.id)
    .order("is_curated", { ascending: false })
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(50) as { data: any[] };

  const safeListingsForLocale =
    locale === "en"
      ? listingData ?? []
      : (listingData ?? []).map((listing) => ({
          ...listing,
          // These category cards currently read from base listing fields only.
          // Hide body copy on localized routes rather than leaking English text.
          short_description: null,
        }));
  
  const cityMap = new Map(cityData?.map(c => [c.id, c]) || []);
  
  const cityAggs = new Map<string, { slug: string; name: string; count: number }>();
  for (const listing of safeListingsForLocale) {
    const city = Array.isArray(listing.cities) ? listing.cities[0] : (listing.cities as { slug: string; name: string } | null);
    if (!city) continue;
    const existing = cityAggs.get(city.slug);
    if (existing) existing.count++;
    else cityAggs.set(city.slug, { slug: city.slug, name: city.name, count: 1 });
  }
  
  const topCities = Array.from(cityAggs.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  
  const categoryName = getCategoryDisplayName(canonicalSlug, locale);
  const categoryRouteData = buildCategoryRouteData(canonicalSlug);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(categoryRouteData, SUPPORTED_LOCALES);

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
      <Header localeSwitchPaths={localeSwitchPaths} />
      <main className="min-h-screen pt-20">
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
