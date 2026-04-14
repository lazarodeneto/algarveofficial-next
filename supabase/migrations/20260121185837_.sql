-- Fix view_tracking: Allow inserts but validate entity exists
DROP POLICY IF EXISTS "Anyone can log unique views" ON public.view_tracking;

-- Create a more restrictive policy that validates the entity exists
CREATE POLICY "Anyone can log views for valid entities"
ON public.view_tracking
FOR INSERT
WITH CHECK (
  -- Validate entity_type is one of the allowed types
  entity_type IN ('listing', 'blog_post') AND
  -- Validate the entity actually exists
  CASE 
    WHEN entity_type = 'listing' THEN EXISTS (
      SELECT 1 FROM public.listings WHERE id = entity_id AND status = 'published'
    )
    WHEN entity_type = 'blog_post' THEN EXISTS (
      SELECT 1 FROM public.blog_posts WHERE id = entity_id AND status = 'published'
    )
    ELSE false
  END
);

-- Fix whatsapp_webhook_events: Only service role can insert (edge functions)
-- Regular users should never be able to insert webhook events
DROP POLICY IF EXISTS "Service can insert webhook events" ON public.whatsapp_webhook_events;

-- Create policy that only allows authenticated service-level access
-- Since edge functions use service_role key, they bypass RLS entirely
-- For safety, we deny all direct inserts from anon and authenticated roles
CREATE POLICY "Deny direct webhook event inserts"
ON public.whatsapp_webhook_events
FOR INSERT
TO anon, authenticated
WITH CHECK (false);;
