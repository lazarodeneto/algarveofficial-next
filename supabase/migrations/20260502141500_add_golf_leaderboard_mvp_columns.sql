-- Golf leaderboard MVP
-- Non-destructive compatibility layer for simple, optional leaderboard rows.

CREATE TABLE IF NOT EXISTS public.golf_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT,
  course_id UUID,
  total_score INT,
  to_par INT,
  rounds_played INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.golf_rounds
  ADD COLUMN IF NOT EXISTS player_name TEXT,
  ADD COLUMN IF NOT EXISTS course_id UUID,
  ADD COLUMN IF NOT EXISTS to_par INT,
  ADD COLUMN IF NOT EXISTS rounds_played INT DEFAULT 1;

ALTER TABLE public.golf_rounds
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN listing_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS golf_rounds_course_id_to_par_idx
  ON public.golf_rounds (course_id, to_par ASC);

CREATE INDEX IF NOT EXISTS golf_rounds_player_name_idx
  ON public.golf_rounds (player_name);
