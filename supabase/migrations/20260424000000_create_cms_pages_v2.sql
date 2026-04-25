-- CMS v2: structured page config table
-- Coexists alongside legacy cms_page_configs_v1 and cms_documents tables.

CREATE TABLE IF NOT EXISTS public.cms_pages_v2 (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  locale           text        NOT NULL DEFAULT 'en',
  page_key         text        NOT NULL,
  title            text        NOT NULL,
  status           text        NOT NULL DEFAULT 'draft',
  schema_version   integer     NOT NULL DEFAULT 2,
  page_type        text        NOT NULL,
  config           jsonb       NOT NULL DEFAULT '{}'::jsonb,
  published_config jsonb,
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT cms_pages_v2_locale_page_key_unique UNIQUE (locale, page_key),
  CONSTRAINT cms_pages_v2_status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT cms_pages_v2_page_type_check CHECK (page_type IN ('homepage', 'category_page', 'city_page', 'landing_page', 'editorial_page'))
);

CREATE INDEX IF NOT EXISTS cms_pages_v2_locale_page_key_idx ON public.cms_pages_v2 (locale, page_key);
CREATE INDEX IF NOT EXISTS cms_pages_v2_status_idx          ON public.cms_pages_v2 (status);
CREATE INDEX IF NOT EXISTS cms_pages_v2_page_type_idx       ON public.cms_pages_v2 (page_type);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS cms_pages_v2_set_updated_at ON public.cms_pages_v2;
CREATE TRIGGER cms_pages_v2_set_updated_at
  BEFORE UPDATE ON public.cms_pages_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.cms_pages_v2 ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published pages
CREATE POLICY cms_pages_v2_public_read
  ON public.cms_pages_v2
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admin/service_role: full access
CREATE POLICY cms_pages_v2_admin_all
  ON public.cms_pages_v2
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

GRANT SELECT ON public.cms_pages_v2 TO anon, authenticated;
GRANT ALL ON public.cms_pages_v2 TO service_role;