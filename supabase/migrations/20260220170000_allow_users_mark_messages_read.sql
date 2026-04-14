-- Allow users and owners to mark their own inbound messages as read.
-- Without this policy, useMarkThreadMessagesAsRead silently fails for non-admin users
-- because the only UPDATE-capable policy is the admin FOR ALL policy.

CREATE POLICY "Recipients can mark their messages as read"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
-- The original "Service can manage messages" policy uses has_role(_, 'admin')
-- but chat_threads admin policy uses is_admin_or_editor(). Editors can manage
-- threads but not messages — fix this so editors can also delete/update messages.

DROP POLICY IF EXISTS "Service can manage messages" ON public.chat_messages;
CREATE POLICY "Admins and editors can manage all messages"
  ON public.chat_messages FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
