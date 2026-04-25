-- Add featured_rank column for manual listing pinning
-- Allows admin to pin specific listings to top of search results
-- Lower number = higher priority (1 = highest)
-- NULL = not featured (uses normal ranking)

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS featured_rank INTEGER CHECK (featured_rank IS NULL OR featured_rank > 0);

CREATE INDEX IF NOT EXISTS idx_listings_featured_rank ON public.listings(featured_rank) WHERE featured_rank IS NOT NULL;

-- Note: RLS policy for featured_rank should match existing tier/status policies
-- Admin users can update, public read-only users can only read (filtered)