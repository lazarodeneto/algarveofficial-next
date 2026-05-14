-- Add double opt-in and Resend sync fields to the legacy newsletter table.
-- The legacy subscribe_newsletter RPC remains present, but no longer marks
-- contacts as subscribed without confirmation.

ALTER TABLE public.email_subscribers
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS unsubscribe_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_confirmation_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_contact_id TEXT,
  ADD COLUMN IF NOT EXISTS resend_sync_status TEXT,
  ADD COLUMN IF NOT EXISTS resend_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resend_segment_id TEXT,
  ADD COLUMN IF NOT EXISTS resend_topic_id TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS user_agent_hash TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMPTZ;

UPDATE public.email_subscribers
SET status = CASE
  WHEN is_subscribed THEN 'subscribed'
  WHEN unsubscribed_at IS NOT NULL THEN 'unsubscribed'
  ELSE 'pending'
END
WHERE status IS NULL;

ALTER TABLE public.email_subscribers
  ALTER COLUMN status SET DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'email_subscribers_status_check'
      AND conrelid = 'public.email_subscribers'::regclass
  ) THEN
    ALTER TABLE public.email_subscribers
      ADD CONSTRAINT email_subscribers_status_check
      CHECK (status IN ('pending', 'subscribed', 'unsubscribed', 'bounced', 'complained', 'failed'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_email_subscribers_lower_email
  ON public.email_subscribers (lower(email));

CREATE INDEX IF NOT EXISTS idx_email_subscribers_status
  ON public.email_subscribers (status);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_confirmation_token_hash
  ON public.email_subscribers (confirmation_token_hash)
  WHERE confirmation_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_subscribers_unsubscribe_token_hash
  ON public.email_subscribers (unsubscribe_token_hash)
  WHERE unsubscribe_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_subscribers_created_at
  ON public.email_subscribers (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_resend_contact_id
  ON public.email_subscribers (resend_contact_id)
  WHERE resend_contact_id IS NOT NULL;

DROP TRIGGER IF EXISTS set_email_subscribers_updated_at ON public.email_subscribers;
CREATE TRIGGER set_email_subscribers_updated_at
  BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_subscriber_to_contacts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _contact_status public.email_contact_status;
BEGIN
  -- Pending double opt-in records must not be promoted into subscribed CRM
  -- contacts before confirmation.
  IF COALESCE(NEW.status, 'pending') = 'pending' THEN
    RETURN NEW;
  END IF;

  _contact_status := CASE
    WHEN COALESCE(NEW.status, '') = 'subscribed' AND NEW.is_subscribed THEN 'subscribed'::public.email_contact_status
    WHEN COALESCE(NEW.status, '') = 'bounced' THEN 'bounced'::public.email_contact_status
    WHEN COALESCE(NEW.status, '') = 'complained' THEN 'complained'::public.email_contact_status
    ELSE 'unsubscribed'::public.email_contact_status
  END;

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
    _contact_status,
    COALESCE(NEW.tags, '{}'),
    COALESCE(NEW.source, 'newsletter'),
    CASE WHEN _contact_status = 'subscribed'::public.email_contact_status THEN COALESCE(NEW.confirmed_at, NEW.subscribed_at) ELSE NULL END,
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
  AFTER INSERT OR UPDATE OF email, full_name, is_subscribed, subscribed_at, confirmed_at, source, tags, status
  ON public.email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscriber_to_contacts();

CREATE OR REPLACE FUNCTION public.subscribe_newsletter(
  _email text,
  _full_name text DEFAULT NULL,
  _source text DEFAULT 'website',
  _ip_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _recent_count integer;
BEGIN
  IF _email IS NULL OR _email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email format');
  END IF;

  IF _ip_hash IS NOT NULL THEN
    SELECT COUNT(*) INTO _recent_count
    FROM public.newsletter_rate_limits
    WHERE ip_hash = _ip_hash
      AND created_at > now() - interval '1 hour';

    IF _recent_count >= 5 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Too many requests. Please try again later.');
    END IF;

    INSERT INTO public.newsletter_rate_limits (ip_hash) VALUES (_ip_hash);
  END IF;

  IF random() < 0.01 THEN
    PERFORM public.cleanup_newsletter_rate_limits();
  END IF;

  INSERT INTO public.email_subscribers (
    email,
    full_name,
    source,
    is_subscribed,
    status,
    subscribed_at
  )
  VALUES (
    lower(trim(_email)),
    _full_name,
    _source,
    false,
    'pending',
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.email_subscribers.full_name),
    source = COALESCE(EXCLUDED.source, public.email_subscribers.source, 'newsletter'),
    is_subscribed = CASE
      WHEN public.email_subscribers.status = 'subscribed' THEN public.email_subscribers.is_subscribed
      ELSE false
    END,
    status = CASE
      WHEN public.email_subscribers.status = 'subscribed' THEN public.email_subscribers.status
      WHEN public.email_subscribers.status IN ('bounced', 'complained') THEN public.email_subscribers.status
      ELSE 'pending'
    END,
    updated_at = now();

  RETURN jsonb_build_object('success', true, 'message', 'If this email can be subscribed, a confirmation email will be sent.');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription failed. Please try again.');
END;
$$;

COMMENT ON COLUMN public.email_subscribers.status IS
  'Newsletter lifecycle status for double opt-in and suppression handling.';
