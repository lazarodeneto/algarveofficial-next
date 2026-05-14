-- Transactional email delivery audit log for server-side Resend sends.
-- Existing email_events is campaign/contact oriented, so transactional sends use
-- a separate append-only operational table.

CREATE TABLE IF NOT EXISTS public.transactional_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_email_id TEXT,
  template_key TEXT NOT NULL,
  recipient TEXT,
  subject TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  status TEXT NOT NULL CHECK (status IN ('attempt', 'sent', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactional_email_events_created_at
  ON public.transactional_email_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactional_email_events_status_created
  ON public.transactional_email_events(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactional_email_events_provider_email_id
  ON public.transactional_email_events(provider_email_id)
  WHERE provider_email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactional_email_events_related
  ON public.transactional_email_events(related_entity_type, related_entity_id)
  WHERE related_entity_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactional_email_events_template
  ON public.transactional_email_events(template_key, created_at DESC);

ALTER TABLE public.transactional_email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactional_email_events_admin_select"
  ON public.transactional_email_events;

CREATE POLICY "transactional_email_events_admin_select"
  ON public.transactional_email_events FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));

REVOKE ALL ON public.transactional_email_events FROM PUBLIC;
REVOKE ALL ON public.transactional_email_events FROM anon;
GRANT SELECT ON public.transactional_email_events TO authenticated;

COMMENT ON TABLE public.transactional_email_events IS
  'Operational log of transactional Resend email attempts, successes, failures, and skips.';
