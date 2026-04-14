-- Include provider circuit-breaker status in admin outbox health view.

CREATE OR REPLACE VIEW public.admin_external_outbox_health
WITH (security_invoker = on)
AS
WITH outbox_counts AS (
  SELECT
    COUNT(*)::INTEGER AS total_jobs,
    COUNT(*) FILTER (WHERE status = 'queued')::INTEGER AS queued_count,
    COUNT(*) FILTER (WHERE status = 'retry')::INTEGER AS retry_count,
    COUNT(*) FILTER (WHERE status = 'processing')::INTEGER AS processing_count,
    COUNT(*) FILTER (WHERE status = 'dead')::INTEGER AS dead_count,
    COUNT(*) FILTER (WHERE status = 'sent')::INTEGER AS sent_count,
    MIN(next_retry_at) FILTER (WHERE status IN ('queued', 'retry')) AS oldest_due_retry_at
  FROM public.external_outbox
),
open_alerts AS (
  SELECT
    COUNT(*)::INTEGER AS open_alerts_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'alert_key', alert_key,
          'severity', severity,
          'title', title,
          'first_seen_at', first_seen_at,
          'last_seen_at', last_seen_at,
          'details', details
        )
        ORDER BY last_seen_at DESC
      ),
      '[]'::jsonb
    ) AS open_alerts
  FROM public.system_alerts
  WHERE source = 'external_outbox'
    AND resolved_at IS NULL
),
open_circuits AS (
  SELECT
    COUNT(*)::INTEGER AS open_provider_circuits_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'provider', provider,
          'consecutive_failures', consecutive_failures,
          'failure_threshold', failure_threshold,
          'cooldown_seconds', cooldown_seconds,
          'opened_at', opened_at,
          'cooldown_until', cooldown_until,
          'last_failure_at', last_failure_at,
          'last_error', last_error
        )
        ORDER BY cooldown_until DESC NULLS LAST
      ),
      '[]'::jsonb
    ) AS open_provider_circuits
  FROM public.external_provider_circuits
  WHERE is_open = true
    AND cooldown_until IS NOT NULL
    AND cooldown_until > now()
)
SELECT
  now() AS observed_at,
  c.total_jobs,
  c.queued_count,
  c.retry_count,
  c.processing_count,
  c.dead_count,
  c.sent_count,
  c.oldest_due_retry_at,
  CASE
    WHEN c.oldest_due_retry_at IS NULL THEN 0
    ELSE GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - c.oldest_due_retry_at)) / 60)::INTEGER)
  END AS oldest_due_retry_age_minutes,
  a.open_alerts_count,
  a.open_alerts,
  oc.open_provider_circuits_count,
  oc.open_provider_circuits
FROM outbox_counts c
CROSS JOIN open_alerts a
CROSS JOIN open_circuits oc;
