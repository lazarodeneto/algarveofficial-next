-- Add event_data JSONB column to store category-specific fields
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_data JSONB DEFAULT '{}'::jsonb;;
