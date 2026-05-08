-- Golf leaderboard course names
-- Adds a denormalized course_name for leaderboard displays, backfills it from listings,
-- and clears dedicated leaderboard rows so the public leaderboard starts empty.

ALTER TABLE IF EXISTS public.golf_rounds
  ADD COLUMN IF NOT EXISTS course_name text;

ALTER TABLE IF EXISTS public.golf_leaderboard
  ADD COLUMN IF NOT EXISTS course_name text;

ALTER TABLE IF EXISTS public.golf_leaderboard_entries
  ADD COLUMN IF NOT EXISTS course_name text;

DO $$
BEGIN
  IF to_regclass('public.golf_rounds') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'golf_rounds'
        AND column_name = 'listing_id'
    ) THEN
      EXECUTE '
        UPDATE public.golf_rounds AS rounds
        SET course_name = COALESCE(rounds.course_name, listings.name)
        FROM public.listings AS listings
        WHERE rounds.course_name IS NULL
          AND rounds.listing_id = listings.id
      ';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'golf_rounds'
        AND column_name = 'course_id'
    ) THEN
      EXECUTE '
        UPDATE public.golf_rounds AS rounds
        SET course_name = COALESCE(rounds.course_name, listings.name)
        FROM public.listings AS listings
        WHERE rounds.course_name IS NULL
          AND rounds.course_id = listings.id
      ';
    END IF;

    CREATE INDEX IF NOT EXISTS golf_rounds_course_name_idx
      ON public.golf_rounds (course_name)
      WHERE course_name IS NOT NULL;

    COMMENT ON COLUMN public.golf_rounds.course_name IS
      'Denormalized golf course name for leaderboard display.';
  END IF;

  IF to_regclass('public.golf_leaderboard') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'golf_leaderboard'
        AND column_name IN ('listing_id', 'course_id')
    ) THEN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'golf_leaderboard'
          AND column_name = 'listing_id'
      ) THEN
        EXECUTE '
          UPDATE public.golf_leaderboard AS leaderboard
          SET course_name = COALESCE(leaderboard.course_name, listings.name)
          FROM public.listings AS listings
          WHERE leaderboard.course_name IS NULL
            AND leaderboard.listing_id = listings.id
        ';
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'golf_leaderboard'
          AND column_name = 'course_id'
      ) THEN
        EXECUTE '
          UPDATE public.golf_leaderboard AS leaderboard
          SET course_name = COALESCE(leaderboard.course_name, listings.name)
          FROM public.listings AS listings
          WHERE leaderboard.course_name IS NULL
            AND leaderboard.course_id = listings.id
        ';
      END IF;
    END IF;

  END IF;

  IF to_regclass('public.golf_leaderboard_entries') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'golf_leaderboard_entries'
        AND column_name = 'listing_id'
    ) THEN
      EXECUTE '
        UPDATE public.golf_leaderboard_entries AS entries
        SET course_name = COALESCE(entries.course_name, listings.name)
        FROM public.listings AS listings
        WHERE entries.course_name IS NULL
          AND entries.listing_id = listings.id
      ';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'golf_leaderboard_entries'
        AND column_name = 'course_id'
    ) THEN
      EXECUTE '
        UPDATE public.golf_leaderboard_entries AS entries
        SET course_name = COALESCE(entries.course_name, listings.name)
        FROM public.listings AS listings
        WHERE entries.course_name IS NULL
          AND entries.course_id = listings.id
      ';
    END IF;

    EXECUTE 'DELETE FROM public.golf_leaderboard_entries';
  END IF;

  IF to_regclass('public.golf_leaderboard') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.golf_leaderboard';
  END IF;
END $$;
