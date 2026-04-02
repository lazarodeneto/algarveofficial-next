import { useQuery } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import {
  fetchCategoryTranslations,
  fetchCityTranslations,
  fetchRegionTranslations,
  normalizePublicContentLocale,
} from "@/lib/publicContentLocale";

export type CityRow = Tables<'cities'>;
export type RegionRow = Tables<'regions'>;
export type CategoryRow = Tables<'categories'>;

function mergeCityTranslations(cities: CityRow[], translations: Awaited<ReturnType<typeof fetchCityTranslations>>) {
  const translationMap = new Map(translations.map((translation) => [translation.city_id, translation]));

  return cities.map((city) => {
    const translation = translationMap.get(city.id);
    if (!translation) return city;

    return {
      ...city,
      name: translation.name?.trim() || city.name,
      short_description: translation.short_description?.trim() || city.short_description,
      description: translation.description?.trim() || city.description,
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
      name: translation.name?.trim() || region.name,
      short_description: translation.short_description?.trim() || region.short_description,
      description: translation.description?.trim() || region.description,
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
      name: translation.name?.trim() || category.name,
      short_description: translation.short_description?.trim() || category.short_description,
      description: translation.description?.trim() || category.description,
    };
  });
}

/**
 * Fetch all active cities
 */
export function useCities() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['cities', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

/**
 * Fetch all active regions
 */
export function useRegions() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['regions', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

/**
 * Fetch published listing counts grouped by region.
 * Much more efficient than fetching all listings just to count them.
 */
export function useRegionListingCounts() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['reference-data', 'region-listing-counts'],
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch all active categories
 */
export function useCategories() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['categories', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

/**
 * Fetch featured regions
 */
export function useFeaturedRegions() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['regions', 'featured', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch featured cities
 */
export function useFeaturedCities() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['cities', 'featured', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch featured categories
 */
export function useFeaturedCategories() {
  const { i18n } = useTranslation();
  const locale = normalizePublicContentLocale(i18n.language);
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['categories', 'featured', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
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
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch city-region mappings
 */
export function useCityRegionMappings() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['city-region-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_region_mapping')
        .select('*');

      if (error) {
        console.warn('Error fetching city-region mappings:', error);
        throw error;
      }

      return data;
    },
    enabled: isBrowser,
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
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['cities', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching all cities:', error);
        throw error;
      }

      return data as CityRow[];
    },
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch ALL regions (including inactive) for admin forms
 */
export function useAllRegions() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['regions', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching all regions:', error);
        throw error;
      }

      return data as RegionRow[];
    },
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch ALL categories (including inactive) for admin forms
 */
export function useAllCategories() {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching all categories:', error);
        throw error;
      }

      return data as CategoryRow[];
    },
    enabled: isBrowser,
    staleTime: 1000 * 60 * 10,
  });
}
