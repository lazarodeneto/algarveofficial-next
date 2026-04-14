-- Reconcile provider circuit alerts when provider circuits are no longer open.
-- This prevents stale `provider_circuit_*` alerts if no follow-up job runs after cooldown expiry.

CREATE OR REPLACE FUNCTION public.reconcile_provider_circuit_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stale_alert RECORD;
BEGIN
  FOR stale_alert IN
    SELECT
      sa.alert_key,
      REPLACE(sa.alert_key, 'provider_circuit_', '') AS provider
    FROM public.system_alerts sa
    LEFT JOIN public.external_provider_circuits c
      ON c.provider = REPLACE(sa.alert_key, 'provider_circuit_', '')
      AND c.is_open IS TRUE
      AND (c.cooldown_until IS NULL OR c.cooldown_until > now())
    WHERE sa.source = 'external_outbox'
      AND sa.resolved_at IS NULL
      AND sa.alert_key LIKE 'provider_circuit_%'
      AND c.provider IS NULL
  LOOP
    PERFORM public.resolve_system_alert(
      'external_outbox',
      stale_alert.alert_key,
      jsonb_build_object(
        'reason', 'provider_circuit_not_open',
        'provider', stale_alert.provider,
        'resolved_at', now()
      )
    );
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION public.reconcile_provider_circuit_alerts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reconcile_provider_circuit_alerts() FROM anon;
REVOKE ALL ON FUNCTION public.reconcile_provider_circuit_alerts() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_provider_circuit_alerts() TO service_role;
DO $do$
DECLARE
  existing_job_id BIGINT;
BEGIN
  SELECT jobid INTO existing_job_id
  FROM cron.job
  WHERE jobname = 'reconcile-provider-circuit-alerts'
  LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'reconcile-provider-circuit-alerts',
    '*/5 * * * *',
    'SELECT public.reconcile_provider_circuit_alerts();'
  );
END;
$do$;
