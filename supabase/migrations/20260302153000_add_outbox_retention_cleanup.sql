-- Retention cleanup for external_outbox to prevent unbounded table/index growth.

CREATE OR REPLACE FUNCTION public.cleanup_external_outbox()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sent_retention_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_sent_retention_days', true), ''), '14');
  dead_retention_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_dead_retention_days', true), ''), '90');
  batch_size_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_cleanup_batch_size', true), ''), '5000');

  sent_retention_days INTEGER := 14;
  dead_retention_days INTEGER := 90;
  batch_size INTEGER := 5000;

  sent_deleted INTEGER := 0;
  dead_deleted INTEGER := 0;
BEGIN
  IF sent_retention_setting ~ '^\d+$' THEN
    sent_retention_days := GREATEST(1, LEAST(3650, sent_retention_setting::INTEGER));
  END IF;
  IF dead_retention_setting ~ '^\d+$' THEN
    dead_retention_days := GREATEST(1, LEAST(3650, dead_retention_setting::INTEGER));
  END IF;
  IF batch_size_setting ~ '^\d+$' THEN
    batch_size := GREATEST(100, LEAST(100000, batch_size_setting::INTEGER));
  END IF;

  WITH sent_candidate AS (
    SELECT id
    FROM public.external_outbox
    WHERE status = 'sent'
      AND updated_at < (now() - make_interval(days => sent_retention_days))
    ORDER BY updated_at ASC
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED
  ),
  sent_delete AS (
    DELETE FROM public.external_outbox o
    USING sent_candidate c
    WHERE o.id = c.id
    RETURNING o.id
  )
  SELECT COUNT(*)::INTEGER INTO sent_deleted FROM sent_delete;

  WITH dead_candidate AS (
    SELECT id
    FROM public.external_outbox
    WHERE status = 'dead'
      AND updated_at < (now() - make_interval(days => dead_retention_days))
    ORDER BY updated_at ASC
    LIMIT GREATEST(batch_size - sent_deleted, 0)
    FOR UPDATE SKIP LOCKED
  ),
  dead_delete AS (
    DELETE FROM public.external_outbox o
    USING dead_candidate c
    WHERE o.id = c.id
    RETURNING o.id
  )
  SELECT COUNT(*)::INTEGER INTO dead_deleted FROM dead_delete;

  RETURN jsonb_build_object(
    'sent_deleted', sent_deleted,
    'dead_deleted', dead_deleted,
    'sent_retention_days', sent_retention_days,
    'dead_retention_days', dead_retention_days,
    'batch_size', batch_size
  );
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_external_outbox() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_external_outbox() FROM anon;
REVOKE ALL ON FUNCTION public.cleanup_external_outbox() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_external_outbox() TO service_role;
DO $do$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'cleanup-external-outbox'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'cleanup-external-outbox',
    '17 */6 * * *',
    'SELECT public.cleanup_external_outbox();'
  );
END;
$do$;
