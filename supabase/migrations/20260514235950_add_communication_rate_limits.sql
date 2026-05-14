-- Shared hashed rate-limit table for public communication forms.

CREATE TABLE IF NOT EXISTS public.communication_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  identifier_hash TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scope, identifier_hash)
);

CREATE INDEX IF NOT EXISTS idx_communication_rate_limits_scope_window
  ON public.communication_rate_limits(scope, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_communication_rate_limits_last_seen
  ON public.communication_rate_limits(last_seen_at DESC);

ALTER TABLE public.communication_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "communication_rate_limits_admin_select"
  ON public.communication_rate_limits;

CREATE POLICY "communication_rate_limits_admin_select"
  ON public.communication_rate_limits FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

REVOKE ALL ON public.communication_rate_limits FROM PUBLIC;
REVOKE ALL ON public.communication_rate_limits FROM anon;
GRANT SELECT ON public.communication_rate_limits TO authenticated;

COMMENT ON TABLE public.communication_rate_limits IS
  'Hashed per-scope request counters for public communication form abuse protection.';
