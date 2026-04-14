-- Provider-level circuit breaker state shared across outbox workers.

CREATE TABLE IF NOT EXISTS public.external_provider_circuits (
  provider TEXT PRIMARY KEY CHECK (provider = ANY (ARRAY['resend', 'whatsapp', 'openai'])),
  is_open BOOLEAN NOT NULL DEFAULT false,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  failure_threshold INTEGER NOT NULL DEFAULT 5,
  cooldown_seconds INTEGER NOT NULL DEFAULT 300,
  opened_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_external_provider_circuits_open
  ON public.external_provider_circuits(is_open, cooldown_until);
ALTER TABLE public.external_provider_circuits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "external_provider_circuits_admin_select" ON public.external_provider_circuits;
CREATE POLICY "external_provider_circuits_admin_select"
  ON public.external_provider_circuits
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
