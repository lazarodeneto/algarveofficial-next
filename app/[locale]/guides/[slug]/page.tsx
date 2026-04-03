import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { SUPPORTED_LOCALES, isValidLocale, DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getCategoryDisplayName, getCategoryUrlSlug, ALL_CANONICAL_SLUGS, type CanonicalCategorySlug } from "@/lib/seo/programmatic/category-slugs";
import { getServerTranslations } from "@/lib/i18n/server";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { ListingCard } from "@/components/seo/programmatic/ListingCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 60;

const GUIDES_CONFIG = {
  "best-restaurants-in-lagos": {
    title: "Best Restaurants in Lagos",
    description: "Discover the finest dining in Lagos, Algarve — from traditional petiscos to world-class fine dining experiences.",
    targetCity: "lagos",
    targetCategory: "restaurants",
  },
  "golf-in-vilamoura": {
    title: "Golf in Vilamoura",
    description: "Explore championship golf courses in Vilamoura, one of the Algarve's premier golf destinations.",
    targetCity: "vilamoura",
    targetCategory: "golf",
  },
  "beaches-in-tavira": {
    title: "Beaches in Tavira",
    description: "Discover beautiful beaches near Tavira, from natural islands to golden sands along the Ria Formosa.",
    targetCity: "tavira",
    targetCategory: "beaches",
  },
  "things-to-do-in-albufeira": {
    title: "Things to Do in Albufeira",
    description: "Find the best activities and experiences in Albufeira — from beach days to boat tours and cultural visits.",
    targetCity: "albufeira",
    targetCategory: "experiences",
  },
  "family-attractions-in-albufeira": {
    title: "Family Attractions in Albufeira",
    description: "Discover family-friendly activities in Albufeira — theme parks, water sports, and fun for all ages.",
    targetCity: "albufeira",
    targetCategory: "family-attractions",
  },
  "wellness-spas-in-lagos": {
    title: "Wellness & Spas in Lagos",
    description: "Relax and rejuvenate at the best spas and wellness centers in Lagos, Algarve.",
    targetCity: "lagos",
    targetCategory: "wellness-spas",
  },
  "shopping-in-lagos": {
    title: "Shopping in Lagos",
    description: "Discover the best shopping in Lagos — from luxury boutiques to local artisan markets.",
    targetCity: "lagos",
    targetCategory: "shopping",
  },
  "real-estate-in-quinta-do-lago": {
    title: "Real Estate in Quinta do Lago",
    description: "Explore luxury properties and investment opportunities in prestigious Quinta do Lago.",
    targetCity: "quinta-do-lago",
    targetCategory: "real-estate",
  },
  "beach-clubs-in-albufeira": {
    title: "Beach Clubs in Albufeira",
    description: "Experience the best beach clubs in Albufeira — premium sunbeds, cocktails, and oceanfront luxury.",
    targetCity: "albufeira",
    targetCategory: "beach-clubs",
  },
  "experiences-in-faro": {
    title: "Experiences in Faro",
    description: "Discover unique experiences in Faro — from cultural tours to outdoor adventures in the Ria Formosa.",
    targetCity: "faro",
    targetCategory: "experiences",
  },
};

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
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const guide = GUIDES_CONFIG[slug as keyof typeof GUIDES_CONFIG];
  
  if (!guide) return {};
  
  return {
    title: `${guide.title} | AlgarveOfficial`,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
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
  
  const { data: listings } = await supabase
    .from("listings")
    .select("id, slug, name, short_description, featured_image_url, tier, is_curated, google_rating, google_review_count, price_from, price_currency, website_url, cities(slug, name)")
    .eq("status", "published")
    .eq("city_id", cityData.id)
    .eq("category_id", catData.id)
    .order("is_curated", { ascending: false })
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(20) as { data: any[] };
  
  const categorySlug = getCategoryUrlSlug(guide.targetCategory as CanonicalCategorySlug, locale);
  const tx = await getServerTranslations(locale, ["common"]);
  
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="bg-gradient-to-b from-background/60 to-background py-12">
          <div className="app-container">
            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
              <ol className="flex gap-2">
                <li><LocaleLink href="/">Home</LocaleLink></li>
                <li>/</li>
                <li><LocaleLink href={`/visit/${guide.targetCity}`}>{cityData.name}</LocaleLink></li>
                <li>/</li>
                <li><LocaleLink href={`/visit/${guide.targetCity}/${categorySlug}`}>{getCategoryDisplayName(guide.targetCategory as CanonicalCategorySlug, locale)}</LocaleLink></li>
              </ol>
            </nav>
            
            <h1 className="font-serif text-4xl md:text-5xl mb-4">{guide.title}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{guide.description}</p>
          </div>
        </section>
        
        <section className="app-container py-8">
          <h2 className="text-xl font-semibold mb-4">
            Top {getCategoryDisplayName(guide.targetCategory as CanonicalCategorySlug, locale)} in {cityData.name}
          </h2>
          
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} tx={tx} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">More listings coming soon.</p>
          )}
        </section>
        
        <section className="app-container py-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Explore More in {cityData.name}</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_CANONICAL_SLUGS.slice(0, 8).map((cat) => {
              const catSlug = getCategoryUrlSlug(cat, locale);
              return (
                <LocaleLink
                  key={cat}
                  href={`/visit/${guide.targetCity}/${catSlug}`}
                  className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80"
                >
                  {getCategoryDisplayName(cat, locale)} in {cityData.name}
                </LocaleLink>
              );
            })}
          </div>
        </section>
        
        <section className="app-container py-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(GUIDES_CONFIG)
              .filter(([s]) => s !== slug)
              .slice(0, 4)
              .map(([guideSlug, g]) => (
                <LocaleLink
                  key={guideSlug}
                  href={`/guides/${guideSlug}`}
                  className="block p-4 rounded-xl border border-border hover:border-primary/50"
                >
                  <span className="font-medium">{g.title}</span>
                </LocaleLink>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
