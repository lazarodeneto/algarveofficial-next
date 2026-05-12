import type { Tables } from "@/integrations/supabase/types";

export type PublicListingTier = Tables<"listings">["tier"];
export type PublicListingStatus = Tables<"listings">["status"];
export type PublicListingClaimStatus = Tables<"listings">["claim_status"];

export type PublicLocationDTO = {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type PublicPlaceRefDTO = {
  id: string;
  name: string;
  slug: string;
};

export type PublicCategoryDTO = PublicPlaceRefDTO & {
  icon: string | null;
  imageUrl: string | null;
};

export type PublicResolvedCategoryDTO = PublicCategoryDTO & {
  canonicalSlug: string;
  canonicalUrlSlug: string;
  memberIds: string[];
  memberSlugs: string[];
  pillar?: string | null;
};

export type CategoryResolution =
  | {
      ok: true;
      category: PublicResolvedCategoryDTO;
    }
  | {
      ok: false;
      reason: "not_found" | "redirect_required";
      redirectTo?: string;
    };

export type PublicRatingSummaryDTO = {
  averageRating: number | null;
  reviewCount: number | null;
  source: "native" | "external" | "combined" | "none";
  externalRating?: number | null;
  externalReviewCount?: number | null;
  nativeAverageRating?: number | null;
  nativeReviewCount?: number | null;
};

export type PublicReviewsSummaryDTO = PublicRatingSummaryDTO & {
  nativeAverage: number | null;
  nativeCount: number;
  googleRating: number | null;
  googleReviewCount: number | null;
  displayRating: number | null;
  displayReviewCount: number;
  displaySource: PublicRatingSummaryDTO["source"];
};

export type PublicListingDTO = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  imageUrl: string | null;
  status: PublicListingStatus;
  tier: PublicListingTier;
  isCurated: boolean;
  category: PublicCategoryDTO | null;
  categoryId: string | null;
  city: PublicPlaceRefDTO | null;
  cityId: string | null;
  region: PublicPlaceRefDTO | null;
  regionId: string | null;
  location: PublicLocationDTO;
  address: string | null;
  websiteUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  priceCurrency: string | null;
  googleBusinessUrl: string | null;
  reviews: PublicReviewsSummaryDTO;
  tags: string[];
  categoryData: unknown;
  claimStatus: PublicListingClaimStatus | null;
  publishedAt: string | null;
  updatedAt: string | null;
  createdAt: string | null;
};

export type PublicMapListingDTO = PublicListingDTO & {
  location: PublicLocationDTO & {
    latitude: number;
    longitude: number;
  };
};

export type PublicPropertyDetailsDTO = {
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  plotSqm: number | null;
  /** @deprecated Use areaSqm for new public property DTOs. */
  areaSquareMeters: number | null;
  /** @deprecated Use plotSqm for new public property DTOs. */
  plotSquareMeters: number | null;
};

export type PublicPropertyListingDTO = PublicListingDTO & {
  property: PublicPropertyDetailsDTO;
};

export type PublicPropertyDTO = {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  region: string | null;
  price: number | null;
  currency: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  imageUrl: string | null;
  href: string;
};

export type PublicCategoryCountsDTO = {
  byCategoryId: Record<string, number>;
  byCategorySlug: Record<string, number>;
  byCanonicalCategoryId: Record<string, number>;
  byCanonicalCategorySlug: Record<string, number>;
  byMemberCategoryId: Record<string, number>;
  byMemberCategorySlug: Record<string, number>;
};

export type PublicCategoryCityCountDTO = {
  id: string;
  slug: string;
  name: string;
  count: number;
};
