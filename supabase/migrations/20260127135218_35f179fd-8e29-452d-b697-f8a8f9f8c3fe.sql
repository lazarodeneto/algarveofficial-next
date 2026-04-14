-- Function to recalculate all dynamic segment counts
CREATE OR REPLACE FUNCTION public.refresh_all_segment_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seg RECORD;
  cnt INTEGER;
BEGIN
  FOR seg IN SELECT id FROM email_segments WHERE is_dynamic = true
  LOOP
    -- Count subscribed contacts for each dynamic segment
    SELECT COUNT(*) INTO cnt
    FROM email_contacts
    WHERE status = 'subscribed';
    
    UPDATE email_segments SET contact_count = cnt, updated_at = now() WHERE id = seg.id;
  END LOOP;
END;
$$;
-- Trigger function to refresh segment counts
CREATE OR REPLACE FUNCTION public.trigger_refresh_segment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM refresh_all_segment_counts();
  RETURN NULL;
END;
$$;
-- Create trigger on email_contacts changes (statement-level for efficiency)
DROP TRIGGER IF EXISTS refresh_segments_on_contact_change ON email_contacts;
CREATE TRIGGER refresh_segments_on_contact_change
  AFTER INSERT OR UPDATE OR DELETE ON email_contacts
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_segment_counts();
-- Backfill existing segment counts
SELECT refresh_all_segment_counts();
