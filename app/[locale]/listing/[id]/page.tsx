export const dynamic = "force-dynamic";

import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { withTimeout } from "@/lib/supabase/db-utils";
import { buildBreadcrumbSchema, buildLocalBusinessSchema } from "@/lib/seo/advanced/schema-builders";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import type { ListingReview } from "@/hooks/useListingReviews";
import {
  ListingDetailClient,
  type ListingTranslationRow,
  type ListingWithRelations,
  type RelatedListing,
  type WhatsAppStatus,
} from "@/components/listing/ListingDetailClient";
import { buildPageMetadata } from "@/lib/seo/advanced/metadata-builders";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";

const PUBLIC_LISTING_FIELDS = `
  id, slug, name, short_description, description, featured_image_url,
  price_from, price_to, price_currency, tier, is_curated, status,
  city_id, region_id, category_id, owner_id, latitude, longitude,
  address, contact_phone, contact_email, website_url, facebook_url,
  instagram_url, twitter_url, linkedin_url, youtube_url, tiktok_url,
  telegram_url, google_business_url, google_rating, google_review_count,
  tags, category_data, view_count, published_at, created_at, updated_at
`;

const PUBLIC_CITY_FIELDS = "id, name, slug, short_description, image_url, latitude, longitude";
const PUBLIC_REGION_FIELDS = "id, name, slug, short_description, image_url";
const PUBLIC_CATEGORY_FIELDS = "id, name, slug, icon, short_description, image_url";

type ListingReviewRow = ListingReview & {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface ListingPageData {
  listing: ListingWithRelations;
  translations: Record<Locale, ListingTranslationRow | null>;
  reviews: ListingReviewRow[];
  relatedListings: RelatedListing[];
  whatsappStatus: WhatsAppStatus;
  canonicalSlug: string;
  localizedSlugs: Partial<Record<Locale, string>>;
}

interface ListingPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function truncateMeta(value?: string | null, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

function buildListingDescription({
  translation,
  listing,
}: {
  translation: ListingTranslationRow | null;
  listing: ListingWithRelations;
}) {
  return (
    truncateMeta(translation?.seo_description) ||
    truncateMeta(translation?.description) ||
    truncateMeta(listing.description) ||
    truncateMeta(listing.short_description) ||
    "Discover this curated Algarve listing on AlgarveOfficial."
  );
}

async function fetchApprovedReviews(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_reviews")
    .select("*")
    .eq("listing_id", listingId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const reviews = ((data ?? []) as ListingReviewRow[]) ?? [];
  const userIds = Array.from(new Set(reviews.map((review) => review.user_id).filter(Boolean)));

  if (userIds.length === 0) return reviews;

  const { data: profiles, error: profilesError } = await supabase
    .from("public_profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError) throw profilesError;

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id as string,
      {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      },
    ]),
  );

  return reviews.map((review) => ({
    ...review,
    profile: profileMap.get(review.user_id) ?? null,
  }));
}

async function fetchAllTranslations(listingId: string) {
  const supabase = await createClient();

  const { data: allTranslations, error } = await supabase
    .from("listing_translations")
    .select("language_code, title, description, seo_title, seo_description")
    .eq("listing_id", listingId);

  if (error) throw error;

  const translations: Record<Locale, ListingTranslationRow | null> = {} as Record<
    Locale,
    ListingTranslationRow | null
  >;

  for (const locale of SUPPORTED_LOCALES) {
    const dbLocale = locale === "en" ? "en" : locale;
    const found = (allTranslations ?? []).find((t) => t.language_code === dbLocale);
    translations[locale] = found as ListingTranslationRow | null;
  }

  return translations;
}

async function fetchLocalizedSlugs(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_slugs")
    .select("slug, language_code, is_current")
    .eq("listing_id", listingId);

  if (error) return {};

  const slugs: Partial<Record<Locale, string>> = {};

  for (const row of data ?? []) {
    const locale = row.language_code as Locale;
    if (SUPPORTED_LOCALES.includes(locale)) {
      if (row.is_current || !slugs[locale]) {
        slugs[locale] = row.slug;
      }
    }
  }

  return slugs;
}

const getListingPageData = cache(async (locale: Locale, idOrSlug: string): Promise<ListingPageData | null> => {
  const supabase = await createClient();
  const isParamUuid = isUuid(idOrSlug);

  let resolvedListingId: string | null = isParamUuid ? idOrSlug : null;

  if (!isParamUuid) {
    const { data: slugRow, error: slugError } = await supabase
      .from("listing_slugs")
      .select("listing_id, slug, is_current")
      .eq("slug", idOrSlug)
      .maybeSingle();

    if (slugError) throw slugError;
    resolvedListingId = slugRow?.listing_id ?? null;
  }

  let listingQuery = supabase.from("listings").select(`
      ${PUBLIC_LISTING_FIELDS},
      city:cities(${PUBLIC_CITY_FIELDS}),
      region:regions(${PUBLIC_REGION_FIELDS}),
      category:categories(${PUBLIC_CATEGORY_FIELDS}),
      images:listing_images(id, image_url, alt_text, display_order, is_featured)
    `);

  listingQuery = resolvedListingId
    ? listingQuery.eq("id", resolvedListingId)
    : listingQuery.eq("slug", idOrSlug);

  const listingResult =
    (await withTimeout(
      listingQuery.maybeSingle() as unknown as Promise<{
        data: ListingWithRelations | null;
        error: { message: string } | null;
      }>,
      15000,
      { data: null, error: null },
    )) ?? { data: null, error: null };

  if (listingResult.error) throw listingResult.error;

  const listing = listingResult.data ?? null;
  if (!listing || listing.status !== "published") return null;

  const canonicalSlug = listing.slug || listing.id;

  const settledResults =
    (await withTimeout(
      Promise.all([
        fetchApprovedReviews(listing.id),
        listing.category_id
          ? supabase
              .from("listings")
              .select(`
                id, slug, name, short_description, description, featured_image_url,
                price_from, price_to, price_currency, tier, is_curated, status,
                city_id, region_id, category_id, owner_id, latitude, longitude,
                address, website_url, facebook_url, instagram_url, twitter_url,
                linkedin_url, youtube_url, tiktok_url, telegram_url,
                google_business_url, google_rating, google_review_count,
                tags, category_data, view_count, published_at, created_at, updated_at,
                city:cities(${PUBLIC_CITY_FIELDS}),
                region:regions(${PUBLIC_REGION_FIELDS}),
                category:categories(${PUBLIC_CATEGORY_FIELDS})
              `)
              .eq("status", "published")
              .eq("category_id", listing.category_id)
              .neq("id", listing.id)
              .order("created_at", { ascending: false })
              .limit(3)
          : Promise.resolve({ data: [], error: null }),
        listing.owner_id
          ? supabase
              .from("whatsapp_accounts")
              .select("wa_enabled, business_phone_e164")
              .eq("owner_id", listing.owner_id)
              .eq("wa_enabled", true)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]),
      20000,
      null,
    )) ?? [null, [], { data: [], error: null }, { data: null, error: null }];

  const [reviews, relatedResponse, whatsappResponse] = settledResults as [
    ListingReviewRow[],
    { data: RelatedListing[] | null; error: { message: string } | null },
    { data: { wa_enabled?: boolean | null; business_phone_e164?: string | null } | null; error: { message: string } | null },
  ];

  if (relatedResponse.error) throw relatedResponse.error;
  if (whatsappResponse.error) throw whatsappResponse.error;

  const [translations, localizedSlugs] = await Promise.all([
    fetchAllTranslations(listing.id),
    fetchLocalizedSlugs(listing.id),
  ]);

  return {
    listing,
    translations,
    reviews: reviews ?? [],
    relatedListings: relatedResponse.data ?? [],
    whatsappStatus: {
      enabled: !!whatsappResponse.data,
      phone: whatsappResponse.data?.business_phone_e164 || null,
    },
    canonicalSlug,
    localizedSlugs,
  };
});

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getListingPageData(resolvedLocale, id);

  if (!data) {
    return buildPageMetadata({
      title: "Listing Not Found",
      description: "This Algarve listing is no longer available.",
      localizedPath: `/listing/${id}`,
      noIndex: true,
      noFollow: true,
    });
  }

  const { listing, translations } = data;
  const currentTranslation = translations[resolvedLocale];
  const title = currentTranslation?.seo_title?.trim() || currentTranslation?.title?.trim() || listing.name;
  const description = buildListingDescription({ listing, translation: currentTranslation });
  const ogImage =
    normalizePublicImageUrl(listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(listing.featured_image_url) ||
    "/og-image.png";

  const localizedPath = `/listing/${data.localizedSlugs[resolvedLocale] ?? data.canonicalSlug}`;

  return buildPageMetadata({
    title,
    description,
    localizedPath,
    image: ogImage,
    type: "place",
    locale: resolvedLocale,
  });
}

export default async function LocaleListingPage({ params }: ListingPageProps) {
  const { locale, id } = await params;
  const resolvedLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const data = await getListingPageData(resolvedLocale, id);

  if (!data) notFound();

  const currentTranslation = data.translations[resolvedLocale];
  const title = currentTranslation?.title?.trim() || data.listing.name;
  const description = buildListingDescription({ listing: data.listing, translation: currentTranslation });
  const categoryName = data.listing.category?.name || "Directory";
  const categorySlug = getCanonicalCategorySlug(data.listing.category?.slug);
  const categoryPath = categorySlug ? `/directory?category=${categorySlug}` : "/directory";
  const canonicalPath = `/listing/${data.localizedSlugs[resolvedLocale] ?? data.canonicalSlug}`;
  const ogImage =
    normalizePublicImageUrl(data.listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(data.listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(data.listing.featured_image_url) ||
    "/og-image.png";

   
  const businessSchema = buildLocalBusinessSchema({
    id: data.listing.id,
    slug: data.localizedSlugs[resolvedLocale] ?? data.canonicalSlug,
    name: title,
    description: truncateMeta(currentTranslation?.description) || truncateMeta(data.listing.description) || undefined,
    image_url: absoluteUrl(String(ogImage)),
    category_slug: data.listing.category?.slug || "",
    category_name: data.listing.category?.name || undefined,
    city: data.listing.city?.name || undefined,
    region: data.listing.region?.name || undefined,
    address: data.listing.address || undefined,
    latitude: data.listing.latitude || data.listing.city?.latitude || undefined,
    longitude: data.listing.longitude || data.listing.city?.longitude || undefined,
    telephone: data.listing.contact_phone || undefined,
    email: data.listing.contact_email || undefined,
    website: data.listing.website_url || undefined,
    price_range: data.listing.price_from
      ? `€${data.listing.price_from}${data.listing.price_to ? ` - €${data.listing.price_to}` : "+"}`
      : undefined,
    google_rating: data.listing.google_rating || undefined,
    google_review_count: data.listing.google_review_count || undefined,
    tags: data.listing.tags || undefined,
  } as Parameters<typeof buildLocalBusinessSchema>[0]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: categoryName, url: absoluteUrl(categoryPath) },
    { name: title, url: absoluteUrl(canonicalPath) },
  ]);

  const primaryImage =
    normalizePublicImageUrl(data.listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(data.listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(data.listing.featured_image_url) ||
    normalizePublicImageUrl(data.listing.category?.image_url) ||
    "/og-image.png";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div id="listing-detail-server-shell" className="min-h-screen bg-background text-foreground">
        <main className="app-container pt-32 pb-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card">
              <div className="relative min-h-[24rem]">
                <Image
                  src={primaryImage}
                  alt={title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <aside className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{categoryName}</p>
              <h1 className="mt-4 font-serif text-4xl text-foreground">{title}</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                {data.listing.city?.name ? `${data.listing.city.name}, Algarve, Portugal` : "Algarve, Portugal"}
              </p>
              <p className="mt-6 text-sm leading-7 text-muted-foreground">{description}</p>
            </aside>
          </div>
        </main>
      </div>

      <ListingDetailClient
        listing={data.listing}
        initialTranslation={currentTranslation}
        initialReviews={data.reviews}
        initialRelatedListings={data.relatedListings}
        initialWhatsAppStatus={data.whatsappStatus}
        initialLookupValue={id}
      />
    </>
  );
}
