-- Add listing_id column to events table
ALTER TABLE public.events 
ADD COLUMN listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL;
-- Create index for faster lookups
CREATE INDEX idx_events_listing_id ON public.events(listing_id);
-- Create function to sync event to listing
CREATE OR REPLACE FUNCTION public.sync_event_to_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _events_category_id uuid := '3b6ef365-60b2-4a92-9cb1-9dfd4f5a98d2';
  _premier_events_category_id uuid := '22dcc3a0-2bfd-4369-8f77-1c2cefc00816';
  _target_category_id uuid;
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

  -- Determine target category: premier-events for featured, otherwise events
  IF NEW.is_featured = true THEN
    _target_category_id := _premier_events_category_id;
  ELSE
    _target_category_id := _events_category_id;
  END IF;

  -- Map event status to listing status
  CASE NEW.status
    WHEN 'published' THEN _listing_status := 'published';
    WHEN 'cancelled' THEN _listing_status := 'archived';
    WHEN 'rejected' THEN _listing_status := 'rejected';
    ELSE _listing_status := 'draft';
  END CASE;

  -- Handle INSERT or UPDATE
  IF TG_OP = 'INSERT' THEN
    -- Only create listing if event is published
    IF NEW.status = 'published' THEN
      -- Generate unique slug for listing
      _slug := 'event-' || NEW.slug;
      
      INSERT INTO public.listings (
        name,
        slug,
        description,
        short_description,
        category_id,
        city_id,
        owner_id,
        status,
        featured_image_url,
        category_data,
        meta_title,
        meta_description,
        tags
      ) VALUES (
        NEW.title,
        _slug,
        NEW.description,
        NEW.short_description,
        _target_category_id,
        NEW.city_id,
        NEW.submitter_id,
        _listing_status,
        NEW.image,
        jsonb_build_object(
          'event_id', NEW.id,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'start_time', NEW.start_time,
          'end_time', NEW.end_time,
          'venue', NEW.venue,
          'location', NEW.location,
          'ticket_url', NEW.ticket_url,
          'price_range', NEW.price_range,
          'event_category', NEW.category
        ),
        NEW.meta_title,
        NEW.meta_description,
        NEW.tags
      )
      RETURNING id INTO _new_listing_id;
      
      -- Update the event with the new listing_id (bypass trigger recursion)
      NEW.listing_id := _new_listing_id;
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- If listing exists, update it
    IF NEW.listing_id IS NOT NULL THEN
      -- Update existing listing
      UPDATE public.listings SET
        name = NEW.title,
        description = NEW.description,
        short_description = NEW.short_description,
        category_id = _target_category_id,
        city_id = NEW.city_id,
        status = _listing_status,
        featured_image_url = NEW.image,
        category_data = jsonb_build_object(
          'event_id', NEW.id,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'start_time', NEW.start_time,
          'end_time', NEW.end_time,
          'venue', NEW.venue,
          'location', NEW.location,
          'ticket_url', NEW.ticket_url,
          'price_range', NEW.price_range,
          'event_category', NEW.category
        ),
        meta_title = NEW.meta_title,
        meta_description = NEW.meta_description,
        tags = NEW.tags,
        updated_at = now()
      WHERE id = NEW.listing_id;
      
      -- If event is no longer published, archive the listing
      IF NEW.status != 'published' AND OLD.status = 'published' THEN
        UPDATE public.listings SET status = _listing_status WHERE id = NEW.listing_id;
      END IF;
    ELSE
      -- No listing exists yet, create one if now published
      IF NEW.status = 'published' THEN
        _slug := 'event-' || NEW.slug;
        
        INSERT INTO public.listings (
          name,
          slug,
          description,
          short_description,
          category_id,
          city_id,
          owner_id,
          status,
          featured_image_url,
          category_data,
          meta_title,
          meta_description,
          tags
        ) VALUES (
          NEW.title,
          _slug,
          NEW.description,
          NEW.short_description,
          _target_category_id,
          NEW.city_id,
          NEW.submitter_id,
          _listing_status,
          NEW.image,
          jsonb_build_object(
            'event_id', NEW.id,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date,
            'start_time', NEW.start_time,
            'end_time', NEW.end_time,
            'venue', NEW.venue,
            'location', NEW.location,
            'ticket_url', NEW.ticket_url,
            'price_range', NEW.price_range,
            'event_category', NEW.category
          ),
          NEW.meta_title,
          NEW.meta_description,
          NEW.tags
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
-- Create trigger for events table
CREATE TRIGGER sync_event_listing_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_event_to_listing();
-- Backfill: Create listings for existing published events
DO $$
DECLARE
  _event RECORD;
  _events_category_id uuid := '3b6ef365-60b2-4a92-9cb1-9dfd4f5a98d2';
  _premier_events_category_id uuid := '22dcc3a0-2bfd-4369-8f77-1c2cefc00816';
  _target_category_id uuid;
  _new_listing_id uuid;
  _slug text;
BEGIN
  FOR _event IN 
    SELECT * FROM public.events 
    WHERE status = 'published' AND listing_id IS NULL
  LOOP
    -- Determine category
    IF _event.is_featured = true THEN
      _target_category_id := _premier_events_category_id;
    ELSE
      _target_category_id := _events_category_id;
    END IF;
    
    _slug := 'event-' || _event.slug;
    
    -- Create listing
    INSERT INTO public.listings (
      name,
      slug,
      description,
      short_description,
      category_id,
      city_id,
      owner_id,
      status,
      featured_image_url,
      category_data,
      meta_title,
      meta_description,
      tags
    ) VALUES (
      _event.title,
      _slug,
      _event.description,
      _event.short_description,
      _target_category_id,
      _event.city_id,
      _event.submitter_id,
      'published',
      _event.image,
      jsonb_build_object(
        'event_id', _event.id,
        'start_date', _event.start_date,
        'end_date', _event.end_date,
        'start_time', _event.start_time,
        'end_time', _event.end_time,
        'venue', _event.venue,
        'location', _event.location,
        'ticket_url', _event.ticket_url,
        'price_range', _event.price_range,
        'event_category', _event.category
      ),
      _event.meta_title,
      _event.meta_description,
      _event.tags
    )
    RETURNING id INTO _new_listing_id;
    
    -- Link event to listing
    UPDATE public.events SET listing_id = _new_listing_id WHERE id = _event.id;
  END LOOP;
END $$;
