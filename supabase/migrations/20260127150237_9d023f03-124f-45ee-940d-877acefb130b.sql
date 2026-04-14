-- Create cookie_banner_settings table
CREATE TABLE public.cookie_banner_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT DEFAULT 'Your Privacy Matters',
  description TEXT DEFAULT 'We use cookies and similar technologies to analyze site usage and improve your experience. This includes collecting anonymized data such as page views and session information. You can choose to accept or decline analytics tracking.',
  learn_more_text TEXT DEFAULT 'Learn more',
  learn_more_link TEXT DEFAULT '/privacy-policy',
  decline_button_text TEXT DEFAULT 'Decline',
  accept_button_text TEXT DEFAULT 'Accept Analytics',
  gdpr_badge_text TEXT DEFAULT 'GDPR Compliant',
  data_retention_text TEXT DEFAULT 'Data retained for 90 days',
  show_gdpr_badge BOOLEAN DEFAULT true,
  show_data_retention BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.cookie_banner_settings ENABLE ROW LEVEL SECURITY;
-- Admins can manage
CREATE POLICY "Admins can manage cookie banner settings"
  ON public.cookie_banner_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
-- Anyone can view
CREATE POLICY "Anyone can view cookie banner settings"
  ON public.cookie_banner_settings FOR SELECT
  USING (true);
-- Insert default settings
INSERT INTO public.cookie_banner_settings (id) VALUES ('default');
