-- ─── Translation Invalidation + Requeue System ───────────────────────────────
-- Tracks content versions so translations can be detected as outdated and
-- automatically (Signature) or manually (Verified) re-queued.

-- ── 1. Version column on listings ─────────────────────────────────────────────
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS content_updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Backfill: use updated_at as baseline for existing rows
UPDATE public.listings
SET content_updated_at = COALESCE(updated_at, NOW())
WHERE content_updated_at = NOW() AND updated_at IS NOT NULL;

-- ── 2. Source-version column on translation_jobs ───────────────────────────────
ALTER TABLE public.translation_jobs
  ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ DEFAULT NULL;

-- ── 3. Indexes ─────────────────────────────────────────────────────────────────

-- Fast outdated-job scan: listing_id + source_updated_at for jobs with a version
CREATE INDEX IF NOT EXISTS translation_jobs_source_updated_idx
  ON public.translation_jobs (listing_id, source_updated_at)
  WHERE source_updated_at IS NOT NULL;

-- Fast listing version lookups
CREATE INDEX IF NOT EXISTS listings_content_updated_at_idx
  ON public.listings (content_updated_at);

-- ── 4. Trigger function: detect translatable field changes ────────────────────
--
-- Add / remove columns in the IF block below to match your listings schema.
-- Translatable fields typically include: name, description, short_description,
-- seo_title, seo_description, amenities, highlights (adjust as needed).
--
CREATE OR REPLACE FUNCTION public.listings_content_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- ── Only proceed when a translatable field actually changed ──────────────────
  IF NOT (
    OLD.name              IS DISTINCT FROM NEW.name              OR
    OLD.description       IS DISTINCT FROM NEW.description       OR
    OLD.short_description IS DISTINCT FROM NEW.short_description OR
    OLD.seo_title         IS DISTINCT FROM NEW.seo_title         OR
    OLD.seo_description   IS DISTINCT FROM NEW.seo_description
  ) THEN
    RETURN NEW;
  END IF;

  -- ── Bump content version ─────────────────────────────────────────────────────
  NEW.content_updated_at := v_now;

  -- ── Signature tier: auto-requeue outdated done jobs ──────────────────────────
  -- Done jobs whose source snapshot is behind the new content version are stale.
  -- Re-set status to 'queued' and apply fresh SLA.
  IF NEW.tier = 'signature' THEN
    UPDATE public.translation_jobs
    SET
      status            = 'queued',
      source_updated_at = v_now,
      sla_deadline      = v_now + INTERVAL '2 hours',
      sla_priority      = 100,
      updated_at        = v_now
    WHERE
      listing_id        = NEW.id
      AND status        IN ('auto', 'reviewed', 'edited')
      AND (source_updated_at IS NULL OR source_updated_at < v_now);
  END IF;

  -- ── Verified tier: leave jobs untouched; UI shows "Outdated" badge ───────────
  -- Manual re-translate is triggered from the Translation Dashboard.

  RETURN NEW;
END;
$$;

-- ── 5. Attach trigger ─────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS listings_content_changed_trigger ON public.listings;

CREATE TRIGGER listings_content_changed_trigger
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.listings_content_changed();

-- ── 6. Column comments ────────────────────────────────────────────────────────
COMMENT ON COLUMN public.listings.content_updated_at IS
  'Bumped whenever a translatable field (name, description, SEO fields) changes.
   Used to detect stale translation_jobs.';

COMMENT ON COLUMN public.translation_jobs.source_updated_at IS
  'Snapshot of listings.content_updated_at at the time this job was enqueued.
   If source_updated_at < listings.content_updated_at the translation is outdated.';
