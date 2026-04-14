-- Fix email_campaigns RLS policies to allow admin/editor to manage campaigns
DROP POLICY IF EXISTS "email_campaigns_admin_select" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_campaigns_admin_insert" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_campaigns_admin_update" ON public.email_campaigns;
DROP POLICY IF EXISTS "email_campaigns_admin_delete" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;

-- Ensure RLS is enabled
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow admins/editors to view all campaigns
CREATE POLICY "email_campaigns_admin_select"
ON public.email_campaigns FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Allow admins/editors to create campaigns
CREATE POLICY "email_campaigns_admin_insert"
ON public.email_campaigns FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Allow admins/editors to update campaigns
CREATE POLICY "email_campaigns_admin_update"
ON public.email_campaigns FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Allow admins/editors to delete campaigns
CREATE POLICY "email_campaigns_admin_delete"
ON public.email_campaigns FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));;
