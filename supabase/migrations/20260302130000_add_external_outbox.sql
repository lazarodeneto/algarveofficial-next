-- Durable outbox for external side effects (Resend/WhatsApp/OpenAI, etc.).
-- Supports retries with backoff and dead-letter semantics.

CREATE TABLE IF NOT EXISTS public.external_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider = ANY (ARRAY['resend', 'whatsapp', 'openai'])),
  operation TEXT NOT NULL,
  payload JSONB NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status = ANY (ARRAY['queued', 'processing', 'retry', 'sent', 'dead'])),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 6,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_external_outbox_status_next_retry
  ON public.external_outbox(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_external_outbox_provider_operation
  ON public.external_outbox(provider, operation);
ALTER TABLE public.external_outbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "external_outbox_admin_select" ON public.external_outbox;
CREATE POLICY "external_outbox_admin_select"
  ON public.external_outbox FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
CREATE OR REPLACE FUNCTION public.claim_external_outbox_jobs(_max_jobs INTEGER DEFAULT 20)
RETURNS SETOF public.external_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidate AS (
    SELECT id
    FROM public.external_outbox
    WHERE status IN ('queued', 'retry')
      AND next_retry_at <= now()
      AND (locked_at IS NULL OR locked_at < (now() - interval '10 minutes'))
    ORDER BY next_retry_at ASC, created_at ASC
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
