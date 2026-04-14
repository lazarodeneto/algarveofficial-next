-- Reclaim outbox jobs stuck in `processing` after worker crashes/timeouts.
-- Without this, stale locks can cause permanent message loss.

CREATE INDEX IF NOT EXISTS idx_external_outbox_status_locked_at
  ON public.external_outbox(status, locked_at);
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
    SELECT id
    FROM public.external_outbox
    WHERE (
      status IN ('queued', 'retry')
      AND next_retry_at <= now()
    ) OR (
      status = 'processing'
      AND locked_at IS NOT NULL
      AND locked_at < (now() - lock_timeout)
    )
    ORDER BY
      CASE
        WHEN status = 'processing' THEN locked_at
        ELSE next_retry_at
      END ASC,
      created_at ASC
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
