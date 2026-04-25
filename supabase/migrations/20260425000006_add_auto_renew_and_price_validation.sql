-- Add auto_renew to subscriptions
ALTER TABLE listing_subscriptions
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;

-- Add price validation to prevent incorrect charges
CREATE OR REPLACE FUNCTION validate_slot_price(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER,
  p_received_amount DECIMAL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_expected_price DECIMAL;
  v_price_diff DECIMAL;
BEGIN
  -- Get expected price from placement_slots
  SELECT price_monthly INTO v_expected_price
  FROM placement_slots
  WHERE context_type = p_context_type
  AND context_value = p_context_value
  AND position = p_position;

  -- Allow 10% variance for currency conversion differences
  v_price_diff := abs(p_received_amount - v_expected_price) / v_expected_price;

  IF v_price_diff > 0.10 THEN
    RAISE WARNING 'Price mismatch: expected %, received %', v_expected_price, p_received_amount;
    RETURN false;
  END IF;

  RETURN true;
END;
$$;