-- Atomic metric increment helpers for webhook processing.
-- Prevents lost updates under concurrent webhook deliveries.

CREATE OR REPLACE FUNCTION public.increment_email_opens(contact_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_contacts
  SET
    emails_opened = COALESCE(emails_opened, 0) + 1,
    last_email_opened_at = now(),
    updated_at = now()
  WHERE id = contact_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_email_clicks(contact_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_contacts
  SET
    emails_clicked = COALESCE(emails_clicked, 0) + 1,
    last_email_clicked_at = now(),
    updated_at = now()
  WHERE id = contact_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_email_bounces(contact_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_contacts
  SET
    bounce_count = COALESCE(bounce_count, 0) + 1,
    status = 'bounced',
    updated_at = now()
  WHERE id = contact_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_campaign_opened(campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET
    total_opened = COALESCE(total_opened, 0) + 1,
    updated_at = now()
  WHERE id = campaign_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_campaign_clicked(campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET
    total_clicked = COALESCE(total_clicked, 0) + 1,
    updated_at = now()
  WHERE id = campaign_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.increment_campaign_bounced(campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.email_campaigns
  SET
    total_bounced = COALESCE(total_bounced, 0) + 1,
    updated_at = now()
  WHERE id = campaign_id;
END;
$$;
