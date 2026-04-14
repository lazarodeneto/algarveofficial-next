-- Migration: Admin Delete Listing RPC
-- Creates a SECURITY DEFINER function that cascades all listing dependencies
-- and deletes the listings themselves, bypassing RLS entirely.
-- Only callable by authenticated admins (enforced inside the function).

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
  -- Only allow admins to execute this function
  IF NOT public.is_admin_or_editor(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- 1. Events & Content
  DELETE FROM public.events           WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.reviews          WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.translation_jobs WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.listing_images   WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.listing_translations WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.listing_slugs    WHERE listing_id = ANY(listing_ids);

  -- 2. Analytics & Tracking
  DELETE FROM public.analytics_daily  WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.analytics_events WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.view_tracking    WHERE entity_id  = ANY(listing_ids);

  -- 3. Curated & Assignments
  DELETE FROM public.curated_assignments WHERE listing_id = ANY(listing_ids);

  -- 4. User Interactions & Claims
  DELETE FROM public.favorites        WHERE listing_id          = ANY(listing_ids);
  DELETE FROM public.listing_claims   WHERE listing_id          = ANY(listing_ids);
  DELETE FROM public.listing_claims   WHERE assigned_listing_id = ANY(listing_ids);

  -- 5. Communications — children first, then containers

  -- Legacy chat threads
  SELECT array_agg(id) INTO _thread_ids
  FROM public.chat_threads
  WHERE listing_id = ANY(listing_ids);

  IF _thread_ids IS NOT NULL THEN
    DELETE FROM public.chat_messages WHERE thread_id = ANY(_thread_ids);
  END IF;

  -- New conversations system
  SELECT array_agg(id) INTO _conversation_ids
  FROM public.conversations
  WHERE listing_id = ANY(listing_ids);

  IF _conversation_ids IS NOT NULL THEN
    DELETE FROM public.messages WHERE conversation_id = ANY(_conversation_ids);
  END IF;

  -- Containers
  DELETE FROM public.chat_threads  WHERE listing_id = ANY(listing_ids);
  DELETE FROM public.conversations WHERE listing_id = ANY(listing_ids);

  -- 6. Finally delete the listings
  DELETE FROM public.listings WHERE id = ANY(listing_ids);
END;
$$;
-- Revoke public execute, grant only to authenticated users
-- (the function itself enforces admin-only access)
REVOKE EXECUTE ON FUNCTION public.admin_delete_listings(uuid[]) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.admin_delete_listings(uuid[]) TO authenticated;
