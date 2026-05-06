-- Keep newsletter subscription updates synchronized with email_contacts.
-- subscribe_newsletter uses ON CONFLICT DO UPDATE for existing subscribers,
-- so the subscriber/contact bridge must react to updates as well as inserts.

CREATE OR REPLACE FUNCTION public.sync_subscriber_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.email_contacts (
    email,
    full_name,
    status,
    tags,
    source,
    consent_given_at,
    created_at
  )
  VALUES (
    lower(trim(NEW.email)),
    NEW.full_name,
    CASE
      WHEN NEW.is_subscribed THEN 'subscribed'::public.email_contact_status
      ELSE 'unsubscribed'::public.email_contact_status
    END,
    COALESCE(NEW.tags, '{}'),
    COALESCE(NEW.source, 'newsletter'),
    CASE WHEN NEW.is_subscribed THEN NEW.subscribed_at ELSE NULL END,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.email_contacts.full_name),
    status = EXCLUDED.status,
    tags = COALESCE(EXCLUDED.tags, public.email_contacts.tags, '{}'),
    source = COALESCE(EXCLUDED.source, public.email_contacts.source, 'newsletter'),
    consent_given_at = CASE
      WHEN EXCLUDED.status = 'subscribed'::public.email_contact_status
        THEN COALESCE(EXCLUDED.consent_given_at, public.email_contacts.consent_given_at)
      ELSE public.email_contacts.consent_given_at
    END,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_subscriber_to_contacts_trigger ON public.email_subscribers;
CREATE TRIGGER sync_subscriber_to_contacts_trigger
  AFTER INSERT OR UPDATE OF email, full_name, is_subscribed, subscribed_at, source, tags
  ON public.email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscriber_to_contacts();
