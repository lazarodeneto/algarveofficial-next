CREATE OR REPLACE FUNCTION public.increment_listing_views(
  _listing_id uuid,
  _session_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row_count integer;
BEGIN
  INSERT INTO public.view_tracking (entity_type, entity_id, session_id)
  VALUES ('listing', _listing_id, _session_id)
  ON CONFLICT (entity_type, entity_id, session_id) DO NOTHING;

  GET DIAGNOSTICS _row_count = ROW_COUNT;

  IF _row_count > 0 THEN
    UPDATE public.listings
    SET view_count = view_count + 1
    WHERE id = _listing_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_blog_views(
  _post_id uuid,
  _session_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row_count integer;
BEGIN
  INSERT INTO public.view_tracking (entity_type, entity_id, session_id)
  VALUES ('blog_post', _post_id, _session_id)
  ON CONFLICT (entity_type, entity_id, session_id) DO NOTHING;

  GET DIAGNOSTICS _row_count = ROW_COUNT;

  IF _row_count > 0 THEN
    UPDATE public.blog_posts
    SET views = views + 1
    WHERE id = _post_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
NOTIFY pgrst, 'reload schema';
