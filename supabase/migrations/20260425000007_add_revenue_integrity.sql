-- Revenue Integrity & Production Hardening

-- 1. Add price locking and audit fields
ALTER TABLE placement_slots
ADD COLUMN IF NOT EXISTS locked_price INTEGER,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id);

-- 2. Stripe events processed for idempotency
CREATE TABLE IF NOT EXISTS stripe_events_processed (
  id TEXT PRIMARY KEY,
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_processed_created
ON stripe_events_processed(processed_at DESC);

-- 3. Slot transactions audit table
CREATE TABLE IF NOT EXISTS slot_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id),
  context_type TEXT,
  context_value TEXT,
  position INTEGER,
  price_paid INTEGER,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
  stripe_session_id TEXT,
  stripe_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_slot_transactions_listing
ON slot_transactions(listing_id, created_at DESC);

-- 4. Updated reserve_slot function with price locking
CREATE OR REPLACE FUNCTION reserve_slot(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER,
  p_listing_owner_id UUID,
  p_price INTEGER,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_reserved_until TIMESTAMPTZ;
  v_transaction_id UUID;
BEGIN
  SELECT reserved_until INTO v_current_reserved_until
  FROM placement_slots
  WHERE context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;

  IF v_current_reserved_until IS NOT NULL AND v_current_reserved_until > NOW() THEN
    IF (SELECT reserved_by FROM placement_slots 
        WHERE context_type = p_context_type 
        AND context_value = p_context_value 
        AND position = p_position) = p_listing_owner_id THEN
      UPDATE placement_slots
      SET reserved_until = NOW() + interval '10 minutes',
          locked_price = p_price,
          stripe_session_id = p_stripe_session_id,
          updated_at = NOW()
      WHERE context_type = p_context_type
      AND context_value = p_context_value
      AND position = p_position;
      RETURN true;
    END IF;
    RAISE EXCEPTION 'Slot already reserved by another user';
  END IF;

  -- Create audit transaction record
  INSERT INTO slot_transactions (
    listing_id, context_type, context_value, position,
    price_paid, status, stripe_session_id
  ) VALUES (
    p_listing_id, p_context_type, p_context_value, p_position,
    p_price, 'pending', p_stripe_session_id
  ) RETURNING id INTO v_transaction_id;

  -- Reserve the slot with locked price
  INSERT INTO placement_slots (listing_id, context_type, context_value, position, 
    reserved_by, reserved_until, locked_price, stripe_session_id, is_active)
  VALUES (p_listing_id, p_context_type, p_context_value, p_position, 
    p_listing_owner_id, NOW() + interval '10 minutes', p_price, p_stripe_session_id, false)
  ON CONFLICT (context_type, context_value, position)
  DO UPDATE SET
    listing_id = p_listing_id,
    reserved_by = p_listing_owner_id,
    reserved_until = NOW() + interval '10 minutes',
    locked_price = p_price,
    stripe_session_id = p_stripe_session_id,
    assigned_by = p_listing_owner_id,
    updated_at = NOW();

  RETURN true;
END;
$$;

-- 5. Atomic slot confirmation
CREATE OR REPLACE FUNCTION confirm_slot_with_validation(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER,
  p_received_price INTEGER,
  p_stripe_event_id TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_locked_price INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get locked price
  SELECT locked_price INTO v_locked_price
  FROM placement_slots
  WHERE listing_id = p_listing_id
  AND context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;

  -- Validate price matches locked price (allow 5% variance)
  IF v_locked_price IS NULL OR 
     abs(p_received_price - v_locked_price) / v_locked_price > 0.05 THEN
    RAISE EXCEPTION 'Price validation failed: expected %, received %', 
      v_locked_price, p_received_price;
  END IF;

  -- Mark transaction as completed
  UPDATE slot_transactions
  SET status = 'completed',
      completed_at = NOW()
  WHERE listing_id = p_listing_id
  AND context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position
  AND status = 'pending'
  RETURNING id INTO v_transaction_id;

  -- Activate the slot
  UPDATE placement_slots
  SET is_active = true,
      assigned_at = NOW(),
      reserved_by = NULL,
      reserved_until = NULL,
      updated_at = NOW()
  WHERE listing_id = p_listing_id
  AND context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;

  RETURN true;
END;
$$;

-- 6. Failsafe cleanup for stale slots
CREATE OR REPLACE FUNCTION cleanup_stale_slots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Release expired reservations
  UPDATE placement_slots
  SET reserved_by = NULL,
      reserved_until = NULL,
      locked_price = NULL,
      stripe_session_id = NULL,
      updated_at = NOW()
  WHERE reserved_until IS NOT NULL
  AND reserved_until < NOW()
  AND is_active = false;

  -- Mark failed transactions
  UPDATE slot_transactions
  SET status = 'failed'
  WHERE status = 'pending'
  AND created_at < NOW() - interval '1 hour';
END;
$$;