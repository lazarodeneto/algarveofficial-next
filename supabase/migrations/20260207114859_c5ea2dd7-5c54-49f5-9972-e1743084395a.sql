-- Fix homepage_settings UPDATE policy to use user_roles table instead of JWT claims
DROP POLICY IF EXISTS "homepage_settings_admin_update" ON public.homepage_settings;
CREATE POLICY "homepage_settings_admin_update" ON public.homepage_settings
  FOR UPDATE USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
-- Fix INSERT policy too
DROP POLICY IF EXISTS "homepage_settings_admin_insert" ON public.homepage_settings;
CREATE POLICY "homepage_settings_admin_insert" ON public.homepage_settings
  FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));
-- Fix DELETE policy
DROP POLICY IF EXISTS "homepage_settings_admin_delete" ON public.homepage_settings;
CREATE POLICY "homepage_settings_admin_delete" ON public.homepage_settings
  FOR DELETE USING (public.is_admin_or_editor(auth.uid()));
