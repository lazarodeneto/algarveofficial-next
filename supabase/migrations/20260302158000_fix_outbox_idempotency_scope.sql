-- Refine outbox idempotency: dedupe only active jobs.
-- Allows future re-enqueue after jobs reach terminal states (sent/dead).

ALTER TABLE public.external_outbox
  ADD COLUMN IF NOT EXISTS idempotency_scope TEXT
  GENERATED ALWAYS AS (
    CASE
      WHEN status = ANY (ARRAY['queued', 'retry', 'processing']) THEN 'active'
      ELSE 'closed'
    END
  ) STORED;
DROP INDEX IF EXISTS ux_external_outbox_idempotency;
CREATE UNIQUE INDEX IF NOT EXISTS ux_external_outbox_idempotency_active_scope
  ON public.external_outbox(provider, operation, idempotency_key, idempotency_scope);
