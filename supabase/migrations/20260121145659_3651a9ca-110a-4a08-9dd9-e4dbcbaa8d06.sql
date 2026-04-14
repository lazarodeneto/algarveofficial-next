-- Allow listing owners to view their own aggregated daily analytics (privacy-safe)
CREATE POLICY "Owners can view their listing daily analytics"
  ON public.analytics_daily FOR SELECT
  TO authenticated
  USING (
    listing_id IS NOT NULL AND
    public.is_listing_owner(auth.uid(), listing_id)
  );
