-- Migration to support contact form inquiries
-- Created: 2026-02-16

-- 1. Make listing_id and viewer_id nullable in chat_threads
ALTER TABLE public.chat_threads 
ALTER COLUMN listing_id DROP NOT NULL,
ALTER COLUMN viewer_id DROP NOT NULL;
-- 2. Add contact fields for guest inquiries
ALTER TABLE public.chat_threads 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;
-- 3. Update RLS policies to allow public inserts for contact form
-- We refine existing policies to allow NULL viewer_id for guests

-- chat_threads: allow insert if owner_id is an admin when viewer_id is null
DROP POLICY IF EXISTS "chat_threads_viewer_insert" ON public.chat_threads;
CREATE POLICY "chat_threads_viewer_insert" ON public.chat_threads
FOR INSERT WITH CHECK (
  (viewer_id = auth.uid()) OR -- Existing authenticated logic
  (
    viewer_id IS NULL AND 
    contact_name IS NOT NULL AND 
    contact_email IS NOT NULL AND 
    owner_id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
  ) -- Guest contact form logic
);
-- chat_messages: allow public insert if thread is a guest thread (viewer_id is NULL)
DROP POLICY IF EXISTS "chat_messages_participant_insert" ON public.chat_messages;
CREATE POLICY "chat_messages_participant_insert" ON public.chat_messages
FOR INSERT WITH CHECK (
  (can_access_thread(thread_id, auth.uid())) OR 
  (EXISTS (
    SELECT 1 FROM public.chat_threads 
    WHERE id = thread_id AND viewer_id IS NULL
  ))
);
-- Ensure admins can still see these messages
-- The existing chat_threads_viewer_select already allows is_admin_or_editor(auth.uid()) or owner_id = auth.uid()
-- The existing chat_messages_participant_select already allows is_admin_or_editor(auth.uid()) or can_access_thread;
