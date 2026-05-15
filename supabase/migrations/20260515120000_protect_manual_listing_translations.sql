-- Protect human-entered listing translations from background automatic jobs.

ALTER TABLE public.translation_jobs
  ADD COLUMN IF NOT EXISTS allow_manual_overwrite boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.translation_jobs.allow_manual_overwrite IS
  'Set only by an explicit admin confirmation when automatic translation may replace an edited/manual listing translation.';

CREATE OR REPLACE FUNCTION public.queue_jobs_only_on_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
DECLARE
  new_hash text;
  old_hash text;
  t text;
  targets text[] := ARRAY['pt-pt','fr','de','es','it','nl','sv','no','da'];
BEGIN
  IF (NEW.language_code <> 'en') THEN
    RETURN NEW;
  END IF;

  new_hash := public.hash_en_translation(
    NEW.title,
    NEW.short_description,
    NEW.description,
    NEW.seo_title,
    NEW.seo_description
  );

  IF (TG_OP = 'UPDATE') THEN
    old_hash := public.hash_en_translation(
      OLD.title,
      OLD.short_description,
      OLD.description,
      OLD.seo_title,
      OLD.seo_description
    );
    IF (new_hash = old_hash) THEN
      NEW.source_hash := new_hash;
      RETURN NEW;
    END IF;
  END IF;

  FOREACH t IN ARRAY targets LOOP
    INSERT INTO public.translation_jobs (listing_id, target_lang, status, allow_manual_overwrite)
    VALUES (NEW.listing_id, t, 'queued', false)
    ON CONFLICT (listing_id, target_lang)
    DO UPDATE SET
      status = CASE
        WHEN public.translation_jobs.status = 'edited' THEN public.translation_jobs.status
        ELSE 'queued'::public.translation_status
      END,
      attempts = CASE
        WHEN public.translation_jobs.status = 'edited' THEN public.translation_jobs.attempts
        ELSE 0
      END,
      last_error = CASE
        WHEN public.translation_jobs.status = 'edited' THEN public.translation_jobs.last_error
        ELSE NULL
      END,
      locked_at = NULL,
      allow_manual_overwrite = false,
      updated_at = now();

    INSERT INTO public.listing_translations (listing_id, language_code, title, translation_status)
    VALUES (NEW.listing_id, t, NEW.title, 'queued')
    ON CONFLICT (listing_id, language_code)
    DO UPDATE SET
      translation_status = CASE
        WHEN public.listing_translations.translation_status = 'edited' THEN public.listing_translations.translation_status
        ELSE 'queued'::public.translation_status
      END,
      updated_at = now();
  END LOOP;

  NEW.source_hash := new_hash;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.listings_content_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
BEGIN
  IF NOT (
    OLD.name              IS DISTINCT FROM NEW.name              OR
    OLD.description       IS DISTINCT FROM NEW.description       OR
    OLD.short_description IS DISTINCT FROM NEW.short_description OR
    OLD.meta_title        IS DISTINCT FROM NEW.meta_title        OR
    OLD.meta_description  IS DISTINCT FROM NEW.meta_description
  ) THEN
    RETURN NEW;
  END IF;

  NEW.content_updated_at := v_now;

  IF NEW.tier = 'signature' THEN
    UPDATE public.translation_jobs
    SET
      status = 'queued',
      source_updated_at = v_now,
      sla_deadline = v_now + interval '2 hours',
      sla_priority = 100,
      allow_manual_overwrite = false,
      updated_at = v_now
    WHERE
      listing_id = NEW.id
      AND status IN ('auto', 'reviewed')
      AND (source_updated_at IS NULL OR source_updated_at < v_now);
  END IF;

  RETURN NEW;
END;
$$;
