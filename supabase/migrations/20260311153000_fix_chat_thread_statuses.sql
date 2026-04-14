UPDATE public.chat_threads
SET status = 'closed'
WHERE status = 'archived';
ALTER TABLE public.chat_threads
DROP CONSTRAINT IF EXISTS chat_threads_status_check;
ALTER TABLE public.chat_threads
ADD CONSTRAINT chat_threads_status_check
CHECK (status IN ('active', 'closed', 'blocked'));
