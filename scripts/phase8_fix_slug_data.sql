-- Phase 8: safe slug data correction.
--
-- Run manually after reviewing the output from scripts/audit-slugs.ts.
-- This script is intentionally conservative:
-- - it updates only listings with deterministic, conflict-free target slugs;
-- - it inserts old listing slugs into listing_slugs before changing listings.slug;
-- - it records every before/after decision in public.slug_data_correction_log;
-- - it logs non-listing public slug candidates for review instead of changing
--   them, because the app does not currently have a generic redirect resolver
--   for category/city/region/blog/event/page URLs.
--
-- Re-run safety: idempotent. Existing log rows and aliases are not duplicated.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '2min';

CREATE TABLE IF NOT EXISTS public.slug_data_correction_log (
  id bigserial PRIMARY KEY,
  run_key text NOT NULL,
  entity_table text NOT NULL,
  entity_id text NOT NULL,
  entity_name text,
  old_slug text,
  new_slug text,
  action text NOT NULL,
  reason text NOT NULL,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS slug_data_correction_log_dedupe_idx
  ON public.slug_data_correction_log (
    run_key,
    entity_table,
    entity_id,
    action,
    (COALESCE(old_slug, '')),
    (COALESCE(new_slug, ''))
  );

COMMENT ON TABLE public.slug_data_correction_log IS
  'Before/after audit log for deterministic slug data correction runs.';

CREATE OR REPLACE FUNCTION pg_temp.normalize_slug_sql(value text, max_length integer DEFAULT 120)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  WITH cleaned AS (
    SELECT lower(
      translate(
        regexp_replace(COALESCE(value, ''), '[''’‘`´]', '', 'g'),
        'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝŸýÿ',
        'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOOooooooUUUUuuuuYYyy'
      )
    ) AS value
  ),
  hyphenated AS (
    SELECT regexp_replace(value, '[^a-z0-9]+', '-', 'g') AS value
    FROM cleaned
  ),
  collapsed AS (
    SELECT trim(BOTH '-' FROM regexp_replace(value, '-+', '-', 'g')) AS value
    FROM hyphenated
  )
  SELECT regexp_replace(left(value, GREATEST(max_length, 1)), '-+$', '')
  FROM collapsed;
$$;

CREATE OR REPLACE FUNCTION pg_temp.slug_is_canonical(value text, max_length integer DEFAULT 120)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT value IS NOT NULL
    AND btrim(value) = value
    AND length(value) BETWEEN 1 AND max_length
    AND value ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
$$;

CREATE OR REPLACE FUNCTION pg_temp.proposed_slug(old_slug text, display_name text, max_length integer DEFAULT 120)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN old_slug IS NULL OR btrim(old_slug) = '' THEN
      pg_temp.normalize_slug_sql(display_name, max_length)
    WHEN btrim(old_slug) ~* '^(https?://|www\.)'
      OR btrim(old_slug) ~ '[/?#]'
      OR btrim(old_slug) ~* '^(en|pt-pt|fr|de|es|it|nl|sv|no|da)(/|$)' THEN
      pg_temp.normalize_slug_sql(display_name, max_length)
    ELSE
      pg_temp.normalize_slug_sql(old_slug, max_length)
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.invalid_slug_reason(value text, max_length integer DEFAULT 120)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN value IS NULL THEN 'slug is null'
    WHEN btrim(value) = '' THEN 'slug is empty'
    WHEN btrim(value) <> value THEN 'slug has leading or trailing whitespace'
    WHEN btrim(value) ~* '^(https?://|www\.)' THEN 'slug stores a full URL'
    WHEN btrim(value) ~* '^(en|pt-pt|fr|de|es|it|nl|sv|no|da)(/|$)' THEN 'slug stores a locale prefix'
    WHEN btrim(value) ~ '[/?#]' THEN 'slug stores a path, slash, query, or fragment'
    WHEN length(value) > max_length THEN 'slug exceeds canonical max length'
    WHEN value !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN 'slug is not lowercase ASCII hyphen form'
    ELSE 'slug needs review'
  END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.log_non_listing_slug_review(
  target_table regclass,
  display_column name,
  max_length integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  run_key constant text := '20260507120000_phase8_slug_data_fix';
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'id'
      AND NOT attisdropped
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = 'slug'
      AND NOT attisdropped
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = target_table
      AND attname = display_column
      AND NOT attisdropped
  ) THEN
    RETURN;
  END IF;

  EXECUTE format(
    $sql$
      INSERT INTO public.slug_data_correction_log (
        run_key,
        entity_table,
        entity_id,
        entity_name,
        old_slug,
        new_slug,
        action,
        reason,
        applied
      )
      SELECT
        %L,
        %L,
        id::text,
        %I::text,
        slug,
        pg_temp.proposed_slug(slug, %I::text, %s),
        'REVIEW_NON_LISTING_PUBLIC_SLUG',
        pg_temp.invalid_slug_reason(slug, %s) || '; manual redirect strategy required before changing this public URL',
        false
      FROM %s
      WHERE NOT pg_temp.slug_is_canonical(slug, %s)
      ON CONFLICT DO NOTHING
    $sql$,
    run_key,
    target_table::text,
    display_column,
    display_column,
    max_length,
    max_length,
    target_table,
    max_length
  );
END;
$$;

-- 1. Build a before/after table for listing slug fixes.
WITH listing_candidates AS (
  SELECT
    l.id,
    l.name,
    l.slug AS old_slug,
    pg_temp.proposed_slug(l.slug, l.name, 120) AS new_slug,
    pg_temp.invalid_slug_reason(l.slug, 120) AS reason
  FROM public.listings l
  WHERE NOT pg_temp.slug_is_canonical(l.slug, 120)
),
annotated AS (
  SELECT
    c.*,
    COUNT(*) OVER (PARTITION BY c.new_slug) AS candidate_target_count,
    EXISTS (
      SELECT 1
      FROM public.listings other
      WHERE other.id <> c.id
        AND other.slug = c.new_slug
    ) AS conflicts_listing_slug,
    EXISTS (
      SELECT 1
      FROM public.listing_slugs alias
      WHERE alias.listing_id <> c.id
        AND alias.slug = c.new_slug
    ) AS conflicts_listing_alias
  FROM listing_candidates c
),
classified AS (
  SELECT
    *,
    CASE
      WHEN NOT pg_temp.slug_is_canonical(new_slug, 120) THEN 'SKIP_LISTING_SLUG_NO_SAFE_TARGET'
      WHEN old_slug IS NOT DISTINCT FROM new_slug THEN 'SKIP_LISTING_SLUG_NO_CHANGE'
      WHEN candidate_target_count > 1 OR conflicts_listing_slug OR conflicts_listing_alias THEN 'SKIP_LISTING_SLUG_CONFLICT'
      ELSE 'UPDATE_LISTING_SLUG'
    END AS action
  FROM annotated
)
INSERT INTO public.slug_data_correction_log (
  run_key,
  entity_table,
  entity_id,
  entity_name,
  old_slug,
  new_slug,
  action,
  reason,
  applied
)
SELECT
  '20260507120000_phase8_slug_data_fix',
  'public.listings',
  id::text,
  name,
  old_slug,
  new_slug,
  action,
  CASE
    WHEN action = 'UPDATE_LISTING_SLUG' THEN reason
    WHEN action = 'SKIP_LISTING_SLUG_NO_SAFE_TARGET' THEN reason || '; no deterministic canonical target could be produced'
    WHEN action = 'SKIP_LISTING_SLUG_CONFLICT' THEN reason || '; target slug conflicts with another listing or alias'
    ELSE reason
  END,
  false
FROM classified
ON CONFLICT DO NOTHING;

-- 2. Create old-slug redirect rows before updating listings.slug.
INSERT INTO public.slug_data_correction_log (
  run_key,
  entity_table,
  entity_id,
  entity_name,
  old_slug,
  new_slug,
  action,
  reason,
  applied
)
SELECT
  '20260507120000_phase8_slug_data_fix',
  'public.listing_slugs',
  l.entity_id,
  l.entity_name,
  l.old_slug,
  l.new_slug,
  'INSERT_OLD_LISTING_REDIRECT',
  'preserve old listing URL before canonical slug update',
  false
FROM public.slug_data_correction_log l
WHERE l.run_key = '20260507120000_phase8_slug_data_fix'
  AND l.entity_table = 'public.listings'
  AND l.action = 'UPDATE_LISTING_SLUG'
  AND pg_temp.slug_is_canonical(l.old_slug, 120)
  AND l.old_slug <> l.new_slug
ON CONFLICT DO NOTHING;

WITH inserted AS (
  INSERT INTO public.listing_slugs (listing_id, slug, is_current)
  SELECT entity_id::uuid, old_slug, false
  FROM public.slug_data_correction_log
  WHERE run_key = '20260507120000_phase8_slug_data_fix'
    AND entity_table = 'public.listing_slugs'
    AND action = 'INSERT_OLD_LISTING_REDIRECT'
    AND applied = false
  ON CONFLICT (slug) DO NOTHING
  RETURNING listing_id::text AS entity_id, slug AS old_slug
)
UPDATE public.slug_data_correction_log log
SET applied = true
FROM inserted i
WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
  AND log.entity_table = 'public.listing_slugs'
  AND log.action = 'INSERT_OLD_LISTING_REDIRECT'
  AND log.entity_id = i.entity_id
  AND log.old_slug = i.old_slug;

-- 3. Update only safe listing slugs. The trigger from
-- 20260507093000_harden_listing_slug_aliases.sql also writes the current alias.
WITH updated AS (
  UPDATE public.listings listing
  SET slug = log.new_slug
  FROM public.slug_data_correction_log log
  WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
    AND log.entity_table = 'public.listings'
    AND log.action = 'UPDATE_LISTING_SLUG'
    AND log.applied = false
    AND listing.id = log.entity_id::uuid
    AND listing.slug IS NOT DISTINCT FROM log.old_slug
  RETURNING
    log.entity_id,
    log.old_slug,
    log.new_slug
)
UPDATE public.slug_data_correction_log log
SET applied = true
FROM updated u
WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
  AND log.entity_table = 'public.listings'
  AND log.action = 'UPDATE_LISTING_SLUG'
  AND log.entity_id = u.entity_id
  AND log.old_slug IS NOT DISTINCT FROM u.old_slug
  AND log.new_slug = u.new_slug;

-- If an old-slug alias already existed before the insert, mark the redirect
-- log as applied once the listing update trigger has made it non-current.
UPDATE public.slug_data_correction_log log
SET applied = true
WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
  AND log.entity_table = 'public.listing_slugs'
  AND log.action = 'INSERT_OLD_LISTING_REDIRECT'
  AND log.applied = false
  AND EXISTS (
    SELECT 1
    FROM public.listing_slugs alias
    WHERE alias.listing_id = log.entity_id::uuid
      AND alias.slug = log.old_slug
      AND alias.is_current = false
  );

-- 4. Backfill and normalize listing_slugs current aliases for already-clean
-- listing slugs. This keeps redirect resolution complete without changing
-- display names or inventing new slugs.
INSERT INTO public.slug_data_correction_log (
  run_key,
  entity_table,
  entity_id,
  entity_name,
  old_slug,
  new_slug,
  action,
  reason,
  applied
)
SELECT
  '20260507120000_phase8_slug_data_fix',
  'public.listing_slugs',
  l.id::text,
  l.name,
  NULL,
  l.slug,
  'INSERT_CURRENT_LISTING_ALIAS',
  'current listing_slugs alias missing',
  false
FROM public.listings l
WHERE pg_temp.slug_is_canonical(l.slug, 120)
  AND NOT EXISTS (
    SELECT 1
    FROM public.listing_slugs alias
    WHERE alias.slug = l.slug
  )
ON CONFLICT DO NOTHING;

WITH inserted AS (
  INSERT INTO public.listing_slugs (listing_id, slug, is_current)
  SELECT entity_id::uuid, new_slug, true
  FROM public.slug_data_correction_log
  WHERE run_key = '20260507120000_phase8_slug_data_fix'
    AND entity_table = 'public.listing_slugs'
    AND action = 'INSERT_CURRENT_LISTING_ALIAS'
    AND applied = false
  ON CONFLICT (slug) DO NOTHING
  RETURNING listing_id::text AS entity_id, slug AS new_slug
)
UPDATE public.slug_data_correction_log log
SET applied = true
FROM inserted i
WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
  AND log.entity_table = 'public.listing_slugs'
  AND log.action = 'INSERT_CURRENT_LISTING_ALIAS'
  AND log.entity_id = i.entity_id
  AND log.new_slug = i.new_slug;

-- Same reporting correction for current aliases that appeared through a
-- trigger or a prior idempotent run before this insert returned a row.
UPDATE public.slug_data_correction_log log
SET applied = true
WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
  AND log.entity_table = 'public.listing_slugs'
  AND log.action = 'INSERT_CURRENT_LISTING_ALIAS'
  AND log.applied = false
  AND EXISTS (
    SELECT 1
    FROM public.listing_slugs alias
    WHERE alias.listing_id = log.entity_id::uuid
      AND alias.slug = log.new_slug
      AND alias.is_current = true
  );

INSERT INTO public.slug_data_correction_log (
  run_key,
  entity_table,
  entity_id,
  entity_name,
  old_slug,
  new_slug,
  action,
  reason,
  applied
)
SELECT
  '20260507120000_phase8_slug_data_fix',
  'public.listing_slugs',
  alias.id::text,
  listing.name,
  alias.slug,
  listing.slug,
  'MARK_STALE_CURRENT_LISTING_ALIAS_NONCURRENT',
  'current alias does not match listings.slug; preserved as an old redirect',
  false
FROM public.listing_slugs alias
JOIN public.listings listing ON listing.id = alias.listing_id
WHERE alias.is_current = true
  AND pg_temp.slug_is_canonical(listing.slug, 120)
  AND alias.slug <> listing.slug
  AND EXISTS (
    SELECT 1
    FROM public.listing_slugs current_alias
    WHERE current_alias.listing_id = listing.id
      AND current_alias.slug = listing.slug
  )
ON CONFLICT DO NOTHING;

WITH updated AS (
  UPDATE public.listing_slugs alias
  SET is_current = false
  FROM public.slug_data_correction_log log
  WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
    AND log.entity_table = 'public.listing_slugs'
    AND log.action = 'MARK_STALE_CURRENT_LISTING_ALIAS_NONCURRENT'
    AND log.applied = false
    AND alias.id = log.entity_id::uuid
    AND alias.slug = log.old_slug
  RETURNING alias.id::text AS entity_id, alias.slug AS old_slug
)
UPDATE public.slug_data_correction_log log
SET applied = true
FROM updated u
WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
  AND log.entity_table = 'public.listing_slugs'
  AND log.action = 'MARK_STALE_CURRENT_LISTING_ALIAS_NONCURRENT'
  AND log.entity_id = u.entity_id
  AND log.old_slug = u.old_slug;

-- 5. Log non-listing public slug issues for manual redirect-safe handling.
DO $$
BEGIN
  IF to_regclass('public.categories') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.categories'::regclass, 'name', 80);
  END IF;
  IF to_regclass('public.cities') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.cities'::regclass, 'name', 80);
  END IF;
  IF to_regclass('public.regions') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.regions'::regclass, 'name', 80);
  END IF;
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.blog_posts'::regclass, 'title', 120);
  END IF;
  IF to_regclass('public.events') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.events'::regclass, 'title', 120);
  END IF;
  IF to_regclass('public.pages') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.pages'::regclass, 'title', 120);
  END IF;
  IF to_regclass('public.footer_sections') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.footer_sections'::regclass, 'title', 80);
  END IF;
  IF to_regclass('public.tags') IS NOT NULL THEN
    PERFORM pg_temp.log_non_listing_slug_review('public.tags'::regclass, 'name', 80);
  END IF;
END;
$$;

-- 6. Add/validate constraints and indexes only when data is clean.
DO $$
BEGIN
  IF to_regclass('public.listing_slugs') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM public.listing_slugs
       WHERE is_current = true
       GROUP BY listing_id
       HAVING count(*) > 1
     )
     AND NOT EXISTS (
       SELECT 1
       FROM pg_class
       WHERE relname = 'idx_listing_slugs_one_current_per_listing'
         AND relnamespace = 'public'::regnamespace
     ) THEN
    CREATE UNIQUE INDEX idx_listing_slugs_one_current_per_listing
      ON public.listing_slugs (listing_id)
      WHERE is_current = true;

    INSERT INTO public.slug_data_correction_log (
      run_key,
      entity_table,
      entity_id,
      action,
      reason,
      applied
    )
    VALUES (
      '20260507120000_phase8_slug_data_fix',
      'public.listing_slugs',
      'idx_listing_slugs_one_current_per_listing',
      'CREATE_ONE_CURRENT_LISTING_ALIAS_INDEX',
      'enforce one current listing slug alias per listing after data is clean',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION pg_temp.validate_slug_constraint_if_clean(
  target_table regclass,
  target_column name,
  constraint_name name,
  max_length integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  bad_count bigint;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = target_table
      AND conname = constraint_name
  ) THEN
    RETURN;
  END IF;

  EXECUTE format(
    'SELECT count(*) FROM %s WHERE NOT pg_temp.slug_is_canonical(%I, %s)',
    target_table,
    target_column,
    max_length
  )
  INTO bad_count;

  IF bad_count = 0 THEN
    EXECUTE format('ALTER TABLE %s VALIDATE CONSTRAINT %I', target_table, constraint_name);
  ELSE
    RAISE NOTICE 'Skipping %.% constraint validation: % non-canonical rows remain',
      target_table,
      target_column,
      bad_count;
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.listings') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.listings'::regclass, 'slug', 'listings_slug_canonical_chk', 120);
  END IF;
  IF to_regclass('public.listing_slugs') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.listing_slugs'::regclass, 'slug', 'listing_slugs_slug_canonical_chk', 120);
  END IF;
  IF to_regclass('public.categories') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.categories'::regclass, 'slug', 'categories_slug_canonical_chk', 80);
  END IF;
  IF to_regclass('public.cities') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.cities'::regclass, 'slug', 'cities_slug_canonical_chk', 80);
  END IF;
  IF to_regclass('public.regions') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.regions'::regclass, 'slug', 'regions_slug_canonical_chk', 80);
  END IF;
  IF to_regclass('public.pages') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.pages'::regclass, 'slug', 'pages_slug_canonical_chk', 120);
  END IF;
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.blog_posts'::regclass, 'slug', 'blog_posts_slug_canonical_chk', 120);
  END IF;
  IF to_regclass('public.events') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.events'::regclass, 'slug', 'events_slug_canonical_chk', 120);
  END IF;
  IF to_regclass('public.footer_sections') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.footer_sections'::regclass, 'slug', 'footer_sections_slug_canonical_chk', 80);
  END IF;
  IF to_regclass('public.tags') IS NOT NULL THEN
    PERFORM pg_temp.validate_slug_constraint_if_clean('public.tags'::regclass, 'slug', 'tags_slug_canonical_chk', 80);
  END IF;
END;
$$;

-- Before/after report for this run. Keep this result with deployment notes.
SELECT
  entity_table,
  entity_id,
  entity_name,
  old_slug,
  new_slug,
  action,
  reason,
  applied,
  created_at
FROM public.slug_data_correction_log
WHERE run_key = '20260507120000_phase8_slug_data_fix'
ORDER BY
  CASE WHEN applied THEN 0 ELSE 1 END,
  entity_table,
  action,
  entity_name NULLS LAST,
  entity_id;

COMMIT;
