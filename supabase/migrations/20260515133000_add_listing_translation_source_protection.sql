-- Add durable provenance for listing translations and protect manual rows from
-- automatic requeue/overwrite paths.

ALTER TABLE public.translation_jobs
  ADD COLUMN IF NOT EXISTS allow_manual_overwrite boolean;

UPDATE public.translation_jobs
SET allow_manual_overwrite = false
WHERE allow_manual_overwrite IS NULL;

ALTER TABLE public.translation_jobs
  ALTER COLUMN allow_manual_overwrite SET DEFAULT false,
  ALTER COLUMN allow_manual_overwrite SET NOT NULL;

ALTER TABLE public.listing_translations
  ADD COLUMN IF NOT EXISTS translation_source text;

ALTER TABLE public.listing_translations
  ALTER COLUMN translation_source SET DEFAULT 'automatic';

UPDATE public.listing_translations
SET translation_source = 'automatic'
WHERE translation_source IS NULL
   OR translation_source NOT IN ('manual', 'automatic');

UPDATE public.listing_translations lt
SET translation_source = 'manual'
WHERE lt.translation_status = 'edited'
   OR EXISTS (
     SELECT 1
     FROM public.translation_jobs tj
     WHERE tj.listing_id = lt.listing_id
       AND tj.target_lang = lt.language_code
       AND tj.status = 'edited'
   )
   OR EXISTS (
     SELECT 1
     FROM public.translation_jobs tj
     WHERE tj.listing_id = lt.listing_id
       AND tj.target_lang = lt.language_code
       AND lt.translation_status = 'reviewed'
       AND tj.status = 'reviewed'
       AND COALESCE(tj.attempts, 0) = 0
   );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.listing_translations'::regclass
      AND conname = 'listing_translations_translation_source_check'
  ) THEN
    ALTER TABLE public.listing_translations
      ADD CONSTRAINT listing_translations_translation_source_check
      CHECK (translation_source IN ('manual', 'automatic'));
  END IF;
END $$;

ALTER TABLE public.listing_translations
  ALTER COLUMN translation_source SET NOT NULL;

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
  protected_manual boolean;
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
    SELECT EXISTS (
      SELECT 1
      FROM public.listing_translations lt
      WHERE lt.listing_id = NEW.listing_id
        AND lt.language_code = t
        AND (
          lt.translation_source = 'manual'
          OR lt.translation_status = 'edited'
        )
    )
    INTO protected_manual;

    INSERT INTO public.translation_jobs (listing_id, target_lang, status, allow_manual_overwrite)
    VALUES (NEW.listing_id, t, 'queued', false)
    ON CONFLICT (listing_id, target_lang)
    DO UPDATE SET
      status = CASE
        WHEN protected_manual THEN public.translation_jobs.status
        ELSE 'queued'::public.translation_status
      END,
      attempts = CASE
        WHEN protected_manual THEN public.translation_jobs.attempts
        ELSE 0
      END,
      last_error = CASE
        WHEN protected_manual THEN public.translation_jobs.last_error
        ELSE NULL
      END,
      locked_at = NULL,
      allow_manual_overwrite = false,
      updated_at = CASE
        WHEN protected_manual THEN public.translation_jobs.updated_at
        ELSE now()
      END;

    INSERT INTO public.listing_translations (listing_id, language_code, title, translation_status, translation_source)
    VALUES (NEW.listing_id, t, NEW.title, 'queued', 'automatic')
    ON CONFLICT (listing_id, language_code)
    DO UPDATE SET
      translation_status = CASE
        WHEN public.listing_translations.translation_source = 'manual'
          OR public.listing_translations.translation_status = 'edited'
        THEN public.listing_translations.translation_status
        ELSE 'queued'::public.translation_status
      END,
      translation_source = CASE
        WHEN public.listing_translations.translation_source = 'manual'
          OR public.listing_translations.translation_status = 'edited'
        THEN public.listing_translations.translation_source
        ELSE 'automatic'
      END,
      updated_at = CASE
        WHEN public.listing_translations.translation_source = 'manual'
          OR public.listing_translations.translation_status = 'edited'
        THEN public.listing_translations.updated_at
        ELSE now()
      END;
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
    UPDATE public.translation_jobs tj
    SET
      status = 'queued',
      source_updated_at = v_now,
      sla_deadline = v_now + interval '2 hours',
      sla_priority = 100,
      allow_manual_overwrite = false,
      updated_at = v_now
    WHERE
      tj.listing_id = NEW.id
      AND tj.status IN ('auto', 'reviewed')
      AND (tj.source_updated_at IS NULL OR tj.source_updated_at < v_now)
      AND NOT EXISTS (
        SELECT 1
        FROM public.listing_translations lt
        WHERE lt.listing_id = tj.listing_id
          AND lt.language_code = tj.target_lang
          AND (
            lt.translation_source = 'manual'
            OR lt.translation_status = 'edited'
          )
      );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_listing_translations_needs_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
    OR OLD.short_description IS DISTINCT FROM NEW.short_description
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
    OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
  THEN
    UPDATE public.listing_translations
    SET
      translation_status = 'queued',
      translation_source = 'automatic',
      updated_at = now()
    WHERE listing_id = NEW.id
      AND language_code != 'en'
      AND translation_status IN ('auto', 'reviewed')
      AND translation_source <> 'manual';

    INSERT INTO public.translation_jobs (listing_id, target_lang, status, allow_manual_overwrite)
    SELECT NEW.id, t, 'queued', false
    FROM unnest(ARRAY['pt-pt','fr','de','es','it','nl','sv','no','da']) AS t
    ON CONFLICT (listing_id, target_lang)
    DO UPDATE SET
      status = CASE
        WHEN EXISTS (
          SELECT 1
          FROM public.listing_translations lt
          WHERE lt.listing_id = NEW.id
            AND lt.language_code = public.translation_jobs.target_lang
            AND (
              lt.translation_source = 'manual'
              OR lt.translation_status = 'edited'
            )
        )
        THEN public.translation_jobs.status
        ELSE 'queued'::public.translation_status
      END,
      attempts = CASE
        WHEN EXISTS (
          SELECT 1
          FROM public.listing_translations lt
          WHERE lt.listing_id = NEW.id
            AND lt.language_code = public.translation_jobs.target_lang
            AND (
              lt.translation_source = 'manual'
              OR lt.translation_status = 'edited'
            )
        )
        THEN public.translation_jobs.attempts
        ELSE 0
      END,
      last_error = CASE
        WHEN EXISTS (
          SELECT 1
          FROM public.listing_translations lt
          WHERE lt.listing_id = NEW.id
            AND lt.language_code = public.translation_jobs.target_lang
            AND (
              lt.translation_source = 'manual'
              OR lt.translation_status = 'edited'
            )
        )
        THEN public.translation_jobs.last_error
        ELSE NULL
      END,
      locked_at = NULL,
      allow_manual_overwrite = false,
      updated_at = CASE
        WHEN EXISTS (
          SELECT 1
          FROM public.listing_translations lt
          WHERE lt.listing_id = NEW.id
            AND lt.language_code = public.translation_jobs.target_lang
            AND (
              lt.translation_source = 'manual'
              OR lt.translation_status = 'edited'
            )
        )
        THEN public.translation_jobs.updated_at
        ELSE now()
      END;
  END IF;
  RETURN NEW;
END;
$$;
