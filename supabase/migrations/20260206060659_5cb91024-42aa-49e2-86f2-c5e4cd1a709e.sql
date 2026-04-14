-- Drop old policies that use JWT role claim
DROP POLICY IF EXISTS "cookie_banner_settings_admin_insert" ON public.cookie_banner_settings;
DROP POLICY IF EXISTS "cookie_banner_settings_admin_update" ON public.cookie_banner_settings;
DROP POLICY IF EXISTS "cookie_banner_settings_admin_delete" ON public.cookie_banner_settings;
-- Create new policies using the proper role check function
CREATE POLICY "cookie_banner_settings_admin_insert"
ON public.cookie_banner_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "cookie_banner_settings_admin_update"
ON public.cookie_banner_settings
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "cookie_banner_settings_admin_delete"
ON public.cookie_banner_settings
FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
