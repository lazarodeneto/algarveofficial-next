-- Persist worker heartbeat and alert on stale/missing outbox worker runs.

CREATE TABLE IF NOT EXISTS public.external_outbox_worker_heartbeat (
  worker_name TEXT PRIMARY KEY,
  last_status TEXT NOT NULL CHECK (last_status = ANY (ARRAY['running', 'success', 'error'])),
  last_started_at TIMESTAMPTZ,
  last_finished_at TIMESTAMPTZ,
  last_runtime_ms INTEGER,
  last_claimed INTEGER NOT NULL DEFAULT 0,
  last_processed INTEGER NOT NULL DEFAULT 0,
  last_failed INTEGER NOT NULL DEFAULT 0,
  last_deferred INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.external_outbox_worker_heartbeat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "external_outbox_worker_heartbeat_admin_select" ON public.external_outbox_worker_heartbeat;
CREATE POLICY "external_outbox_worker_heartbeat_admin_select"
  ON public.external_outbox_worker_heartbeat
  FOR SELECT
  TO authenticated
  USING (is_admin_or_editor(auth.uid()));
GRANT SELECT ON TABLE public.external_outbox_worker_heartbeat TO authenticated;
CREATE OR REPLACE FUNCTION public.check_external_outbox_worker_liveness()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stale_minutes_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_worker_stale_minutes', true), ''), '10');
  running_timeout_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_worker_running_timeout_minutes', true), ''), '15');
  stale_minutes INTEGER := 10;
  running_timeout_minutes INTEGER := 15;
  heartbeat_age_minutes INTEGER := 0;
  running_age_minutes INTEGER := 0;
  heartbeat_record public.external_outbox_worker_heartbeat%ROWTYPE;
  effective_last_seen TIMESTAMPTZ;
BEGIN
  IF stale_minutes_setting ~ '^\d+$' THEN
    stale_minutes := GREATEST(1, LEAST(10080, stale_minutes_setting::INTEGER));
  END IF;
  IF running_timeout_setting ~ '^\d+$' THEN
    running_timeout_minutes := GREATEST(1, LEAST(10080, running_timeout_setting::INTEGER));
  END IF;

  SELECT *
  INTO heartbeat_record
  FROM public.external_outbox_worker_heartbeat
  WHERE worker_name = 'process-outbox'
  LIMIT 1;

  IF NOT FOUND THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'worker_liveness',
      'critical',
      'Outbox worker heartbeat is missing',
      jsonb_build_object(
        'worker_name', 'process-outbox',
        'reason', 'missing_heartbeat_row',
        'stale_threshold_minutes', stale_minutes
      )
    );
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'worker_stuck',
      jsonb_build_object(
        'worker_name', 'process-outbox',
        'reason', 'missing_heartbeat_row'
      )
    );
    RETURN;
  END IF;

  effective_last_seen := COALESCE(heartbeat_record.last_finished_at, heartbeat_record.last_started_at, heartbeat_record.updated_at);
  heartbeat_age_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - effective_last_seen)) / 60)::INTEGER);

  IF heartbeat_age_minutes >= stale_minutes THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'worker_liveness',
      'critical',
      'Outbox worker heartbeat is stale',
      jsonb_build_object(
        'worker_name', heartbeat_record.worker_name,
        'last_status', heartbeat_record.last_status,
        'last_started_at', heartbeat_record.last_started_at,
        'last_finished_at', heartbeat_record.last_finished_at,
        'last_runtime_ms', heartbeat_record.last_runtime_ms,
        'last_claimed', heartbeat_record.last_claimed,
        'last_processed', heartbeat_record.last_processed,
        'last_failed', heartbeat_record.last_failed,
        'last_deferred', heartbeat_record.last_deferred,
        'heartbeat_age_minutes', heartbeat_age_minutes,
        'stale_threshold_minutes', stale_minutes,
        'last_error', heartbeat_record.last_error
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'worker_liveness',
      jsonb_build_object(
        'worker_name', heartbeat_record.worker_name,
        'heartbeat_age_minutes', heartbeat_age_minutes,
        'stale_threshold_minutes', stale_minutes
      )
    );
  END IF;

  IF heartbeat_record.last_status = 'running' AND heartbeat_record.last_started_at IS NOT NULL THEN
    running_age_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - heartbeat_record.last_started_at)) / 60)::INTEGER);

    IF running_age_minutes >= running_timeout_minutes THEN
      PERFORM public.raise_system_alert(
        'external_outbox',
        'worker_stuck',
        'critical',
        'Outbox worker appears stuck in running state',
        jsonb_build_object(
          'worker_name', heartbeat_record.worker_name,
          'last_started_at', heartbeat_record.last_started_at,
          'running_age_minutes', running_age_minutes,
          'running_timeout_minutes', running_timeout_minutes
        )
      );
    ELSE
      PERFORM public.resolve_system_alert(
        'external_outbox',
        'worker_stuck',
        jsonb_build_object(
          'worker_name', heartbeat_record.worker_name,
          'running_age_minutes', running_age_minutes,
          'running_timeout_minutes', running_timeout_minutes
        )
      );
    END IF;
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'worker_stuck',
      jsonb_build_object(
        'worker_name', heartbeat_record.worker_name,
        'last_status', heartbeat_record.last_status
      )
    );
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.check_external_outbox_worker_liveness() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_external_outbox_worker_liveness() FROM anon;
REVOKE ALL ON FUNCTION public.check_external_outbox_worker_liveness() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_external_outbox_worker_liveness() TO service_role;
DO $do$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'check-external-outbox-worker-liveness'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'check-external-outbox-worker-liveness',
    '*/5 * * * *',
    'SELECT public.check_external_outbox_worker_liveness();'
  );
END;
$do$;
