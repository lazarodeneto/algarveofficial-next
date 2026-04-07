-- Stripe webhook idempotency + subscription audit log.
-- Both tables are service-role-only. RLS is enabled with no policies, which
-- denies access to anon/authenticated clients per project convention.

-- 1. Idempotency table for Stripe webhooks
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id     TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  payload_hash TEXT NOT NULL,
  result       TEXT NOT NULL DEFAULT 'pending'
               CHECK (result IN ('pending', 'success', 'error', 'skipped')),
  error        TEXT
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type
  ON public.stripe_webhook_events (type);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_result_received
  ON public.stripe_webhook_events (result, received_at DESC);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- 2. Audit log for subscription mutations
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID,
  action          TEXT NOT NULL,
  previous_state  JSONB,
  new_state       JSONB,
  stripe_event_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_owner
  ON public.subscription_audit_log (owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_event
  ON public.subscription_audit_log (stripe_event_id);

ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;
