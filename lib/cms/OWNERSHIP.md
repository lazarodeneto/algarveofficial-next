# CMS Ownership and Runtime Source of Truth

## Public runtime CMS source
Public frontend routes consume CMS configuration from `global_settings` keys, primarily:

- `cms_page_configs_v1`
- `cms_text_overrides_v1`
- `cms_design_tokens_v1`
- `cms_custom_css_v1`

This contract is defined in:

- `lib/cms/pageBuilderRegistry.ts`
- `contexts/CmsPageBuilderContext.tsx`
- `hooks/useCmsPageBuilder.ts`
- `app/api/cms/runtime/route.ts`
- `lib/cms/runtime-resolver.ts`
- `app/api/admin/cms/documents/route.ts` (admin query endpoint for CMS document/version inspection)

## Locale and version model
- CMS runtime reads from `cms_documents` + `cms_document_versions` first, with locale precedence:
  1. exact locale (for example `pt-pt`)
  2. `default`
- CMS admin writes are locale-aware through `/api/admin/global-settings`:
  - `locale=default`: persists canonical defaults in `global_settings` and mirrors to `cms_documents`
  - non-default locale: persists CMS keys to `cms_documents` only, while non-CMS settings still persist to `global_settings`
- Public consumers should read CMS settings through `/api/cms/runtime` (or `useGlobalSettings` with CMS keys), not by querying `global_settings` directly for localized content.

## Admin modules that write runtime-backed data
Use these modules for production editorial changes:

- `/admin/content/page-builder`
- `/admin/content/home`
- `/admin/content/partner`
- `/admin/content/support`
- `/admin/content/contact`
- `/admin/content/terms`
- `/admin/content/privacy`
- `/admin/content/cookies`
- Menu/media/translations modules under `/admin/content/*`

## Deprecated module: `/admin/content/pages`
The legacy Pages module writes to the `pages` table. Public routes do not read from that table.
To avoid orphan editorial workflows, `/admin/content/pages` is retained only as a deprecation notice that redirects editors to runtime-backed CMS modules.
