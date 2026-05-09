# Listing Slug Management

## Policy

Admin content edits do not change URLs. Canonical URL changes must go through the dedicated slug update action, which preserves the previous URL as a redirect alias.

Golf listing suggestions use the canonical course name only, for example `Espiche Golf` -> `espiche-golf`.

## Before And After Behavior

Before:
- Editing a listing name, city, or address kept `public.listings.slug` unchanged.
- Admins could still change `slug` through the generic listing update path.
- Alias health issues had to be repaired manually.

After:
- Generic listing edits reject changed slugs and keep content edits URL-safe.
- `PATCH /api/admin/listings/:listingId/slug` updates the canonical slug through `public.update_listing_canonical_slug`.
- The RPC locks the listing row, validates/collides the normalized slug, marks old slug rows historical, updates `public.listings.slug`, and writes one current `public.listing_slugs` row.
- `/admin/url-health` shows suggested slug differences, missing current rows, multiple current rows, and alias conflicts with safe repair actions.

## SQL Verification

```sql
-- Duplicate alias slugs should be impossible.
select slug, count(*)
from public.listing_slugs
group by slug
having count(*) > 1;

-- A listing should have at most one current slug row.
select listing_id, count(*) as current_count
from public.listing_slugs
where is_current = true
group by listing_id
having count(*) > 1;

-- Published listings should have a current alias matching listings.slug.
select l.id, l.name, l.slug
from public.listings l
left join public.listing_slugs s
  on s.listing_id = l.id
 and s.slug = l.slug
 and s.is_current = true
where l.status = 'published'
  and s.id is null;

-- Historical aliases that collide with another listing's canonical slug.
select s.listing_id, s.slug, l.id as conflicting_listing_id, l.name as conflicting_listing_name
from public.listing_slugs s
join public.listings l
  on l.slug = s.slug
 and l.id <> s.listing_id;

-- Smoke a slug update in a transaction, then roll it back.
begin;
select *
from public.update_listing_canonical_slug(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'example-new-slug'
);
rollback;
```

## Curl Checks

```bash
# Canonical listing URL should return 200.
curl -I https://algarveofficial.com/listing/new-canonical-slug

# Old listing URL should 308/301 redirect to the canonical listing URL.
curl -I https://algarveofficial.com/listing/old-historical-slug

# Canonical golf URL should return 200.
curl -I https://algarveofficial.com/golf/courses/espiche-golf

# Old golf URL should 308/301 redirect to the canonical golf URL.
curl -I https://algarveofficial.com/golf/courses/espiche-golf-sa-quarteira
```

## Build Verification

```bash
npm run typecheck
npm run lint
npm run build
```
