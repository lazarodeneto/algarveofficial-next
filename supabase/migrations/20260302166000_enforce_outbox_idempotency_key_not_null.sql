-- Enforce non-null outbox idempotency keys after all enqueue paths provide keys.

UPDATE public.external_outbox
SET idempotency_key = CONCAT('legacy:', id::TEXT)
WHERE idempotency_key IS NULL
   OR btrim(idempotency_key) = '';
ALTER TABLE public.external_outbox
  ALTER COLUMN idempotency_key SET NOT NULL;
