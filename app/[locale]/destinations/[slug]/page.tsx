import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import {
  buildAbsoluteRouteUrl,
  buildLocalizedPath,
  buildLocaleSwitchPathsForEntity,
  buildUniformLocalizedSlugMap,
  type DestinationRouteData,
} from "@/lib/i18n/localized-routing";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getRegionImageSet } from "@/lib/regionImages";
import {
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
  type PublicContentLocale,
} from "@/lib/publicContentLocale";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { buildFaqSchema, buildTouristDestinationSchema } from "@/lib/seo/schemaBuilders.js";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PUBLIC_LISTING_FIELDS = `
  id, slug, name, short_description, featured_image_url, tier,
  status, city_id, region_id, category_id, latitude, longitude
`;
const DESTINATION_REGION_FIELDS = `
  id, slug, name, description, short_description, image_url, hero_image_url,
  is_active, is_visible_destinations
`;
const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon, short_description, image_url";

type RegionRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  hero_image_url: string | null;
};

interface LocaleDestinationPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

type DestinationCity = {
  id: string;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
};

type DestinationListing = {
  id: string;
  slug: string | null;
  name: string;
  short_description: string | null;
  description?: string | null;
  featured_image_url: string | null;
  city?: DestinationCity | null;
};

type DestinationListingRow = Omit<DestinationListing, "city"> & {
  city?: DestinationCity | DestinationCity[] | null;
};

function resolveRegionImage(region: RegionRow): string | null {
  const fallbackRegionImage = getRegionImageSet(region.slug, { includeAliases: true });
  const fallbackImageSrc = typeof fallbackRegionImage?.image === "string"
    ? fallbackRegionImage.image
    : null;
  const src = region.hero_image_url || region.image_url || fallbackImageSrc;
  return src ? normalizePublicImageUrl(src) : null;
}

function truncateMeta(value?: string | null, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function normalizeDestinationListing(row: DestinationListingRow): DestinationListing {
  const city = Array.isArray(row.city) ? (row.city[0] ?? null) : (row.city ?? null);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short_description: row.short_description,
    description: row.description,
    featured_image_url: row.featured_image_url,
    city,
  };
}

function buildDestinationRouteData(region: RegionRow): DestinationRouteData {
  return {
    routeType: "destination",
    id: region.id,
    slugs: buildUniformLocalizedSlugMap(region.slug),
  };
}

const getDestinationPageData = cache(async (slug: string, locale: Locale) => {
  const supabase = createPublicServerClient();
  const contentLocale: PublicContentLocale = normalizePublicContentLocale(locale);

  const { data: regionData, error: regionError } = await supabase
    .from("regions")
    .select(DESTINATION_REGION_FIELDS)
    .eq("slug", slug)
    .or("is_active.eq.true,is_visible_destinations.eq.true")
    .maybeSingle();

  if (regionError) throw regionError;

  let region = (regionData as RegionRow | null) ?? null;
  if (!region) return null;

  if (contentLocale !== "en") {
    const [translation] = await fetchRegionTranslations(contentLocale, [region.id]);
    if (translation) {
      region = {
        ...region,
        name: translation.name?.trim() || region.name,
        short_description: translation.short_description?.trim() || region.short_description,
        description: translation.description?.trim() || region.description,
      };
    }
  }

  const [citiesResponse, listingsResponse, regionsResponse] = await Promise.all([
    supabase
      .from("city_region_mapping")
      .select(`city:cities(${PUBLIC_CITY_FIELDS})`)
      .eq("region_id", region.id),
    supabase
      .from("listings")
      .select(`
        ${PUBLIC_LISTING_FIELDS},
        city:cities(${PUBLIC_CITY_FIELDS}),
        category:categories(${PUBLIC_CATEGORY_FIELDS})
      `)
      .eq("region_id", region.id)
      .eq("status", "published")
      .order("is_curated", { ascending: false })
      .order("tier", { ascending: false })
      .limit(24),
    supabase
      .from("regions")
      .select("id, slug, name, short_description, image_url, hero_image_url")
      .eq("is_active", true)
      .eq("is_visible_destinations", true)
      .neq("id", region.id)
      .order("display_order", { ascending: true })
      .limit(8),
  ]);

  if (citiesResponse.error) throw citiesResponse.error;
  if (listingsResponse.error) throw listingsResponse.error;
  // regionsResponse errors are non-fatal — silently fall back to empty

  let cities = (citiesResponse.data ?? [])
    .map((row) => row.city as unknown as DestinationCity | null)
    .filter((city): city is DestinationCity => Boolean(city));

  let listings = ((listingsResponse.data ?? []) as DestinationListingRow[]).map(
    normalizeDestinationListing,
  );

  if (contentLocale !== "en") {
    const [cityTranslations, listingTranslations] = await Promise.all([
      fetchCityTranslations(contentLocale, cities.map((city) => city.id)),
      fetchListingTranslations(contentLocale, listings.map((listing) => listing.id)),
    ]);

    const cityTranslationMap = new Map(
      cityTranslations.map((translation) => [translation.city_id, translation]),
    );
    const listingTranslationMap = new Map(
      listingTranslations.map((translation) => [translation.listing_id, translation]),
    );

    cities = cities.map((city) => {
      const translation = cityTranslationMap.get(city.id);
      return {
        ...city,
        name: translation?.name?.trim() || city.name,
        short_description: translation?.short_description?.trim() || city.short_description,
        description: translation?.description?.trim() || city.description,
      };
    });

    listings = listings.map((listing) => {
      const listingTranslation = listingTranslationMap.get(listing.id);
      const cityTranslation = listing.city?.id ? cityTranslationMap.get(listing.city.id) : undefined;

      return {
        ...listing,
        name: listingTranslation?.title?.trim() || listing.name,
        short_description: listingTranslation?.short_description?.trim() || listing.short_description,
        description: listingTranslation?.description?.trim() || listing.description,
        city: listing.city
          ? {
              ...listing.city,
              name: cityTranslation?.name?.trim() || listing.city.name,
              short_description:
                cityTranslation?.short_description?.trim() || listing.city.short_description,
              description: cityTranslation?.description?.trim() || listing.city.description,
            }
          : listing.city,
      };
    });
  }

  const otherRegions = (regionsResponse.data ?? []) as RegionRow[];

  return {
    region,
    cities,
    listings,
    otherRegions,
  };
});

export const revalidate = 60;

export async function generateMetadata({ params }: LocaleDestinationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getDestinationPageData(slug, resolvedLocale);
  const tx = await getServerTranslations(resolvedLocale, ["destinationDetail.metaTitleSuffix"]);

  if (!data) {
    return buildPageMetadata({
      title: "Destination Not Found",
      description: "The requested destination could not be found.",
      localizedPath: `/destinations/${slug}`,
      locale: resolvedLocale,
      noIndex: true,
      noFollow: true,
    });
  }

  const { region } = data;
  const description = truncateMeta(region.short_description) || truncateMeta(region.description);
  const resolvedImage = resolveRegionImage(region);

  return buildPageMetadata({
    title: `${region.name} | ${tx["destinationDetail.metaTitleSuffix"] ?? "Algarve Destination Guide"}`,
    description: description || undefined,
    localizedRoute: buildDestinationRouteData(region),
    image: resolvedImage ?? undefined,
    type: "place",
    locale: resolvedLocale,
  });
}

export default async function LocaleDestinationPage({ params }: LocaleDestinationPageProps) {
  const { locale, slug } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const [data, tx] = await Promise.all([
    getDestinationPageData(slug, resolvedLocale),
    getServerTranslations(resolvedLocale, [
      "destinationDetail.backToDestinations",
      "destinationDetail.badge",
      "destinationDetail.exploreRegion",
      "destinationDetail.listingsCount",
      "destinationDetail.metaTitleSuffix",
      "destinationDetail.faqTitle",
      "common.noListingsYet",
      "common.noListingsYetDesc",
    ]),
  ]);

  if (!data) notFound();

  const { region, cities, listings, otherRegions } = data;
  const routeData = buildDestinationRouteData(region);
  const resolvedImage = resolveRegionImage(region);
  const canonicalUrl = buildAbsoluteRouteUrl(resolvedLocale, routeData);
  const localeSwitchPaths = buildLocaleSwitchPathsForEntity(routeData, SUPPORTED_LOCALES);

  const destinationFaqs = [
    {
      question: `Best things to do in ${region.name} Algarve`,
      answer: `${region.name} offers a diverse range of activities for visitors. From beautiful beaches and golf courses to cultural attractions and local cuisine, the region provides unforgettable experiences for all types of travelers.`,
    },
    {
      question: `Best restaurants in ${region.name} Algarve`,
      answer: `${region.name} boasts excellent dining options ranging from traditional Portuguese tavernas to upscale international restaurants. Be sure to try fresh seafood, local wines, and regional specialties.`,
    },
    {
      question: `Family-friendly activities in ${region.name} Algarve`,
      answer: `${region.name} is ideal for families with beautiful safe beaches, water parks, nature reserves, and interactive attractions suitable for children of all ages.`,
    },
    {
      question: `Best beaches in ${region.name} Algarve`,
      answer: `${region.name} features stunning coastline with pristine beaches, some with golden sands and others with unique rock formations. Many beaches offer excellent facilities and Blue Flag status.`,
    },
    {
      question: `Golf courses near ${region.name} Algarve`,
      answer: `${region.name} is home to several world-class golf courses designed by renowned architects, making it a premier golfing destination in Europe with stunning ocean and landscape views.`,
    },
  ];

  const touristDestinationSchema = buildTouristDestinationSchema({
    name: region.name,
    description: region.description || region.short_description || undefined,
    image: resolvedImage || undefined,
    url: canonicalUrl,
    latitude: undefined,
    longitude: undefined,
    containedInPlace: "Algarve",
    touristType: ["Luxury Traveler", "Cultural Tourist", "Golf Enthusiast", "Beach Lover", "Family Traveler"],
  });

  const faqSchema = buildFaqSchema(destinationFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristDestinationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div id="destination-detail-server-shell" className="min-h-screen bg-background text-foreground">
        <Header localeSwitchPaths={localeSwitchPaths} />

      <main>
        <section className="relative overflow-hidden pt-[calc(6rem+10px)] pb-16 lg:pt-[calc(8rem+10px)] lg:pb-24">
          <div className="absolute inset-0">
            {resolvedImage ? (
               
              <Image
                src={resolvedImage as string}
                alt={region.name}
                fill
                unoptimized
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-charcoal-light to-charcoal" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/25" />
          </div>

          <div className="relative app-container content-max">
            <Link
              href={buildLocalizedPath(resolvedLocale, "/destinations")}
              className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors"
            >
              ← {tx["destinationDetail.backToDestinations"] ?? "Back to Destinations"}
            </Link>

            <span className="mt-8 inline-block text-sm font-medium text-primary tracking-[0.3em] uppercase">
              {tx["destinationDetail.badge"] ?? "Premium Region"}
            </span>

            <h1 className="mt-6 text-hero font-serif font-medium text-white">{region.name}</h1>

            <p className="mt-6 text-body text-white/85 readable">
              {region.description || region.short_description}
            </p>

            {cities.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {cities.map((city) => (
                  <Link
                    key={city.id}
                    href={buildLocalizedPath(resolvedLocale, `/destinations/${city.slug}`)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm text-white backdrop-blur-sm"
                  >
                    <span className="text-primary">•</span>
                    {city.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="app-container content-max density">
            <div className="mb-12">
              <h2 className="text-title font-serif font-medium text-foreground">
                {(tx["destinationDetail.exploreRegion"] ?? "Explore {{region}}").replace("{{region}}", region.name)}
              </h2>
              <p className="mt-2 text-body text-muted-foreground">
                {(tx["destinationDetail.listingsCount"] ?? "{{count}} premium listings in this region").replace(
                  "{{count}}",
                  String(listings.length),
                )}
              </p>
            </div>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => {
                  const listingImage = normalizePublicImageUrl(listing.featured_image_url);
                  return (
                    <Link
                      key={listing.id}
                      href={buildLocalizedPath(
                        resolvedLocale,
                        `/listing/${listing.slug || listing.id}`
                      )}
                      className="group block"
                    >
                      <article className="overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          {listingImage ? (
                            <Image
                              src={listingImage}
                              alt={listing.name}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-card to-muted" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif text-lg font-medium text-foreground line-clamp-1">
                            {listing.name}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {listing.short_description}
                          </p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card px-8 py-14 text-center">
                <h3 className="text-title font-serif text-foreground">{tx["common.noListingsYet"] ?? "No Listings Yet"}</h3>
                <p className="mt-3 text-body text-muted-foreground">
                  {tx["common.noListingsYetDesc"] ?? "We're selecting the finest experiences for this region."}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-3xl app-container density">
            <h2 className="text-2xl font-serif font-medium text-center mb-8">
              {tx["destinationDetail.faqTitle"] ?? "Frequently Asked Questions"}
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {destinationFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`q${index}`} className="border rounded-lg px-6 bg-card">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        {otherRegions.length > 0 && (
          <section className="py-16 lg:py-24 bg-card">
            <div className="app-container content-max">
              <h2 className="text-title font-serif font-medium text-foreground text-center mb-2">
                Explore More Destinations
              </h2>
              <p className="text-body text-muted-foreground text-center mb-10">
                Discover other prestigious regions across the Algarve
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherRegions.map((r) => {
                  const imgSrc = normalizePublicImageUrl(r.image_url ?? r.hero_image_url);
                  return (
                    <Link
                      key={r.id}
                      href={buildLocalizedPath(resolvedLocale, `/destinations/${r.slug}`)}
                      className="group block rounded-xl overflow-hidden bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="relative w-full h-36 bg-muted overflow-hidden">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={r.name}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                            <span className="text-muted-foreground/30 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-serif font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {r.name}
                        </h3>
                        {r.short_description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {r.short_description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
    </>
  );
}
