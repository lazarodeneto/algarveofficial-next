CREATE OR REPLACE FUNCTION public.mark_thread_messages_read(p_thread_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_thread public.chat_threads%ROWTYPE;
  v_sender_type text;
  v_updated_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO v_thread
  FROM public.chat_threads
  WHERE id = p_thread_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Thread not found';
  END IF;

  IF public.is_admin_or_editor(v_user_id) THEN
    v_sender_type := 'admin';
  ELSIF v_thread.viewer_id = v_user_id THEN
    v_sender_type := 'viewer';
  ELSIF v_thread.owner_id = v_user_id THEN
    v_sender_type := 'owner';
  ELSE
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.chat_messages
  SET delivery_status = 'read'
  WHERE thread_id = p_thread_id
    AND sender_type <> v_sender_type
    AND delivery_status <> 'read'
    AND (
      recipient_id = v_user_id
      OR recipient_id IS NULL
    );

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_thread_messages_read(uuid) TO authenticated;
