-- Add explicit inbox status history to the existing admin inbox side table.
-- Source records remain canonical; this table stores inbox-only state and
-- snapshots needed when a resolved source row no longer matches active queries.

ALTER TABLE public.admin_inbox_archives
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS dismissed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS item_snapshot jsonb;

UPDATE public.admin_inbox_archives
SET status = CASE
  WHEN reason = 'read_from_list' OR reason LIKE 'read_from_list:%' THEN 'open'
  WHEN reason IN ('archived', 'archived_from_list')
    OR reason LIKE 'archived:%'
    OR reason LIKE 'archived_from_list:%'
    THEN 'archived'
  WHEN reason IN ('resolved', 'resolved_from_inbox', 'approved_from_inbox', 'rejected_from_inbox')
    OR reason LIKE 'resolved:%'
    OR reason LIKE 'resolved_from_inbox:%'
    OR reason LIKE 'approved_from_inbox:%'
    OR reason LIKE 'rejected_from_inbox:%'
    THEN 'resolved'
  ELSE 'dismissed'
END
WHERE status IS NULL;

UPDATE public.admin_inbox_archives
SET
  resolved_at = COALESCE(resolved_at, archived_at),
  updated_at = COALESCE(updated_at, archived_at)
WHERE status = 'resolved';

UPDATE public.admin_inbox_archives
SET
  dismissed_at = COALESCE(dismissed_at, archived_at),
  updated_at = COALESCE(updated_at, archived_at)
WHERE status = 'dismissed';

ALTER TABLE public.admin_inbox_archives
  ALTER COLUMN status SET DEFAULT 'archived',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.admin_inbox_archives
  DROP CONSTRAINT IF EXISTS admin_inbox_archives_status_chk;

ALTER TABLE public.admin_inbox_archives
  ADD CONSTRAINT admin_inbox_archives_status_chk
    CHECK (status IN ('open', 'archived', 'resolved', 'dismissed'));

CREATE INDEX IF NOT EXISTS admin_inbox_archives_status_idx
  ON public.admin_inbox_archives (status);

CREATE INDEX IF NOT EXISTS admin_inbox_archives_updated_at_idx
  ON public.admin_inbox_archives (updated_at DESC);
