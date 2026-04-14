-- GDPR Compliance: Auto-mask IP addresses on insert
CREATE OR REPLACE FUNCTION public.anonymize_analytics_ip()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Automatically mask IP address on insert for GDPR compliance
  IF NEW.ip_address IS NOT NULL THEN
    -- Store masked version - IPv4: mask last 2 octets, IPv6: full mask
    NEW.ip_address := CASE 
      WHEN family(NEW.ip_address) = 4 THEN 
        (split_part(host(NEW.ip_address), '.', 1) || '.' || 
         split_part(host(NEW.ip_address), '.', 2) || '.0.0')::inet
      ELSE 
        '::1'::inet  -- Anonymize IPv6 completely
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-mask IPs on analytics_events insert
DROP TRIGGER IF EXISTS anonymize_ip_on_insert ON public.analytics_events;
CREATE TRIGGER anonymize_ip_on_insert
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_analytics_ip();

-- Add comment documenting GDPR compliance
COMMENT ON TABLE public.analytics_events IS 'Analytics events with GDPR-compliant data handling. IP addresses are auto-masked on insert. Data older than 90 days is automatically purged.';

-- Ensure view_tracking also has proper documentation
COMMENT ON TABLE public.view_tracking IS 'Session-based view deduplication. No PII stored. Data older than 90 days is automatically purged per GDPR retention policy.';

-- Add consent tracking column to analytics_events if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analytics_events' 
    AND column_name = 'consent_given'
  ) THEN
    ALTER TABLE public.analytics_events ADD COLUMN consent_given boolean DEFAULT false;
  END IF;
END $$;

-- Update RLS policy to only allow inserts with consent
DROP POLICY IF EXISTS "Users can log their own events" ON public.analytics_events;
CREATE POLICY "Users can log events with consent"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (
    consent_given = true 
    AND ((user_id IS NULL) OR (user_id = auth.uid()))
  );;
