-- Create table to track AI image generation usage
CREATE TABLE public.ai_generation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('city', 'listing')),
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  category_slug TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
-- Add index for efficient querying
CREATE INDEX idx_ai_generation_logs_created_at ON public.ai_generation_logs(created_at DESC);
CREATE INDEX idx_ai_generation_logs_entity_type ON public.ai_generation_logs(entity_type);
CREATE INDEX idx_ai_generation_logs_status ON public.ai_generation_logs(status);
-- Enable RLS
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;
-- Only admins can view generation logs
CREATE POLICY "Admins can view generation logs"
ON public.ai_generation_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
-- Only admins can insert generation logs
CREATE POLICY "Admins can insert generation logs"
ON public.ai_generation_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Add comment
COMMENT ON TABLE public.ai_generation_logs IS 'Tracks AI image generation requests for monitoring and usage statistics';
