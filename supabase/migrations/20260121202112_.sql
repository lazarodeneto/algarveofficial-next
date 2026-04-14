-- Fix security definer view issue by recreating with security_invoker
DROP VIEW IF EXISTS public.public_listings;

CREATE VIEW public.public_listings 
WITH (security_invoker = true)
AS
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

-- Also fix public_profiles view if it has the same issue
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;;
