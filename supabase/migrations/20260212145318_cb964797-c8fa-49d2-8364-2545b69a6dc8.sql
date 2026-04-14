-- Drop old policies
DROP POLICY IF EXISTS "events_admin_insert" ON public.events;
DROP POLICY IF EXISTS "events_admin_update" ON public.events;
DROP POLICY IF EXISTS "events_admin_delete" ON public.events;
-- Admin/editor can insert
CREATE POLICY "events_admin_insert" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()) OR auth.uid() = submitter_id);
-- Admin/editor can update any; submitter can update own
CREATE POLICY "events_admin_update" ON public.events
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()) OR auth.uid() = submitter_id)
  WITH CHECK (public.is_admin_or_editor(auth.uid()) OR auth.uid() = submitter_id);
-- Admin/editor can delete
CREATE POLICY "events_admin_delete" ON public.events
  FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
