
-- Drop all existing policies on analytics_events
DROP POLICY IF EXISTS "analytics_events_admin_only" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_delete_safe" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert_safe" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_update_safe" ON public.analytics_events;

-- Admin-only SELECT
CREATE POLICY "analytics_events_admin_select"
ON public.analytics_events FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Allow anonymous inserts (tracking events from visitors)
CREATE POLICY "analytics_events_anon_insert"
ON public.analytics_events FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated inserts (tracking events from logged-in users)
CREATE POLICY "analytics_events_auth_insert"
ON public.analytics_events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin-only UPDATE
CREATE POLICY "analytics_events_admin_update"
ON public.analytics_events FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Admin-only DELETE
CREATE POLICY "analytics_events_admin_delete"
ON public.analytics_events FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
;
