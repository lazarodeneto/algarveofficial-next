-- Ensure the current importer/admin golf schema exists in deployed databases.
-- This is intentionally additive and compatible with the earlier legacy
-- golf_holes listing_id model plus the newer course_id model.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.golf_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Main Course',
  holes_count integer NOT NULL DEFAULT 18 CHECK (holes_count BETWEEN 1 AND 54),
  is_default boolean NOT NULL DEFAULT false,
  holes integer,
  par integer,
  slope jsonb,
  course_rating jsonb,
  length_meters jsonb,
  designer text,
  year_opened integer,
  last_renovation integer,
  layout_type text,
  difficulty text,
  is_tournament_course boolean NOT NULL DEFAULT false,
  is_signature boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.golf_courses
  ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT 'Main Course',
  ADD COLUMN IF NOT EXISTS holes_count integer NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS holes integer,
  ADD COLUMN IF NOT EXISTS par integer,
  ADD COLUMN IF NOT EXISTS slope jsonb,
  ADD COLUMN IF NOT EXISTS course_rating jsonb,
  ADD COLUMN IF NOT EXISTS length_meters jsonb,
  ADD COLUMN IF NOT EXISTS designer text,
  ADD COLUMN IF NOT EXISTS year_opened integer,
  ADD COLUMN IF NOT EXISTS last_renovation integer,
  ADD COLUMN IF NOT EXISTS layout_type text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS is_tournament_course boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_signature boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.golf_courses
  DROP CONSTRAINT IF EXISTS golf_courses_holes_count_check;

UPDATE public.golf_courses
SET
  is_default = COALESCE(is_default, false),
  is_tournament_course = COALESCE(is_tournament_course, false),
  is_signature = COALESCE(is_signature, false),
  holes_count = CASE
    WHEN holes_count BETWEEN 1 AND 54 THEN holes_count
    ELSE 18
  END;

ALTER TABLE public.golf_courses
  ADD CONSTRAINT golf_courses_holes_count_check
  CHECK (holes_count BETWEEN 1 AND 54) NOT VALID;

ALTER TABLE public.golf_courses
  VALIDATE CONSTRAINT golf_courses_holes_count_check;

ALTER TABLE public.golf_courses
  ALTER COLUMN holes_count SET DEFAULT 18,
  ALTER COLUMN holes_count SET NOT NULL,
  ALTER COLUMN is_default SET DEFAULT false,
  ALTER COLUMN is_default SET NOT NULL,
  ALTER COLUMN is_tournament_course SET DEFAULT false,
  ALTER COLUMN is_tournament_course SET NOT NULL,
  ALTER COLUMN is_signature SET DEFAULT false,
  ALTER COLUMN is_signature SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_golf_courses_listing_id
  ON public.golf_courses(listing_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_golf_courses_default_per_listing
  ON public.golf_courses(listing_id)
  WHERE is_default = true;

CREATE TABLE IF NOT EXISTS public.golf_holes (
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  hole_number smallint NOT NULL,
  par smallint NOT NULL,
  stroke_index smallint,
  hcp smallint,
  distance_white integer,
  distance_yellow integer,
  distance_red integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, hole_number)
);

ALTER TABLE public.golf_holes
  ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.golf_courses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS stroke_index smallint,
  ADD COLUMN IF NOT EXISTS hcp smallint,
  ADD COLUMN IF NOT EXISTS distance_white integer,
  ADD COLUMN IF NOT EXISTS distance_yellow integer,
  ADD COLUMN IF NOT EXISTS distance_red integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.golf_holes
  DROP CONSTRAINT IF EXISTS golf_holes_hole_number_check,
  DROP CONSTRAINT IF EXISTS golf_holes_stroke_index_check;

ALTER TABLE public.golf_holes
  ADD CONSTRAINT golf_holes_hole_number_check
  CHECK (hole_number BETWEEN 1 AND 54) NOT VALID,
  ADD CONSTRAINT golf_holes_stroke_index_check
  CHECK (stroke_index IS NULL OR stroke_index BETWEEN 1 AND 54) NOT VALID;

ALTER TABLE public.golf_holes
  VALIDATE CONSTRAINT golf_holes_hole_number_check,
  VALIDATE CONSTRAINT golf_holes_stroke_index_check;

CREATE INDEX IF NOT EXISTS idx_golf_holes_course_id
  ON public.golf_holes(course_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'golf_holes_course_id_hole_number_key'
      AND conrelid = 'public.golf_holes'::regclass
  ) THEN
    ALTER TABLE public.golf_holes
      ADD CONSTRAINT golf_holes_course_id_hole_number_key UNIQUE (course_id, hole_number);
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.golf_round_holes') IS NOT NULL THEN
    ALTER TABLE public.golf_round_holes
      DROP CONSTRAINT IF EXISTS golf_round_holes_hole_number_check;

    ALTER TABLE public.golf_round_holes
      ADD CONSTRAINT golf_round_holes_hole_number_check
      CHECK (hole_number BETWEEN 1 AND 54) NOT VALID;

    ALTER TABLE public.golf_round_holes
      VALIDATE CONSTRAINT golf_round_holes_hole_number_check;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.set_golf_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS golf_courses_set_updated_at ON public.golf_courses;
CREATE TRIGGER golf_courses_set_updated_at
  BEFORE UPDATE ON public.golf_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_golf_updated_at();

DROP TRIGGER IF EXISTS golf_holes_set_updated_at ON public.golf_holes;
CREATE TRIGGER golf_holes_set_updated_at
  BEFORE UPDATE ON public.golf_holes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_golf_updated_at();

ALTER TABLE public.golf_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_holes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS golf_courses_select_public ON public.golf_courses;
CREATE POLICY golf_courses_select_public
  ON public.golf_courses
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS golf_courses_admin_write ON public.golf_courses;
CREATE POLICY golf_courses_admin_write
  ON public.golf_courses
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS golf_holes_select_public ON public.golf_holes;
CREATE POLICY golf_holes_select_public
  ON public.golf_holes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS golf_holes_admin_write ON public.golf_holes;
CREATE POLICY golf_holes_admin_write
  ON public.golf_holes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

NOTIFY pgrst, 'reload schema';
