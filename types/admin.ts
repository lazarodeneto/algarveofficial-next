export type ListingTier = "unverified" | "verified" | "signature";

export type PublishStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export interface User {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  role?: string | null;
}

export interface City {
  id: string;
  name: string;
  slug?: string | null;
  municipality?: string | null;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PremiumRegion {
  id: string;
  name: string;
  slug?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image_url?: string | null;
  short_description?: string | null;
  is_active?: boolean;
}
