-- Fix listings_content_changed trigger: replace non-existent seo_title/seo_description
-- columns with the actual column names meta_title/meta_description.

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
    OLD.meta_title        IS DISTINCT FROM NEW.meta_title        OR
    OLD.meta_description  IS DISTINCT FROM NEW.meta_description
  ) THEN
    RETURN NEW;
  END IF;

  -- ── Bump content version ─────────────────────────────────────────────────────
  NEW.content_updated_at := v_now;

  -- ── Signature tier: auto-requeue outdated done jobs ──────────────────────────
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

  RETURN NEW;
END;
$$;
