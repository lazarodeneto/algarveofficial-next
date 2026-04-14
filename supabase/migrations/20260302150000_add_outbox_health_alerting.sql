-- Outbox health monitoring and alerting.
-- Detects dead-letter growth, retry backlog age/size, and stale processing locks.

CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  alert_key TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity = ANY (ARRAY['info', 'warning', 'critical'])),
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_system_alerts_open
  ON public.system_alerts(source, alert_key, last_seen_at DESC)
  WHERE resolved_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_system_alerts_open_key
  ON public.system_alerts(source, alert_key)
  WHERE resolved_at IS NULL;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "system_alerts_admin_select" ON public.system_alerts;
CREATE POLICY "system_alerts_admin_select"
  ON public.system_alerts
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
DROP POLICY IF EXISTS "system_alerts_admin_manage" ON public.system_alerts;
CREATE POLICY "system_alerts_admin_manage"
  ON public.system_alerts
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE OR REPLACE FUNCTION public.raise_system_alert(
  _source TEXT,
  _alert_key TEXT,
  _severity TEXT,
  _title TEXT,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id UUID;
BEGIN
  SELECT id INTO existing_id
  FROM public.system_alerts
  WHERE source = _source
    AND alert_key = _alert_key
    AND resolved_at IS NULL
  LIMIT 1;

  IF existing_id IS NULL THEN
    BEGIN
      INSERT INTO public.system_alerts (
        source,
        alert_key,
        severity,
        title,
        details,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      )
      VALUES (
        _source,
        _alert_key,
        _severity,
        _title,
        COALESCE(_details, '{}'::jsonb),
        now(),
        now(),
        now(),
        now()
      )
      RETURNING id INTO existing_id;
    EXCEPTION
      WHEN unique_violation THEN
        SELECT id INTO existing_id
        FROM public.system_alerts
        WHERE source = _source
          AND alert_key = _alert_key
          AND resolved_at IS NULL
        LIMIT 1;
    END;

    IF existing_id IS NOT NULL THEN
      UPDATE public.system_alerts
      SET
        severity = _severity,
        title = _title,
        details = COALESCE(_details, '{}'::jsonb),
        last_seen_at = now(),
        updated_at = now()
      WHERE id = existing_id;
    END IF;
  ELSE
    UPDATE public.system_alerts
    SET
      severity = _severity,
      title = _title,
      details = COALESCE(_details, '{}'::jsonb),
      last_seen_at = now(),
      updated_at = now()
    WHERE id = existing_id;
  END IF;

  RETURN existing_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.resolve_system_alert(
  _source TEXT,
  _alert_key TEXT,
  _resolution JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_rows INTEGER := 0;
BEGIN
  UPDATE public.system_alerts
  SET
    resolved_at = now(),
    updated_at = now(),
    details = COALESCE(details, '{}'::jsonb) || jsonb_build_object(
      'resolved', true,
      'resolution', COALESCE(_resolution, '{}'::jsonb),
      'resolved_at', now()
    )
  WHERE source = _source
    AND alert_key = _alert_key
    AND resolved_at IS NULL;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows;
END;
$$;
CREATE OR REPLACE FUNCTION public.check_external_outbox_health()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dead_threshold_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_alert_dead_threshold', true), ''), '1');
  retry_threshold_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_alert_retry_threshold', true), ''), '40');
  retry_age_threshold_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_alert_retry_age_minutes', true), ''), '20');
  stale_processing_threshold_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_alert_stale_processing_threshold', true), ''), '5');
  lock_timeout_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_lock_timeout_seconds', true), ''), '900');

  dead_threshold INTEGER := 1;
  retry_threshold INTEGER := 40;
  retry_age_threshold_minutes INTEGER := 20;
  stale_processing_threshold INTEGER := 5;
  lock_timeout_seconds INTEGER := 900;
  lock_timeout INTERVAL := interval '15 minutes';

  dead_count INTEGER := 0;
  retry_due_count INTEGER := 0;
  stale_processing_count INTEGER := 0;
  oldest_retry_age_minutes INTEGER := 0;
  oldest_retry_at TIMESTAMPTZ;
  dead_by_operation JSONB := '{}'::jsonb;
BEGIN
  IF dead_threshold_setting ~ '^\d+$' THEN
    dead_threshold := GREATEST(1, LEAST(100000, dead_threshold_setting::INTEGER));
  END IF;
  IF retry_threshold_setting ~ '^\d+$' THEN
    retry_threshold := GREATEST(1, LEAST(100000, retry_threshold_setting::INTEGER));
  END IF;
  IF retry_age_threshold_setting ~ '^\d+$' THEN
    retry_age_threshold_minutes := GREATEST(1, LEAST(10080, retry_age_threshold_setting::INTEGER));
  END IF;
  IF stale_processing_threshold_setting ~ '^\d+$' THEN
    stale_processing_threshold := GREATEST(1, LEAST(100000, stale_processing_threshold_setting::INTEGER));
  END IF;
  IF lock_timeout_setting ~ '^\d+$' THEN
    lock_timeout_seconds := GREATEST(60, LEAST(86400, lock_timeout_setting::INTEGER));
  END IF;

  lock_timeout := make_interval(secs => lock_timeout_seconds);

  SELECT COUNT(*)::INTEGER
  INTO dead_count
  FROM public.external_outbox
  WHERE status = 'dead';

  SELECT COALESCE(jsonb_object_agg(operation, cnt), '{}'::jsonb)
  INTO dead_by_operation
  FROM (
    SELECT operation, COUNT(*)::INTEGER AS cnt
    FROM public.external_outbox
    WHERE status = 'dead'
    GROUP BY operation
    ORDER BY COUNT(*) DESC
    LIMIT 10
  ) dead_ops;

  IF dead_count >= dead_threshold THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'dead_jobs',
      'critical',
      'External outbox dead-letter jobs detected',
      jsonb_build_object(
        'dead_count', dead_count,
        'threshold', dead_threshold,
        'dead_by_operation', dead_by_operation
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'dead_jobs',
      jsonb_build_object('dead_count', dead_count, 'threshold', dead_threshold)
    );
  END IF;

  SELECT
    COUNT(*)::INTEGER,
    MIN(next_retry_at)
  INTO retry_due_count, oldest_retry_at
  FROM public.external_outbox
  WHERE status IN ('queued', 'retry')
    AND next_retry_at <= now();

  IF oldest_retry_at IS NOT NULL THEN
    oldest_retry_age_minutes := GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - oldest_retry_at)) / 60)::INTEGER);
  ELSE
    oldest_retry_age_minutes := 0;
  END IF;

  IF retry_due_count >= retry_threshold OR oldest_retry_age_minutes >= retry_age_threshold_minutes THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'retry_backlog',
      'warning',
      'External outbox retry backlog is above threshold',
      jsonb_build_object(
        'retry_due_count', retry_due_count,
        'retry_threshold', retry_threshold,
        'oldest_retry_at', oldest_retry_at,
        'oldest_retry_age_minutes', oldest_retry_age_minutes,
        'retry_age_threshold_minutes', retry_age_threshold_minutes
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'retry_backlog',
      jsonb_build_object(
        'retry_due_count', retry_due_count,
        'oldest_retry_age_minutes', oldest_retry_age_minutes
      )
    );
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO stale_processing_count
  FROM public.external_outbox
  WHERE status = 'processing'
    AND locked_at IS NOT NULL
    AND locked_at < (now() - lock_timeout);

  IF stale_processing_count >= stale_processing_threshold THEN
    PERFORM public.raise_system_alert(
      'external_outbox',
      'stale_processing',
      'critical',
      'External outbox has stale processing locks',
      jsonb_build_object(
        'stale_processing_count', stale_processing_count,
        'threshold', stale_processing_threshold,
        'lock_timeout_seconds', lock_timeout_seconds
      )
    );
  ELSE
    PERFORM public.resolve_system_alert(
      'external_outbox',
      'stale_processing',
      jsonb_build_object(
        'stale_processing_count', stale_processing_count,
        'threshold', stale_processing_threshold
      )
    );
  END IF;
END;
$$;
DO $do$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'check-external-outbox-health'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'check-external-outbox-health',
    '*/5 * * * *',
    'SELECT public.check_external_outbox_health();'
  );
END;
$do$;
