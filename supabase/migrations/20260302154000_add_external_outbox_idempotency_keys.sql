-- Add idempotency keys for outbox enqueue operations.
-- This prevents duplicate queued jobs from repeated retries/callers.

ALTER TABLE public.external_outbox
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS ux_external_outbox_idempotency
  ON public.external_outbox(provider, operation, idempotency_key);
