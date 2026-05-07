-- Phase 5 slug hardening.
--
-- Existing schema already has global uniqueness for the public slug columns
-- used by current routes:
-- - listings.slug
-- - categories.slug
-- - cities.slug
-- - regions.slug
-- - pages.slug
-- - blog_posts.slug
-- - events.slug
-- - footer_sections.slug
-- - listing_slugs.slug
-- - tags.slug, when the legacy tags table exists
--
-- Add format checks as NOT VALID so the migration is safe on production data:
-- new and updated rows are protected immediately, while existing rows can be
-- validated after the slug audit/backfill has been run.

CREATE OR REPLACE FUNCTION pg_temp.add_canonical_slug_check(
  target_table regclass,
  target_column name,
  constraint_name name
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  canonical_slug_pattern constant text := '^[a-z0-9]+(-[a-z0-9]+)*$';
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = target_column
      AND NOT attisdropped
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = target_table
      AND conname = constraint_name
  ) THEN
    RETURN;
  END IF;

  EXECUTE format(
    'ALTER TABLE %s ADD CONSTRAINT %I CHECK (%I IS NOT NULL AND %I ~ %L) NOT VALID',
    target_table,
    constraint_name,
    target_column,
    target_column,
    canonical_slug_pattern
  );
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.listings') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.listings'::regclass, 'slug', 'listings_slug_canonical_chk');
  END IF;

  IF to_regclass('public.listing_slugs') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.listing_slugs'::regclass, 'slug', 'listing_slugs_slug_canonical_chk');
  END IF;

  IF to_regclass('public.categories') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.categories'::regclass, 'slug', 'categories_slug_canonical_chk');
  END IF;

  IF to_regclass('public.cities') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.cities'::regclass, 'slug', 'cities_slug_canonical_chk');
  END IF;

  IF to_regclass('public.regions') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.regions'::regclass, 'slug', 'regions_slug_canonical_chk');
  END IF;

  IF to_regclass('public.pages') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.pages'::regclass, 'slug', 'pages_slug_canonical_chk');
  END IF;

  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.blog_posts'::regclass, 'slug', 'blog_posts_slug_canonical_chk');
  END IF;

  IF to_regclass('public.events') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.events'::regclass, 'slug', 'events_slug_canonical_chk');
  END IF;

  IF to_regclass('public.footer_sections') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.footer_sections'::regclass, 'slug', 'footer_sections_slug_canonical_chk');
  END IF;

  IF to_regclass('public.tags') IS NOT NULL THEN
    PERFORM pg_temp.add_canonical_slug_check('public.tags'::regclass, 'slug', 'tags_slug_canonical_chk');
  END IF;
END;
$$;

-- After production data is clean, validate deliberately:
--
-- ALTER TABLE public.listings VALIDATE CONSTRAINT listings_slug_canonical_chk;
-- ALTER TABLE public.listing_slugs VALIDATE CONSTRAINT listing_slugs_slug_canonical_chk;
-- ALTER TABLE public.categories VALIDATE CONSTRAINT categories_slug_canonical_chk;
-- ALTER TABLE public.cities VALIDATE CONSTRAINT cities_slug_canonical_chk;
-- ALTER TABLE public.regions VALIDATE CONSTRAINT regions_slug_canonical_chk;
-- ALTER TABLE public.pages VALIDATE CONSTRAINT pages_slug_canonical_chk;
-- ALTER TABLE public.blog_posts VALIDATE CONSTRAINT blog_posts_slug_canonical_chk;
-- ALTER TABLE public.events VALIDATE CONSTRAINT events_slug_canonical_chk;
-- ALTER TABLE public.footer_sections VALIDATE CONSTRAINT footer_sections_slug_canonical_chk;
-- ALTER TABLE public.tags VALIDATE CONSTRAINT tags_slug_canonical_chk;
