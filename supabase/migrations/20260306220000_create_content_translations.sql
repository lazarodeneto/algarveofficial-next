-- ─────────────────────────────────────────────────────────────────────────────
-- Translation tables for CMS content: categories, cities, regions
-- + auto-revision triggers: EN change → mark translations as needs_review
-- + listings auto-revision: source listing change → queue retranslation
-- ─────────────────────────────────────────────────────────────────────────────

-- Status: pending (no translation), auto (GPT), reviewed (human), needs_review (EN changed), failed
-- ─────────────────────────────────────────────────────────────────────────────
-- CATEGORY TRANSLATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.category_translations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  locale            TEXT        NOT NULL,
  name              TEXT,
  description       TEXT,
  short_description TEXT,
  meta_title        TEXT,
  meta_description  TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, locale)
);
CREATE INDEX idx_category_translations_cat    ON public.category_translations(category_id);
CREATE INDEX idx_category_translations_locale ON public.category_translations(locale);
CREATE INDEX idx_category_translations_status ON public.category_translations(status);
-- ─────────────────────────────────────────────────────────────────────────────
-- CITY TRANSLATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.city_translations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id           UUID        NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  locale            TEXT        NOT NULL,
  name              TEXT,
  description       TEXT,
  short_description TEXT,
  meta_title        TEXT,
  meta_description  TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (city_id, locale)
);
CREATE INDEX idx_city_translations_city   ON public.city_translations(city_id);
CREATE INDEX idx_city_translations_locale ON public.city_translations(locale);
CREATE INDEX idx_city_translations_status ON public.city_translations(status);
-- ─────────────────────────────────────────────────────────────────────────────
-- REGION TRANSLATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE public.region_translations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id         UUID        NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  locale            TEXT        NOT NULL,
  name              TEXT,
  description       TEXT,
  short_description TEXT,
  meta_title        TEXT,
  meta_description  TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (region_id, locale)
);
CREATE INDEX idx_region_translations_region ON public.region_translations(region_id);
CREATE INDEX idx_region_translations_locale ON public.region_translations(locale);
CREATE INDEX idx_region_translations_status ON public.region_translations(status);
-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at triggers for translation tables
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TRIGGER category_translations_updated_at
  BEFORE UPDATE ON public.category_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER city_translations_updated_at
  BEFORE UPDATE ON public.city_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER region_translations_updated_at
  BEFORE UPDATE ON public.region_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-REVISION: when EN source content changes, mark translations as needs_review
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_category_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.short_description IS DISTINCT FROM NEW.short_description
    OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
    OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
  THEN
    UPDATE public.category_translations
    SET status = 'needs_review', updated_at = now()
    WHERE category_id = NEW.id AND status IN ('auto', 'reviewed');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER categories_translations_needs_review
  AFTER UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.mark_category_translations_needs_review();
-- ──

CREATE OR REPLACE FUNCTION public.mark_city_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.short_description IS DISTINCT FROM NEW.short_description
    OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
    OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
  THEN
    UPDATE public.city_translations
    SET status = 'needs_review', updated_at = now()
    WHERE city_id = NEW.id AND status IN ('auto', 'reviewed');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER cities_translations_needs_review
  AFTER UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.mark_city_translations_needs_review();
-- ──

CREATE OR REPLACE FUNCTION public.mark_region_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.short_description IS DISTINCT FROM NEW.short_description
    OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
    OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
  THEN
    UPDATE public.region_translations
    SET status = 'needs_review', updated_at = now()
    WHERE region_id = NEW.id AND status IN ('auto', 'reviewed');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER regions_translations_needs_review
  AFTER UPDATE ON public.regions
  FOR EACH ROW EXECUTE FUNCTION public.mark_region_translations_needs_review();
-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO-REVISION FOR LISTINGS: when listings source changes, queue retranslation
-- The existing queue_jobs_only_on_change trigger fires on listing_translations.en updates.
-- This new trigger fires on the listings table itself, so direct edits to
-- listings.name/description/meta also trigger retranslation.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_listing_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
    OR OLD.short_description IS DISTINCT FROM NEW.short_description
    OR OLD.description IS DISTINCT FROM NEW.description
    OR OLD.meta_title IS DISTINCT FROM NEW.meta_title
    OR OLD.meta_description IS DISTINCT FROM NEW.meta_description
  THEN
    -- Mark existing non-EN translations as queued (needs retranslation)
    UPDATE public.listing_translations
    SET translation_status = 'queued', updated_at = now()
    WHERE listing_id = NEW.id
      AND language_code != 'en'
      AND translation_status IN ('auto', 'reviewed');

    -- Queue translation jobs
    INSERT INTO public.translation_jobs (listing_id, target_lang, status)
    SELECT NEW.id, t, 'queued'
    FROM unnest(ARRAY['pt-pt','fr','de','es','it','nl','sv','no','da']) AS t
    ON CONFLICT (listing_id, target_lang)
    DO UPDATE SET
      status = 'queued',
      attempts = 0,
      last_error = null,
      locked_at = null,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER listings_mark_translations_needs_review
  AFTER UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.mark_listing_translations_needs_review();
-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_translations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_translations    ENABLE ROW LEVEL SECURITY;
-- Public read
CREATE POLICY "public_read_category_translations"
  ON public.category_translations FOR SELECT USING (true);
CREATE POLICY "public_read_city_translations"
  ON public.city_translations FOR SELECT USING (true);
CREATE POLICY "public_read_region_translations"
  ON public.region_translations FOR SELECT USING (true);
-- Admin write (service role bypasses RLS for edge functions)
CREATE POLICY "admin_write_category_translations"
  ON public.category_translations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin_write_city_translations"
  ON public.city_translations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admin_write_region_translations"
  ON public.region_translations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
