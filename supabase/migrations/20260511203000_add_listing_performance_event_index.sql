-- Support owner listing performance aggregation over recent public analytics events.
CREATE INDEX IF NOT EXISTS idx_analytics_events_listing_type_created_at
  ON public.analytics_events (listing_id, event_type, created_at DESC)
  WHERE listing_id IS NOT NULL;
