-- Fix email_automations RLS policies to allow admin/editor to manage automations
DROP POLICY IF EXISTS "email_automations_admin_select" ON public.email_automations;
DROP POLICY IF EXISTS "email_automations_admin_insert" ON public.email_automations;
DROP POLICY IF EXISTS "email_automations_admin_update" ON public.email_automations;
DROP POLICY IF EXISTS "email_automations_admin_delete" ON public.email_automations;
DROP POLICY IF EXISTS "Admins can manage email automations" ON public.email_automations;
-- Ensure RLS is enabled
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
-- Allow admins/editors to view all automations
CREATE POLICY "email_automations_admin_select"
ON public.email_automations FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
-- Allow admins/editors to create automations
CREATE POLICY "email_automations_admin_insert"
ON public.email_automations FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));
-- Allow admins/editors to update automations
CREATE POLICY "email_automations_admin_update"
ON public.email_automations FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));
-- Allow admins/editors to delete automations
CREATE POLICY "email_automations_admin_delete"
ON public.email_automations FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
