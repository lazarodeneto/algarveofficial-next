"use client";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { inferCategorySlugsFromSearch } from '@/lib/categoryMerges';
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchListingTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
} from "@/lib/publicContentLocale";

export type ListingRow = Tables<'listings'>;
export type ListingTier = 'unverified' | 'verified' | 'signature';

export interface ListingFilters {
  search?: string;
  categoryId?: string;
  categoryIds?: string[];
  cityId?: string;
  regionId?: string;
  tier?: ListingTier;
  excludeCategoryId?: string;
  excludeCategorySlug?: string;
}

export interface ListingWithRelations extends ListingRow {
  city?: Tables<'cities'> | null;
  region?: Tables<'regions'> | null;
  category?: Tables<'categories'> | null;
}

function mergeListingLocalizations(
  listings: ListingWithRelations[],
  listingTranslations: Awaited<ReturnType<typeof fetchListingTranslations>>,
  cityTranslations: Awaited<ReturnType<typeof fetchCityTranslations>>,
  regionTranslations: Awaited<ReturnType<typeof fetchRegionTranslations>>,
  categoryTranslations: Awaited<ReturnType<typeof fetchCategoryTranslations>>,
) {
  const listingTranslationMap = new Map(
    listingTranslations.map((translation) => [translation.listing_id, translation]),
  );
  const cityTranslationMap = new Map(
    cityTranslations.map((translation) => [translation.city_id, translation]),
  );
  const regionTranslationMap = new Map(
    regionTranslations.map((translation) => [translation.region_id, translation]),
  );
  const categoryTranslationMap = new Map(
    categoryTranslations.map((translation) => [translation.category_id, translation]),
  );

  return listings.map((listing) => {
    const listingTranslation = listingTranslationMap.get(listing.id);
    const cityTranslation = listing.city?.id ? cityTranslationMap.get(listing.city.id) : undefined;
    const regionTranslation = listing.region?.id ? regionTranslationMap.get(listing.region.id) : undefined;
    const categoryTranslation = listing.category?.id ? categoryTranslationMap.get(listing.category.id) : undefined;

    return {
      ...listing,
      name: listingTranslation?.title?.trim() || listing.name,
      short_description: listingTranslation?.short_description?.trim() || listing.short_description,
      description: listingTranslation?.description?.trim() || listing.description,
      city: listing.city
        ? {
            ...listing.city,
            name: cityTranslation?.name?.trim() || listing.city.name,
            short_description: cityTranslation?.short_description?.trim() || listing.city.short_description,
            description: cityTranslation?.description?.trim() || listing.city.description,
          }
        : listing.city,
      region: listing.region
        ? {
            ...listing.region,
            name: regionTranslation?.name?.trim() || listing.region.name,
            short_description: regionTranslation?.short_description?.trim() || listing.region.short_description,
            description: regionTranslation?.description?.trim() || listing.region.description,
          }
        : listing.region,
      category: listing.category
        ? {
            ...listing.category,
            name: categoryTranslation?.name?.trim() || listing.category.name,
            short_description:
              categoryTranslation?.short_description?.trim() || listing.category.short_description,
          }
        : listing.category,
    };
  });
}

function normalizeListingFilters(filters: ListingFilters): ListingFilters {
  const normalized: ListingFilters = {};

  const search = filters.search?.trim();
  if (search) {
    normalized.search = search;
  }

  if (filters.categoryId && filters.categoryId !== "all") {
    normalized.categoryId = filters.categoryId;
  }

  if (Array.isArray(filters.categoryIds)) {
    const cleaned = Array.from(
      new Set(
        filters.categoryIds
          .map((value) => value?.trim())
          .filter((value): value is string => Boolean(value) && value !== "all")
      )
    );
    if (cleaned.length > 0) {
      normalized.categoryIds = cleaned;
    }
  }

  if (filters.cityId && filters.cityId !== "all") {
    normalized.cityId = filters.cityId;
  }

  if (filters.regionId && filters.regionId !== "all") {
    normalized.regionId = filters.regionId;
  }

  if (filters.tier) {
    normalized.tier = filters.tier;
  }

  if (filters.excludeCategoryId && filters.excludeCategoryId !== "all") {
    normalized.excludeCategoryId = filters.excludeCategoryId;
  }

  const excludeCategorySlug = filters.excludeCategorySlug?.trim();
  if (excludeCategorySlug) {
    normalized.excludeCategorySlug = excludeCategorySlug;
  }

  return normalized;
}

async function resolveExcludedCategoryId(filters: ListingFilters): Promise<string | null> {
  if (filters.excludeCategoryId && filters.excludeCategoryId !== 'all') {
    return filters.excludeCategoryId;
  }

  if (!filters.excludeCategorySlug) {
    return null;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', filters.excludeCategorySlug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[,%(){}'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function resolveSearchCategoryIds(search?: string): Promise<string[]> {
  if (!search?.trim()) return [];

  const term = sanitizeSearchTerm(search);
  if (!term) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("is_active", true)
    .or(`name.ilike.%${term}%,slug.ilike.%${term}%,short_description.ilike.%${term}%`);

  if (error) throw error;

  const ids = new Set((data || []).map((row) => row.id).filter(Boolean));
  const inferredSlugs = inferCategorySlugsFromSearch(term);

  if (inferredSlugs.length > 0) {
    const { data: inferredRows, error: inferredError } = await supabase
      .from("categories")
      .select("id")
      .in("slug", inferredSlugs);

    if (inferredError) throw inferredError;
    (inferredRows || []).forEach((row) => {
      if (row.id) ids.add(row.id);
    });
  }

  return Array.from(ids);
}

function applyListingFilters(
  query: any,
  filters: ListingFilters,
  excludedCategoryId: string | null,
  matchingCategoryIds: string[] = []
) {
  if (Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds);
  } else if (filters.categoryId && filters.categoryId !== 'all') {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.cityId && filters.cityId !== 'all') {
    query = query.eq('city_id', filters.cityId);
  }

  if (filters.regionId && filters.regionId !== 'all') {
    query = query.eq('region_id', filters.regionId);
  }

  if (filters.tier && filters.tier !== ('all' as any)) {
    query = query.eq('tier', filters.tier);
  }

  if (filters.search?.trim()) {
    const term = sanitizeSearchTerm(filters.search);
    if (term) {
      const tagTokens = term
        .toLowerCase()
        .split(" ")
        .map((token) => token.replace(/[^a-z0-9_-]/gi, ""))
        .filter(Boolean)
        .slice(0, 5);

      const searchClauses = [
        `name.ilike.%${term}%`,
        `short_description.ilike.%${term}%`,
        `description.ilike.%${term}%`,
      ];

      for (const token of tagTokens) {
        searchClauses.push(`name.ilike.%${token}%`);
        searchClauses.push(`short_description.ilike.%${token}%`);
        searchClauses.push(`description.ilike.%${token}%`);
        searchClauses.push(`tags.cs.{${token}}`);
      }

      if (matchingCategoryIds.length > 0) {
        searchClauses.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
      }

      query = query.or(searchClauses.join(","));
    }
  }

  if (excludedCategoryId) {
    query = query.neq('category_id', excludedCategoryId);
  }

  return query;
}

// Public-safe fields for listings (excludes PII like contact_email, contact_phone, whatsapp_number)
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

// Safe fields for related entities
const PUBLIC_CITY_FIELDS = 'id, name, slug, short_description, image_url, latitude, longitude';
const PUBLIC_REGION_FIELDS = 'id, name, slug, short_description, image_url';
const PUBLIC_CATEGORY_FIELDS = 'id, name, slug, icon, short_description, image_url';

/**
 * Fetch all published listings with optional filters
 * Uses explicit field selection to prevent PII exposure
 */
export function usePublishedListings(filters: ListingFilters = {}) {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const normalizedFilters = normalizeListingFilters(filters);

  if (typeof window === "undefined") {
    return {
      data: [] as ListingWithRelations[],
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ['listings', 'published', normalizedFilters, locale],
    queryFn: async () => {
      const [excludedCategoryId, matchingCategoryIds] = await Promise.all([
        resolveExcludedCategoryId(normalizedFilters),
        resolveSearchCategoryIds(normalizedFilters.search),
      ]);

      const pageSize = 1000;
      let from = 0;
      const allListings: ListingWithRelations[] = [];

      // Supabase REST responses are capped (commonly at 1000 rows), so paginate.
      while (true) {
        let query = supabase
          .from('listings')
          .select(`
            ${PUBLIC_LISTING_FIELDS},
            city:cities(${PUBLIC_CITY_FIELDS}),
            region:regions(${PUBLIC_REGION_FIELDS}),
            category:categories(${PUBLIC_CATEGORY_FIELDS})
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);

        query = applyListingFilters(query, normalizedFilters, excludedCategoryId, matchingCategoryIds);

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        const page = (data as unknown as ListingWithRelations[]) ?? [];
        allListings.push(...page);

        if (page.length < pageSize) break;
        from += pageSize;
      }

      // Sort by tier: signature > verified > unverified
      const tierOrder: Record<string, number> = { signature: 0, verified: 1, unverified: 2 };
      const sortedListings = allListings.sort(
        (a, b) => (tierOrder[a.tier ?? "unverified"] ?? 2) - (tierOrder[b.tier ?? "unverified"] ?? 2)
      );

      if (locale === "en" || sortedListings.length === 0) {
        return sortedListings;
      }

      const listingIds = sortedListings.map((listing) => listing.id);
      const cityIds = sortedListings.map((listing) => listing.city?.id).filter(Boolean) as string[];
      const regionIds = sortedListings.map((listing) => listing.region?.id).filter(Boolean) as string[];
      const categoryIds = sortedListings.map((listing) => listing.category?.id).filter(Boolean) as string[];

      const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
        fetchListingTranslations(locale, listingIds),
        fetchCityTranslations(locale, cityIds),
        fetchRegionTranslations(locale, regionIds),
        fetchCategoryTranslations(locale, categoryIds),
      ]);

      return mergeListingLocalizations(
        sortedListings,
        listingTranslations,
        cityTranslations,
        regionTranslations,
        categoryTranslations,
      );
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes — listings rarely change
    gcTime: 1000 * 60 * 15,
  });
}

/**
 * Fetch a single listing by ID
 * Uses explicit field selection to prevent PII exposure
 */
export function useListing(idOrSlug: string | undefined) {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);

  if (typeof window === "undefined") {
    return {
      data: null,
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ['listing', idOrSlug, locale],
    queryFn: async () => {
      if (!idOrSlug) return null;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase
        .from('listings')
        .select(`
          ${PUBLIC_LISTING_FIELDS},
          city:cities(${PUBLIC_CITY_FIELDS}),
          region:regions(${PUBLIC_REGION_FIELDS}),
          category:categories(${PUBLIC_CATEGORY_FIELDS}),
          images:listing_images(id, image_url, alt_text, display_order, is_featured)
        `);

      if (isUuid) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.eq('slug', idOrSlug);
      }

      const { data, error } = await query.single();

      if (error) {
        throw error;
      }

      const listing = data as unknown as ListingWithRelations & { images?: unknown[] };

      if (locale === "en") {
        return listing;
      }

      const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
        fetchListingTranslations(locale, [listing.id]),
        fetchCityTranslations(locale, listing.city?.id ? [listing.city.id] : []),
        fetchRegionTranslations(locale, listing.region?.id ? [listing.region.id] : []),
        fetchCategoryTranslations(locale, listing.category?.id ? [listing.category.id] : []),
      ]);

      const [localizedListing] = mergeListingLocalizations(
        [listing],
        listingTranslations,
        cityTranslations,
        regionTranslations,
        categoryTranslations,
      );

      return localizedListing;
    },
    enabled: !!idOrSlug,
  });
}

/**
 * Resolve a slug (possibly old) to a listing_id via the listing_slugs table.
 * Returns the row with listing_id and is_current flag.
 */
export function useResolveSlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['listing-slug', slug],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      if (!slug) return null;
      const { data, error } = await supabase
        .from('listing_slugs')
        .select('listing_id, slug, is_current')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch curated listings (signature + is_curated + published)
 * Uses explicit field selection to prevent PII exposure
 */
export function useCuratedListings() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);

  if (typeof window === "undefined") {
    return {
      data: [] as ListingWithRelations[],
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ['listings', 'curated', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          ${PUBLIC_LISTING_FIELDS},
          city:cities(${PUBLIC_CITY_FIELDS}),
          region:regions(${PUBLIC_REGION_FIELDS}),
          category:categories(${PUBLIC_CATEGORY_FIELDS})
        `)
        .eq('status', 'published')
        .eq('tier', 'signature')
        .eq('is_curated', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const listings = data as unknown as ListingWithRelations[];
      if (locale === "en" || listings.length === 0) return listings;

      const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
        fetchListingTranslations(locale, listings.map((listing) => listing.id)),
        fetchCityTranslations(locale, listings.map((listing) => listing.city?.id).filter(Boolean) as string[]),
        fetchRegionTranslations(locale, listings.map((listing) => listing.region?.id).filter(Boolean) as string[]),
        fetchCategoryTranslations(locale, listings.map((listing) => listing.category?.id).filter(Boolean) as string[]),
      ]);

      return mergeListingLocalizations(
        listings,
        listingTranslations,
        cityTranslations,
        regionTranslations,
        categoryTranslations,
      );
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch signature listings
 * Uses explicit field selection to prevent PII exposure
 */
export function useSignatureListings() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);

  if (typeof window === "undefined") {
    return {
      data: [] as ListingWithRelations[],
      isLoading: false,
      error: null,
    };
  }

  return useQuery({
    queryKey: ['listings', 'signature', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          ${PUBLIC_LISTING_FIELDS},
          city:cities(${PUBLIC_CITY_FIELDS}),
          region:regions(${PUBLIC_REGION_FIELDS}),
          category:categories(${PUBLIC_CATEGORY_FIELDS})
        `)
        .eq('status', 'published')
        .eq('tier', 'signature')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const listings = data as unknown as ListingWithRelations[];
      if (locale === "en" || listings.length === 0) return listings;

      const [listingTranslations, cityTranslations, regionTranslations, categoryTranslations] = await Promise.all([
        fetchListingTranslations(locale, listings.map((listing) => listing.id)),
        fetchCityTranslations(locale, listings.map((listing) => listing.city?.id).filter(Boolean) as string[]),
        fetchRegionTranslations(locale, listings.map((listing) => listing.region?.id).filter(Boolean) as string[]),
        fetchCategoryTranslations(locale, listings.map((listing) => listing.category?.id).filter(Boolean) as string[]),
      ]);

      return mergeListingLocalizations(
        listings,
        listingTranslations,
        cityTranslations,
        regionTranslations,
        categoryTranslations,
      );
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Fetch a single listing by ID with FULL data for admin/owner editing
 * Includes contact PII - only for authenticated admin/editor/owner use
 * RLS will enforce access control at database level
 */
export function useAdminListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', 'admin', id],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      if (!id) return null;

      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          city:cities(*),
          region:regions(*),
          category:categories(*),
          images:listing_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
}

/**
 * Increment listing views with session-based deduplication
 * Only tracks if user has consented to analytics (sessionId is not null)
 */
export function useIncrementListingViews() {
  return useMutation({
    mutationFn: async ({ listingId, sessionId }: { listingId: string; sessionId: string | null }) => {
      // Skip tracking if no consent (sessionId is null)
      if (!sessionId) {
        return;
      }

      const { error } = await supabase.rpc('increment_listing_views', {
        _listing_id: listingId,
        _session_id: sessionId
      });
      if (error) throw error;
    },
  });
}

/**
 * Fetch total count of published listings
 */
export function usePublishedListingsCount(filters: ListingFilters = {}) {
  const normalizedFilters = normalizeListingFilters(filters);

  return useQuery({
    queryKey: ['listings', 'published-count', normalizedFilters],
    queryFn: async () => {
      if (typeof window === "undefined") return 0;
      const [excludedCategoryId, matchingCategoryIds] = await Promise.all([
        resolveExcludedCategoryId(normalizedFilters),
        resolveSearchCategoryIds(normalizedFilters.search),
      ]);

      let query = supabase
        .from('listings')
        .select('id', { count: 'exact', head: false })
        .eq('status', 'published');

      query = applyListingFilters(query, normalizedFilters, excludedCategoryId, matchingCategoryIds);
      query = query.limit(1);

      const { count, error, status } = await query;

      if (error) {
        if (status === 503) {
          return 0;
        }
        throw error;
      }
      return count || 0;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
