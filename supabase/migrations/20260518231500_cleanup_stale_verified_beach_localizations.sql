-- Keep verified beach upgrades from being overridden by stale automatic translations.
-- The public page falls back to the verified base/en beach content until fresh
-- locale-specific content is generated with matching verification metadata.

with verified_beach_listings as (
  select
    l.id,
    l.category_data,
    l.updated_at as listing_updated_at
  from public.listings l
  join public.categories c on c.id = l.category_id
  where l.status = 'published'
    and c.slug = 'beaches'
    and l.category_data is not null
    and l.category_data ?| array[
      'last_verified_at',
      'lastVerifiedAt',
      'verification_sources',
      'verificationSources',
      'verification_notes',
      'verificationNotes',
      'parking_info',
      'parkingInfo',
      'accessibility_info',
      'accessibilityInfo',
      'lifeguard_info',
      'lifeguardInfo',
      'blue_flag_info',
      'blueFlagInfo',
      'blue_flag_year',
      'blueFlagYear',
      'nearby_beaches',
      'nearbyBeaches',
      'nearby_restaurants',
      'nearbyRestaurants',
      'nearby_attractions',
      'nearbyAttractions',
      'faq_items',
      'faqItems',
      'google_maps_url',
      'googleMapsUrl'
    ]
),
cleaned_localized_content as (
  select
    vbl.id,
    coalesce(
      (
        select jsonb_object_agg(locale_key, locale_value)
        from jsonb_each(coalesce(vbl.category_data->'localized_content', '{}'::jsonb)) as localized(locale_key, locale_value)
        where jsonb_typeof(locale_value) = 'object'
          and (
            (
              coalesce(vbl.category_data->>'last_verified_at', vbl.category_data->>'lastVerifiedAt') is not null
              and coalesce(locale_value->>'last_verified_at', locale_value->>'lastVerifiedAt')
                = coalesce(vbl.category_data->>'last_verified_at', vbl.category_data->>'lastVerifiedAt')
            )
            or (
              coalesce(vbl.category_data->>'last_verified_at', vbl.category_data->>'lastVerifiedAt') is null
              and locale_value ?| array[
                'verification_sources',
                'verificationSources',
                'verification_notes',
                'verificationNotes',
                'parking_info',
                'parkingInfo',
                'accessibility_info',
                'accessibilityInfo',
                'lifeguard_info',
                'lifeguardInfo',
                'blue_flag_info',
                'blueFlagInfo',
                'nearby_beaches',
                'nearbyBeaches',
                'nearby_restaurants',
                'nearbyRestaurants',
                'nearby_attractions',
                'nearbyAttractions',
                'faq_items',
                'faqItems',
                'google_maps_url',
                'googleMapsUrl'
              ]
            )
          )
      ),
      '{}'::jsonb
    ) as localized_content
  from verified_beach_listings vbl
)
update public.listings l
set category_data = jsonb_set(
  l.category_data,
  '{localized_content}',
  case
    when clc.localized_content ? 'en' then clc.localized_content
    else clc.localized_content || jsonb_build_object('en', l.category_data - 'localized_content')
  end,
  true
)
from cleaned_localized_content clc
where l.id = clc.id
  and l.category_data->'localized_content' is distinct from (
    case
      when clc.localized_content ? 'en' then clc.localized_content
      else clc.localized_content || jsonb_build_object('en', l.category_data - 'localized_content')
    end
  );

with verified_beach_listings as (
  select
    l.id,
    l.updated_at as listing_updated_at
  from public.listings l
  join public.categories c on c.id = l.category_id
  where l.status = 'published'
    and c.slug = 'beaches'
    and l.category_data is not null
    and l.category_data ?| array[
      'last_verified_at',
      'lastVerifiedAt',
      'verification_sources',
      'verificationSources',
      'verification_notes',
      'verificationNotes',
      'parking_info',
      'parkingInfo',
      'accessibility_info',
      'accessibilityInfo',
      'lifeguard_info',
      'lifeguardInfo',
      'blue_flag_info',
      'blueFlagInfo',
      'blue_flag_year',
      'blueFlagYear',
      'nearby_beaches',
      'nearbyBeaches',
      'nearby_restaurants',
      'nearbyRestaurants',
      'nearby_attractions',
      'nearbyAttractions',
      'faq_items',
      'faqItems',
      'google_maps_url',
      'googleMapsUrl'
    ]
)
update public.listing_translations lt
set
  translation_status = 'queued',
  updated_at = now()
from verified_beach_listings vbl
where lt.listing_id = vbl.id
  and lt.translation_status in ('auto', 'reviewed')
  and coalesce(lt.translation_source, 'automatic') <> 'manual'
  and (
    lt.updated_at is null
    or vbl.listing_updated_at is null
    or lt.updated_at < vbl.listing_updated_at
  );
