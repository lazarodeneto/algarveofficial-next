-- Normalize app-role authorization to public.user_roles and close broad branding writes.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'editor'::public.app_role);
$$;

DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can upload branding" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update branding" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete branding" ON storage.objects;

CREATE POLICY "Admins and editors can upload branding"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'branding' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update branding"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'branding' AND public.is_admin_or_editor(auth.uid()))
  WITH CHECK (bucket_id = 'branding' AND public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can delete branding"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'branding' AND public.is_admin_or_editor(auth.uid()));
