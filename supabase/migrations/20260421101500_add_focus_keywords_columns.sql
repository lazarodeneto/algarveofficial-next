-- Add SEO focus keywords support across admin-managed content entities.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.partner_settings
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.terms_settings
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.privacy_settings
  ADD COLUMN IF NOT EXISTS focus_keywords text;

ALTER TABLE public.cookie_settings
  ADD COLUMN IF NOT EXISTS focus_keywords text;
