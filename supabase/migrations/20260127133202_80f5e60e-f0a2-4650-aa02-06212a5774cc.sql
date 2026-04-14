-- 1. Create sync function for email_subscribers → email_contacts
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
    NEW.email,
    NEW.full_name,
    CASE WHEN NEW.is_subscribed THEN 'subscribed'::email_contact_status ELSE 'unsubscribed'::email_contact_status END,
    COALESCE(NEW.tags, '{}'),
    COALESCE(NEW.source, 'newsletter'),
    NEW.subscribed_at,
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    status = CASE WHEN NEW.is_subscribed THEN 'subscribed'::email_contact_status ELSE 'unsubscribed'::email_contact_status END,
    updated_at = now();
  
  RETURN NEW;
END;
$$;
-- 2. Create trigger on email_subscribers
DROP TRIGGER IF EXISTS sync_subscriber_to_contacts_trigger ON public.email_subscribers;
CREATE TRIGGER sync_subscriber_to_contacts_trigger
  AFTER INSERT ON public.email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscriber_to_contacts();
-- 3. Update handle_new_user to also create email_contacts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Default role is viewer_logged
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer_logged');
  
  -- Create email contact (linked to user)
  INSERT INTO public.email_contacts (
    email,
    full_name,
    user_id,
    status,
    source,
    consent_given_at
  )
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.id,
    'subscribed'::email_contact_status,
    'signup',
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = NEW.id,
    updated_at = now();
  
  RETURN NEW;
END;
$$;
-- 4. Backfill: Sync any existing email_subscribers not in email_contacts
INSERT INTO public.email_contacts (email, full_name, status, tags, source, consent_given_at, created_at)
SELECT 
  es.email,
  es.full_name,
  CASE WHEN es.is_subscribed THEN 'subscribed'::email_contact_status ELSE 'unsubscribed'::email_contact_status END,
  COALESCE(es.tags, '{}'),
  COALESCE(es.source, 'newsletter'),
  es.subscribed_at,
  es.created_at
FROM public.email_subscribers es
WHERE es.email NOT IN (SELECT email FROM public.email_contacts);
