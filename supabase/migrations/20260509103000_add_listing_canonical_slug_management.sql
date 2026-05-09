begin;

create or replace function public.normalize_listing_slug_input(value text)
returns text
language sql
immutable
as $function$
  select regexp_replace(
    regexp_replace(
      lower(regexp_replace(coalesce(value, ''), '[''’‘`´]', '', 'g')),
      '[^a-z0-9]+',
      '-',
      'g'
    ),
    '(^-+|-+$)',
    '',
    'g'
  );
$function$;

-- Repair current alias drift before enforcing one current row per listing.
with canonical_listings as (
  select id, slug
  from public.listings
  where slug is not null
    and btrim(slug) <> ''
)
update public.listing_slugs alias
set is_current = false
from canonical_listings listing
where alias.listing_id = listing.id
  and alias.is_current = true
  and alias.slug <> listing.slug;

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
  from public.listing_slugs alias
  where alias.slug = listing.slug
)
on conflict (slug) do nothing;

with canonical_listings as (
  select id, slug
  from public.listings
  where slug is not null
    and btrim(slug) <> ''
)
update public.listing_slugs alias
set is_current = true
from canonical_listings listing
where alias.listing_id = listing.id
  and alias.slug = listing.slug
  and alias.is_current is distinct from true;

create unique index if not exists idx_listing_slugs_slug
  on public.listing_slugs (slug);

create unique index if not exists idx_listing_slugs_one_current_per_listing
  on public.listing_slugs (listing_id)
  where is_current = true;

create or replace function public.update_listing_canonical_slug(
  p_listing_id uuid,
  p_new_slug text
)
returns table(old_slug text, new_slug text)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_old_slug text;
  v_new_slug text;
begin
  if not public.is_admin_or_editor(auth.uid()) then
    raise exception 'Only admins or editors can update listing URLs.'
      using errcode = '42501';
  end if;

  select l.slug
    into v_old_slug
  from public.listings l
  where l.id = p_listing_id
  for update;

  if not found then
    raise exception 'Listing was not found.'
      using errcode = 'P0002';
  end if;

  v_new_slug := public.normalize_listing_slug_input(p_new_slug);

  if v_new_slug is null or btrim(v_new_slug) = '' then
    raise exception 'Slug is required.'
      using errcode = '22023';
  end if;

  if v_new_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Slug must use lowercase ASCII letters, numbers, and single hyphens only.'
      using errcode = '22023';
  end if;

  if length(v_new_slug) > 120 then
    raise exception 'Slug must be 120 characters or less.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.listings l
    where l.slug = v_new_slug
      and l.id <> p_listing_id
  ) then
    raise exception 'Slug "%" is already used by another listing.', v_new_slug
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.listing_slugs alias
    where alias.slug = v_new_slug
      and alias.listing_id <> p_listing_id
  ) then
    raise exception 'Slug "%" is already reserved as a current or previous listing URL.', v_new_slug
      using errcode = '23505';
  end if;

  update public.listing_slugs
  set is_current = false
  where listing_id = p_listing_id;

  if v_old_slug is not null and btrim(v_old_slug) <> '' and v_old_slug <> v_new_slug then
    insert into public.listing_slugs (listing_id, slug, is_current)
    values (p_listing_id, v_old_slug, false)
    on conflict (slug) do update
    set is_current = false
    where public.listing_slugs.listing_id = p_listing_id;
  end if;

  update public.listings
  set slug = v_new_slug
  where id = p_listing_id;

  update public.listing_slugs
  set is_current = false
  where listing_id = p_listing_id;

  insert into public.listing_slugs (listing_id, slug, is_current)
  values (p_listing_id, v_new_slug, true)
  on conflict (slug) do update
  set
    listing_id = excluded.listing_id,
    is_current = true
  where public.listing_slugs.listing_id = excluded.listing_id;

  old_slug := v_old_slug;
  new_slug := v_new_slug;
  return next;
end;
$function$;

grant execute on function public.update_listing_canonical_slug(uuid, text) to authenticated;

commit;
