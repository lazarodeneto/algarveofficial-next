-- 020_rls_policies.sql
-- Row Level Security policies for core tables
-- Run this migration to enable RLS on: listings, cities, categories, regions, profiles, listing_images

-- ═══════════════════════════════════════════════════════════════════════════════
-- LISTINGS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public read ONLY for published listings
CREATE POLICY "Public read published listings"
ON public.listings
FOR SELECT
USING (status = 'published');

-- Owner read own listings
CREATE POLICY "Owner read own listings"
ON public.listings
FOR SELECT
USING (auth.uid() = owner_id);

-- Owner insert own listings
CREATE POLICY "Owner insert own listings"
ON public.listings
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owner update own listings
CREATE POLICY "Owner update own listings"
ON public.listings
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Service role full access
CREATE POLICY "Service role full access"
ON public.listings
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- CITIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Public read all cities
CREATE POLICY "Public read cities"
ON public.cities
FOR SELECT
USING (true);

-- Service role full access (admin writes)
CREATE POLICY "Service role write cities"
ON public.cities
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read all categories
CREATE POLICY "Public read categories"
ON public.categories
FOR SELECT
USING (true);

-- Service role full access (admin writes)
CREATE POLICY "Service role write categories"
ON public.categories
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- REGIONS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Public read all regions
CREATE POLICY "Public read regions"
ON public.regions
FOR SELECT
USING (true);

-- Service role full access (admin writes)
CREATE POLICY "Service role write regions"
ON public.regions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users read own profile
CREATE POLICY "User read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users update own profile
CREATE POLICY "User update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role full access
CREATE POLICY "Service role full profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- LISTING_IMAGES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;

-- Public read images for published listings only
CREATE POLICY "Public read published listing images"
ON public.listing_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_images.listing_id
    AND l.status = 'published'
  )
);

-- Owner read images for own listings
CREATE POLICY "Owner read own listing images"
ON public.listing_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_images.listing_id
    AND l.owner_id = auth.uid()
  )
);

-- Service role full access
CREATE POLICY "Service role write listing images"
ON public.listing_images
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');