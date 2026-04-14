-- Alert when outbox worker scheduler/config is missing, to avoid silent backlog growth.

CREATE OR REPLACE FUNCTION public.check_external_outbox_worker_configuration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  worker_secret TEXT := NULLIF(current_setting('app.settings.outbox_worker_secret', true), '');
  worker_job_schedule TEXT;
  health_job_schedule TEXT;
BEGIN
  SELECT schedule
  INTO worker_job_schedule
  FROM cron.job
  WHERE jobname = 'process-external-outbox'
  LIMIT 1;

  SELECT schedule
  INTO health_job_schedule
  FROM cron.job
  WHERE jobname = 'check-external-outbox-health'
  LIMIT 1;

  IF worker_secret IS NULL THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'worker_secret_missing',
      'critical',
      'Outbox worker secret is not configured',
      jsonb_build_object(
        'setting', 'app.settings.outbox_worker_secret',
        'impact', 'process-external-outbox cron trigger is skipped'
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'worker_secret_missing',
      jsonb_build_object(
        'setting', 'app.settings.outbox_worker_secret',
        'configured', true
      )
    );
  END IF;

  IF worker_job_schedule IS NULL THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'worker_cron_missing',
      'critical',
      'Outbox worker cron job is missing',
      jsonb_build_object(
        'jobname', 'process-external-outbox',
        'impact', 'queued outbox jobs will not be processed on schedule'
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'worker_cron_missing',
      jsonb_build_object(
        'jobname', 'process-external-outbox',
        'schedule', worker_job_schedule
      )
    );
  END IF;

  IF health_job_schedule IS NULL THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'health_cron_missing',
      'warning',
      'Outbox health-check cron job is missing',
      jsonb_build_object(
        'jobname', 'check-external-outbox-health',
        'impact', 'outbox health alerts may go stale between manual checks'
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'health_cron_missing',
      jsonb_build_object(
        'jobname', 'check-external-outbox-health',
        'schedule', health_job_schedule
      )
    );
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.check_external_outbox_worker_configuration() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_external_outbox_worker_configuration() FROM anon;
REVOKE ALL ON FUNCTION public.check_external_outbox_worker_configuration() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_external_outbox_worker_configuration() TO service_role;
DO $do$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'check-external-outbox-worker-config'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'check-external-outbox-worker-config',
    '*/5 * * * *',
    'SELECT public.check_external_outbox_worker_configuration();'
  );
END;
$do$;
