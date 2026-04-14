-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY FIXES: Function search paths and permissive policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Fix update_updated_at_column function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
-- Fix handle_new_user function (already has search_path but let's be explicit)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Default role is viewer_logged
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer_logged');
  
  RETURN NEW;
END;
$$;
-- Fix permissive INSERT policies for analytics_events and email_subscribers
-- These tables need to track data origin for abuse prevention

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
-- Create more restrictive analytics events policy (rate-limited by client)
CREATE POLICY "Unauthenticated users can log limited events"
  ON public.analytics_events FOR INSERT
  TO anon
  WITH CHECK (
    -- Only allow specific safe event types from anonymous users
    event_type IN ('page_view', 'listing_view', 'search')
  );
CREATE POLICY "Authenticated users can log events"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Authenticated users can log their own events or anonymous events
    user_id IS NULL OR user_id = auth.uid()
  );
-- Create more restrictive email subscriber policy
CREATE POLICY "Anyone can subscribe with valid email"
  ON public.email_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Basic validation: email must be present and formatted
    email IS NOT NULL AND 
    email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  );
