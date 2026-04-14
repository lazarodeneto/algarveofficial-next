-- Add policy for newsletter_rate_limits table (only the security definer function needs access)
-- This table is managed entirely by the subscribe_newsletter function
CREATE POLICY "No direct access to rate limits"
ON public.newsletter_rate_limits FOR ALL
TO authenticated, anon
USING (false);
