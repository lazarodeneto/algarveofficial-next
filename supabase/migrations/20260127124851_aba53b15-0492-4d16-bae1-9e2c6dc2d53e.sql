-- Email Marketing System Database Schema

-- Create status enums
CREATE TYPE public.email_contact_status AS ENUM ('subscribed', 'unsubscribed', 'bounced', 'complained');
CREATE TYPE public.email_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled');
CREATE TYPE public.email_event_type AS ENUM ('delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed');
CREATE TYPE public.automation_status AS ENUM ('active', 'paused', 'draft');
CREATE TYPE public.automation_trigger_type AS ENUM ('signup', 'tag_added', 'segment_joined', 'manual', 'date_based');
-- Email Contacts (enhanced from email_subscribers)
CREATE TABLE public.email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status email_contact_status NOT NULL DEFAULT 'subscribed',
  tags TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  source TEXT,
  ip_address TEXT,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  last_email_opened_at TIMESTAMP WITH TIME ZONE,
  last_email_clicked_at TIMESTAMP WITH TIME ZONE,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Email Templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  category TEXT DEFAULT 'general',
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Email Segments
CREATE TABLE public.email_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '[]',
  contact_count INTEGER DEFAULT 0,
  is_dynamic BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Email Campaigns
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'AlgarveOfficial',
  from_email TEXT NOT NULL,
  reply_to TEXT,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  segment_id UUID REFERENCES public.email_segments(id) ON DELETE SET NULL,
  status email_campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Campaign Recipients (individual send tracking)
CREATE TABLE public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.email_contacts(id) ON DELETE CASCADE,
  resend_id TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, contact_id)
);
-- Email Events (tracking)
CREATE TABLE public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.email_contacts(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.campaign_recipients(id) ON DELETE CASCADE,
  event_type email_event_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Email Automations
CREATE TABLE public.email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type automation_trigger_type NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  status automation_status NOT NULL DEFAULT 'draft',
  total_enrolled INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Automation Enrollments
CREATE TABLE public.automation_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.email_automations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.email_contacts(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_step_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(automation_id, contact_id)
);
-- Indexes for performance
CREATE INDEX idx_email_contacts_status ON public.email_contacts(status);
CREATE INDEX idx_email_contacts_email ON public.email_contacts(email);
CREATE INDEX idx_email_contacts_tags ON public.email_contacts USING GIN(tags);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON public.email_campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_contact ON public.campaign_recipients(contact_id);
CREATE INDEX idx_email_events_campaign ON public.email_events(campaign_id);
CREATE INDEX idx_email_events_contact ON public.email_events(contact_id);
CREATE INDEX idx_email_events_type ON public.email_events(event_type);
CREATE INDEX idx_automation_enrollments_automation ON public.automation_enrollments(automation_id);
CREATE INDEX idx_automation_enrollments_contact ON public.automation_enrollments(contact_id);
-- Enable RLS on all tables
ALTER TABLE public.email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_enrollments ENABLE ROW LEVEL SECURITY;
-- RLS Policies: Admin/Editor only access for all email marketing tables
CREATE POLICY "Admins can manage email contacts"
  ON public.email_contacts FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage email segments"
  ON public.email_segments FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage email campaigns"
  ON public.email_campaigns FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage campaign recipients"
  ON public.campaign_recipients FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage email events"
  ON public.email_events FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage email automations"
  ON public.email_automations FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can manage automation enrollments"
  ON public.automation_enrollments FOR ALL
  USING (public.is_admin_or_editor(auth.uid()));
-- Triggers for updated_at
CREATE TRIGGER update_email_contacts_updated_at
  BEFORE UPDATE ON public.email_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_segments_updated_at
  BEFORE UPDATE ON public.email_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_automations_updated_at
  BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Migrate existing email_subscribers to email_contacts
INSERT INTO public.email_contacts (email, full_name, status, tags, source, consent_given_at, created_at)
SELECT 
  email,
  full_name,
  CASE WHEN is_subscribed THEN 'subscribed'::email_contact_status ELSE 'unsubscribed'::email_contact_status END,
  COALESCE(tags, '{}'),
  source,
  subscribed_at,
  created_at
FROM public.email_subscribers
ON CONFLICT (email) DO NOTHING;
