import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import { getPublicListingsByCategory } from "@/lib/public-data/listings";
import type {
  PublicListingDTO,
  PublicPropertyDTO,
  PublicPropertyDetailsDTO,
  PublicPropertyListingDTO,
} from "@/lib/public-data/types";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export type PublicPropertyCategoryDTO = Pick<Tables<"categories">, "id" | "name" | "slug">;

const CANONICAL_REAL_ESTATE_CATEGORY_SLUG = "real-estate";

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNestedPropertyData(categoryData: unknown): Record<string, unknown> {
  return toRecord(toRecord(categoryData).property);
}

function getPropertyValue(categoryData: unknown, key: string): unknown {
  const data = toRecord(categoryData);
  return data[key] ?? getNestedPropertyData(categoryData)[key];
}

export function resolvePublicPropertyDetails(categoryData: unknown): PublicPropertyDetailsDTO {
  const areaSqm =
    toNumber(getPropertyValue(categoryData, "property_size_m2")) ??
    toNumber(getPropertyValue(categoryData, "area_sqm"));
  const plotSqm =
    toNumber(getPropertyValue(categoryData, "plot_size_m2")) ??
    toNumber(getPropertyValue(categoryData, "plot_sqm"));

  return {
    propertyType: toString(getPropertyValue(categoryData, "property_type")),
    bedrooms: toNumber(getPropertyValue(categoryData, "bedrooms")),
    bathrooms: toNumber(getPropertyValue(categoryData, "bathrooms")),
    areaSqm,
    plotSqm,
    areaSquareMeters: areaSqm,
    plotSquareMeters: plotSqm,
  };
}

function resolvePropertyPrice(listing: PublicListingDTO): number | null {
  return (
    toNumber(listing.priceFrom) ??
    toNumber(getPropertyValue(listing.categoryData, "price")) ??
    null
  );
}

function resolvePropertyCurrency(listing: PublicListingDTO, price: number | null): string | null {
  if (price === null) return null;
  return (
    toString(listing.priceCurrency) ??
    toString(getPropertyValue(listing.categoryData, "currency"))
  );
}

export function normalizePublicProperty(listing: PublicListingDTO): PublicPropertyDTO {
  const details = resolvePublicPropertyDetails(listing.categoryData);
  const price = resolvePropertyPrice(listing);

  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.name,
    city: listing.location.city,
    region: listing.location.region,
    price,
    currency: resolvePropertyCurrency(listing, price),
    bedrooms: details.bedrooms,
    bathrooms: details.bathrooms,
    areaSqm: details.areaSqm,
    imageUrl: listing.imageUrl,
    href: `/listing/${listing.slug}`,
  };
}

export const getPublicPropertyListings = cache(
  async (options: { locale?: string; limit?: number } = {}): Promise<{
    category: PublicPropertyCategoryDTO | null;
    listings: PublicPropertyListingDTO[];
  }> => {
    const supabase = createPublicServerClient();
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", CANONICAL_REAL_ESTATE_CATEGORY_SLUG)
      .eq("is_active", true)
      .maybeSingle();
    const listings = await getPublicListingsByCategory(CANONICAL_REAL_ESTATE_CATEGORY_SLUG, {
      locale: options.locale,
      limit: options.limit ?? 48,
      includeReviewsSummary: false,
    });
    const category =
      categoryRow
        ? {
            id: categoryRow.id,
            name: categoryRow.name,
            slug: categoryRow.slug,
          }
        : listings[0]?.category
          ? {
              id: listings[0].category.id,
              name: listings[0].category.name,
              slug: listings[0].category.slug,
            }
          : null;

    return {
      category,
      listings: listings.map((listing) => ({
        ...listing,
        property: resolvePublicPropertyDetails(listing.categoryData),
      })),
    };
  },
);

export const getPublicProperties = cache(
  async (options: { locale?: string; limit?: number } = {}): Promise<{
    category: PublicPropertyCategoryDTO | null;
    properties: PublicPropertyDTO[];
  }> => {
    const data = await getPublicPropertyListings(options);

    return {
      category: data.category,
      properties: data.listings.map(normalizePublicProperty),
    };
  },
);
