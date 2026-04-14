-- Create site_settings table for global configuration
CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  primary_color TEXT DEFAULT 'rgba(196, 155, 55, 1)',
  secondary_color TEXT DEFAULT 'rgba(196, 155, 55, 0.3)',
  accent_color TEXT DEFAULT 'rgba(255, 215, 102, 1)',
  site_name TEXT DEFAULT 'AlgarveOfficial',
  tagline TEXT DEFAULT 'Luxury Experiences in Portugal',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.site_settings (id) VALUES ('default');

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for site settings
CREATE POLICY "Site settings are publicly readable" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (public.is_admin_or_editor(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;
