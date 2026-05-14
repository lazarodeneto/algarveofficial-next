-- Admin Inbox slice 1: persistence for archive + assignment state.
-- Moderation approve/reject still write to source tables (listings, listing_reviews, events);
-- these tables only hold inbox-specific metadata that has no natural home on the source rows.

CREATE TABLE IF NOT EXISTS public.admin_inbox_archives (
  source text NOT NULL,
  source_row_id uuid NOT NULL,
  archived_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archived_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  PRIMARY KEY (source, source_row_id)
);

CREATE TABLE IF NOT EXISTS public.admin_inbox_assignments (
  source text NOT NULL,
  source_row_id uuid NOT NULL,
  assignee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, source_row_id)
);

DO $$
DECLARE
  existing_definition text;
  expected_definition text := 'CHECK ((source = ANY (ARRAY[''listing_moderation''::text, ''review_moderation''::text, ''event_moderation''::text])))';
BEGIN
  SELECT pg_get_constraintdef(oid)
  INTO existing_definition
  FROM pg_constraint
  WHERE conname = 'admin_inbox_archives_source_chk'
    AND conrelid = 'public.admin_inbox_archives'::regclass;

  IF existing_definition IS NULL THEN
    ALTER TABLE public.admin_inbox_archives
      ADD CONSTRAINT admin_inbox_archives_source_chk
        CHECK (source IN ('listing_moderation', 'review_moderation', 'event_moderation'));
  ELSIF existing_definition <> expected_definition THEN
    RAISE EXCEPTION
      'Existing constraint admin_inbox_archives_source_chk has unexpected definition: %',
      existing_definition;
  END IF;
END $$;

DO $$
DECLARE
  existing_definition text;
  expected_definition text := 'CHECK ((source = ANY (ARRAY[''listing_moderation''::text, ''review_moderation''::text, ''event_moderation''::text])))';
BEGIN
  SELECT pg_get_constraintdef(oid)
  INTO existing_definition
  FROM pg_constraint
  WHERE conname = 'admin_inbox_assignments_source_chk'
    AND conrelid = 'public.admin_inbox_assignments'::regclass;

  IF existing_definition IS NULL THEN
    ALTER TABLE public.admin_inbox_assignments
      ADD CONSTRAINT admin_inbox_assignments_source_chk
        CHECK (source IN ('listing_moderation', 'review_moderation', 'event_moderation'));
  ELSIF existing_definition <> expected_definition THEN
    RAISE EXCEPTION
      'Existing constraint admin_inbox_assignments_source_chk has unexpected definition: %',
      existing_definition;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS admin_inbox_assignments_assignee_idx
  ON public.admin_inbox_assignments (assignee_id);

ALTER TABLE public.admin_inbox_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_inbox_assignments ENABLE ROW LEVEL SECURITY;

-- Only admins can touch these tables. Service-role bypasses RLS.
DROP POLICY IF EXISTS admin_inbox_archives_admin_all
  ON public.admin_inbox_archives;

CREATE POLICY admin_inbox_archives_admin_all
  ON public.admin_inbox_archives
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS admin_inbox_assignments_admin_all
  ON public.admin_inbox_assignments;

CREATE POLICY admin_inbox_assignments_admin_all
  ON public.admin_inbox_assignments
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
