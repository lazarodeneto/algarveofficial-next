-- Avoid claiming outbox jobs for providers currently in circuit-breaker cooldown.

CREATE OR REPLACE FUNCTION public.claim_external_outbox_jobs(_max_jobs INTEGER DEFAULT 20)
RETURNS SETOF public.external_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lock_timeout_setting TEXT := COALESCE(NULLIF(current_setting('app.settings.outbox_lock_timeout_seconds', true), ''), '900');
  lock_timeout_seconds INTEGER := 900;
  lock_timeout INTERVAL := interval '15 minutes';
BEGIN
  IF lock_timeout_setting ~ '^\d+$' THEN
    lock_timeout_seconds := GREATEST(60, LEAST(86400, lock_timeout_setting::INTEGER));
  END IF;
  lock_timeout := make_interval(secs => lock_timeout_seconds);

  RETURN QUERY
  WITH candidate AS (
    SELECT o.id
    FROM public.external_outbox o
    WHERE (
      o.status IN ('queued', 'retry')
      AND o.next_retry_at <= now()
    ) OR (
      o.status = 'processing'
      AND o.locked_at IS NOT NULL
      AND o.locked_at < (now() - lock_timeout)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.external_provider_circuits c
      WHERE c.provider = o.provider
        AND c.is_open = true
        AND c.cooldown_until IS NOT NULL
        AND c.cooldown_until > now()
    )
    ORDER BY
      CASE
        WHEN o.status = 'processing' THEN o.locked_at
        ELSE o.next_retry_at
      END ASC,
      o.created_at ASC
    LIMIT GREATEST(COALESCE(_max_jobs, 20), 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.external_outbox o
  SET
    status = 'processing',
    locked_at = now(),
    updated_at = now()
  FROM candidate
  WHERE o.id = candidate.id
  RETURNING o.*;
END;
$$;
