begin;

-- Keep programmatic category routes, sitemap data, and admin taxonomy aligned.
-- These rows are already first-class canonical slugs in the application code;
-- do not add image fallbacks here because admin-managed missing media must
-- render as black.
insert into public.categories (
  name,
  slug,
  icon,
  display_order,
  is_featured,
  is_active,
  template_fields
)
values
  ('Beaches', 'beaches', 'Umbrella', 30, true, true, '[]'::jsonb),
  ('Security Services', 'security-services', 'Shield', 52, false, true, '[]'::jsonb)
on conflict (slug) do update
set
  name = coalesce(nullif(public.categories.name, ''), excluded.name),
  icon = coalesce(nullif(public.categories.icon, ''), excluded.icon),
  is_active = true,
  updated_at = now();

-- Ensure future listing slug edits keep one current alias and preserve old
-- aliases for redirects. Re-declare this here so environments that have the
-- alias table but missed the hardening migration are still repaired.
create or replace function public.track_listing_slug_change()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $function$
begin
  if tg_op = 'INSERT' then
    if new.slug is not null and btrim(new.slug) <> '' then
      update public.listing_slugs
      set is_current = false
      where listing_id = new.id;

      insert into public.listing_slugs (listing_id, slug, is_current)
      values (new.id, new.slug, true)
      on conflict (slug) do update
      set
        listing_id = excluded.listing_id,
        is_current = true
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    return new;
  end if;

  if old.slug is distinct from new.slug and new.slug is not null and btrim(new.slug) <> '' then
    update public.listing_slugs
    set is_current = false
    where listing_id = new.id;

    if old.slug is not null and btrim(old.slug) <> '' then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (new.id, old.slug, false)
      on conflict (slug) do nothing;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (new.id, new.slug, true)
    on conflict (slug) do update
    set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_track_listing_slug_change on public.listings;

create trigger trg_track_listing_slug_change
  after insert or update on public.listings
  for each row
  execute function public.track_listing_slug_change();

with canonical_listings as (
  select id, slug
  from public.listings
  where slug is not null
    and btrim(slug) <> ''
)
update public.listing_slugs existing
set is_current = false
from canonical_listings listing
where existing.listing_id = listing.id
  and existing.is_current = true
  and existing.slug <> listing.slug;

with canonical_listings as (
  select id, slug
  from public.listings
  where slug is not null
    and btrim(slug) <> ''
)
update public.listing_slugs existing
set is_current = true
from canonical_listings listing
where existing.listing_id = listing.id
  and existing.slug = listing.slug
  and existing.is_current is distinct from true;

with canonical_listings as (
  select id, slug
  from public.listings
  where slug is not null
    and btrim(slug) <> ''
)
insert into public.listing_slugs (listing_id, slug, is_current)
select listing.id, listing.slug, true
from canonical_listings listing
where not exists (
  select 1
  from public.listing_slugs existing
  where existing.slug = listing.slug
);

commit;
