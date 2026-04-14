-- =====================================================
-- FIX FINAL SECURITY ISSUES
-- =====================================================

-- 1. Add RLS policies for chat_threads (missing policies)
-- Viewers can see their own threads
CREATE POLICY "chat_threads_viewer_select"
  ON public.chat_threads FOR SELECT
  USING (
    viewer_id = auth.uid() 
    OR owner_id = auth.uid()
    OR public.is_admin_or_editor(auth.uid())
  );
-- Viewers can create threads
CREATE POLICY "chat_threads_viewer_insert"
  ON public.chat_threads FOR INSERT
  WITH CHECK (viewer_id = auth.uid());
-- Participants can update their own threads (for unread counts)
CREATE POLICY "chat_threads_participant_update"
  ON public.chat_threads FOR UPDATE
  USING (
    viewer_id = auth.uid() 
    OR owner_id = auth.uid()
    OR public.is_admin_or_editor(auth.uid())
  );
-- 2. Revoke authenticated access to materialized view (only anon was revoked)
REVOKE SELECT ON public.mv_views_daily FROM authenticated;
-- 3. Create a regular view for daily views that authenticated users can use
-- This ensures the materialized view isn't exposed via the API
CREATE OR REPLACE VIEW public.views_daily_stats
WITH (security_invoker = on) AS
SELECT 
  entity_type,
  entity_id,
  day,
  views
FROM public.mv_views_daily
WHERE public.is_admin_or_editor(auth.uid());
GRANT SELECT ON public.views_daily_stats TO authenticated;
