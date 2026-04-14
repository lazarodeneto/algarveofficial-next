-- Backfill: sync existing email_subscribers to email_contacts
INSERT INTO public.email_contacts (
  email,
  full_name,
  status,
  tags,
  source,
  consent_given_at,
  created_at
)
SELECT 
  es.email,
  es.full_name,
  CASE WHEN es.is_subscribed THEN 'subscribed'::email_contact_status ELSE 'unsubscribed'::email_contact_status END,
  COALESCE(es.tags, '{}'),
  COALESCE(es.source, 'newsletter'),
  es.subscribed_at,
  es.created_at
FROM public.email_subscribers es
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_contacts ec WHERE ec.email = es.email
);
