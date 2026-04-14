-- Schedule periodic outbox processing via pg_cron.
-- Requires DB setting `app.settings.outbox_worker_secret` to match the
-- OUTBOX_WORKER_SECRET edge-function secret.
-- Optional DB setting `app.settings.supabase_functions_base_url`
-- defaults to this project's Supabase URL.

CREATE OR REPLACE FUNCTION public.trigger_process_outbox()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  base_url TEXT := COALESCE(
    NULLIF(current_setting('app.settings.supabase_functions_base_url', true), ''),
    'https://niylxpvafywjonrphddp.supabase.co'
  );
  worker_secret TEXT := NULLIF(current_setting('app.settings.outbox_worker_secret', true), '');
  max_jobs_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_max_jobs', true), ''), '50');
  max_jobs INTEGER := 50;
  request_url TEXT;
BEGIN
  IF worker_secret IS NULL THEN
    RAISE NOTICE 'trigger_process_outbox skipped: app.settings.outbox_worker_secret is not set';
    RETURN;
  END IF;

  IF max_jobs_setting ~ '^\d+$' THEN
    max_jobs := GREATEST(1, LEAST(200, max_jobs_setting::INTEGER));
  END IF;

  request_url := base_url || '/functions/v1/process-outbox?max_jobs=' || max_jobs::TEXT;

  -- Try schema-qualified pg_net call using extensions schema first.
  BEGIN
    PERFORM extensions.http_post(
      url := request_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', worker_secret
      ),
      body := '{}'::jsonb
    );
  EXCEPTION
    WHEN undefined_function THEN
      -- Fallback when pg_net is installed under net schema.
      PERFORM net.http_post(
        url := request_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-internal-secret', worker_secret
        ),
        body := '{}'::jsonb
      );
  END;
END;
$$;
DO $do$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'process-external-outbox'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'process-external-outbox',
    '*/5 * * * *',
    'SELECT public.trigger_process_outbox();'
  );
END;
$do$;
