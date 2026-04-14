-- Clear E2E test meta title left in cms_page_configs_v1.
-- Structure: { "home": { "meta": { "title": "E2E Meta Title ..." }, ... }, ... }
-- Remove the title from every page whose meta.title starts with "E2E ".

UPDATE public.global_settings
SET value = (
  SELECT jsonb_object_agg(
    page_key,
    CASE
      WHEN (page_val->'meta'->>'title') LIKE 'E2E %'
      THEN jsonb_set(page_val, '{meta,title}', '""'::jsonb)
      ELSE page_val
    END
  )::text
  FROM jsonb_each(value::jsonb) AS t(page_key, page_val)
)
WHERE key = 'cms_page_configs_v1'
  AND value LIKE '%E2E %';
