"use client";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePublishedListings } from "@/hooks/useListings";
import { useCities, useCategories, useRegions } from "@/hooks/useReferenceData";
import { translateCategoryName } from "@/lib/translateCategory";
import { buildMergedCategoryOptions } from "@/lib/categoryMerges";

export interface SearchResult {
  id: string;
  type: "listing" | "category" | "city" | "region";
  title: string;
  subtitle?: string;
  href: string;
  icon?: string;
}

export function useGlobalSearch() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>(() => {
    try {
      const stored = localStorage.getItem("algarve-recent-searches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch data from Supabase
  const { data: listings } = usePublishedListings();
  const { data: cities } = useCities();
  const { data: categories } = useCategories();
  const { data: regions } = useRegions();
  const mergedCategories = useMemo(() => buildMergedCategoryOptions(categories || []), [categories]);

  const tokenize = (value: string) =>
    value
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

  const toTagText = (tags: unknown): string => {
    if (Array.isArray(tags)) return tags.map((tag) => String(tag)).join(" ");
    if (typeof tags === "string") return tags;
    return "";
  };

  const textMatchesQuery = (text: string, rawQuery: string, tokens: string[]): boolean => {
    const normalized = text.toLowerCase();
    return normalized.includes(rawQuery) || tokens.every((token) => normalized.includes(token));
  };

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const qTokens = tokenize(q);
    const matches: SearchResult[] = [];

    // Search listings (published only - already filtered by hook)
    listings?.forEach((listing) => {
      const listingCategoryName = translateCategoryName(t, listing.category?.slug, listing.category?.name);
      const listingSearchText = [
        listing.name,
        listing.short_description,
        listing.description,
        listing.category?.name,
        listingCategoryName,
        listing.category?.slug,
        listing.city?.name,
        listing.region?.name,
        toTagText(listing.tags),
      ]
        .filter(Boolean)
        .join(" ");

      if (textMatchesQuery(listingSearchText, q, qTokens)) {
        matches.push({
          id: listing.id,
          type: "listing",
          title: listing.name,
          subtitle: listing.city?.name,
          href: `/listing/${listing.slug || listing.id}`,
        });
      }
    });

    // Search merged categories (only those with listings)
    mergedCategories.forEach((category) => {
      const categoryDisplayName = translateCategoryName(t, category.slug, category.name);
      const categoryText = [categoryDisplayName, category.name, category.slug, category.short_description].filter(Boolean).join(" ");
      if (textMatchesQuery(categoryText, q, qTokens)) {
        const memberIds = new Set(category.memberIds);
        const hasListings = listings?.some((listing) => memberIds.has(listing.category_id));
        if (hasListings) {
          matches.push({
            id: category.id,
            type: "category",
            title: categoryDisplayName,
            subtitle: "Category",
            href: `/directory?category=${category.slug}`,
          });
        }
      }
    });

    // Search cities (only those with listings)
    cities?.forEach((city) => {
      const cityText = [city.name, city.slug, city.short_description].filter(Boolean).join(" ");
      if (textMatchesQuery(cityText, q, qTokens)) {
        const hasListings = listings?.some(l => l.city_id === city.id);
        if (hasListings) {
          matches.push({
            id: city.id,
            type: "city",
            title: city.name,
            subtitle: "City",
            href: `/city/${city.slug}`,
          });
        }
      }
    });

    // Search regions (only those with listings)
    regions?.forEach((region) => {
      const regionText = [region.name, region.slug, region.short_description].filter(Boolean).join(" ");
      if (textMatchesQuery(regionText, q, qTokens)) {
        const hasListings = listings?.some(l => l.region_id === region.id);
        if (hasListings) {
          matches.push({
            id: region.id,
            type: "region",
            title: region.name,
            subtitle: "Region",
            href: `/destinations/${region.slug}`,
          });
        }
      }
    });

    return matches.slice(0, 10); // Limit results
  }, [query, listings, cities, mergedCategories, regions, t]);

  const addToRecent = (result: SearchResult) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.id !== result.id);
      const updated = [result, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("algarve-recent-searches", JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  };

  const clearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("algarve-recent-searches");
    } catch {
      // Ignore localStorage errors
    }
  };

  return {
    query,
    setQuery,
    results,
    recentSearches,
    addToRecent,
    clearRecent,
  };
}
