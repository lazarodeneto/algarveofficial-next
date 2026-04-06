# Schema + Index Migration Coverage

This repository now includes explicit, additive SQL migrations for the P2 schema/index backlog so schema evolution is reproducible from source.

## Migration Inventory

1. `supabase/migrations/009_cms_documents_v1.sql`
- Introduces CMS V2 storage (`cms_documents`, `cms_document_versions`)
- Adds locale-aware + queryable document dimensions (`page_id`, `block_id`, `locale`, `doc_type`, `status`)
- Adds document version history (`version`, JSONB `content`, `created_by`, `created_at`)
- Adds lookup + version indexes and a JSONB GIN index
- Adds `updated_at` trigger maintenance

2. `supabase/migrations/010_hot_path_indexes.sql`
- Adds additive indexes for public browse and admin pricing/review hot paths
- Covers listings browse filters, cities/regions/categories active ordering, subscription pricing filters, and listing review lookups

## Operational Contract

- All migrations are additive and guarded by `IF NOT EXISTS`/constraint checks.
- Existing runtime behavior remains backward compatible while new structures are introduced.
- No data-destructive statements are included.

## Apply / Verify

1. Apply SQL migrations in order:
- `009_cms_documents_v1.sql`
- `010_hot_path_indexes.sql`

2. Verify objects:
- Tables: `cms_documents`, `cms_document_versions`
- Indexes: `idx_cms_documents_lookup`, `idx_cms_document_versions_document`, `idx_listings_public_browse`, etc.

3. Verify query plans:
- Run `EXPLAIN (ANALYZE, BUFFERS)` on key browse/admin queries and confirm index usage.

## Rollback Guidance

- Because migrations are additive, rollback should prefer feature-flagging new code paths first.
- If a rollback is mandatory, drop newly added indexes before tables to preserve dependency order:
1. Drop indexes from `010_hot_path_indexes.sql`
2. Drop trigger + FK from `009_cms_documents_v1.sql`
3. Drop `cms_document_versions`, then `cms_documents`

## Notes

- CMS V2 tables are the target for locale-aware/versioned content.
- Legacy `global_settings` CMS keys remain for compatibility while migration of runtime read/write paths is phased.
