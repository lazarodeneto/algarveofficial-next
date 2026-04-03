import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES, isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getCategoryDisplayName, getCategoryUrlSlug, ALL_CANONICAL_SLUGS, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import { getServerTranslations } from "@/lib/i18n/server";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import { generateSeoContentBlock } from "@/lib/seo/programmatic/content-blocks";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const DEFAULT_SITE_URL = "https://algarveofficial.com";

interface PageParams {
  locale: string;
  category: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export const revalidate = 60;

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
  
  const canonical = getCategoryUrlSlug(rawCategory as CanonicalCategorySlug, locale) 
    ? ALL_CANONICAL_SLUGS.find(s => getCategoryUrlSlug(s, locale) === rawCategory)
    : null;
  
  if (!canonical) return {};
  
  const categoryName = getCategoryDisplayName(canonical, locale);
  
  return {
    title: `${categoryName} in the Algarve | AlgarveOfficial`,
    description: `Discover the best ${categoryName.toLowerCase()} in the Algarve. Curated local recommendations on AlgarveOfficial.`,
  };
}

export default async function CategoryHubPage({ params }: PageProps) {
  const { locale: rawLocale, category: rawCategory } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  
  const canonicalSlug = ALL_CANONICAL_SLUGS.find(s => getCategoryUrlSlug(s, locale) === rawCategory);
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
  
  const cityMap = new Map(cityData?.map(c => [c.id, c]) || []);
  
  const cityAggs = new Map<string, { slug: string; name: string; count: number }>();
  for (const listing of listingData || []) {
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
  const categorySlug = getCategoryUrlSlug(canonicalSlug, locale);
  
  const tx = await getServerTranslations(locale, ["common"]);
  
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="bg-gradient-to-b from-background/60 to-background py-12">
          <div className="app-container">
            <h1 className="font-serif text-4xl md:text-5xl mb-4">
              {categoryName} in the Algarve
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover the best {categoryName.toLowerCase()} across the Algarve. 
              Browse by city to find curated local recommendations.
            </p>
          </div>
        </section>
        
        <section className="app-container py-8">
          <h2 className="text-xl font-semibold mb-4">
            Top cities for {categoryName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {topCities.map((city) => (
              <LocaleLink
                key={city.slug}
                href={`/visit/${city.slug}/${categorySlug}`}
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
        
        {listingData && listingData.length > 0 && (
          <section className="app-container py-8">
            <h2 className="text-xl font-semibold mb-4">
              Featured {categoryName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listingData.slice(0, 12).map((listing) => (
                <ListingCard key={listing.id} listing={listing} tx={tx} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
