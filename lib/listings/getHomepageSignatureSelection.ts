import type { ListingWithRelations } from "@/hooks/useListings";

export interface HomepageSignatureSelection {
  listings: ListingWithRelations[];
  isFallback: boolean;
}

type SupabaseLike = {
  from: (table: "listings") => {
    select: (columns: string) => any;
  };
};

const PUBLIC_LISTING_FIELDS = `
  id,
  slug,
  name,
  short_description,
  description,
  featured_image_url,
  tier,
  is_curated,
  status,
  city_id,
  region_id,
  category_id,
  google_rating,
  google_review_count,
  created_at,
  city:cities(id, name, slug),
  region:regions(id, name, slug),
  category:categories(id, name, slug, icon, image_url)
`;

const TIER_WEIGHT: Record<string, number> = {
  signature: 3,
  verified: 2,
  unverified: 1,
};

function hasImage(listing: ListingWithRelations) {
  return Boolean(listing.featured_image_url || listing.category?.image_url);
}

function sortFallbackListings(listings: ListingWithRelations[]) {
  return [...listings].sort((a, b) => {
    const tierDiff = (TIER_WEIGHT[b.tier] ?? 0) - (TIER_WEIGHT[a.tier] ?? 0);
    if (tierDiff !== 0) return tierDiff;

    const imageDiff = Number(hasImage(b)) - Number(hasImage(a));
    if (imageDiff !== 0) return imageDiff;

    const ratingDiff = Number(b.google_rating ?? 0) - Number(a.google_rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;

    return Date.parse(b.created_at ?? "") - Date.parse(a.created_at ?? "");
  });
}

function balanceByCategory(listings: ListingWithRelations[], limit: number) {
  const selected: ListingWithRelations[] = [];
  const categoryCounts = new Map<string, number>();
  const maxPerCategory = 4;

  for (const listing of listings) {
    if (selected.length >= limit) break;

    const categoryKey = listing.category_id ?? listing.category?.slug ?? "uncategorized";
    const currentCount = categoryCounts.get(categoryKey) ?? 0;
    if (currentCount >= maxPerCategory) continue;

    selected.push(listing);
    categoryCounts.set(categoryKey, currentCount + 1);
  }

  if (selected.length < limit) {
    const selectedIds = new Set(selected.map((listing) => listing.id));
    for (const listing of listings) {
      if (selected.length >= limit) break;
      if (selectedIds.has(listing.id)) continue;
      selected.push(listing);
    }
  }

  return selected;
}

export async function getHomepageSignatureSelection(
  supabase: SupabaseLike,
): Promise<HomepageSignatureSelection> {
  const signatureQuery = supabase
    .from("listings")
    .select(PUBLIC_LISTING_FIELDS)
    .eq("tier", "signature")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24);

  const { data: signatureData, error: signatureError } = await signatureQuery;
  const signatureListings = signatureError
    ? []
    : ((signatureData ?? []) as unknown as ListingWithRelations[]);

  if (signatureListings.length >= 24) {
    return {
      listings: balanceByCategory(signatureListings, 24),
      isFallback: false,
    };
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("listings")
    .select(PUBLIC_LISTING_FIELDS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(96);

  if (fallbackError) {
    return {
      listings: balanceByCategory(signatureListings, 24),
      isFallback: true,
    };
  }

  return {
    listings: balanceByCategory(sortFallbackListings((fallbackData ?? []) as unknown as ListingWithRelations[]), 24),
    isFallback: true,
  };
}
