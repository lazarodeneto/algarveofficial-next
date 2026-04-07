# Remediation Rollout Runbook

## Scope
This runbook covers deployment of the full remediation backlog implemented in this branch:

- Routing parity + scroll behavior fixes
- Unified metadata/canonical/hreflang behavior
- Subscription pricing path stabilization
- Legal settings runtime wiring
- Admin mutation route hardening
- CMS v2 locale-aware + versioned runtime path
- Contract/runtime regression suite expansion

## Pre-deploy checklist
1. Ensure production env contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
2. Confirm migrations are ready to apply:
   - `009_cms_documents_v1.sql`
   - `010_hot_path_indexes.sql`
3. Run local verification:
   - `npm run verify:remediation`

## Deploy order
1. Apply DB migrations:
   - `supabase db push`
2. Deploy application code.
3. Run smoke checks (manual, post-deploy):
   - localized and unlocalized route matrix
   - pricing create/update in admin subscriptions
   - city-index/filter scroll behavior in directory pages
   - legal pages reflect admin content in locales
   - admin content page builder save/read for default + non-default locale
   - admin CMS documents endpoint:
     - `/api/admin/cms/documents?include_versions=true&version_limit=5`

## Verification matrix
1. Routing:
   - `/signup`, `/forgot-password`, `/maintenance`, `/real-estate/:slug` do not redirect to localized 404
2. SEO metadata:
   - canonicals/hreflangs consistent across `en` and non-`en`
3. Admin writes:
   - secured routes enforce role checks
   - contacts/automations write only via API
4. CMS v2:
   - page builder saves locale-aware payloads
   - runtime resolver falls back exact locale -> default
   - `/api/admin/cms/documents` returns bounded data and request IDs

## Rollback strategy
1. App rollback:
   - revert deployment to previous stable artifact.
2. DB rollback:
   - schema changes are additive; do not drop new tables/indexes during incident response.
   - disable new CMS endpoints at routing/proxy layer if needed while app rollback completes.
3. Incident triage:
   - use `request_id` from `/api/admin/cms/documents` error payload/logs for correlation.

## Ownership
- Routing/SEO: platform/frontend
- Admin mutation routes: platform/backend
- CMS model/runtime: CMS platform owners
- Migration strategy: DB/platform owners
