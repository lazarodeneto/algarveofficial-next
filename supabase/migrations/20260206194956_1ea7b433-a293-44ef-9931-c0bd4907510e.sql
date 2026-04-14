-- Remove unused tables from Realtime publication to reduce WAL overhead
-- Only chat_messages is actually subscribed to in the application code
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_threads;
ALTER PUBLICATION supabase_realtime DROP TABLE public.conversations;
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
