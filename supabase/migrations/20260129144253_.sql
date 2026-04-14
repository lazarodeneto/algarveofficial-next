-- Create support_settings table for Owner Support page CMS
CREATE TABLE public.support_settings (
  id text PRIMARY KEY DEFAULT 'default',
  email text DEFAULT 'support@algarveofficial.com',
  phone text DEFAULT '+351 289 123 456',
  phone_hours text DEFAULT 'Mon-Fri, 9:00-18:00',
  help_center_url text DEFAULT '#',
  help_center_label text DEFAULT 'Browse our guides',
  response_time text DEFAULT '< 24 hours',
  response_time_note text DEFAULT 'During business hours',
  form_title text DEFAULT 'Send a Message',
  form_description text DEFAULT 'Fill out the form below and we''ll get back to you as soon as possible',
  success_message text DEFAULT 'Support request submitted! We''ll respond within 24 hours.',
  categories jsonb DEFAULT '["Listing Issue", "Membership & Billing", "Request New Listing", "Technical Problem", "Other"]'::jsonb,
  faqs jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

-- Insert default row
INSERT INTO public.support_settings (id) VALUES ('default');

-- RLS Policies
CREATE POLICY "Admins can manage support settings"
ON public.support_settings FOR ALL USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Anyone can view support settings"
ON public.support_settings FOR SELECT USING (true);;
