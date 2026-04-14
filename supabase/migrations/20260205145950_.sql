-- Drop existing permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
DROP POLICY IF EXISTS "Public can insert" ON public.email_subscribers;
DROP POLICY IF EXISTS "Allow public insert" ON public.email_subscribers;

-- Create rate limiting table for newsletter subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_rate_limits_ip_created 
ON public.newsletter_rate_limits(ip_hash, created_at);

-- Clean up old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_newsletter_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.newsletter_rate_limits 
  WHERE created_at < now() - interval '1 hour';
$$;

-- Secure newsletter subscription function with rate limiting
CREATE OR REPLACE FUNCTION public.subscribe_newsletter(
  _email text,
  _full_name text DEFAULT NULL,
  _source text DEFAULT 'website',
  _ip_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recent_count integer;
  _result jsonb;
BEGIN
  -- Validate email format
  IF _email IS NULL OR _email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email format');
  END IF;
  
  -- Rate limiting: max 5 subscriptions per IP per hour
  IF _ip_hash IS NOT NULL THEN
    SELECT COUNT(*) INTO _recent_count
    FROM public.newsletter_rate_limits
    WHERE ip_hash = _ip_hash
      AND created_at > now() - interval '1 hour';
    
    IF _recent_count >= 5 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Too many requests. Please try again later.');
    END IF;
    
    -- Record this attempt
    INSERT INTO public.newsletter_rate_limits (ip_hash) VALUES (_ip_hash);
  END IF;
  
  -- Clean up old rate limit entries periodically (1% chance each call)
  IF random() < 0.01 THEN
    PERFORM public.cleanup_newsletter_rate_limits();
  END IF;
  
  -- Insert or update subscriber
  INSERT INTO public.email_subscribers (email, full_name, source, is_subscribed, subscribed_at)
  VALUES (lower(trim(_email)), _full_name, _source, true, now())
  ON CONFLICT (email) DO UPDATE SET
    is_subscribed = true,
    full_name = COALESCE(EXCLUDED.full_name, email_subscribers.full_name),
    subscribed_at = CASE WHEN email_subscribers.is_subscribed = false THEN now() ELSE email_subscribers.subscribed_at END,
    unsubscribed_at = NULL;
  
  RETURN jsonb_build_object('success', true, 'message', 'Successfully subscribed');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription failed. Please try again.');
END;
$$;

-- Now restrict direct INSERT to admins only
CREATE POLICY "Only admins can insert directly"
ON public.email_subscribers FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Ensure SELECT is restricted to admins
DROP POLICY IF EXISTS "Admins can view subscribers" ON public.email_subscribers;
CREATE POLICY "Admins can view subscribers"
ON public.email_subscribers FOR SELECT
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Admins can update/delete
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.email_subscribers;
CREATE POLICY "Admins can update subscribers"
ON public.email_subscribers FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.email_subscribers;
CREATE POLICY "Admins can delete subscribers"
ON public.email_subscribers FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));;
