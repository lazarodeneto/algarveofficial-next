import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface CuratedListingWithRelations extends Tables<'listings'> {
  city?: Tables<'cities'> | null;
  region?: Tables<'regions'> | null;
  category?: Tables<'categories'> | null;
}

// Public-safe fields for listings (excludes PII)
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

const PUBLIC_CITY_FIELDS = 'id, name, slug, short_description, image_url, latitude, longitude';
const PUBLIC_REGION_FIELDS = 'id, name, slug, short_description, image_url';
const PUBLIC_CATEGORY_FIELDS = 'id, name, slug, icon, short_description, image_url';

/**
 * Fetch curated listings from curated_assignments table (admin-assigned)
 * Falls back to homepage assignment if no context-specific assignment exists
 * 
 * @param contextType - 'homepage' | 'region' | 'category' | 'city'
 * @param contextId - The ID of the region/category/city (null for homepage)
 * @param limit - Maximum number of listings to return
 */
export function useCuratedAssignments(
  contextType: string,
  contextId: string | null,
  limit: number = 3
) {
  const isBrowser = typeof window !== "undefined";

  return useQuery({
    queryKey: ['curated-assignments', contextType, contextId, limit],
    queryFn: async () => {
      // First, try to fetch assignments for the specific context
      let query = supabase
        .from('curated_assignments')
        .select(`
          id,
          display_order,
          listing:listings(
            ${PUBLIC_LISTING_FIELDS},
            city:cities(${PUBLIC_CITY_FIELDS}),
            region:regions(${PUBLIC_REGION_FIELDS}),
            category:categories(${PUBLIC_CATEGORY_FIELDS})
          )
        `)
        .order('display_order', { ascending: true })
        .limit(limit);

      // Apply context filter
      if (contextType === 'homepage') {
        query = query.eq('context_type', 'homepage');
      } else if (contextId) {
        query = query.eq('context_type', contextType).eq('context_id', contextId);
      }

      const { data: contextAssignments, error: contextError } = await query;

      if (contextError) {
        throw contextError;
      }

      // Filter to only published, signature listings
      let validListings = (contextAssignments || [])
        .map(a => a.listing as unknown as CuratedListingWithRelations)
        .filter(listing => listing && listing.status === 'published' && listing.tier === 'signature');

      // If no listings found for specific context, fallback to homepage
      if (validListings.length === 0 && contextType !== 'homepage') {
        const { data: homepageAssignments, error: homepageError } = await supabase
          .from('curated_assignments')
          .select(`
            id,
            display_order,
            listing:listings(
              ${PUBLIC_LISTING_FIELDS},
              city:cities(${PUBLIC_CITY_FIELDS}),
              region:regions(${PUBLIC_REGION_FIELDS}),
              category:categories(${PUBLIC_CATEGORY_FIELDS})
            )
          `)
          .eq('context_type', 'homepage')
          .order('display_order', { ascending: true })
          .limit(limit);

        if (homepageError) {
          throw homepageError;
        }

        validListings = (homepageAssignments || [])
          .map(a => a.listing as unknown as CuratedListingWithRelations)
          .filter(listing => listing && listing.status === 'published' && listing.tier === 'signature');
      }

      return validListings.slice(0, limit);
    },
    enabled: isBrowser,
    initialData: [] as CuratedListingWithRelations[],
    staleTime: 1000 * 60, // Keep curated cards responsive to recent admin changes
    gcTime: 1000 * 60 * 30,
  });
}
