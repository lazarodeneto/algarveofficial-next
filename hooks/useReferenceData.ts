import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
} from "@/lib/publicContentLocale";
import {
  categoriesQueryKey,
  cityListingCountsQueryKey,
  citiesQueryKey,
  regionListingCountsQueryKey,
  regionsQueryKey,
} from "@/lib/query-keys";

export type CityRow = Tables<'cities'>;
export type RegionRow = Tables<'regions'>;
export type CategoryRow = Tables<'categories'>;

const CITY_FIELDS = `
  id, name, slug, short_description, description, image_url, hero_image_url,
  latitude, longitude, is_active, is_featured, display_order,
  meta_title, meta_description, created_at, updated_at
`;

const REGION_FIELDS = `
  id, name, slug, short_description, description, image_url, hero_image_url,
  is_active, is_featured, is_visible_destinations, display_order,
  meta_title, meta_description, created_at, updated_at
`;

const CATEGORY_FIELDS = `
  id, name, slug, short_description, description, icon, image_url,
  is_active, is_featured, display_order, template_fields,
  meta_title, meta_description, created_at, updated_at
`;

const CITY_REGION_MAPPING_FIELDS = "id, city_id, region_id, is_primary, created_at";

function mergeCityTranslations(cities: CityRow[], translations: Awaited<ReturnType<typeof fetchCityTranslations>>) {
  const translationMap = new Map(translations.map((translation) => [translation.city_id, translation]));

  return cities.map((city) => {
    const translation = translationMap.get(city.id);
    if (!translation) return city;

    return {
      ...city,
      name: translation.name?.trim() ?? city.name,
      short_description: translation.short_description?.trim() ?? city.short_description,
      description: translation.description?.trim() ?? city.description,
    };
  });
}

function mergeRegionTranslations(regions: RegionRow[], translations: Awaited<ReturnType<typeof fetchRegionTranslations>>) {
  const translationMap = new Map(translations.map((translation) => [translation.region_id, translation]));

  return regions.map((region) => {
    const translation = translationMap.get(region.id);
    if (!translation) return region;

    return {
      ...region,
      name: translation.name?.trim() ?? region.name,
      short_description: translation.short_description?.trim() ?? region.short_description,
      description: translation.description?.trim() ?? region.description,
    };
  });
}

function mergeCategoryTranslations(
  categories: CategoryRow[],
  translations: Awaited<ReturnType<typeof fetchCategoryTranslations>>,
) {
  const translationMap = new Map(translations.map((translation) => [translation.category_id, translation]));

  return categories.map((category) => {
    const translation = translationMap.get(category.id);
    if (!translation) return category;

    return {
      ...category,
      name: translation.name?.trim() ?? category.name,
      short_description: translation.short_description?.trim() ?? category.short_description,
      description: translation.description?.trim() ?? category.description,
    };
  });
}

/**
 * Fetch all active cities
 */
export function useCities() {
  const locale = normalizePublicContentLocale(useCurrentLocale());

  return useQuery({
    queryKey: citiesQueryKey(locale),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(CITY_FIELDS)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching cities:', error);
        throw error;
      }

      const cities = data as CityRow[];
      if (locale === "en" || cities.length === 0) return cities;

      const translations = await fetchCityTranslations(locale, cities.map((city) => city.id));
      return mergeCityTranslations(cities, translations);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch all active regions
 */
export function useRegions() {
  const locale = normalizePublicContentLocale(useCurrentLocale());

  return useQuery({
    queryKey: regionsQueryKey(locale),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select(REGION_FIELDS)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching regions:', error);
        throw error;
      }

      const regions = data as RegionRow[];
      if (locale === "en" || regions.length === 0) return regions;

      const translations = await fetchRegionTranslations(locale, regions.map((region) => region.id));
      return mergeRegionTranslations(regions, translations);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch published listing counts grouped by region.
 * Much more efficient than fetching all listings just to count them.
 */
export function useRegionListingCounts() {
  return useQuery({
    queryKey: regionListingCountsQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('region_id', { count: 'exact', head: false })
        .eq('status', 'published')
        .not('region_id', 'is', null);

      if (error) {
        console.warn('Error fetching region counts:', error);
        return {};
      }

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.region_id) {
          counts[row.region_id] = (counts[row.region_id] || 0) + 1;
        }
      }
      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch published listing counts grouped by city.
 * Used for city discovery surfaces that should only show cities with inventory.
 */
export function useCityListingCounts() {
  return useQuery({
    queryKey: cityListingCountsQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('city_id', { count: 'exact', head: false })
        .eq('status', 'published')
        .not('city_id', 'is', null);

      if (error) {
        console.warn('Error fetching city counts:', error);
        return {};
      }

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.city_id) {
          counts[row.city_id] = (counts[row.city_id] || 0) + 1;
        }
      }
      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch published listing counts grouped by category.
 * Used to hide empty category navigation/filter surfaces.
 */
export function useCategoryListingCounts() {
  return useQuery({
    queryKey: ['category-listing-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('category_id', { count: 'exact', head: false })
        .eq('status', 'published')
        .not('category_id', 'is', null);

      if (error) {
        console.warn('Error fetching category counts:', error);
        return {};
      }

      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.category_id) {
          counts[row.category_id] = (counts[row.category_id] || 0) + 1;
        }
      }
      return counts;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch all active categories
 */
export function useCategories() {
  const locale = normalizePublicContentLocale(useCurrentLocale());
  

  return useQuery({
    queryKey: categoriesQueryKey(locale),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(CATEGORY_FIELDS)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching categories:', error);
        throw error;
      }

      const categories = data as CategoryRow[];
      if (locale === "en" || categories.length === 0) return categories;

      const translations = await fetchCategoryTranslations(locale, categories.map((category) => category.id));
      return mergeCategoryTranslations(categories, translations);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch featured regions
 */
export function useFeaturedRegions() {
  const locale = normalizePublicContentLocale(useCurrentLocale());

  return useQuery({
    queryKey: ['regions', 'featured', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select(REGION_FIELDS)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Error fetching featured regions:', error);
        throw error;
      }

      const regions = data as RegionRow[];
      if (locale === "en" || regions.length === 0) return regions;

      const translations = await fetchRegionTranslations(locale, regions.map((region) => region.id));
      return mergeRegionTranslations(regions, translations);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch featured cities
 */
export function useFeaturedCities() {
  const locale = normalizePublicContentLocale(useCurrentLocale());
  

  return useQuery({
    queryKey: ['cities', 'featured', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(CITY_FIELDS)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Error fetching featured cities:', error);
        throw error;
      }

      const cities = data as CityRow[];
      if (locale === "en" || cities.length === 0) return cities;

      const translations = await fetchCityTranslations(locale, cities.map((city) => city.id));
      return mergeCityTranslations(cities, translations);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch featured categories
 */
export function useFeaturedCategories() {
  const locale = normalizePublicContentLocale(useCurrentLocale());
  

  return useQuery({
    queryKey: ['categories', 'featured', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(CATEGORY_FIELDS)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Error fetching featured categories:', error);
        throw error;
      }

      const categories = data as CategoryRow[];
      if (locale === "en" || categories.length === 0) return categories;

      const translations = await fetchCategoryTranslations(locale, categories.map((category) => category.id));
      return mergeCategoryTranslations(categories, translations);
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch city-region mappings
 */
export function useCityRegionMappings() {
  

  return useQuery({
    queryKey: ['city-region-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_region_mapping')
        .select(CITY_REGION_MAPPING_FIELDS);

      if (error) {
        console.warn('Error fetching city-region mappings:', error);
        throw error;
      }

      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

// ============================================
// ADMIN HOOKS - Fetch ALL records (including inactive)
// ============================================

/**
 * Fetch ALL cities (including inactive) for admin forms
 */
export function useAllCities() {
  

  return useQuery({
    queryKey: ['cities', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(CITY_FIELDS)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching all cities:', error);
        throw error;
      }

      return data as CityRow[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch ALL regions (including inactive) for admin forms
 */
export function useAllRegions() {
  

  return useQuery({
    queryKey: ['regions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select(REGION_FIELDS)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching all regions:', error);
        throw error;
      }

      return data as RegionRow[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch ALL categories (including inactive) for admin forms
 */
export function useAllCategories() {
  

  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(CATEGORY_FIELDS)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching all categories:', error);
        throw error;
      }

      return data as CategoryRow[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
