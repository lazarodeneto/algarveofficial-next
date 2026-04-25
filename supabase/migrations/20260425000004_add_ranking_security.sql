-- RANKING + MONETIZATION SECURITY

-- 1. Revoke direct access to featured_positions (DB enforces all writes)
REVOKE INSERT, UPDATE, DELETE ON listing_featured_positions FROM anon, authenticated;

-- 2. Create secure RPC for pin operations
CREATE OR REPLACE FUNCTION pin_listing_to_context(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT,
  p_position INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify listing has active subscription
  IF NOT EXISTS (
    SELECT 1 FROM listing_subscriptions
    WHERE listing_id = p_listing_id
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ) THEN
    RAISE EXCEPTION 'Listing does not have active subscription';
  END IF;

  -- Upsert featured position
  INSERT INTO listing_featured_positions (listing_id, context_type, context_value, position)
  VALUES (p_listing_id, p_context_type, p_context_value, p_position)
  ON CONFLICT (context_type, context_value, listing_id)
  DO UPDATE SET position = p_position, updated_at = NOW();
END;
$$;

-- 3. Create unpin function
CREATE OR REPLACE FUNCTION unpin_listing_from_context(
  p_listing_id UUID,
  p_context_type TEXT,
  p_context_value TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM listing_featured_positions
  WHERE listing_id = p_listing_id
  AND context_type = p_context_type
  AND context_value = p_context_value;
END;
$$;

-- 4. Scheduled cleanup function (for cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_featured_positions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove featured positions for expired subscriptions
  UPDATE listing_featured_positions
  SET listing_id = NULL, updated_at = NOW()
  WHERE listing_id IN (
    SELECT listing_id FROM listing_subscriptions
    WHERE status != 'active'
    OR current_period_end < NOW()
  );
END;
$$;

-- Note: Schedule cleanup via:
-- select cron.schedule(
--   'cleanup-expired-featureds',
--   '0 * * * *',  -- every hour
--   'select cleanup_expired_featured_positions()'
-- );