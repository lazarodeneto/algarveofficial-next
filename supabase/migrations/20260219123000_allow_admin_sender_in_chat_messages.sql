-- Allow admin-originated messages used by whatsapp-send and admin inbox replies
ALTER TABLE public.chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;
ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_type_check
CHECK (sender_type IN ('viewer', 'owner', 'admin', 'system'));
