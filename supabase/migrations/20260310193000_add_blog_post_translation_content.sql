ALTER TABLE public.blog_post_translations
ADD COLUMN IF NOT EXISTS content text;
CREATE OR REPLACE FUNCTION public.mark_blog_post_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.title IS DISTINCT FROM NEW.title
  OR OLD.excerpt IS DISTINCT FROM NEW.excerpt
  OR OLD.content IS DISTINCT FROM NEW.content
  OR OLD.seo_title IS DISTINCT FROM NEW.seo_title
  OR OLD.seo_description IS DISTINCT FROM NEW.seo_description THEN
    UPDATE public.blog_post_translations
    SET status = 'needs_review', updated_at = now()
    WHERE post_id = NEW.id AND status NOT IN ('needs_review', 'pending');
  END IF;
  RETURN NEW;
END;
$$;
