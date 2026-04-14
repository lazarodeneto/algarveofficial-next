
-- Allow thread participants to SELECT messages in their threads
CREATE POLICY "chat_messages_participant_select"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  public.can_access_thread(thread_id, auth.uid())
  OR public.is_admin_or_editor(auth.uid())
);

-- Allow thread participants to INSERT messages in their threads
CREATE POLICY "chat_messages_participant_insert"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_access_thread(thread_id, auth.uid())
  OR public.is_admin_or_editor(auth.uid())
);
;
