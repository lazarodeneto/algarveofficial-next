-- Add SLA tracking columns to translation_jobs.
-- sla_deadline: when the job must be completed (set per tier at enqueue time)
-- sla_priority: numeric weight used in priority score computation

ALTER TABLE public.translation_jobs
  ADD COLUMN IF NOT EXISTS sla_deadline  TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sla_priority  INT         DEFAULT 0    NOT NULL;

-- Index for fast breach queries (sla_deadline < NOW() WHERE status IN (...))
CREATE INDEX IF NOT EXISTS translation_jobs_sla_deadline_idx
  ON public.translation_jobs (sla_deadline)
  WHERE sla_deadline IS NOT NULL;

-- Index for priority-ordered scans
CREATE INDEX IF NOT EXISTS translation_jobs_sla_priority_idx
  ON public.translation_jobs (sla_priority DESC);

COMMENT ON COLUMN public.translation_jobs.sla_deadline IS
  'Timestamp by which this job must complete. NULL = no SLA commitment.';
COMMENT ON COLUMN public.translation_jobs.sla_priority IS
  'Numeric priority weight injected at enqueue time. Signature = 100, Verified = 10.';
