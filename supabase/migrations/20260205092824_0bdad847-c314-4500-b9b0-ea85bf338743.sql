-- Fix admin/editor permissions for curated assignments by using user_roles (not JWT 'role' claim)

-- 1) Update role helper functions to support RBAC via public.user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (
    (auth.jwt() ->> 'role') IN ('admin','editor')
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = ANY (ARRAY['admin','editor']::public.app_role[])
    )
  );
$$;
CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT (
    (auth.jwt() ->> 'role') IN ('admin','editor')
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = ANY (ARRAY['admin','editor']::public.app_role[])
    )
  );
$$;
-- 2) Ensure curated_assignments has correct RLS policies for admin/editor writes
ALTER TABLE public.curated_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS curated_assignments_admin_insert ON public.curated_assignments;
DROP POLICY IF EXISTS curated_assignments_admin_update ON public.curated_assignments;
DROP POLICY IF EXISTS curated_assignments_admin_delete ON public.curated_assignments;
CREATE POLICY curated_assignments_admin_insert
ON public.curated_assignments
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor());
CREATE POLICY curated_assignments_admin_update
ON public.curated_assignments
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor())
WITH CHECK (public.is_admin_or_editor());
CREATE POLICY curated_assignments_admin_delete
ON public.curated_assignments
FOR DELETE
TO authenticated
USING (public.is_admin_or_editor());
