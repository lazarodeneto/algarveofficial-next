-- Add maintenance mode columns to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS maintenance_message TEXT DEFAULT 'We are currently performing scheduled maintenance. Please check back soon.';
