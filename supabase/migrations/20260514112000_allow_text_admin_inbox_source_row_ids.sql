-- Admin inbox side tables need to store both real row UUIDs and stable derived
-- alert keys such as translation_job:processor-unconfigured.

ALTER TABLE public.admin_inbox_archives
  DROP CONSTRAINT IF EXISTS admin_inbox_archives_pkey;

ALTER TABLE public.admin_inbox_archives
  ALTER COLUMN source_row_id TYPE text
  USING source_row_id::text;

ALTER TABLE public.admin_inbox_archives
  ADD CONSTRAINT admin_inbox_archives_pkey
  PRIMARY KEY (source, source_row_id);

ALTER TABLE public.admin_inbox_assignments
  DROP CONSTRAINT IF EXISTS admin_inbox_assignments_pkey;

ALTER TABLE public.admin_inbox_assignments
  ALTER COLUMN source_row_id TYPE text
  USING source_row_id::text;

ALTER TABLE public.admin_inbox_assignments
  ADD CONSTRAINT admin_inbox_assignments_pkey
  PRIMARY KEY (source, source_row_id);
