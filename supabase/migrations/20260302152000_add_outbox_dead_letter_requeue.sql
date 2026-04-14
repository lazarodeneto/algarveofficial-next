-- Controlled replay of dead-letter outbox jobs.
-- Intended for manual/operator recovery after dependency outages.

CREATE OR REPLACE FUNCTION public.requeue_dead_external_outbox_jobs(
  _max_jobs INTEGER DEFAULT 100,
  _provider TEXT DEFAULT NULL,
  _operation TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  applied_limit INTEGER := GREATEST(1, LEAST(COALESCE(_max_jobs, 100), 1000));
  updated_rows INTEGER := 0;
BEGIN
  WITH candidate AS (
    SELECT id
    FROM public.external_outbox
    WHERE status = 'dead'
      AND (_provider IS NULL OR provider = _provider)
      AND (_operation IS NULL OR operation = _operation)
    ORDER BY updated_at ASC, created_at ASC
    LIMIT applied_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.external_outbox o
  SET
    status = 'retry',
    attempts = 0,
    next_retry_at = now(),
    locked_at = NULL,
    updated_at = now()
  FROM candidate
  WHERE o.id = candidate.id;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows;
END;
$$;
REVOKE ALL ON FUNCTION public.requeue_dead_external_outbox_jobs(INTEGER, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.requeue_dead_external_outbox_jobs(INTEGER, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.requeue_dead_external_outbox_jobs(INTEGER, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.requeue_dead_external_outbox_jobs(INTEGER, TEXT, TEXT) TO service_role;
