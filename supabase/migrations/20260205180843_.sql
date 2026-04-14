-- Fix email_templates RLS policies to allow admin/editor to manage templates
DROP POLICY IF EXISTS "email_templates_admin_select" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_insert" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_update" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_delete" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

-- Ensure RLS is enabled
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Allow admins/editors to view all templates
CREATE POLICY "email_templates_admin_select"
ON public.email_templates FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Allow admins/editors to create templates
CREATE POLICY "email_templates_admin_insert"
ON public.email_templates FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Allow admins/editors to update templates
CREATE POLICY "email_templates_admin_update"
ON public.email_templates FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Allow admins/editors to delete templates
CREATE POLICY "email_templates_admin_delete"
ON public.email_templates FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));;
