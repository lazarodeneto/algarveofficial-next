-- Translation tables for Footer Sections, Footer Links, and Blog Posts
-- Mirrors the pattern used for category/city/region translations.

-- ── Footer Section Translations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.footer_section_translations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id     uuid        NOT NULL REFERENCES public.footer_sections(id) ON DELETE CASCADE,
  locale         text        NOT NULL,
  title          text        NOT NULL DEFAULT '',
  status         text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section_id, locale)
);
ALTER TABLE public.footer_section_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_footer_section_translations"
  ON public.footer_section_translations FOR SELECT USING (true);
CREATE POLICY "admin_write_footer_section_translations"
  ON public.footer_section_translations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','editor')
  ));
-- ── Footer Link Translations ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.footer_link_translations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id        uuid        NOT NULL REFERENCES public.footer_links(id) ON DELETE CASCADE,
  locale         text        NOT NULL,
  name           text        NOT NULL DEFAULT '',
  status         text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(link_id, locale)
);
ALTER TABLE public.footer_link_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_footer_link_translations"
  ON public.footer_link_translations FOR SELECT USING (true);
CREATE POLICY "admin_write_footer_link_translations"
  ON public.footer_link_translations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','editor')
  ));
-- ── Blog Post Translations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_post_translations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         uuid        NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  locale          text        NOT NULL,
  title           text        NOT NULL DEFAULT '',
  excerpt         text,
  seo_title       text,
  seo_description text,
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, locale)
);
ALTER TABLE public.blog_post_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_post_translations"
  ON public.blog_post_translations FOR SELECT USING (true);
CREATE POLICY "admin_write_blog_post_translations"
  ON public.blog_post_translations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','editor')
  ));
-- ── Auto-revision triggers ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_footer_section_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.title IS DISTINCT FROM NEW.title THEN
    UPDATE public.footer_section_translations
    SET status = 'needs_review', updated_at = now()
    WHERE section_id = NEW.id AND status NOT IN ('needs_review', 'pending');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER footer_sections_translations_needs_review
AFTER UPDATE ON public.footer_sections
FOR EACH ROW EXECUTE FUNCTION public.mark_footer_section_translations_needs_review();
CREATE OR REPLACE FUNCTION public.mark_footer_link_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public.footer_link_translations
    SET status = 'needs_review', updated_at = now()
    WHERE link_id = NEW.id AND status NOT IN ('needs_review', 'pending');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER footer_links_translations_needs_review
AFTER UPDATE ON public.footer_links
FOR EACH ROW EXECUTE FUNCTION public.mark_footer_link_translations_needs_review();
CREATE OR REPLACE FUNCTION public.mark_blog_post_translations_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.title IS DISTINCT FROM NEW.title
  OR OLD.excerpt IS DISTINCT FROM NEW.excerpt
  OR OLD.seo_title IS DISTINCT FROM NEW.seo_title
  OR OLD.seo_description IS DISTINCT FROM NEW.seo_description THEN
    UPDATE public.blog_post_translations
    SET status = 'needs_review', updated_at = now()
    WHERE post_id = NEW.id AND status NOT IN ('needs_review', 'pending');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER blog_posts_translations_needs_review
AFTER UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.mark_blog_post_translations_needs_review();
