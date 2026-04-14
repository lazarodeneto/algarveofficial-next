-- Redirect table for old slugs
CREATE TABLE public.listing_slugs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  slug text NOT NULL,
  is_current boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Each slug must be globally unique
CREATE UNIQUE INDEX idx_listing_slugs_slug ON public.listing_slugs (slug);
CREATE INDEX idx_listing_slugs_listing_id ON public.listing_slugs (listing_id);
-- Enable RLS
ALTER TABLE public.listing_slugs ENABLE ROW LEVEL SECURITY;
-- Public read access (needed for slug resolution)
CREATE POLICY "Anyone can read listing slugs"
  ON public.listing_slugs FOR SELECT
  USING (true);
-- Only admins can manage slugs
CREATE POLICY "Admins can manage listing slugs"
  ON public.listing_slugs FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
-- Populate with current slugs from listings
INSERT INTO public.listing_slugs (listing_id, slug, is_current)
SELECT id, slug, true FROM public.listings WHERE slug IS NOT NULL AND slug != ''
ON CONFLICT (slug) DO NOTHING;
-- Trigger: when a listing slug changes, archive the old one and insert the new one
CREATE OR REPLACE FUNCTION public.track_listing_slug_change()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.slug IS DISTINCT FROM NEW.slug AND NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    -- Mark old slug as not current
    UPDATE public.listing_slugs
    SET is_current = false
    WHERE listing_id = NEW.id AND is_current = true;

    -- Insert new current slug
    INSERT INTO public.listing_slugs (listing_id, slug, is_current)
    VALUES (NEW.id, NEW.slug, true)
    ON CONFLICT (slug) DO UPDATE SET is_current = true;
  END IF;
  RETURN NEW;
END;
$function$;
CREATE TRIGGER trg_track_listing_slug_change
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_listing_slug_change();
