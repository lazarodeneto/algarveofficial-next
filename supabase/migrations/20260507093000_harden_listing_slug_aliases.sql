-- Keep listing_slugs aligned for inserts and updates so old public URLs can
-- resolve to the current canonical listing slug.
CREATE OR REPLACE FUNCTION public.track_listing_slug_change()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NOT NULL AND btrim(NEW.slug) <> '' THEN
      UPDATE public.listing_slugs
      SET is_current = false
      WHERE listing_id = NEW.id;

      INSERT INTO public.listing_slugs (listing_id, slug, is_current)
      VALUES (NEW.id, NEW.slug, true)
      ON CONFLICT (slug) DO UPDATE
      SET
        listing_id = EXCLUDED.listing_id,
        is_current = true
      WHERE public.listing_slugs.listing_id = EXCLUDED.listing_id;
    END IF;

    RETURN NEW;
  END IF;

  IF OLD.slug IS DISTINCT FROM NEW.slug AND NEW.slug IS NOT NULL AND btrim(NEW.slug) <> '' THEN
    UPDATE public.listing_slugs
    SET is_current = false
    WHERE listing_id = NEW.id;

    IF OLD.slug IS NOT NULL AND btrim(OLD.slug) <> '' THEN
      INSERT INTO public.listing_slugs (listing_id, slug, is_current)
      VALUES (NEW.id, OLD.slug, false)
      ON CONFLICT (slug) DO NOTHING;
    END IF;

    INSERT INTO public.listing_slugs (listing_id, slug, is_current)
    VALUES (NEW.id, NEW.slug, true)
    ON CONFLICT (slug) DO UPDATE
    SET
      listing_id = EXCLUDED.listing_id,
      is_current = true
    WHERE public.listing_slugs.listing_id = EXCLUDED.listing_id;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_track_listing_slug_change ON public.listings;

CREATE TRIGGER trg_track_listing_slug_change
  AFTER INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_listing_slug_change();

INSERT INTO public.listing_slugs (listing_id, slug, is_current)
SELECT l.id, l.slug, true
FROM public.listings l
WHERE l.slug IS NOT NULL
  AND btrim(l.slug) <> ''
ON CONFLICT (slug) DO NOTHING;
