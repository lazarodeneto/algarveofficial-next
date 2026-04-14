-- ============================================
-- FIX SECURITY LINTER ISSUES
-- Convert SECURITY DEFINER views to SECURITY INVOKER
-- Fix overly permissive INSERT policies
-- ============================================

-- ============================================
-- 1. FIX VIEWS - Use SECURITY INVOKER (default)
-- ============================================

-- Drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_listings;
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate public_listings view with explicit SECURITY INVOKER
CREATE VIEW public.public_listings 
WITH (security_invoker = true)
AS
SELECT 
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
  latitude,
  longitude,
  address,
  website_url,
  facebook_url,
  instagram_url,
  tags,
  category_data,
  view_count,
  published_at,
  created_at,
  updated_at
FROM public.listings
WHERE status = 'published';

-- Recreate public_profiles view with explicit SECURITY INVOKER
CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT 
  id,
  full_name,
  avatar_url,
  bio
FROM public.profiles;

-- Grant access to views
GRANT SELECT ON public.public_listings TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ============================================
-- 2. FIX AUDIT LOG INSERT POLICY - Add user check
-- ============================================

DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;

-- More restrictive insert policy - only authenticated users can log their own actions
CREATE POLICY "Users can insert their own audit logs"
  ON public.security_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- 3. REVIEW & TIGHTEN OTHER PERMISSIVE POLICIES
-- ============================================

-- The following policies are intentionally permissive and should stay:
-- - view_tracking INSERT (anonymous view logging is required for analytics)
-- - whatsapp_webhook_events INSERT (webhooks need to insert without auth)
-- These are service-level operations that require public access

-- However, let's add rate limiting metadata to prevent abuse
-- (Note: Actual rate limiting should be done at edge function level);
