-- Allow "mark as read" / "clear notification" to hide any derived inbox source.
-- Source records are not modified; this only writes to the inbox archive side table.

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
