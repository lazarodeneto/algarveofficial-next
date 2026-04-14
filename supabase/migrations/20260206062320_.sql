-- Global key/value settings used by Admin → Global Settings (SEO, Social, Labels, Contact, etc.)
CREATE TABLE IF NOT EXISTS public.global_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  category TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (safe: values are non-PII site config like SEO/social links)
DROP POLICY IF EXISTS "Global settings are publicly readable" ON public.global_settings;
CREATE POLICY "Global settings are publicly readable"
ON public.global_settings
FOR SELECT
USING (true);

-- Admin/editor write access
DROP POLICY IF EXISTS "Admins and editors can insert global settings" ON public.global_settings;
CREATE POLICY "Admins and editors can insert global settings"
ON public.global_settings
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admins and editors can update global settings" ON public.global_settings;
CREATE POLICY "Admins and editors can update global settings"
ON public.global_settings
FOR UPDATE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admins and editors can delete global settings" ON public.global_settings;
CREATE POLICY "Admins and editors can delete global settings"
ON public.global_settings
FOR DELETE
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Keep updated_at current
DROP TRIGGER IF EXISTS update_global_settings_updated_at ON public.global_settings;
CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
;
