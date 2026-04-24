-- Golf round + scorecard tracking
-- Canonical course source remains public.listings (category = golf)

CREATE TABLE IF NOT EXISTS public.golf_holes (
  listing_id        uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  hole_number       smallint NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  par               smallint NOT NULL CHECK (par BETWEEN 2 AND 6),
  stroke_index      smallint CHECK (stroke_index BETWEEN 1 AND 18),
  distance_white    integer CHECK (distance_white IS NULL OR distance_white > 0),
  distance_yellow   integer CHECK (distance_yellow IS NULL OR distance_yellow > 0),
  distance_red      integer CHECK (distance_red IS NULL OR distance_red > 0),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, hole_number)
);

CREATE TABLE IF NOT EXISTS public.golf_rounds (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id        uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  tee_color         text NOT NULL DEFAULT 'yellow'
                    CHECK (tee_color IN ('white', 'yellow', 'red')),
  total_score       integer CHECK (total_score IS NULL OR total_score >= 0),
  total_vs_par      integer,
  started_at        timestamptz NOT NULL DEFAULT now(),
  finished_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.golf_round_holes (
  round_id          uuid NOT NULL REFERENCES public.golf_rounds(id) ON DELETE CASCADE,
  hole_number       smallint NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
  strokes           smallint NOT NULL CHECK (strokes BETWEEN 1 AND 20),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (round_id, hole_number)
);

CREATE INDEX IF NOT EXISTS golf_rounds_user_id_started_at_idx
  ON public.golf_rounds (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS golf_rounds_listing_id_idx
  ON public.golf_rounds (listing_id);

CREATE INDEX IF NOT EXISTS golf_round_holes_round_id_idx
  ON public.golf_round_holes (round_id);

CREATE OR REPLACE FUNCTION public.set_golf_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS golf_holes_set_updated_at ON public.golf_holes;
CREATE TRIGGER golf_holes_set_updated_at
  BEFORE UPDATE ON public.golf_holes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_golf_updated_at();

DROP TRIGGER IF EXISTS golf_rounds_set_updated_at ON public.golf_rounds;
CREATE TRIGGER golf_rounds_set_updated_at
  BEFORE UPDATE ON public.golf_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.set_golf_updated_at();

DROP TRIGGER IF EXISTS golf_round_holes_set_updated_at ON public.golf_round_holes;
CREATE TRIGGER golf_round_holes_set_updated_at
  BEFORE UPDATE ON public.golf_round_holes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_golf_updated_at();

ALTER TABLE public.golf_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_round_holes ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS golf_rounds_select_own ON public.golf_rounds;
CREATE POLICY golf_rounds_select_own
  ON public.golf_rounds
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS golf_rounds_insert_own ON public.golf_rounds;
CREATE POLICY golf_rounds_insert_own
  ON public.golf_rounds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS golf_rounds_update_own ON public.golf_rounds;
CREATE POLICY golf_rounds_update_own
  ON public.golf_rounds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS golf_rounds_delete_own ON public.golf_rounds;
CREATE POLICY golf_rounds_delete_own
  ON public.golf_rounds
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS golf_round_holes_select_own ON public.golf_round_holes;
CREATE POLICY golf_round_holes_select_own
  ON public.golf_round_holes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.golf_rounds rounds
      WHERE rounds.id = golf_round_holes.round_id
        AND rounds.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS golf_round_holes_insert_own ON public.golf_round_holes;
CREATE POLICY golf_round_holes_insert_own
  ON public.golf_round_holes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.golf_rounds rounds
      WHERE rounds.id = golf_round_holes.round_id
        AND rounds.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS golf_round_holes_update_own ON public.golf_round_holes;
CREATE POLICY golf_round_holes_update_own
  ON public.golf_round_holes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.golf_rounds rounds
      WHERE rounds.id = golf_round_holes.round_id
        AND rounds.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.golf_rounds rounds
      WHERE rounds.id = golf_round_holes.round_id
        AND rounds.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS golf_round_holes_delete_own ON public.golf_round_holes;
CREATE POLICY golf_round_holes_delete_own
  ON public.golf_round_holes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.golf_rounds rounds
      WHERE rounds.id = golf_round_holes.round_id
        AND rounds.user_id = auth.uid()
    )
  );
