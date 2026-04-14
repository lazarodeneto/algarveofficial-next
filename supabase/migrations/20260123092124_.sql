-- Add IP whitelist column to site_settings
ALTER TABLE public.site_settings
ADD COLUMN maintenance_ip_whitelist TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.site_settings.maintenance_ip_whitelist IS 'Array of IP addresses that can bypass maintenance mode';;
