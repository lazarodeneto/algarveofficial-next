-- Standardize AlgarveOfficial public/support email defaults.

ALTER TABLE public.support_settings
  ALTER COLUMN email SET DEFAULT 'info@algarveofficial.com';

UPDATE public.support_settings
SET
  email = 'info@algarveofficial.com',
  updated_at = now()
WHERE id = 'default'
  AND (
    email IS NULL
    OR btrim(email) = ''
    OR lower(btrim(email)) = 'support@algarveofficial.com'
  );

UPDATE public.contact_settings
SET
  display_email = 'info@algarveofficial.com',
  forwarding_email = 'info@algarveofficial.com',
  updated_at = now()
WHERE id = 'default'
  AND (
    display_email IS NULL
    OR btrim(display_email) = ''
    OR lower(btrim(display_email)) IN (
      'hello@algarveofficial.com',
      'support@algarveofficial.com',
      'concierge@algarveofficial.com',
      'legal@algarveofficial.com',
      'privacy@algarveofficial.com',
      'admin@algarveofficial.com'
    )
    OR forwarding_email IS NULL
    OR btrim(forwarding_email) = ''
    OR lower(btrim(forwarding_email)) IN (
      'hello@algarveofficial.com',
      'support@algarveofficial.com',
      'concierge@algarveofficial.com',
      'legal@algarveofficial.com',
      'privacy@algarveofficial.com',
      'admin@algarveofficial.com'
    )
  );
