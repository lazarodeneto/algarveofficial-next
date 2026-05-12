import { cache } from "react";

import type { Tables } from "@/integrations/supabase/types";
import { getPublicPropertyListings } from "@/lib/public-data/properties";

export type RealEstateCategory = Pick<Tables<"categories">, "id" | "name" | "slug">;

export type RealEstateDirectoryListing = Pick<
  Tables<"listings">,
  | "id"
  | "slug"
  | "name"
  | "short_description"
  | "featured_image_url"
  | "updated_at"
  | "price_from"
  | "price_to"
  | "price_currency"
  | "tier"
  | "category_id"
  | "status"
  | "city_id"
  | "category_data"
  | "created_at"
> & {
  cities: { id: string; name: string; slug: string } | null;
};

export interface RealEstateDirectoryData {
  category: RealEstateCategory | null;
  listings: RealEstateDirectoryListing[];
  locale: string;
}

export const getRealEstateDirectoryData = cache(
  async (localeInput: string, limit = 48): Promise<RealEstateDirectoryData> => {
    const data = await getPublicPropertyListings({ locale: localeInput, limit });

    return {
      category: data.category,
      listings: data.listings.map((listing) => ({
        id: listing.id,
        slug: listing.slug,
        name: listing.name,
        short_description: listing.shortDescription,
        featured_image_url: listing.imageUrl,
        updated_at: listing.updatedAt ?? "",
        price_from: listing.priceFrom,
        price_to: listing.priceTo,
        price_currency: listing.priceCurrency,
        tier: listing.tier,
        category_id: listing.categoryId ?? "",
        status: listing.status,
        city_id: listing.cityId ?? "",
        category_data: listing.categoryData as Tables<"listings">["category_data"],
        created_at: listing.createdAt ?? "",
        cities: listing.city
          ? {
              id: listing.city.id,
              name: listing.city.name,
              slug: listing.city.slug,
            }
          : null,
      })),
      locale: localeInput,
    };
  },
);
