-- Include unread chat/contact messages in admin inbox action side tables.

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
        'chat_message',
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
        'chat_message',
        'translation_job'
      )
    );
