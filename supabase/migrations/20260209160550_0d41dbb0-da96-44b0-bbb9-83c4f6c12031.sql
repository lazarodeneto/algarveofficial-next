-- Function to auto-archive listings linked to past events
CREATE OR REPLACE FUNCTION public.archive_past_event_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE listings
  SET status = 'archived',
      updated_at = now()
  WHERE id IN (
    SELECT e.listing_id
    FROM events e
    WHERE e.listing_id IS NOT NULL
      AND e.end_date < CURRENT_DATE
      AND e.status = 'published'
  )
  AND status = 'published';
END;
$$;
-- Run it now to fix the current stale listing
SELECT public.archive_past_event_listings();
-- Also update the sync trigger to handle archiving on event update
CREATE OR REPLACE FUNCTION public.auto_archive_past_event_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When an event's end_date is updated and is now in the past, archive its listing
  IF NEW.listing_id IS NOT NULL AND NEW.end_date < CURRENT_DATE THEN
    UPDATE listings
    SET status = 'archived', updated_at = now()
    WHERE id = NEW.listing_id AND status = 'published';
  END IF;
  RETURN NEW;
END;
$$;
-- Trigger on event updates
DROP TRIGGER IF EXISTS trg_auto_archive_past_event_listing ON events;
CREATE TRIGGER trg_auto_archive_past_event_listing
AFTER UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION public.auto_archive_past_event_listing();
