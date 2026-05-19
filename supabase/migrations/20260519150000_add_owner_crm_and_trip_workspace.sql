-- Owner CRM + visitor trip workspace v1.
-- Additive migration: creates owner-scoped CRM tables, visitor trip tables,
-- DB integrity triggers, and the atomic lead creation RPC.

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  primary_listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  email TEXT,
  normalized_email TEXT,
  phone TEXT,
  normalized_phone TEXT,
  country_code TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'active',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT crm_contacts_status_check CHECK (status IN ('active', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.crm_contact_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  channel_value TEXT NOT NULL,
  normalized_value TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crm_contact_channels_type_check CHECK (
    channel_type IN ('email', 'phone', 'whatsapp', 'website', 'instagram', 'facebook', 'linkedin', 'other')
  )
);

CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  thread_id UUID NULL REFERENCES public.chat_threads(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'new_lead',
  title TEXT,
  estimated_value_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  probability INTEGER,
  expected_close_at DATE,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT crm_opportunities_stage_check CHECK (
    stage IN ('new_lead', 'contacted', 'planning', 'booked', 'won', 'lost')
  ),
  CONSTRAINT crm_opportunities_probability_check CHECK (
    probability IS NULL OR (probability >= 0 AND probability <= 100)
  )
);

CREATE TABLE IF NOT EXISTS public.crm_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NULL REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  opportunity_id UUID NULL REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  thread_id UUID NULL REFERENCES public.chat_threads(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  source_table TEXT,
  source_record_id TEXT,
  summary TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT crm_activity_events_type_check CHECK (
    event_type IN (
      'message_received',
      'message_sent',
      'whatsapp_clicked',
      'inquiry_submitted',
      'listing_viewed',
      'listing_saved',
      'task_created',
      'task_completed',
      'opportunity_stage_changed',
      'manual_note',
      'billing_event',
      'listing_change_request'
    )
  )
);

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NULL REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  opportunity_id UUID NULL REFERENCES public.crm_opportunities(id) ON DELETE SET NULL,
  listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crm_tasks_status_check CHECK (status IN ('open', 'completed', 'cancelled')),
  CONSTRAINT crm_tasks_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE TABLE IF NOT EXISTS public.user_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  party_size INTEGER,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT user_trips_status_check CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  CONSTRAINT user_trips_party_size_check CHECK (party_size IS NULL OR party_size > 0)
);

CREATE TABLE IF NOT EXISTS public.user_trip_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.user_trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'listing',
  listing_id UUID NULL REFERENCES public.listings(id) ON DELETE SET NULL,
  external_event_id UUID,
  title TEXT NOT NULL,
  notes TEXT,
  day_date DATE,
  start_time TIME,
  end_time TIME,
  sort_order INTEGER NOT NULL DEFAULT 0,
  estimated_cost_cents INTEGER,
  currency TEXT DEFAULT 'EUR',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_updated
  ON public.crm_contacts(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_normalized_email
  ON public.crm_contacts(owner_id, normalized_email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_normalized_phone
  ON public.crm_contacts(owner_id, normalized_phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contacts_owner_viewer_unique
  ON public.crm_contacts(owner_id, viewer_id)
  WHERE viewer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contacts_owner_email_unique
  ON public.crm_contacts(owner_id, normalized_email)
  WHERE normalized_email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contacts_owner_phone_unique
  ON public.crm_contacts(owner_id, normalized_phone)
  WHERE normalized_phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_contact_channels_contact
  ON public.crm_contact_channels(owner_id, contact_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_contact_channels_unique_normalized
  ON public.crm_contact_channels(owner_id, contact_id, channel_type, normalized_value)
  WHERE normalized_value IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_owner_stage_updated
  ON public.crm_opportunities(owner_id, stage, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_owner_contact
  ON public.crm_opportunities(owner_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_owner_listing
  ON public.crm_opportunities(owner_id, listing_id);

CREATE INDEX IF NOT EXISTS idx_crm_activity_events_owner_occurred
  ON public.crm_activity_events(owner_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activity_events_owner_contact_occurred
  ON public.crm_activity_events(owner_id, contact_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_activity_events_source_unique
  ON public.crm_activity_events(owner_id, source_table, source_record_id)
  WHERE source_table IS NOT NULL AND source_record_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_tasks_owner_status_due
  ON public.crm_tasks(owner_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_owner_contact
  ON public.crm_tasks(owner_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_owner_opportunity
  ON public.crm_tasks(owner_id, opportunity_id);

CREATE INDEX IF NOT EXISTS idx_user_trips_user_updated
  ON public.user_trips(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_trip_events_trip_day_sort
  ON public.user_trip_events(trip_id, day_date, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_trip_events_user_created
  ON public.user_trip_events(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_trips_local_draft_unique
  ON public.user_trips(user_id, ((metadata->>'localDraftId')))
  WHERE NULLIF(metadata->>'localDraftId', '') IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_trip_events_local_event_unique
  ON public.user_trip_events(user_id, trip_id, ((metadata->>'localEventId')))
  WHERE NULLIF(metadata->>'localEventId', '') IS NOT NULL;

CREATE OR REPLACE FUNCTION public.crm_normalize_email(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(lower(trim(value)), '')
$$;

CREATE OR REPLACE FUNCTION public.crm_normalize_phone(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(regexp_replace(trim(value), '[^0-9+]', '', 'g'), '')
$$;

CREATE OR REPLACE FUNCTION public.crm_contacts_normalize()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.email := NULLIF(trim(NEW.email), '');
  NEW.phone := NULLIF(trim(NEW.phone), '');
  NEW.normalized_email := COALESCE(public.crm_normalize_email(NEW.normalized_email), public.crm_normalize_email(NEW.email));
  NEW.normalized_phone := COALESCE(public.crm_normalize_phone(NEW.normalized_phone), public.crm_normalize_phone(NEW.phone));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_contact_channels_normalize()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.channel_value := trim(NEW.channel_value);
  NEW.normalized_value := NULLIF(trim(COALESCE(NEW.normalized_value, NEW.channel_value)), '');

  IF NEW.channel_type = 'email' THEN
    NEW.normalized_value := public.crm_normalize_email(NEW.normalized_value);
  ELSIF NEW.channel_type IN ('phone', 'whatsapp') THEN
    NEW.normalized_value := public.crm_normalize_phone(NEW.normalized_value);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_assert_listing_owner(_listing_id UUID, _owner_id UUID)
RETURNS VOID
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF _listing_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.listings
    WHERE id = _listing_id
      AND owner_id = _owner_id
  ) THEN
    RAISE EXCEPTION 'CRM listing owner mismatch'
      USING ERRCODE = '23514';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_validate_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM public.crm_assert_listing_owner(NEW.primary_listing_id, NEW.owner_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_validate_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id
  FROM public.crm_contacts
  WHERE id = NEW.contact_id;

  IF v_owner_id IS NULL OR v_owner_id <> NEW.owner_id THEN
    RAISE EXCEPTION 'CRM contact channel owner mismatch'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_validate_opportunity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_contact_owner UUID;
  v_thread_owner UUID;
BEGIN
  SELECT owner_id INTO v_contact_owner
  FROM public.crm_contacts
  WHERE id = NEW.contact_id;

  IF v_contact_owner IS NULL OR v_contact_owner <> NEW.owner_id THEN
    RAISE EXCEPTION 'CRM opportunity contact owner mismatch'
      USING ERRCODE = '23514';
  END IF;

  PERFORM public.crm_assert_listing_owner(NEW.listing_id, NEW.owner_id);

  IF NEW.thread_id IS NOT NULL THEN
    SELECT owner_id INTO v_thread_owner
    FROM public.chat_threads
    WHERE id = NEW.thread_id;

    IF v_thread_owner IS NULL OR v_thread_owner <> NEW.owner_id THEN
      RAISE EXCEPTION 'CRM opportunity thread owner mismatch'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_validate_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner UUID;
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.crm_contacts WHERE id = NEW.contact_id;
    IF v_owner IS NULL OR v_owner <> NEW.owner_id THEN
      RAISE EXCEPTION 'CRM activity contact owner mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.opportunity_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.crm_opportunities WHERE id = NEW.opportunity_id;
    IF v_owner IS NULL OR v_owner <> NEW.owner_id THEN
      RAISE EXCEPTION 'CRM activity opportunity owner mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.thread_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.chat_threads WHERE id = NEW.thread_id;
    IF v_owner IS NULL OR v_owner <> NEW.owner_id THEN
      RAISE EXCEPTION 'CRM activity thread owner mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;

  PERFORM public.crm_assert_listing_owner(NEW.listing_id, NEW.owner_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_validate_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner UUID;
BEGIN
  IF NEW.contact_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.crm_contacts WHERE id = NEW.contact_id;
    IF v_owner IS NULL OR v_owner <> NEW.owner_id THEN
      RAISE EXCEPTION 'CRM task contact owner mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.opportunity_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.crm_opportunities WHERE id = NEW.opportunity_id;
    IF v_owner IS NULL OR v_owner <> NEW.owner_id THEN
      RAISE EXCEPTION 'CRM task opportunity owner mismatch' USING ERRCODE = '23514';
    END IF;
  END IF;

  PERFORM public.crm_assert_listing_owner(NEW.listing_id, NEW.owner_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_trip_events_validate_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_trip_owner UUID;
BEGIN
  SELECT user_id INTO v_trip_owner
  FROM public.user_trips
  WHERE id = NEW.trip_id;

  IF v_trip_owner IS NULL OR v_trip_owner <> NEW.user_id THEN
    RAISE EXCEPTION 'Trip event user mismatch'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crm_has_owner_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.has_role(_user_id, 'owner'::public.app_role)
      OR public.has_role(_user_id, 'admin'::public.app_role)
$$;

REVOKE ALL ON FUNCTION public.crm_has_owner_access(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_has_owner_access(UUID) TO authenticated, service_role;

DROP TRIGGER IF EXISTS crm_contacts_normalize_before_write ON public.crm_contacts;
CREATE TRIGGER crm_contacts_normalize_before_write
  BEFORE INSERT OR UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.crm_contacts_normalize();

DROP TRIGGER IF EXISTS crm_contact_channels_normalize_before_write ON public.crm_contact_channels;
CREATE TRIGGER crm_contact_channels_normalize_before_write
  BEFORE INSERT OR UPDATE ON public.crm_contact_channels
  FOR EACH ROW EXECUTE FUNCTION public.crm_contact_channels_normalize();

DROP TRIGGER IF EXISTS crm_contacts_validate_before_write ON public.crm_contacts;
CREATE TRIGGER crm_contacts_validate_before_write
  BEFORE INSERT OR UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.crm_validate_contact();

DROP TRIGGER IF EXISTS crm_contact_channels_validate_before_write ON public.crm_contact_channels;
CREATE TRIGGER crm_contact_channels_validate_before_write
  BEFORE INSERT OR UPDATE ON public.crm_contact_channels
  FOR EACH ROW EXECUTE FUNCTION public.crm_validate_channel();

DROP TRIGGER IF EXISTS crm_opportunities_validate_before_write ON public.crm_opportunities;
CREATE TRIGGER crm_opportunities_validate_before_write
  BEFORE INSERT OR UPDATE ON public.crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.crm_validate_opportunity();

DROP TRIGGER IF EXISTS crm_activity_events_validate_before_write ON public.crm_activity_events;
CREATE TRIGGER crm_activity_events_validate_before_write
  BEFORE INSERT OR UPDATE ON public.crm_activity_events
  FOR EACH ROW EXECUTE FUNCTION public.crm_validate_activity();

DROP TRIGGER IF EXISTS crm_tasks_validate_before_write ON public.crm_tasks;
CREATE TRIGGER crm_tasks_validate_before_write
  BEFORE INSERT OR UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.crm_validate_task();

DROP TRIGGER IF EXISTS user_trip_events_validate_before_write ON public.user_trip_events;
CREATE TRIGGER user_trip_events_validate_before_write
  BEFORE INSERT OR UPDATE ON public.user_trip_events
  FOR EACH ROW EXECUTE FUNCTION public.user_trip_events_validate_owner();

DROP TRIGGER IF EXISTS update_crm_contacts_updated_at ON public.crm_contacts;
CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_opportunities_updated_at ON public.crm_opportunities;
CREATE TRIGGER update_crm_opportunities_updated_at
  BEFORE UPDATE ON public.crm_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_tasks_updated_at ON public.crm_tasks;
CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_trips_updated_at ON public.user_trips;
CREATE TRIGGER update_user_trips_updated_at
  BEFORE UPDATE ON public.user_trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_trip_events_updated_at ON public.user_trip_events;
CREATE TRIGGER update_user_trip_events_updated_at
  BEFORE UPDATE ON public.user_trip_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trip_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_contacts_owner_manage ON public.crm_contacts;
CREATE POLICY crm_contacts_owner_manage
  ON public.crm_contacts FOR ALL
  TO authenticated
  USING (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS crm_contact_channels_owner_manage ON public.crm_contact_channels;
CREATE POLICY crm_contact_channels_owner_manage
  ON public.crm_contact_channels FOR ALL
  TO authenticated
  USING (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS crm_opportunities_owner_manage ON public.crm_opportunities;
CREATE POLICY crm_opportunities_owner_manage
  ON public.crm_opportunities FOR ALL
  TO authenticated
  USING (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS crm_activity_events_owner_read ON public.crm_activity_events;
CREATE POLICY crm_activity_events_owner_read
  ON public.crm_activity_events FOR SELECT
  TO authenticated
  USING (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS crm_activity_events_owner_manual_insert ON public.crm_activity_events;
CREATE POLICY crm_activity_events_owner_manual_insert
  ON public.crm_activity_events FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND public.crm_has_owner_access(auth.uid())
    AND event_type IN ('manual_note', 'task_created', 'task_completed', 'opportunity_stage_changed')
  );

DROP POLICY IF EXISTS crm_activity_events_admin_manage ON public.crm_activity_events;
CREATE POLICY crm_activity_events_admin_manage
  ON public.crm_activity_events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS crm_tasks_owner_manage ON public.crm_tasks;
CREATE POLICY crm_tasks_owner_manage
  ON public.crm_tasks FOR ALL
  TO authenticated
  USING (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    (owner_id = auth.uid() AND public.crm_has_owner_access(auth.uid()))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS user_trips_user_manage ON public.user_trips;
CREATE POLICY user_trips_user_manage
  ON public.user_trips FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS user_trip_events_user_manage ON public.user_trip_events;
CREATE POLICY user_trip_events_user_manage
  ON public.user_trip_events FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contact_channels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.crm_activity_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_trips TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_trip_events TO authenticated;

GRANT ALL ON public.crm_contacts TO service_role;
GRANT ALL ON public.crm_contact_channels TO service_role;
GRANT ALL ON public.crm_opportunities TO service_role;
GRANT ALL ON public.crm_activity_events TO service_role;
GRANT ALL ON public.crm_tasks TO service_role;
GRANT ALL ON public.user_trips TO service_role;
GRANT ALL ON public.user_trip_events TO service_role;

CREATE OR REPLACE FUNCTION public.ensure_owner_crm_lead(
  p_owner_id UUID,
  p_listing_id UUID DEFAULT NULL,
  p_viewer_id UUID DEFAULT NULL,
  p_thread_id UUID DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_source_table TEXT DEFAULT NULL,
  p_source_record_id TEXT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_contact public.crm_contacts%ROWTYPE;
  v_opportunity public.crm_opportunities%ROWTYPE;
  v_activity public.crm_activity_events%ROWTYPE;
  v_normalized_email TEXT := public.crm_normalize_email(p_email);
  v_normalized_phone TEXT := public.crm_normalize_phone(p_phone);
  v_identity_key TEXT;
  v_listing_name TEXT;
BEGIN
  IF p_owner_id IS NULL THEN
    RAISE EXCEPTION 'owner_id is required' USING ERRCODE = '22023';
  END IF;

  IF p_listing_id IS NOT NULL THEN
    SELECT name INTO v_listing_name
    FROM public.listings
    WHERE id = p_listing_id
      AND owner_id = p_owner_id;

    IF v_listing_name IS NULL THEN
      RAISE EXCEPTION 'Listing does not belong to owner' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_thread_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.chat_threads
    WHERE id = p_thread_id
      AND owner_id = p_owner_id
      AND (p_listing_id IS NULL OR listing_id IS NULL OR listing_id = p_listing_id)
  ) THEN
    RAISE EXCEPTION 'Thread does not belong to owner' USING ERRCODE = '42501';
  END IF;

  v_identity_key := COALESCE(
    p_viewer_id::TEXT,
    v_normalized_email,
    v_normalized_phone,
    p_source_table || ':' || p_source_record_id,
    gen_random_uuid()::TEXT
  );

  PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_id::TEXT || ':' || v_identity_key, 0));

  SELECT *
  INTO v_contact
  FROM public.crm_contacts
  WHERE owner_id = p_owner_id
    AND archived_at IS NULL
    AND (
      (p_viewer_id IS NOT NULL AND viewer_id = p_viewer_id)
      OR (v_normalized_email IS NOT NULL AND normalized_email = v_normalized_email)
      OR (v_normalized_phone IS NOT NULL AND normalized_phone = v_normalized_phone)
    )
  ORDER BY updated_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_contact.id IS NULL THEN
    INSERT INTO public.crm_contacts (
      owner_id,
      viewer_id,
      primary_listing_id,
      display_name,
      email,
      normalized_email,
      phone,
      normalized_phone,
      source,
      last_contacted_at,
      metadata
    )
    VALUES (
      p_owner_id,
      p_viewer_id,
      p_listing_id,
      NULLIF(trim(COALESCE(p_display_name, '')), ''),
      NULLIF(trim(COALESCE(p_email, '')), ''),
      v_normalized_email,
      NULLIF(trim(COALESCE(p_phone, '')), ''),
      v_normalized_phone,
      COALESCE(NULLIF(trim(p_source_table), ''), 'inquiry'),
      now(),
      COALESCE(p_metadata, '{}'::jsonb)
    )
    ON CONFLICT DO NOTHING
    RETURNING * INTO v_contact;
  ELSE
    UPDATE public.crm_contacts
    SET
      display_name = COALESCE(NULLIF(trim(COALESCE(p_display_name, '')), ''), display_name),
      email = COALESCE(NULLIF(trim(COALESCE(p_email, '')), ''), email),
      normalized_email = COALESCE(v_normalized_email, normalized_email),
      phone = COALESCE(NULLIF(trim(COALESCE(p_phone, '')), ''), phone),
      normalized_phone = COALESCE(v_normalized_phone, normalized_phone),
      primary_listing_id = COALESCE(primary_listing_id, p_listing_id),
      last_contacted_at = now(),
      metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
    WHERE id = v_contact.id
    RETURNING * INTO v_contact;
  END IF;

  IF v_contact.id IS NULL THEN
    SELECT *
    INTO v_contact
    FROM public.crm_contacts
    WHERE owner_id = p_owner_id
      AND archived_at IS NULL
      AND (
        (p_viewer_id IS NOT NULL AND viewer_id = p_viewer_id)
        OR (v_normalized_email IS NOT NULL AND normalized_email = v_normalized_email)
        OR (v_normalized_phone IS NOT NULL AND normalized_phone = v_normalized_phone)
      )
    ORDER BY updated_at DESC
    LIMIT 1
    FOR UPDATE;
  END IF;

  IF v_contact.id IS NULL THEN
    RAISE EXCEPTION 'Could not create CRM contact' USING ERRCODE = '23505';
  END IF;

  IF v_normalized_email IS NOT NULL THEN
    INSERT INTO public.crm_contact_channels (owner_id, contact_id, channel_type, channel_value, normalized_value, is_primary)
    VALUES (p_owner_id, v_contact.id, 'email', p_email, v_normalized_email, true)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_normalized_phone IS NOT NULL THEN
    INSERT INTO public.crm_contact_channels (owner_id, contact_id, channel_type, channel_value, normalized_value, is_primary)
    VALUES (p_owner_id, v_contact.id, 'phone', p_phone, v_normalized_phone, v_normalized_email IS NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  SELECT *
  INTO v_opportunity
  FROM public.crm_opportunities
  WHERE owner_id = p_owner_id
    AND contact_id = v_contact.id
    AND listing_id IS NOT DISTINCT FROM p_listing_id
    AND stage NOT IN ('won', 'lost')
  ORDER BY updated_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_opportunity.id IS NULL THEN
    INSERT INTO public.crm_opportunities (
      owner_id,
      contact_id,
      listing_id,
      thread_id,
      stage,
      title,
      metadata
    )
    VALUES (
      p_owner_id,
      v_contact.id,
      p_listing_id,
      p_thread_id,
      'new_lead',
      COALESCE(v_listing_name, 'New lead'),
      COALESCE(p_metadata, '{}'::jsonb)
    )
    RETURNING * INTO v_opportunity;
  ELSE
    UPDATE public.crm_opportunities
    SET
      thread_id = COALESCE(thread_id, p_thread_id),
      updated_at = now(),
      metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
    WHERE id = v_opportunity.id
    RETURNING * INTO v_opportunity;
  END IF;

  IF p_source_table IS NOT NULL AND p_source_record_id IS NOT NULL THEN
    INSERT INTO public.crm_activity_events (
      owner_id,
      contact_id,
      opportunity_id,
      listing_id,
      thread_id,
      event_type,
      source_table,
      source_record_id,
      summary,
      metadata
    )
    VALUES (
      p_owner_id,
      v_contact.id,
      v_opportunity.id,
      p_listing_id,
      p_thread_id,
      CASE
        WHEN p_source_table = 'chat_messages' THEN 'message_received'
        ELSE 'inquiry_submitted'
      END,
      p_source_table,
      p_source_record_id,
      p_summary,
      COALESCE(p_metadata, '{}'::jsonb)
    )
    ON CONFLICT DO NOTHING
    RETURNING * INTO v_activity;
  END IF;

  RETURN jsonb_build_object(
    'contactId', v_contact.id,
    'opportunityId', v_opportunity.id,
    'activityId', v_activity.id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_owner_crm_lead(
  UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_owner_crm_lead(
  UUID, UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO service_role;

COMMENT ON TABLE public.crm_contacts IS 'Owner-scoped CRM contacts. Not public; owners see only their own rows.';
COMMENT ON TABLE public.crm_activity_events IS 'Owner CRM activity timeline. Stores summaries and source links, not copied private message bodies.';
COMMENT ON TABLE public.user_trips IS 'Authenticated visitor trip plans. Owners cannot read visitor trips.';
COMMENT ON TABLE public.user_trip_events IS 'Authenticated visitor trip events with listing snapshots for durable itinerary display.';
