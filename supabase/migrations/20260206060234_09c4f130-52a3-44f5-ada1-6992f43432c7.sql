-- Create rate limiting table for admin bulk operations
CREATE TABLE IF NOT EXISTS public.admin_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Create index for efficient lookups
CREATE INDEX idx_admin_rate_limits_lookup 
ON public.admin_rate_limits (user_id, operation_type, created_at DESC);
-- Enable RLS
ALTER TABLE public.admin_rate_limits ENABLE ROW LEVEL SECURITY;
-- Admin-only access
CREATE POLICY "Admins can view rate limits"
ON public.admin_rate_limits
FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));
-- Rate limit check function (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  _user_id UUID,
  _operation_type TEXT,
  _max_operations INTEGER,
  _window_hours INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
  _window_start TIMESTAMPTZ;
  _oldest_in_window TIMESTAMPTZ;
BEGIN
  _window_start := now() - (_window_hours || ' hours')::INTERVAL;
  
  -- Count operations in window
  SELECT COUNT(*), MIN(created_at)
  INTO _count, _oldest_in_window
  FROM public.admin_rate_limits
  WHERE user_id = _user_id
    AND operation_type = _operation_type
    AND created_at > _window_start;
  
  IF _count >= _max_operations THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', _count,
      'max_allowed', _max_operations,
      'window_hours', _window_hours,
      'retry_after_seconds', EXTRACT(EPOCH FROM (_oldest_in_window + (_window_hours || ' hours')::INTERVAL - now()))::INTEGER
    );
  END IF;
  
  -- Record this operation
  INSERT INTO public.admin_rate_limits (user_id, operation_type)
  VALUES (_user_id, _operation_type);
  
  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', _count + 1,
    'max_allowed', _max_operations,
    'window_hours', _window_hours
  );
END;
$$;
-- Cleanup old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_rate_limits
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;
-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_admin_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits() TO authenticated;
-- Add comment
COMMENT ON TABLE public.admin_rate_limits IS 'Tracks admin bulk operations for rate limiting (DoS protection)';
