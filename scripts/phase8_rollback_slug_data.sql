-- Rollback helper for scripts/phase8_fix_slug_data.sql.
--
-- This rollback is best-effort and intentionally limited to rows recorded in
-- public.slug_data_correction_log for the Phase 8 run key. It restores listing
-- slugs that were changed by the script and removes current aliases that the
-- script inserted only for backfill. Old redirect rows created for changed
-- listings are left in place where possible so already-indexed URLs continue
-- to resolve after rollback.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '2min';

-- Validated slug constraints may block restoring an old invalid slug. Drop and
-- re-add them as NOT VALID so existing legacy data can be restored while future
-- writes are still protected.
ALTER TABLE IF EXISTS public.listings
  DROP CONSTRAINT IF EXISTS listings_slug_canonical_chk;

ALTER TABLE IF EXISTS public.listing_slugs
  DROP CONSTRAINT IF EXISTS listing_slugs_slug_canonical_chk;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.slug_data_correction_log
    WHERE run_key = '20260507120000_phase8_slug_data_fix'
      AND entity_table = 'public.listing_slugs'
      AND entity_id = 'idx_listing_slugs_one_current_per_listing'
      AND action = 'CREATE_ONE_CURRENT_LISTING_ALIAS_INDEX'
      AND applied = true
  ) THEN
    DROP INDEX IF EXISTS public.idx_listing_slugs_one_current_per_listing;

    UPDATE public.slug_data_correction_log
    SET applied = false
    WHERE run_key = '20260507120000_phase8_slug_data_fix'
      AND entity_table = 'public.listing_slugs'
      AND entity_id = 'idx_listing_slugs_one_current_per_listing'
      AND action = 'CREATE_ONE_CURRENT_LISTING_ALIAS_INDEX';
  END IF;
END;
$$;

WITH reverted AS (
  UPDATE public.listings listing
  SET slug = log.old_slug
  FROM public.slug_data_correction_log log
  WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
    AND log.entity_table = 'public.listings'
    AND log.action = 'UPDATE_LISTING_SLUG'
    AND log.applied = true
    AND listing.id = log.entity_id::uuid
    AND listing.slug = log.new_slug
  RETURNING
    log.id AS log_id,
    listing.id::text AS entity_id,
    log.new_slug AS rollback_from_slug,
    log.old_slug AS rollback_to_slug
)
UPDATE public.slug_data_correction_log log
SET applied = false
FROM reverted r
WHERE log.id = r.log_id;

WITH deleted AS (
  DELETE FROM public.listing_slugs alias
  USING public.slug_data_correction_log log
  WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
    AND log.entity_table = 'public.listing_slugs'
    AND log.action = 'INSERT_CURRENT_LISTING_ALIAS'
    AND log.applied = true
    AND alias.listing_id = log.entity_id::uuid
    AND alias.slug = log.new_slug
  RETURNING log.id AS log_id
)
UPDATE public.slug_data_correction_log log
SET applied = false
FROM deleted d
WHERE log.id = d.log_id;

WITH restored_current_aliases AS (
  UPDATE public.listing_slugs alias
  SET is_current = true
  FROM public.slug_data_correction_log log
  WHERE log.run_key = '20260507120000_phase8_slug_data_fix'
    AND log.entity_table = 'public.listing_slugs'
    AND log.action = 'MARK_STALE_CURRENT_LISTING_ALIAS_NONCURRENT'
    AND log.applied = true
    AND alias.id = log.entity_id::uuid
    AND alias.slug = log.old_slug
  RETURNING log.id AS log_id
)
UPDATE public.slug_data_correction_log log
SET applied = false
FROM restored_current_aliases restored
WHERE log.id = restored.log_id;

-- Re-add the same NOT VALID checks introduced during Phase 5. Existing rows
-- are not validated here because rollback may intentionally restore legacy
-- invalid slugs.
ALTER TABLE IF EXISTS public.listings
  ADD CONSTRAINT listings_slug_canonical_chk
  CHECK (slug IS NOT NULL AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  NOT VALID;

ALTER TABLE IF EXISTS public.listing_slugs
  ADD CONSTRAINT listing_slugs_slug_canonical_chk
  CHECK (slug IS NOT NULL AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  NOT VALID;

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
  entity_table,
  action,
  entity_name NULLS LAST,
  entity_id;

COMMIT;
