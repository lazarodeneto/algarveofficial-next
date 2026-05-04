-- Fix live/local drift for cms_pages_v2 where policies exist but RLS is disabled.
-- The table is not currently used by runtime CMS rendering, but public tables with
-- policies must have RLS enabled so draft CMS pages stay protected if queried.

ALTER TABLE public.cms_pages_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cms_pages_v2_public_read ON public.cms_pages_v2;
CREATE POLICY cms_pages_v2_public_read
  ON public.cms_pages_v2
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS cms_pages_v2_admin_all ON public.cms_pages_v2;
CREATE POLICY cms_pages_v2_admin_all
  ON public.cms_pages_v2
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

GRANT SELECT ON public.cms_pages_v2 TO anon, authenticated;
GRANT ALL ON public.cms_pages_v2 TO service_role;
