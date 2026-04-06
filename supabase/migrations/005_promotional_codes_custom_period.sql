-- Add custom period settings to promotions
-- Supports billing option: period (e.g. 30 days / 3 months)

ALTER TABLE promotional_codes
  ADD COLUMN IF NOT EXISTS period_length INTEGER,
  ADD COLUMN IF NOT EXISTS period_unit TEXT;

-- Backfill existing period-based promotions to a safe default.
UPDATE promotional_codes
SET
  period_length = COALESCE(period_length, 1),
  period_unit = COALESCE(period_unit, 'months')
WHERE
  'period' = ANY(applicable_billing)
  AND (period_length IS NULL OR period_unit IS NULL);

ALTER TABLE promotional_codes
  DROP CONSTRAINT IF EXISTS promotional_codes_period_length_positive_chk,
  DROP CONSTRAINT IF EXISTS promotional_codes_period_unit_valid_chk,
  DROP CONSTRAINT IF EXISTS promotional_codes_period_pairing_chk,
  DROP CONSTRAINT IF EXISTS promotional_codes_period_required_when_selected_chk;

ALTER TABLE promotional_codes
  ADD CONSTRAINT promotional_codes_period_length_positive_chk
    CHECK (period_length IS NULL OR period_length > 0),
  ADD CONSTRAINT promotional_codes_period_unit_valid_chk
    CHECK (period_unit IS NULL OR period_unit IN ('days', 'months')),
  ADD CONSTRAINT promotional_codes_period_pairing_chk
    CHECK ((period_length IS NULL) = (period_unit IS NULL)),
  ADD CONSTRAINT promotional_codes_period_required_when_selected_chk
    CHECK (
      NOT ('period' = ANY(applicable_billing))
      OR (period_length IS NOT NULL AND period_unit IS NOT NULL)
    );
