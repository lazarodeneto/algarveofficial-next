-- Fill exact WGS84 beach coordinates required by the listing weather widget.
-- Source: Playocean beach pages, checked 2026-05-14.

with coordinate_updates(slug, latitude, longitude) as (
  values
    ('praia-da-bordeira-carrapateira-aljezur', 37.198012::numeric, -8.901136::numeric),
    ('praia-do-carvalho-lagoa', 37.086856::numeric, -8.431559::numeric),
    ('praia-do-alemao-portimao', 37.119636::numeric, -8.564116::numeric),
    ('praia-da-prainha-portimao', 37.118242::numeric, -8.578220::numeric)
)
update public.listings as listing
set
  latitude = coordinates.latitude,
  longitude = coordinates.longitude,
  category_data =
    coalesce(listing.category_data, '{}'::jsonb) ||
    jsonb_build_object(
      'coordinates',
      (
        case
          when jsonb_typeof(coalesce(listing.category_data, '{}'::jsonb)->'coordinates') = 'object'
            then coalesce(listing.category_data, '{}'::jsonb)->'coordinates'
          else '{}'::jsonb
        end
      ) ||
      jsonb_build_object(
        'latitude', coordinates.latitude,
        'longitude', coordinates.longitude
      )
    ),
  updated_at = now()
from coordinate_updates as coordinates
where listing.slug = coordinates.slug
  and exists (
    select 1
    from public.categories as category
    where category.id = listing.category_id
      and category.slug = 'beaches'
  );
