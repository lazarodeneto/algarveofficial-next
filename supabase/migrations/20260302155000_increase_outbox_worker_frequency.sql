-- Increase outbox worker cadence to reduce backlog/latency during outages.
-- Previous schedule ran every 5 minutes.

DO $do$
DECLARE
  existing_job_id BIGINT;
  schedule_expr TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_worker_cron', true), ''), '* * * * *');
BEGIN
  -- Basic cron shape validation (5 fields). Fallback to every minute if invalid.
  IF schedule_expr !~ '^\S+\s+\S+\s+\S+\s+\S+\s+\S+$' THEN
    schedule_expr := '* * * * *';
  END IF;

  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'process-external-outbox'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'process-external-outbox',
    schedule_expr,
    'SELECT public.trigger_process_outbox();'
  );
END;
$do$;
