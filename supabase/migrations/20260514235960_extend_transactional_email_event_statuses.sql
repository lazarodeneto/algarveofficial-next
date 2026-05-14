-- Resend webhook lifecycle statuses for transactional_email_events.

ALTER TABLE public.transactional_email_events
  DROP CONSTRAINT IF EXISTS transactional_email_events_status_check;

ALTER TABLE public.transactional_email_events
  ADD CONSTRAINT transactional_email_events_status_check
  CHECK (
    status IN (
      'attempt',
      'sent',
      'failed',
      'skipped',
      'delivered',
      'delivery_delayed',
      'bounced',
      'complained',
      'opened',
      'clicked',
      'suppressed'
    )
  );
