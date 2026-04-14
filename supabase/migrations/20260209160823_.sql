
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule daily archival at 00:05 UTC
SELECT cron.schedule(
  'archive-past-event-listings',
  '5 0 * * *',
  $$SELECT public.archive_past_event_listings()$$
);
;
