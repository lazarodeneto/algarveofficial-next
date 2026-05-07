begin;

do $$
declare
  v_listing_id uuid;
  v_conflict_id uuid;
  v_old_slug text := 'boavista-golf-spa-resort-quinta-do-lago';
  v_new_slug text := 'boavista-golf-spa-resort-lagos';
begin
  select l.id
  into v_listing_id
  from public.listings l
  join public.categories category on category.id = l.category_id
  left join public.cities city on city.id = l.city_id
  where l.slug in (v_old_slug, v_new_slug)
    and l.name ilike 'Boavista Golf%'
    and category.slug = 'golf'
    and city.slug = 'lagos'
  order by case when l.slug = v_new_slug then 0 else 1 end
  limit 1;

  if v_listing_id is null then
    raise notice 'Boavista Lagos golf listing was not found; no slug changes applied.';
    return;
  end if;

  select id
  into v_conflict_id
  from public.listings
  where slug = v_new_slug
    and id <> v_listing_id
  limit 1;

  if v_conflict_id is not null then
    raise exception 'Cannot move Boavista slug to %, listing % already uses it.', v_new_slug, v_conflict_id;
  end if;

  select listing_id
  into v_conflict_id
  from public.listing_slugs
  where slug = v_new_slug
    and listing_id <> v_listing_id
  limit 1;

  if v_conflict_id is not null then
    raise exception 'Cannot move Boavista slug to %, alias belongs to listing %.', v_new_slug, v_conflict_id;
  end if;

  select listing_id
  into v_conflict_id
  from public.listing_slugs
  where slug = v_old_slug
    and listing_id <> v_listing_id
  limit 1;

  if v_conflict_id is not null then
    raise exception 'Cannot preserve old Boavista slug %, alias belongs to listing %.', v_old_slug, v_conflict_id;
  end if;

  insert into public.listing_slugs (listing_id, slug, is_current)
  values (v_listing_id, v_old_slug, false)
  on conflict (slug) do update
  set is_current = false
  where public.listing_slugs.listing_id = excluded.listing_id;

  update public.listings
  set slug = v_new_slug
  where id = v_listing_id
    and slug is distinct from v_new_slug;

  update public.listing_slugs
  set is_current = false
  where listing_id = v_listing_id
    and slug <> v_new_slug;

  insert into public.listing_slugs (listing_id, slug, is_current)
  values (v_listing_id, v_new_slug, true)
  on conflict (slug) do update
  set
    listing_id = excluded.listing_id,
    is_current = true
  where public.listing_slugs.listing_id = excluded.listing_id;
end $$;

commit;
