-- Merge 'events' category into 'premier-events'
-- All listings currently in the 'events' category are reassigned to 'premier-events'.
-- The 'events' category row is then deleted.
-- The event sync trigger is updated so ALL events (featured or not) go to 'premier-events'.

-- Step 1: Reassign all listings from events → premier-events
UPDATE public.listings
SET category_id = '22dcc3a0-2bfd-4369-8f77-1c2cefc00816'
WHERE category_id = '3b6ef365-60b2-4a92-9cb1-9dfd4f5a98d2';
-- Step 2: Delete the 'events' category
DELETE FROM public.categories
WHERE slug = 'events';
-- Step 3: Update the event sync trigger to always use premier-events
CREATE OR REPLACE FUNCTION public.sync_event_to_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _premier_events_category_id uuid := '22dcc3a0-2bfd-4369-8f77-1c2cefc00816';
  _new_listing_id uuid;
  _listing_status listing_status;
  _slug text;
BEGIN
  -- Handle DELETE: remove linked listing
  IF TG_OP = 'DELETE' THEN
    IF OLD.listing_id IS NOT NULL THEN
      DELETE FROM public.listings WHERE id = OLD.listing_id;
    END IF;
    RETURN OLD;
  END IF;

  -- Map event status to listing status
  CASE NEW.status
    WHEN 'published' THEN _listing_status := 'published';
    WHEN 'cancelled' THEN _listing_status := 'archived';
    WHEN 'rejected' THEN _listing_status := 'rejected';
    ELSE _listing_status := 'draft';
  END CASE;

  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'published' THEN
      _slug := 'event-' || NEW.slug;

      INSERT INTO public.listings (
        name, slug, description, short_description,
        category_id, city_id, owner_id, status, featured_image_url,
        category_data, meta_title, meta_description, tags
      ) VALUES (
        NEW.title, _slug, NEW.description, NEW.short_description,
        _premier_events_category_id, NEW.city_id, NEW.submitter_id,
        _listing_status, NEW.image,
        jsonb_build_object(
          'event_id', NEW.id,
          'start_date', NEW.start_date, 'end_date', NEW.end_date,
          'start_time', NEW.start_time, 'end_time', NEW.end_time,
          'venue', NEW.venue, 'location', NEW.location,
          'ticket_url', NEW.ticket_url, 'price_range', NEW.price_range,
          'event_category', NEW.category
        ),
        NEW.meta_title, NEW.meta_description, NEW.tags
      )
      RETURNING id INTO _new_listing_id;

      NEW.listing_id := _new_listing_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.listing_id IS NOT NULL THEN
      UPDATE public.listings SET
        name = NEW.title,
        description = NEW.description,
        short_description = NEW.short_description,
        category_id = _premier_events_category_id,
        city_id = NEW.city_id,
        status = _listing_status,
        featured_image_url = NEW.image,
        category_data = jsonb_build_object(
          'event_id', NEW.id,
          'start_date', NEW.start_date, 'end_date', NEW.end_date,
          'start_time', NEW.start_time, 'end_time', NEW.end_time,
          'venue', NEW.venue, 'location', NEW.location,
          'ticket_url', NEW.ticket_url, 'price_range', NEW.price_range,
          'event_category', NEW.category
        ),
        meta_title = NEW.meta_title,
        meta_description = NEW.meta_description,
        tags = NEW.tags,
        updated_at = now()
      WHERE id = NEW.listing_id;

      IF NEW.status != 'published' AND OLD.status = 'published' THEN
        UPDATE public.listings SET status = _listing_status WHERE id = NEW.listing_id;
      END IF;
    ELSE
      IF NEW.status = 'published' THEN
        _slug := 'event-' || NEW.slug;

        INSERT INTO public.listings (
          name, slug, description, short_description,
          category_id, city_id, owner_id, status, featured_image_url,
          category_data, meta_title, meta_description, tags
        ) VALUES (
          NEW.title, _slug, NEW.description, NEW.short_description,
          _premier_events_category_id, NEW.city_id, NEW.submitter_id,
          _listing_status, NEW.image,
          jsonb_build_object(
            'event_id', NEW.id,
            'start_date', NEW.start_date, 'end_date', NEW.end_date,
            'start_time', NEW.start_time, 'end_time', NEW.end_time,
            'venue', NEW.venue, 'location', NEW.location,
            'ticket_url', NEW.ticket_url, 'price_range', NEW.price_range,
            'event_category', NEW.category
          ),
          NEW.meta_title, NEW.meta_description, NEW.tags
        )
        RETURNING id INTO _new_listing_id;

        NEW.listing_id := _new_listing_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;
