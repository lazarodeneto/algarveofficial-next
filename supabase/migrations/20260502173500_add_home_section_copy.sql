ALTER TABLE public.homepage_settings
  ADD COLUMN IF NOT EXISTS section_copy jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.homepage_settings_translations
  ADD COLUMN IF NOT EXISTS section_copy jsonb NOT NULL DEFAULT '{}'::jsonb;

NOTIFY pgrst, 'reload schema';
