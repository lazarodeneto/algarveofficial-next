import { createClient } from "@/lib/supabase/server";
import { applyRanking } from "./applyRanking";
import type { ListingCard } from "./get-featured-listings";
import { getPublicListingsByCategory } from "@/lib/public-data";
import type { PublicListingDTO } from "@/lib/public-data";

type RankableListingCard = ListingCard & { created_at: string };

function toListingCard(listing: PublicListingDTO): RankableListingCard {
  return {
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    city_id: listing.cityId,
    category_id: listing.categoryId,
    tier: listing.tier,
    featured_image_url: listing.imageUrl,
    created_at: listing.createdAt ?? listing.updatedAt ?? "",
    short_description: listing.shortDescription,
    city_name: listing.city?.name,
    city_slug: listing.city?.slug,
    category_name: listing.category?.name,
  };
}

async function enrichListings(listings: ListingCard[]): Promise<ListingCard[]> {
  if (!listings.length) return [];

  const supabase = await createClient();
  const cityIds = listings.map((l) => l.city_id).filter(Boolean) as string[];
  const categoryIds = listings.map((l) => l.category_id).filter(Boolean) as string[];

  const [{ data: cities }, { data: categories }] = await Promise.all([
    cityIds.length ? supabase.from("cities").select("id, name, slug").in("id", [...new Set(cityIds)]) : Promise.resolve({ data: [] }),
    categoryIds.length ? supabase.from("categories").select("id, name, slug").in("id", [...new Set(categoryIds)]) : Promise.resolve({ data: [] }),
  ]);

  const cityMap = Object.fromEntries((cities ?? []).map((c) => [c.id, c]));
  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  return listings.map((l) => ({
    ...l,
    city_name: cityMap[l.city_id ?? ""]?.name,
    city_slug: cityMap[l.city_id ?? ""]?.slug,
    category_name: categoryMap[l.category_id ?? ""]?.name,
  }));
}

export async function getListingsByCategory(categorySlug: string, limit = 6): Promise<ListingCard[]> {
  const listings = await getPublicListingsByCategory(categorySlug, {
    limit: 50,
    includeReviewsSummary: false,
  });
  return applyRanking(listings.map(toListingCard)).slice(0, limit);
}

export async function getListingsByCity(citySlug: string, limit = 6): Promise<ListingCard[]> {
  const supabase = await createClient();

  const { data: city } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", citySlug)
    .single();

  if (!city) return [];

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, name, slug, city_id, category_id, tier, featured_image_url, created_at, short_description")
    .eq("status", "published")
    .eq("city_id", city.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !listings) return [];
  return enrichListings(applyRanking(listings).slice(0, limit));
}

export async function getAllListings(limit = 6): Promise<ListingCard[]> {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, name, slug, city_id, category_id, tier, featured_image_url, created_at, short_description")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !listings) return [];
  return enrichListings(applyRanking(listings).slice(0, limit));
}
