-- Fix RLS policies for all remaining email marketing tables

-- 1. email_events (tracks opens, clicks, bounces)
DROP POLICY IF EXISTS "email_events_admin_select" ON public.email_events;
DROP POLICY IF EXISTS "email_events_admin_insert" ON public.email_events;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_events_admin_select"
ON public.email_events FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_events_admin_insert"
ON public.email_events FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));
-- 2. campaign_recipients
DROP POLICY IF EXISTS "campaign_recipients_admin_select" ON public.campaign_recipients;
DROP POLICY IF EXISTS "campaign_recipients_admin_insert" ON public.campaign_recipients;
DROP POLICY IF EXISTS "campaign_recipients_admin_update" ON public.campaign_recipients;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_recipients_admin_select"
ON public.campaign_recipients FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "campaign_recipients_admin_insert"
ON public.campaign_recipients FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "campaign_recipients_admin_update"
ON public.campaign_recipients FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));
-- 3. email_contacts
DROP POLICY IF EXISTS "email_contacts_admin_select" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_admin_insert" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_admin_update" ON public.email_contacts;
DROP POLICY IF EXISTS "email_contacts_admin_delete" ON public.email_contacts;
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_contacts_admin_select"
ON public.email_contacts FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_contacts_admin_insert"
ON public.email_contacts FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_contacts_admin_update"
ON public.email_contacts FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_contacts_admin_delete"
ON public.email_contacts FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
-- 4. email_segments
DROP POLICY IF EXISTS "email_segments_admin_select" ON public.email_segments;
DROP POLICY IF EXISTS "email_segments_admin_insert" ON public.email_segments;
DROP POLICY IF EXISTS "email_segments_admin_update" ON public.email_segments;
DROP POLICY IF EXISTS "email_segments_admin_delete" ON public.email_segments;
ALTER TABLE public.email_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_segments_admin_select"
ON public.email_segments FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_segments_admin_insert"
ON public.email_segments FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_segments_admin_update"
ON public.email_segments FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "email_segments_admin_delete"
ON public.email_segments FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
