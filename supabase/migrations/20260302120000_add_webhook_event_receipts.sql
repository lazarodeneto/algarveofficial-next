-- Store processed external webhook deliveries for idempotency controls.
-- Service-role edge functions insert rows; duplicates are rejected by unique key.
CREATE TABLE IF NOT EXISTS public.webhook_event_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider = ANY (ARRAY['stripe', 'resend'])),
  event_id TEXT NOT NULL,
  event_type TEXT,
  payload JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS webhook_event_receipts_provider_event_id_key
  ON public.webhook_event_receipts(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_event_receipts_received_at
  ON public.webhook_event_receipts(received_at DESC);
ALTER TABLE public.webhook_event_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_event_receipts_admin_select" ON public.webhook_event_receipts;
CREATE POLICY "webhook_event_receipts_admin_select"
  ON public.webhook_event_receipts FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
