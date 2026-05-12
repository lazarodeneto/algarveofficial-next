-- Keep admin inbox action side-table source constraints aligned with every
-- current derived inbox source. This repeats the constraint sync with a newer
-- timestamp so environments that missed the earlier migration can recover.

ALTER TABLE public.admin_inbox_archives
  DROP CONSTRAINT IF EXISTS admin_inbox_archives_source_chk;

ALTER TABLE public.admin_inbox_archives
  ADD CONSTRAINT admin_inbox_archives_source_chk
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
