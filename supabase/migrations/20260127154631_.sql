-- Create sync status table to track batch processing progress
CREATE TABLE public.google_ratings_sync_status (
  id text PRIMARY KEY DEFAULT 'default',
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'completed')),
  last_cursor uuid,
  batch_size integer NOT NULL DEFAULT 20,
  total_listings integer DEFAULT 0,
  processed_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Insert default row
INSERT INTO public.google_ratings_sync_status (id) VALUES ('default');

-- Create refresh log table for audit trail
CREATE TABLE public.google_ratings_refresh_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_started_at timestamptz NOT NULL,
  completed_at timestamptz,
  total_listings integer,
  success_count integer,
  failure_count integer,
  error_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_ratings_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ratings_refresh_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for sync status - admins can read and update
CREATE POLICY "Admins can manage sync status"
  ON public.google_ratings_sync_status
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view sync status"
  ON public.google_ratings_sync_status
  FOR SELECT
  USING (true);

-- RLS policies for refresh log - admins only
CREATE POLICY "Admins can manage refresh logs"
  ON public.google_ratings_refresh_log
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view refresh logs"
  ON public.google_ratings_refresh_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));;
