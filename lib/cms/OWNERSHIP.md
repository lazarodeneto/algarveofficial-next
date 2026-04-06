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
