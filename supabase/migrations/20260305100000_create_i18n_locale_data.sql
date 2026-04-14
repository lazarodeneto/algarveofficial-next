-- i18n_locale_data
-- Stores translated locale data as JSONB blobs, used by the admin
-- Translation Sync panel to persist live translations without a rebuild.
-- The frontend i18n loader deep-merges this data over the bundled JSON.

CREATE TABLE IF NOT EXISTS public.i18n_locale_data (
  locale       TEXT        PRIMARY KEY,
  data         JSONB       NOT NULL DEFAULT '{}',
  key_count    INTEGER     NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Only admins can read/write
ALTER TABLE public.i18n_locale_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage i18n locale data"
  ON public.i18n_locale_data
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );
COMMENT ON TABLE public.i18n_locale_data IS
  'Live translation overrides per locale. Deep-merged over bundled JSON at runtime.';
