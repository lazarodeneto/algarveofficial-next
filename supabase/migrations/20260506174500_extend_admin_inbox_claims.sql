-- Surface derived operational inbox sources without creating a new task table.

ALTER TABLE public.admin_inbox_archives
  DROP CONSTRAINT IF EXISTS admin_inbox_archives_source_chk;

ALTER TABLE public.admin_inbox_archives
  ADD CONSTRAINT admin_inbox_archives_source_chk
    CHECK (source IN ('listing_claim', 'listing_moderation', 'review_moderation', 'event_moderation'));

ALTER TABLE public.admin_inbox_assignments
  DROP CONSTRAINT IF EXISTS admin_inbox_assignments_source_chk;

ALTER TABLE public.admin_inbox_assignments
  ADD CONSTRAINT admin_inbox_assignments_source_chk
    CHECK (
      source IN (
        'billing_subscription',
        'external_outbox_alert',
        'listing_claim',
        'listing_moderation',
        'review_moderation',
        'event_moderation',
        'translation_job'
      )
    );
