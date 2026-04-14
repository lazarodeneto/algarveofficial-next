-- Migration: Admin Delete Chats RPC
-- Creates SECURITY DEFINER functions for safely bypassing RLS
-- to completely delete message rows and thread containers.

CREATE OR REPLACE FUNCTION public.admin_delete_chat_thread(p_thread_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Ensure caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required to delete chat threads';
  END IF;

  -- 2. Delete child messages
  DELETE FROM public.chat_messages WHERE thread_id = p_thread_id;

  -- 3. Delete the thread container
  DELETE FROM public.chat_threads WHERE id = p_thread_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.admin_delete_chat_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Ensure caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'editor')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required to delete chat messages';
  END IF;

  -- 2. Delete the message 
  DELETE FROM public.chat_messages WHERE id = p_message_id;
END;
$$;
-- Revoke public execute
REVOKE EXECUTE ON FUNCTION public.admin_delete_chat_thread(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_chat_message(uuid) FROM PUBLIC;
-- Grant to authenticated users (role check executes inside)
GRANT EXECUTE ON FUNCTION public.admin_delete_chat_thread(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_chat_message(uuid) TO authenticated;
