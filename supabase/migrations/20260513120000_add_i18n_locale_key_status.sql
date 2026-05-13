-- Per-key status metadata for Translation Studio UI key sync.
-- The existing i18n_locale_data JSON payload remains the runtime source for
-- locale overrides; this table adds non-destructive admin metadata only.

CREATE TABLE IF NOT EXISTS public.i18n_locale_key_status (
  locale TEXT NOT NULL,
  key_path TEXT NOT NULL,
  source_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'translated'
    CHECK (status IN ('translated', 'reviewed', 'edited', 'pending_manual', 'missing', 'stale', 'obsolete', 'failed')),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (locale, key_path)
);

CREATE INDEX IF NOT EXISTS i18n_locale_key_status_locale_status_idx
  ON public.i18n_locale_key_status(locale, status);

ALTER TABLE public.i18n_locale_key_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "i18n_locale_key_status_admin_select" ON public.i18n_locale_key_status;
CREATE POLICY "i18n_locale_key_status_admin_select"
  ON public.i18n_locale_key_status
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "i18n_locale_key_status_admin_write" ON public.i18n_locale_key_status;
CREATE POLICY "i18n_locale_key_status_admin_write"
  ON public.i18n_locale_key_status
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

COMMENT ON TABLE public.i18n_locale_key_status IS
  'Admin-only per-key status and source hash metadata for UI locale synchronization.';
