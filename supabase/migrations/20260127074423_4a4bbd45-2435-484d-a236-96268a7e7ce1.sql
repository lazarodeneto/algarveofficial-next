-- Add admin management policy for chat_threads (UPDATE and DELETE)
-- This allows admins to moderate threads (change status, block, etc.)

CREATE POLICY "Admins can manage chat threads"
  ON public.chat_threads FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- Also add participant UPDATE policy for status changes by participants
CREATE POLICY "Participants can update their threads"
  ON public.chat_threads FOR UPDATE
  TO authenticated
  USING (viewer_id = auth.uid() OR owner_id = auth.uid())
  WITH CHECK (viewer_id = auth.uid() OR owner_id = auth.uid());
