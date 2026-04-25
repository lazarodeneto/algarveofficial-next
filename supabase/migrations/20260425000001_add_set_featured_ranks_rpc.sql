-- Atomic featured ranking update function
-- Takes array of {id, rank} and updates all in a single transaction
-- Ensures no partial updates if one fails
CREATE OR REPLACE FUNCTION set_featured_ranks(payload jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Validate payload is array
  IF jsonb_typeof(payload) != 'array' THEN
    RAISE EXCEPTION 'Payload must be an array';
  END IF;

  -- Update all rankings in a single transaction
  FOR item IN SELECT * FROM jsonb_populate_recordset(null::jsonb, payload)
  LOOP
    IF item.id IS NULL OR item.rank IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.listings
    SET featured_rank = item.rank::integer,
        updated_at = NOW()
    WHERE id = item.id::uuid;
  END LOOP;
END;
$$;