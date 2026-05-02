CREATE TABLE IF NOT EXISTS public.golf_tee_time_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.golf_courses(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  players INT,
  handicap TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.golf_tee_time_requests
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.golf_courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS preferred_date DATE,
  ADD COLUMN IF NOT EXISTS preferred_time TEXT,
  ADD COLUMN IF NOT EXISTS players INT,
  ADD COLUMN IF NOT EXISTS handicap TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS golf_tee_time_requests_listing_id_idx
  ON public.golf_tee_time_requests (listing_id);

CREATE INDEX IF NOT EXISTS golf_tee_time_requests_course_id_idx
  ON public.golf_tee_time_requests (course_id);

CREATE INDEX IF NOT EXISTS golf_tee_time_requests_status_created_at_idx
  ON public.golf_tee_time_requests (status, created_at DESC);
