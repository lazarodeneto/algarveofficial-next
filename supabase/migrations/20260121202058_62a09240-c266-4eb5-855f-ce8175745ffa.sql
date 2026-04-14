-- Add missing social media columns to listings table
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS telegram_url TEXT;
-- Add comments for documentation
COMMENT ON COLUMN public.listings.twitter_url IS 'X (Twitter) profile URL';
COMMENT ON COLUMN public.listings.linkedin_url IS 'LinkedIn profile/company URL';
COMMENT ON COLUMN public.listings.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN public.listings.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN public.listings.telegram_url IS 'Telegram channel/user URL';
-- Update the public_listings view to include the new social media columns
DROP VIEW IF EXISTS public.public_listings;
CREATE VIEW public.public_listings AS
SELECT 
  id,
  name,
  slug,
  short_description,
  description,
  category_id,
  city_id,
  region_id,
  address,
  latitude,
  longitude,
  featured_image_url,
  tags,
  tier,
  is_curated,
  status,
  published_at,
  view_count,
  price_from,
  price_to,
  price_currency,
  website_url,
  instagram_url,
  facebook_url,
  twitter_url,
  linkedin_url,
  youtube_url,
  tiktok_url,
  telegram_url,
  google_business_url,
  category_data,
  created_at,
  updated_at
FROM public.listings
WHERE status = 'published';
-- Grant access to the view
GRANT SELECT ON public.public_listings TO anon, authenticated;
