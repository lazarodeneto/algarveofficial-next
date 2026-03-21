import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { CanonicalCategorySlug } from "./category-slugs";
import type { Locale } from "@/lib/i18n/config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgrammaticListing {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  featured_image_url: string | null;
  tier: string;
  is_curated: boolean;
  google_rating: number | null;
  google_review_count: number | null;
  price_from: number | null;
  price_currency: string | null;
  website_url: string | null;
  city_slug: string;
  city_name: string;
  category_slug: string;
  category_name: string;
}

export interface CategoryCityPageData {
  listings: ProgrammaticListing[];
  city: { id: string; slug: string; name: string; description: string | null; image_url: string | null };
  category: { id: string; slug: string; name: string; description: string | null; image_url: string | null };
  relatedCities: { slug: string; name: string; count: number }[];
  relatedCategories: { slug: string; name: string; count: number }[];
  totalCount: number;
}

export interface StaticParamCombination {
  categorySlug: CanonicalCategorySlug;
  citySlug: string;
}

// ─── Field selects ─────────────────────────────────────────────────────────

const LISTING_FIELDS = `
  id, slug, name, short_description, featured_image_url,
  tier, is_curated, google_rating, google_review_count,
  price_from, price_currency, website_url
`;

// ─── Static params ────────────────────────────────────────────────────────────

/**
 * Returns all unique { categorySlug, citySlug } combinations that have
 * at least one published listing. Used by generateStaticParams.
 *
 * Strategy: fetch a lightweight projection of listings + their FKs,
 * then join to categories/cities in memory.
 */
export async function getAllCategoryCityCombinations(): Promise<StaticParamCombination[]> {
  const supabase = createPublicServerClient();

  const [listingsRes, categoriesRes, citiesRes] = await Promise.all([
    supabase
      .from("listings")
      .select("category_id, city_id")
      .eq("status", "published")
      .not("category_id", "is", null)
      .not("city_id", "is", null),
    supabase.from("categories").select("id, slug"),
    supabase.from("cities").select("id, slug"),
  ]);

  if (!listingsRes.data?.length) return [];

  const catSlugById = new Map<string, string>(
    (categoriesRes.data ?? []).map((c) => [c.id, c.slug])
  );
  const citySlugById = new Map<string, string>(
    (citiesRes.data ?? []).map((c) => [c.id, c.slug])
  );

  // Deduplicate by categorySlug+citySlug using a Set
  const seen = new Set<string>();
  const combinations: StaticParamCombination[] = [];

  for (const row of listingsRes.data) {
    if (!row.category_id || !row.city_id) continue;
    const catSlug = catSlugById.get(row.category_id);
    const citySlug = citySlugById.get(row.city_id);
    if (!catSlug || !citySlug) continue;

    const key = `${catSlug}:${citySlug}`;
    if (!seen.has(key)) {
      seen.add(key);
      combinations.push({
        categorySlug: catSlug as CanonicalCategorySlug,
        citySlug,
      });
    }
  }

  return combinations;
}

// ─── Page data ───────────────────────────────────────────────────────────────

/**
 * Fetches all data needed to render a /{locale}/{category}/{city} page.
 *
 * Returns null if no published listings exist (triggers notFound).
 */
export async function getCategoryCityPageData(
  canonicalCategorySlug: string,
  citySlug: string,
): Promise<CategoryCityPageData | null> {
  const supabase = createPublicServerClient();

  // 1. Resolve IDs for the slugs
  const [catRes, cityRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, image_url")
      .eq("slug", canonicalCategorySlug)
      .single(),
    supabase
      .from("cities")
      .select("id, slug, name, description, image_url")
      .eq("slug", citySlug)
      .single(),
  ]);

  if (!catRes.data || !cityRes.data) return null;

  const categoryId = catRes.data.id;
  const cityId = cityRes.data.id;

  // 2. Fetch published listings for this combination
  const listingsRes = await supabase
    .from("listings")
    .select(LISTING_FIELDS)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .eq("city_id", cityId)
    .order("is_curated", { ascending: false })
    .order("google_rating", { ascending: false, nullsFirst: false })
    .limit(50);

  const rawListings = listingsRes.data ?? [];
  if (rawListings.length === 0) return null;

  const listings: ProgrammaticListing[] = rawListings.map((l) => ({
    ...l,
    city_slug: cityRes.data.slug,
    city_name: cityRes.data.name,
    category_slug: catRes.data.slug,
    category_name: catRes.data.name,
  }));

  // 3. Fetch related cities (same category, different cities — for internal linking)
  const relatedCitiesRes = await supabase
    .from("listings")
    .select("city_id, cities!inner(id, slug, name)")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("city_id", cityId)
    .limit(200);

  const cityCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of relatedCitiesRes.data ?? []) {
    const city = Array.isArray(row.cities) ? row.cities[0] : (row.cities as { id: string; slug: string; name: string } | null);
    if (!city) continue;
    const existing = cityCounts.get(city.id);
    if (existing) {
      existing.count++;
    } else {
      cityCounts.set(city.id, { slug: city.slug, name: city.name, count: 1 });
    }
  }

  const relatedCities = Array.from(cityCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 4. Fetch related categories (same city, different categories — for internal linking)
  const relatedCatsRes = await supabase
    .from("listings")
    .select("category_id, categories!inner(id, slug, name)")
    .eq("status", "published")
    .eq("city_id", cityId)
    .neq("category_id", categoryId)
    .limit(200);

  const catCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of relatedCatsRes.data ?? []) {
    const cat = Array.isArray(row.categories) ? row.categories[0] : (row.categories as { id: string; slug: string; name: string } | null);
    if (!cat) continue;
    const existing = catCounts.get(cat.id);
    if (existing) {
      existing.count++;
    } else {
      catCounts.set(cat.id, { slug: cat.slug, name: cat.name, count: 1 });
    }
  }

  const relatedCategories = Array.from(catCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    listings,
    city: cityRes.data,
    category: catRes.data,
    relatedCities,
    relatedCategories,
    totalCount: rawListings.length,
  };
}
