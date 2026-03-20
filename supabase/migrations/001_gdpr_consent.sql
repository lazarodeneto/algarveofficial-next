-- GDPR Cookie Consent Records Table
-- This table stores user consent records for GDPR compliance

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('cookies', 'marketing', 'analytics', 'functional', 'essential')),
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_created_at ON consent_records(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type ON consent_records(consent_type);

-- Enable RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Users can only see their own consent records
CREATE POLICY "Users can view own consent records" ON consent_records
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert records (via API)
CREATE POLICY "Service role can insert consent records" ON consent_records
  FOR INSERT WITH CHECK (true);

-- No updates allowed after consent is given (immutability requirement)
CREATE POLICY "No updates allowed" ON consent_records
  FOR UPDATE USING (false);

-- Only service role can delete
CREATE POLICY "Service role can delete consent records" ON consent_records
  FOR DELETE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consent_records_updated_at
  BEFORE UPDATE ON consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Cookie Policy Table
CREATE TABLE IF NOT EXISTS cookie_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  page_title TEXT,
  description TEXT,
  introduction TEXT,
  last_updated_date TEXT,
  meta_title TEXT,
  meta_description TEXT,
  learn_more_link TEXT DEFAULT '/cookie-policy',
  learn_more_text TEXT DEFAULT 'Learn more',
  accept_button_text TEXT DEFAULT 'Accept All',
  decline_button_text TEXT DEFAULT 'Decline',
  save_button_text TEXT DEFAULT 'Save Preferences',
  show_gdpr_badge BOOLEAN DEFAULT true,
  show_data_retention BOOLEAN DEFAULT true,
  gdpr_badge_text TEXT DEFAULT 'EU GDPR Compliant',
  data_retention_text TEXT DEFAULT 'Data kept for max 2 years',
  sections JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cookie_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read cookie settings
CREATE POLICY "Public can view cookie settings" ON cookie_settings
  FOR SELECT USING (true);

-- Only service role can update
CREATE POLICY "Service role can update cookie settings" ON cookie_settings
  FOR UPDATE USING (true);

-- Insert default settings if not exists
INSERT INTO cookie_settings (id, page_title, description, introduction, last_updated_date)
VALUES (
  'default',
  'Cookie Policy',
  'We use cookies to enhance your browsing experience and analyze site traffic.',
  'This Cookie Policy explains how AlgarveOfficial uses cookies and similar technologies to recognize you when you visit our website.',
  'January 21, 2026'
) ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE consent_records IS 'Stores GDPR consent records for users';
COMMENT ON TABLE cookie_settings IS 'Configurable cookie policy page content';
