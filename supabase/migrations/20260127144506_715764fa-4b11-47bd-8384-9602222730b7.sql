-- Create terms_settings table
CREATE TABLE public.terms_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  page_title TEXT DEFAULT 'Terms of Service',
  last_updated_date TEXT DEFAULT 'January 21, 2026',
  introduction TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create privacy_settings table
CREATE TABLE public.privacy_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  page_title TEXT DEFAULT 'Privacy Policy',
  last_updated_date TEXT DEFAULT 'January 21, 2026',
  introduction TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create cookie_settings table
CREATE TABLE public.cookie_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  page_title TEXT DEFAULT 'Cookie Policy',
  last_updated_date TEXT DEFAULT 'January 21, 2026',
  introduction TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Enable RLS on all tables
ALTER TABLE public.terms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_settings ENABLE ROW LEVEL SECURITY;
-- RLS Policies for terms_settings
CREATE POLICY "Admins can manage terms settings"
  ON public.terms_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view terms settings"
  ON public.terms_settings FOR SELECT
  USING (true);
-- RLS Policies for privacy_settings
CREATE POLICY "Admins can manage privacy settings"
  ON public.privacy_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view privacy settings"
  ON public.privacy_settings FOR SELECT
  USING (true);
-- RLS Policies for cookie_settings
CREATE POLICY "Admins can manage cookie settings"
  ON public.cookie_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view cookie settings"
  ON public.cookie_settings FOR SELECT
  USING (true);
-- Insert default data for terms_settings
INSERT INTO public.terms_settings (id, page_title, last_updated_date, introduction, sections)
VALUES (
  'default',
  'Terms of Service',
  'January 21, 2026',
  'Welcome to AlgarveOfficial. These Terms of Service ("Terms") govern your access to and use of the AlgarveOfficial website, services, and platform (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.',
  '[]'::jsonb
);
-- Insert default data for privacy_settings
INSERT INTO public.privacy_settings (id, page_title, last_updated_date, introduction, sections)
VALUES (
  'default',
  'Privacy Policy',
  'January 21, 2026',
  'AlgarveOfficial ("we", "our", or "us") is committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our website and services.',
  '[]'::jsonb
);
-- Insert default data for cookie_settings
INSERT INTO public.cookie_settings (id, page_title, last_updated_date, introduction, sections)
VALUES (
  'default',
  'Cookie Policy',
  'January 21, 2026',
  'This Cookie Policy explains how AlgarveOfficial uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.',
  '[]'::jsonb
);
