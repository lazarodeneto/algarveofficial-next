-- Create event_status enum
CREATE TYPE event_status AS ENUM (
  'draft', 
  'pending_review', 
  'published', 
  'rejected', 
  'cancelled'
);

-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  image text,
  category text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  venue text,
  city_id uuid NOT NULL REFERENCES public.cities(id),
  ticket_url text,
  price_range text,
  is_featured boolean NOT NULL DEFAULT false,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_pattern text,
  related_listing_ids uuid[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  status event_status NOT NULL DEFAULT 'draft',
  rejection_reason text,
  submitter_id uuid NOT NULL REFERENCES public.profiles(id),
  meta_title text,
  meta_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create indexes for common queries
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_city_id ON public.events(city_id);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_submitter_id ON public.events(submitter_id);
CREATE INDEX idx_events_category ON public.events(category);

-- RLS Policies

-- Public can view published events that haven't ended
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
USING (status = 'published' AND end_date >= CURRENT_DATE);

-- Admins and editors have full access
CREATE POLICY "Admins and editors can manage all events"
ON public.events
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Owners can create their own events
CREATE POLICY "Owners can create events"
ON public.events
FOR INSERT
WITH CHECK (
  submitter_id = auth.uid() 
  AND has_role(auth.uid(), 'owner')
);

-- Owners can view their own events
CREATE POLICY "Owners can view their own events"
ON public.events
FOR SELECT
USING (submitter_id = auth.uid());

-- Owners can update their own draft or rejected events
CREATE POLICY "Owners can update their own draft or rejected events"
ON public.events
FOR UPDATE
USING (
  submitter_id = auth.uid() 
  AND status IN ('draft', 'rejected')
)
WITH CHECK (
  submitter_id = auth.uid() 
  AND status IN ('draft', 'rejected', 'pending_review')
);

-- Owners can delete their own draft events
CREATE POLICY "Owners can delete their own draft events"
ON public.events
FOR DELETE
USING (
  submitter_id = auth.uid() 
  AND status = 'draft'
);

-- Create trigger for updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create protection trigger for events
CREATE OR REPLACE FUNCTION public.enforce_event_protected_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins and editors to modify any field
  IF public.is_admin_or_editor(auth.uid()) THEN
    RETURN NEW;
  END IF;
  
  -- For non-admin/editor users, prevent modification of protected fields
  
  -- Prevent is_featured changes (admin only)
  IF NEW.is_featured IS DISTINCT FROM OLD.is_featured AND NEW.is_featured = true THEN
    RAISE EXCEPTION 'Only administrators can feature events';
  END IF;
  
  -- Prevent direct publishing (require review process)
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    RAISE EXCEPTION 'Only administrators can publish events';
  END IF;
  
  -- Prevent un-rejecting an event
  IF OLD.status = 'rejected' AND NEW.status NOT IN ('rejected', 'draft', 'pending_review') THEN
    RAISE EXCEPTION 'Only administrators can change rejected event status';
  END IF;
  
  -- Prevent changing to cancelled (admin only)
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    RAISE EXCEPTION 'Only administrators can cancel events';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to events table
CREATE TRIGGER enforce_event_protected_fields_trigger
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.enforce_event_protected_fields();;
