import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { CanonicalCategorySlug } from "./category-slugs";

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

export interface CityPageData {
  listings: ProgrammaticListing[];
  city: { id: string; slug: string; name: string; description: string | null; image_url: string | null };
  relatedCities: { slug: string; name: string; count: number }[];
  relatedCategories: { slug: string; name: string; count: number }[];
  totalCount: number;
}

export interface StaticParamCombination {
  categorySlug: CanonicalCategorySlug;
  citySlug: string;
}

export interface ProgrammaticCityIndexEntry {
  citySlug: string;
  cityName: string;
  sortOrder: number | null;
  totalCount: number;
  lastModified: string | null;
}

export interface ProgrammaticCategoryCityIndexEntry {
  categorySlug: CanonicalCategorySlug;
  citySlug: string;
  totalCount: number;
  lastModified: string | null;
}

// ─── Field selects ─────────────────────────────────────────────────────────

const LISTING_FIELDS = `
  id, slug, name, short_description, featured_image_url,
  tier, is_curated, google_rating, google_review_count,
  price_from, price_currency, website_url
`;

const LISTING_RELATION_FIELDS = `
  ${LISTING_FIELDS},
  categories(id, slug, name),
  listing_images(id, image_url, is_featured, display_order)
`;

// ─── Slug validation ─────────────────────────────────────────────────────────

/**
 * Fast format-only check for city slugs before hitting the database.
 * Accepts lowercase ASCII letters, digits, and hyphens; 2–60 chars;
 * no leading or trailing hyphens. Rejects garbage strings, locale codes
 * passed in the wrong segment, SQL fragments, and oversized inputs.
 *
 * Note: this does NOT verify the slug exists in the DB — that is
 * `getCategoryCityPageData`'s responsibility.
 */
export function isValidCitySlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$/.test(slug);
}

// ─── Static params ────────────────────────────────────────────────────────────

/**
 * Returns all unique { categorySlug, citySlug } combinations that have
 * at least one published listing. Used by generateStaticParams.
 *
 * Strategy: fetch a lightweight projection of listings + their FKs,
 * then join to categories/cities in memory.
 */
export async function getAllCategoryCityCombinations(): Promise<StaticParamCombination[]> {
  const entries = await getProgrammaticCategoryCityIndexEntries();

  return entries
    .filter(({ totalCount }) => totalCount > 0)
    .map(({ categorySlug, citySlug }) => ({
    categorySlug,
    citySlug,
  }));
}

export async function getAllProgrammaticCitySlugs(): Promise<string[]> {
  const entries = await getProgrammaticCityIndexEntries();
  return entries.map(({ citySlug }) => citySlug);
}

function getLatestTimestamp(
  current: string | null,
  candidate: string | null | undefined,
): string | null {
  if (!candidate) return current;
  if (!current) return candidate;

  return new Date(candidate) > new Date(current) ? candidate : current;
}

export async function getProgrammaticCityIndexEntries(): Promise<ProgrammaticCityIndexEntry[]> {
  const supabase = createPublicServerClient();

  const [listingsRes, citiesRes] = await Promise.all([
    supabase
      .from("listings")
      .select("city_id, updated_at")
      .eq("status", "published")
      .not("city_id", "is", null),
    supabase
      .from("cities")
      .select("id, slug, name, display_order")
      .eq("is_active", true)
      .not("slug", "is", null),
  ]);

  const cityById = new Map(
    (citiesRes.data ?? []).map((city) => [city.id, city]),
  );

  const aggregates = new Map<string, ProgrammaticCityIndexEntry>();

  for (const row of listingsRes.data ?? []) {
    if (!row.city_id) continue;

    const city = cityById.get(row.city_id);
    if (!city || !city.slug) continue;

    const existing = aggregates.get(city.id);
    if (existing) {
      existing.totalCount += 1;
      existing.lastModified = getLatestTimestamp(existing.lastModified, row.updated_at);
      continue;
    }

    aggregates.set(city.id, {
      citySlug: city.slug.trim().toLowerCase(),
      cityName: city.name,
      sortOrder: city.display_order ?? null,
      totalCount: 1,
      lastModified: row.updated_at ?? null,
    });
  }

  return Array.from(aggregates.values()).sort((a, b) => {
    const orderDelta = (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
    if (orderDelta !== 0) return orderDelta;
    return a.cityName.localeCompare(b.cityName, "en");
  });
}

export async function getProgrammaticCategoryCityIndexEntries(): Promise<ProgrammaticCategoryCityIndexEntry[]> {
  const supabase = createPublicServerClient();

  const [listingsRes, categoriesRes, citiesRes] = await Promise.all([
    supabase
      .from("listings")
      .select("category_id, city_id, updated_at")
      .eq("status", "published")
      .not("category_id", "is", null)
      .not("city_id", "is", null),
    supabase.from("categories").select("id, slug"),
    supabase
      .from("cities")
      .select("id, slug")
      .eq("is_active", true)
      .not("slug", "is", null),
  ]);

  const categorySlugById = new Map<string, string>(
    (categoriesRes.data ?? []).map((category) => [category.id, category.slug]),
  );
  const citySlugById = new Map<string, string>(
    (citiesRes.data ?? []).map((city) => [city.id, city.slug]),
  );

  const aggregates = new Map<string, ProgrammaticCategoryCityIndexEntry>();

  for (const row of listingsRes.data ?? []) {
    if (!row.category_id || !row.city_id) continue;

    const categorySlug = categorySlugById.get(row.category_id);
    const citySlug = citySlugById.get(row.city_id);
    if (!categorySlug || !citySlug) continue;

    const key = `${citySlug}:${categorySlug}`;
    const existing = aggregates.get(key);
    if (existing) {
      existing.totalCount += 1;
      existing.lastModified = getLatestTimestamp(existing.lastModified, row.updated_at);
      continue;
    }

    aggregates.set(key, {
      categorySlug: categorySlug as CanonicalCategorySlug,
      citySlug,
      totalCount: 1,
      lastModified: row.updated_at ?? null,
    });
  }

  return Array.from(aggregates.values())
    .filter((entry) => entry.totalCount > 0)
    .sort((a, b) => {
    const cityDelta = a.citySlug.localeCompare(b.citySlug, "en");
    if (cityDelta !== 0) return cityDelta;
    return a.categorySlug.localeCompare(b.categorySlug, "en");
  });
}

function mapProgrammaticListing(
  listing: Record<string, unknown>,
  city: { slug: string; name: string },
  fallbackCategory?: { slug: string; name: string },
): ProgrammaticListing {
  const nestedCategory = Array.isArray(listing.categories)
    ? listing.categories[0]
    : (listing.categories as { slug?: string | null; name?: string | null } | null | undefined);

  const category = nestedCategory ?? fallbackCategory ?? { slug: "", name: "" };

  const images = Array.isArray(listing.listing_images)
    ? (listing.listing_images as { image_url?: string; is_featured?: boolean; display_order?: number }[])
    : [];

  const fallbackImg = images
    .filter((img) => img.image_url)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })[0]?.image_url ?? null;

  const featuredUrl =
    typeof listing.featured_image_url === "string" && listing.featured_image_url
      ? listing.featured_image_url
      : fallbackImg;

  return {
    id: String(listing.id ?? ""),
    slug: String(listing.slug ?? ""),
    name: String(listing.name ?? ""),
    short_description:
      typeof listing.short_description === "string" ? listing.short_description : null,
    featured_image_url: featuredUrl,
    tier: typeof listing.tier === "string" ? listing.tier : "unverified",
    is_curated: Boolean(listing.is_curated),
    google_rating:
      typeof listing.google_rating === "number" ? listing.google_rating : null,
    google_review_count:
      typeof listing.google_review_count === "number" ? listing.google_review_count : null,
    price_from: typeof listing.price_from === "number" ? listing.price_from : null,
    price_currency:
      typeof listing.price_currency === "string" ? listing.price_currency : null,
    website_url: typeof listing.website_url === "string" ? listing.website_url : null,
    city_slug: city.slug,
    city_name: city.name,
    category_slug: category.slug ?? "",
    category_name: category.name ?? "",
  };
}

async function getPopularAlternativeCities(excludeCityId: string) {
  const supabase = createPublicServerClient();

  const relatedCitiesRes = await supabase
    .from("listings")
    .select("city_id, cities!inner(id, slug, name)")
    .eq("status", "published")
    .neq("city_id", excludeCityId)
    .not("city_id", "is", null)
    .limit(300);

  const cityCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of relatedCitiesRes.data ?? []) {
    const city = Array.isArray(row.cities)
      ? row.cities[0]
      : (row.cities as { id: string; slug: string; name: string } | null);
    if (!city) continue;
    const existing = cityCounts.get(city.id);
    if (existing) {
      existing.count++;
    } else {
      cityCounts.set(city.id, { slug: city.slug, name: city.name, count: 1 });
    }
  }

  return Array.from(cityCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function getCityPageData(citySlug: string): Promise<CityPageData | null> {
  const supabase = createPublicServerClient();

  const cityRes = await supabase
    .from("cities")
    .select("id, slug, name, description, image_url")
    .eq("slug", citySlug)
    .single();

  if (!cityRes.data) return null;

  const city = cityRes.data;

  const [countRes, listingsRes, relatedCatsRes, relatedCities] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("city_id", city.id),
    supabase
      .from("listings")
      .select(LISTING_RELATION_FIELDS)
      .eq("status", "published")
      .eq("city_id", city.id)
      .order("is_curated", { ascending: false })
      .order("google_rating", { ascending: false, nullsFirst: false })
      .limit(24),
    supabase
      .from("listings")
      .select("category_id, categories!inner(id, slug, name)")
      .eq("status", "published")
      .eq("city_id", city.id)
      .not("category_id", "is", null)
      .limit(300),
    getPopularAlternativeCities(city.id),
  ]);

  const listings: ProgrammaticListing[] = (listingsRes.data ?? []).map((listing) =>
    mapProgrammaticListing(listing as Record<string, unknown>, city),
  );

  const catCounts = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of relatedCatsRes.data ?? []) {
    const category = Array.isArray(row.categories)
      ? row.categories[0]
      : (row.categories as { id: string; slug: string; name: string } | null);
    if (!category) continue;
    const existing = catCounts.get(category.id);
    if (existing) {
      existing.count++;
    } else {
      catCounts.set(category.id, { slug: category.slug, name: category.name, count: 1 });
    }
  }

  const relatedCategories = Array.from(catCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    listings,
    city,
    relatedCities,
    relatedCategories,
    totalCount: countRes.count ?? 0,
  };
}

// ─── Page data ───────────────────────────────────────────────────────────────

/**
 * Fetches all data needed to render a localized /visit/{city}/{category} page.
 * Returns null only when the city/category slugs do not exist.
 */
export async function getCategoryCityPageDataAllowEmpty(
  canonicalCategorySlug: string,
  citySlug: string,
): Promise<CategoryCityPageData | null> {
  console.log("category param (direct):", canonicalCategorySlug);
  
  const supabase = createPublicServerClient();

  // 1. Resolve IDs for the slugs - USE EXACT SLUG from URL
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

  console.log("db category match:", catRes.data);
  console.log("db city match:", cityRes.data);
  
  if (!catRes.data || !cityRes.data) return null;

  const categoryId = catRes.data.id;
  const cityId = cityRes.data.id;

  const [countRes, listingsRes, relatedCitiesRes, relatedCatsRes] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("category_id", categoryId)
      .eq("city_id", cityId),
    supabase
      .from("listings")
      .select(LISTING_RELATION_FIELDS)
      .eq("status", "published")
      .eq("category_id", categoryId)
      .eq("city_id", cityId)
      .order("is_curated", { ascending: false })
      .order("google_rating", { ascending: false, nullsFirst: false })
      .limit(24),
    supabase
      .from("listings")
      .select("city_id, cities!inner(id, slug, name)")
      .eq("status", "published")
      .eq("category_id", categoryId)
      .neq("city_id", cityId)
      .limit(200),
    supabase
      .from("listings")
      .select("category_id, categories!inner(id, slug, name)")
      .eq("status", "published")
      .eq("city_id", cityId)
      .neq("category_id", categoryId)
      .limit(200),
  ]);

  const rawListings = listingsRes.data ?? [];
  const listings: ProgrammaticListing[] = rawListings.map((listing) =>
    mapProgrammaticListing(
      listing as Record<string, unknown>,
      { slug: cityRes.data.slug, name: cityRes.data.name },
      { slug: catRes.data.slug, name: catRes.data.name },
    ),
  );

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
    totalCount: countRes.count ?? 0,
  };
}

export async function getCategoryCityPageData(
  canonicalCategorySlug: string,
  citySlug: string,
): Promise<CategoryCityPageData | null> {
  const data = await getCategoryCityPageDataAllowEmpty(canonicalCategorySlug, citySlug);
  if (!data || data.totalCount === 0) {
    return null;
  }

  return data;
}

export interface InternalLinksCategory {
  slug: string;
  name: string;
  count: number;
}

export interface InternalLinksCity {
  slug: string;
  name: string;
  count: number;
}

export async function getInternalLinksData(
  canonicalCategorySlug: string,
  citySlug: string,
  maxItems: number = 8,
): Promise<{
  categoriesInCity: InternalLinksCategory[];
  citiesWithCategory: InternalLinksCity[];
}> {
  const supabase = createPublicServerClient();

  const [catRes, cityRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name")
      .eq("slug", canonicalCategorySlug)
      .single(),
    supabase
      .from("cities")
      .select("id, slug, name")
      .eq("slug", citySlug)
      .single(),
  ]);

  if (!catRes.data || !cityRes.data) {
    return { categoriesInCity: [], citiesWithCategory: [] };
  }

  const categoryId = catRes.data.id;
  const cityId = cityRes.data.id;

  const { data: categoryCounts } = await supabase
    .from("listings")
    .select("category_id, categories!inner(slug, name)")
    .eq("status", "published")
    .eq("city_id", cityId)
    .neq("category_id", categoryId);

  const catMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of categoryCounts ?? []) {
    const cat = Array.isArray(row.categories) ? row.categories[0] : (row.categories as { slug: string; name: string } | null);
    if (!cat) continue;
    const existing = catMap.get(cat.slug);
    if (existing) {
      existing.count++;
    } else {
      catMap.set(cat.slug, { slug: cat.slug, name: cat.name, count: 1 });
    }
  }

  const categoriesInCity = Array.from(catMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c.count,
    }));

  const { data: cityCounts } = await supabase
    .from("listings")
    .select("city_id, cities!inner(slug, name)")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("city_id", cityId);

  const cityMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of cityCounts ?? []) {
    const city = Array.isArray(row.cities) ? row.cities[0] : (row.cities as { slug: string; name: string } | null);
    if (!city) continue;
    const existing = cityMap.get(city.slug);
    if (existing) {
      existing.count++;
    } else {
      cityMap.set(city.slug, { slug: city.slug, name: city.name, count: 1 });
    }
  }

  const citiesWithCategory = Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c.count,
    }));

  return { categoriesInCity, citiesWithCategory };
}
