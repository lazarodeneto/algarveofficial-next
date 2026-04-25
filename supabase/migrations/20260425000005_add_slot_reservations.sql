-- Placement slot reservation system to prevent double-selling

-- 1. Add reservation fields
ALTER TABLE placement_slots
ADD COLUMN IF NOT EXISTS reserved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ;

-- 2. Atomic reservation function
CREATE OR REPLACE FUNCTION reserve_slot(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER,
  p_listing_owner_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_reserved_until TIMESTAMPTZ;
BEGIN
  -- Check current reservation status
  SELECT reserved_until INTO v_current_reserved_until
  FROM placement_slots
  WHERE context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;

  -- If reserved and not expired, deny
  IF v_current_reserved_until IS NOT NULL AND v_current_reserved_until > NOW() THEN
    -- Check if same owner is trying to reserve
    IF (SELECT reserved_by FROM placement_slots 
        WHERE context_type = p_context_type 
        AND context_value = p_context_value 
        AND position = p_position) = p_listing_owner_id THEN
      -- Same user, extend reservation
      UPDATE placement_slots
      SET reserved_until = NOW() + interval '10 minutes',
          updated_at = NOW()
      WHERE context_type = p_context_type
      AND context_value = p_context_value
      AND position = p_position;
      RETURN true;
    END IF;
    
    RAISE EXCEPTION 'Slot already reserved by another user';
  END IF;

  -- Reserve the slot for 10 minutes
  INSERT INTO placement_slots (listing_id, context_type, context_value, position, reserved_by, reserved_until, is_active)
  VALUES (p_listing_id, p_context_type, p_context_value, p_position, p_listing_owner_id, NOW() + interval '10 minutes', false)
  ON CONFLICT (context_type, context_value, position)
  DO UPDATE SET
    listing_id = p_listing_id,
    reserved_by = p_listing_owner_id,
    reserved_until = NOW() + interval '10 minutes',
    updated_at = NOW();

  RETURN true;
END;
$$;

-- 3. Release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE placement_slots
  SET reserved_by = NULL,
      reserved_until = NULL,
      listing_id = NULL
  WHERE reserved_until IS NOT NULL
  AND reserved_until < NOW();
END;
$$;

-- 4. Confirm reservation after payment (called by webhook)
CREATE OR REPLACE FUNCTION confirm_slot_reservation(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE placement_slots
  SET is_active = true,
      reserved_by = NULL,
      reserved_until = NULL,
      updated_at = NOW()
  WHERE listing_id = p_listing_id
  AND context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;
END;
$$;

-- 5. Cancel/clear reservation
CREATE OR REPLACE FUNCTION clear_slot_reservation(
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE placement_slots
  SET reserved_by = NULL,
      reserved_until = NULL,
      updated_at = NOW()
  WHERE context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;
END;
$$;