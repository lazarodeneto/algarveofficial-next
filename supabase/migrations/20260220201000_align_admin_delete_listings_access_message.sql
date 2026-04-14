-- Align admin_delete_listings access error message with actual RBAC check.
-- Access remains admin/editor, matching is_admin_or_editor(auth.uid()).

CREATE OR REPLACE FUNCTION public.admin_delete_listings(listing_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _thread_ids uuid[];
  _conversation_ids uuid[];
BEGIN
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin/editor role required';
  END IF;

  DELETE FROM public.events               WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.reviews              WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.translation_jobs     WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.listing_images       WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.listing_translations WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.listing_slugs        WHERE listing_id = ANY(listing_ids);

  DELETE FROM public.analytics_daily      WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.analytics_events     WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.view_tracking        WHERE entity_id  = ANY(listing_ids);

  DELETE FROM public.curated_assignments  WHERE listing_id = ANY(listing_ids);

  DELETE FROM public.favorites            WHERE listing_id          = ANY(listing_ids);
  DELETE FROM public.listing_claims       WHERE listing_id          = ANY(listing_ids);
  DELETE FROM public.listing_claims       WHERE assigned_listing_id = ANY(listing_ids);

  SELECT array_agg(id) INTO _thread_ids
  FROM public.chat_threads
  WHERE listing_id = ANY(listing_ids);

  IF _thread_ids IS NOT NULL THEN
    DELETE FROM public.chat_messages WHERE thread_id = ANY(_thread_ids);
  END IF;

  SELECT array_agg(id) INTO _conversation_ids
  FROM public.conversations
  WHERE listing_id = ANY(listing_ids);

  IF _conversation_ids IS NOT NULL THEN
    DELETE FROM public.messages WHERE conversation_id = ANY(_conversation_ids);
  END IF;

  DELETE FROM public.chat_threads  WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.conversations WHERE listing_id = ANY(listing_ids);

  DELETE FROM public.listings WHERE id = ANY(listing_ids);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.admin_delete_listings(uuid[]) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.admin_delete_listings(uuid[]) TO authenticated;
