export const dynamic = "force-dynamic";

import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import type { Tables } from "@/integrations/supabase/types";
import { withTimeout } from "@/lib/supabase/db-utils";
import { buildBreadcrumbSchema, buildLocalBusinessSchema } from "@/lib/seo/schemaBuilders.js";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { getCanonicalCategorySlug } from "@/lib/categoryMerges";
import type { ListingReview } from "@/hooks/useListingReviews";
import {
  ListingDetailClient,
  type ListingDetailClientProps,
  type ListingTranslationRow,
  type ListingWithRelations,
  type RelatedListing,
  type WhatsAppStatus,
} from "@/components/listing/ListingDetailClient";
import { buildMetadata } from "@/lib/metadata";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algarveofficial.com";

const PUBLIC_LISTING_FIELDS = `
  id,
  slug,
  name,
  short_description,
  description,
  featured_image_url,
  price_from,
  price_to,
  price_currency,
  tier,
  is_curated,
  status,
  city_id,
  region_id,
  category_id,
  owner_id,
  latitude,
  longitude,
  address,
  contact_phone,
  contact_email,
  website_url,
  facebook_url,
  instagram_url,
  twitter_url,
  linkedin_url,
  youtube_url,
  tiktok_url,
  telegram_url,
  google_business_url,
  google_rating,
  google_review_count,
  tags,
  category_data,
  view_count,
  published_at,
  created_at,
  updated_at
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
  translation: ListingTranslationRow | null;
  reviews: ListingReviewRow[];
  relatedListings: RelatedListing[];
  whatsappStatus: WhatsAppStatus;
  canonicalPath: string;
  redirectPath: string | null;
}

interface ListingPageProps {
  params: Promise<{ id: string }>;
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

  if (userIds.length === 0) {
    return reviews;
  }

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

const getListingPageData = cache(async (idOrSlug: string): Promise<ListingPageData | null> => {
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

  listingQuery = resolvedListingId ? listingQuery.eq("id", resolvedListingId) : listingQuery.eq("slug", idOrSlug);

  const listingResult =
    (await withTimeout(
      listingQuery.maybeSingle() as unknown as Promise<{
        data: ListingWithRelations | null;
        error: { message: string } | null;
      }>,
      15000,
      { data: null, error: null },
    )) ?? { data: null, error: null };

  if (listingResult.error) {
    throw listingResult.error;
  }

  const listing = listingResult.data ?? null;
  if (!listing || listing.status !== "published") {
    return null;
  }

  const canonicalSlug = listing.slug || listing.id;
  const canonicalPath = `/listing/${canonicalSlug}`;
  const redirectPath = !isParamUuid && idOrSlug !== canonicalSlug ? canonicalPath : null;

  const settledResults =
    (await withTimeout(
      Promise.all([
        supabase
          .from("listing_translations")
          .select("listing_id, language_code, title, description, seo_title, seo_description")
          .eq("listing_id", listing.id)
          .eq("language_code", "en")
          .maybeSingle(),
        fetchApprovedReviews(listing.id),
        listing.category_id
          ? supabase
              .from("listings")
              .select(`
                id,
                slug,
                name,
                short_description,
                description,
                featured_image_url,
                price_from,
                price_to,
                price_currency,
                tier,
                is_curated,
                status,
                city_id,
                region_id,
                category_id,
                owner_id,
                latitude,
                longitude,
                address,
                website_url,
                facebook_url,
                instagram_url,
                twitter_url,
                linkedin_url,
                youtube_url,
                tiktok_url,
                telegram_url,
                google_business_url,
                google_rating,
                google_review_count,
                tags,
                category_data,
                view_count,
                published_at,
                created_at,
                updated_at,
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

  const [translationResponse, reviews, relatedResponse, whatsappResponse] = settledResults as [
    { data: ListingTranslationRow | null; error: { message: string } | null } | null,
    ListingReviewRow[],
    { data: RelatedListing[] | null; error: { message: string } | null },
    { data: { wa_enabled?: boolean | null; business_phone_e164?: string | null } | null; error: { message: string } | null },
  ];

  if (translationResponse?.error) throw translationResponse.error;
  if (relatedResponse.error) throw relatedResponse.error;
  if (whatsappResponse.error) throw whatsappResponse.error;

  return {
    listing,
    translation: translationResponse?.data ?? null,
    reviews: reviews ?? [],
    relatedListings: relatedResponse.data ?? [],
    whatsappStatus: {
      enabled: !!whatsappResponse.data,
      phone: whatsappResponse.data?.business_phone_e164 || null,
    },
    canonicalPath,
    redirectPath,
  };
});

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getListingPageData(id);

  if (!data) {
    return buildMetadata({
      title: "Listing Not Found",
      description: "This Algarve listing is no longer available.",
      path: `/listing/${id}`,
      noIndex: true,
      noFollow: true,
    });
  }

  const { listing, translation, canonicalPath } = data;
  const title = translation?.seo_title?.trim() || translation?.title?.trim() || listing.name;
  const description = buildListingDescription({ listing, translation });
  const ogImage =
    normalizePublicImageUrl(listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(listing.featured_image_url) ||
    "/og-image.jpg";

  return buildMetadata({
    title,
    description,
    path: canonicalPath,
    image: ogImage,
    type: "place",
  });
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const data = await getListingPageData(id);

  if (!data) {
    notFound();
  }

  if (data.redirectPath) {
    redirect(data.redirectPath);
  }

  const { listing, translation, reviews, relatedListings, whatsappStatus, canonicalPath } = data;
  const title = translation?.title?.trim() || listing.name;
  const description = buildListingDescription({ listing, translation });
  const categoryName = listing.category?.name || "Directory";
  const categorySlug = getCanonicalCategorySlug(listing.category?.slug);
  const categoryPath = categorySlug ? `/directory?category=${categorySlug}` : "/directory";
  const ogImage =
    normalizePublicImageUrl(listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(listing.featured_image_url) ||
    "/og-image.jpg";

  const businessSchema = buildLocalBusinessSchema({
    name: title,
    description: truncateMeta(translation?.description) || truncateMeta(listing.description) || undefined,
    image: absoluteUrl(String(ogImage)),
    url: absoluteUrl(canonicalPath),
    address: listing.address || undefined,
    city: listing.city?.name || undefined,
    telephone: listing.contact_phone || undefined,
    email: listing.contact_email || undefined,
    priceRange: listing.price_from
      ? `€${listing.price_from}${listing.price_to ? ` - €${listing.price_to}` : "+"}`
      : "€€€€",
    rating: listing.google_rating || undefined,
    reviewCount: listing.google_review_count || undefined,
    latitude: listing.latitude || listing.city?.latitude || undefined,
    longitude: listing.longitude || listing.city?.longitude || undefined,
    category: listing.category?.slug || undefined,
    tags: listing.tags || undefined,
    categoryData: (listing.category_data as Record<string, unknown> | null) || null,
    openingHours: undefined,
    userReviews: reviews
      .filter((review) => review.comment)
      .map((review) => ({
        author: review.profile?.full_name || "Guest",
        rating: review.rating,
        comment: review.comment,
        datePublished: review.created_at.split("T")[0],
      })),
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: categoryName, url: absoluteUrl(categoryPath) },
    { name: title, url: absoluteUrl(canonicalPath) },
  ]);

  const primaryImage =
    normalizePublicImageUrl(listing.images?.find((image) => image.is_featured)?.image_url) ||
    normalizePublicImageUrl(listing.images?.[0]?.image_url) ||
    normalizePublicImageUrl(listing.featured_image_url) ||
    normalizePublicImageUrl(listing.category?.image_url) ||
    "/og-image.jpg";

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
              <img src={primaryImage} alt={title} className="h-full min-h-[24rem] w-full object-cover" />
            </div>
            <aside className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{categoryName}</p>
              <h1 className="mt-4 font-serif text-4xl text-foreground">{title}</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                {listing.city?.name ? `${listing.city.name}, Algarve, Portugal` : "Algarve, Portugal"}
              </p>
              <p className="mt-6 text-sm leading-7 text-muted-foreground">{description}</p>
            </aside>
          </div>
        </main>
      </div>

      <ListingDetailClient
        listing={listing}
        initialTranslation={translation}
        initialReviews={reviews}
        initialRelatedListings={relatedListings}
        initialWhatsAppStatus={whatsappStatus}
        initialLookupValue={id}
      />
    </>
  );
}
