export { getAllListings, getListingsByCategory, getListingsByCity } from "./get-listings-by-category";
import { getAllListings } from "./get-listings-by-category";

export async function getFeaturedListings(limit = 6) {
  return getAllListings(limit);
}

export interface ListingCard {
  id: string;
  name: string;
  slug: string;
  city_id?: string | null;
  category_id?: string | null;
  tier?: string | null;
  featured_image_url?: string | null;
  created_at?: string;
  short_description?: string | null;
  city_name?: string;
  city_slug?: string;
  category_name?: string;
}