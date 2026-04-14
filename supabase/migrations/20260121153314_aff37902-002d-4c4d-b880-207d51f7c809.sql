-- Create view tracking table for session-based deduplication
CREATE TABLE public.view_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('listing', 'blog_post')),
  entity_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, session_id)
);
-- Enable RLS
ALTER TABLE public.view_tracking ENABLE ROW LEVEL SECURITY;
-- Anyone can log unique views (INSERT only, no read access except admins)
CREATE POLICY "Anyone can log unique views"
  ON public.view_tracking FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins can view tracking data"
  ON public.view_tracking FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Create index for faster lookups
CREATE INDEX idx_view_tracking_entity ON public.view_tracking(entity_type, entity_id, session_id);
CREATE INDEX idx_view_tracking_created ON public.view_tracking(created_at);
-- Replace increment_listing_views with session-based version
CREATE OR REPLACE FUNCTION public.increment_listing_views(
  _listing_id UUID,
  _session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inserted BOOLEAN;
BEGIN
  -- Only count unique session views
  INSERT INTO public.view_tracking (entity_type, entity_id, session_id)
  VALUES ('listing', _listing_id, _session_id)
  ON CONFLICT (entity_type, entity_id, session_id) DO NOTHING;
  
  GET DIAGNOSTICS _inserted = ROW_COUNT;
  
  IF _inserted > 0 THEN
    UPDATE public.listings
    SET view_count = view_count + 1
    WHERE id = _listing_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
-- Replace increment_blog_views with session-based version
CREATE OR REPLACE FUNCTION public.increment_blog_views(
  _post_id UUID,
  _session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inserted BOOLEAN;
BEGIN
  -- Only count unique session views
  INSERT INTO public.view_tracking (entity_type, entity_id, session_id)
  VALUES ('blog_post', _post_id, _session_id)
  ON CONFLICT (entity_type, entity_id, session_id) DO NOTHING;
  
  GET DIAGNOSTICS _inserted = ROW_COUNT;
  
  IF _inserted > 0 THEN
    UPDATE public.blog_posts
    SET views = views + 1
    WHERE id = _post_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
-- Add data retention: function to cleanup old tracking data (>90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_view_tracking()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.view_tracking 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
