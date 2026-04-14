-- Add SELECT policy to analytics_events to restrict access to admins only
-- This prevents unauthorized access to tracking data (IP, user agents, session IDs)

CREATE POLICY "Admins can view analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (is_admin_or_editor(auth.uid()));
