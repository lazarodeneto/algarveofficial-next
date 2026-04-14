-- ─────────────────────────────────────────────────────────────────────────────
-- Translation tables for: Header Menu, Hero Section, CMS Pages
-- ─────────────────────────────────────────────────────────────────────────────

-- ── header_menu_item_translations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS header_menu_item_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       uuid NOT NULL REFERENCES header_menu_items(id) ON DELETE CASCADE,
  locale        text NOT NULL,
  name          text NOT NULL,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, locale)
);
-- Mark translations stale when the source label changes
CREATE OR REPLACE FUNCTION _mark_header_menu_item_trans_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE header_menu_item_translations
       SET status = 'needs_review', updated_at = now()
     WHERE item_id = NEW.id AND status IN ('auto','reviewed');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_header_menu_item_trans_review ON header_menu_items;
CREATE TRIGGER trg_header_menu_item_trans_review
  AFTER UPDATE ON header_menu_items
  FOR EACH ROW EXECUTE FUNCTION _mark_header_menu_item_trans_needs_review();
ALTER TABLE header_menu_item_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read header_menu_item_translations"
  ON header_menu_item_translations FOR SELECT USING (true);
CREATE POLICY "Admin write header_menu_item_translations"
  ON header_menu_item_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id = auth.uid() AND role IN ('admin','editor')
    )
  );
-- ── homepage_settings_translations ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homepage_settings_translations (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id             uuid NOT NULL REFERENCES homepage_settings(id) ON DELETE CASCADE,
  locale                  text NOT NULL,
  hero_title              text,
  hero_subtitle           text,
  hero_cta_primary_text   text,
  hero_cta_secondary_text text,
  status                  text NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at           timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE(settings_id, locale)
);
-- Mark translations stale when any hero text field changes
CREATE OR REPLACE FUNCTION _mark_homepage_settings_trans_needs_review()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.hero_title              IS DISTINCT FROM NEW.hero_title
  OR OLD.hero_subtitle           IS DISTINCT FROM NEW.hero_subtitle
  OR OLD.hero_cta_primary_text   IS DISTINCT FROM NEW.hero_cta_primary_text
  OR OLD.hero_cta_secondary_text IS DISTINCT FROM NEW.hero_cta_secondary_text
  THEN
    UPDATE homepage_settings_translations
       SET status = 'needs_review', updated_at = now()
     WHERE settings_id = NEW.id AND status IN ('auto','reviewed');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_homepage_settings_trans_review ON homepage_settings;
CREATE TRIGGER trg_homepage_settings_trans_review
  AFTER UPDATE ON homepage_settings
  FOR EACH ROW EXECUTE FUNCTION _mark_homepage_settings_trans_needs_review();
ALTER TABLE homepage_settings_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read homepage_settings_translations"
  ON homepage_settings_translations FOR SELECT USING (true);
CREATE POLICY "Admin write homepage_settings_translations"
  ON homepage_settings_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id = auth.uid() AND role IN ('admin','editor')
    )
  );
-- ── cms_page_translations ─────────────────────────────────────────────────────
-- Stores translated text-override blobs per CMS page ID and locale.
-- page_id is the string key from cms_page_configs_v1 (e.g. "home", "directory").
CREATE TABLE IF NOT EXISTS cms_page_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id       text NOT NULL,
  locale        text NOT NULL,
  text          jsonb NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','auto','reviewed','needs_review','failed')),
  translated_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page_id, locale)
);
ALTER TABLE cms_page_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read cms_page_translations"
  ON cms_page_translations FOR SELECT USING (true);
CREATE POLICY "Admin write cms_page_translations"
  ON cms_page_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
       WHERE user_id = auth.uid() AND role IN ('admin','editor')
    )
  );
