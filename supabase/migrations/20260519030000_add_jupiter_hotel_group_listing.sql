begin;

insert into public.categories (name, slug, icon, display_order, is_active, is_featured)
values ('Accommodation', 'accommodation', 'Hotel', 1, true, true)
on conflict (slug) do update
set
  name = excluded.name,
  icon = coalesce(nullif(public.categories.icon, ''), excluded.icon),
  is_active = true,
  updated_at = now();

insert into public.cities (name, slug, short_description, latitude, longitude, is_active, is_featured)
values (
  'Praia da Rocha',
  'praia-da-rocha',
  'Portimão resort-beach area around Praia da Rocha and Avenida Tomás Cabreira.',
  37.119377,
  -8.536813,
  true,
  false
)
on conflict (slug) do update
set
  name = excluded.name,
  short_description = coalesce(public.cities.short_description, excluded.short_description),
  latitude = coalesce(public.cities.latitude, excluded.latitude),
  longitude = coalesce(public.cities.longitude, excluded.longitude),
  is_active = true,
  updated_at = now();

insert into public.city_region_mapping (city_id, region_id, is_primary)
select c.id, r.id, true
from public.cities c
join public.regions r on r.slug = 'algarve'
where c.slug = 'praia-da-rocha'
on conflict (city_id, region_id) do update
set is_primary = excluded.is_primary;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_old_slug text;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid;
  v_slug text := 'jupiter-hotel-group';
  v_name text := 'Jupiter Hotel Group';
  v_featured_image_url text := 'https://hapi.mmcreation.com/media/458/Fotos_2025/Aerea_5.jpg';
  v_short_description text := 'Jupiter Hotel Group is a Portuguese hotel group with Algarve units in Praia da Rocha, Portimão and Albufeira.';
  v_description text := $description$
Jupiter Hotel Group is a Portuguese hotel group with Algarve units including Jupiter Algarve Hotel - Beach & Spa in Praia da Rocha, Jupiter Marina Hotel - Couples & Spa in Portimão and Jupiter Albufeira Hotel - Family & Fun in Albufeira.

The group website presents a portfolio of four- and five-star hotel units, with central reservations and contact support for individual bookings, groups and hotel enquiries.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "accommodation",
  "name": "Jupiter Hotel Group",
  "slug": "jupiter-hotel-group",
  "category": "accommodation",
  "tier": "unverified",
  "status": "published",
  "city": "Praia da Rocha",
  "city_slug": "praia-da-rocha",
  "region": "Algarve",
  "region_slug": "algarve",
  "country": "Portugal",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "medium",
  "verification_notes": "Official brand website verifies Jupiter Hotel Group and its Algarve hotel units. The physical address used is the official LinkedIn primary location and matches the official legal address for Jupiter Algarve Hotel. Social links are parent-brand profiles.",
  "accommodation_type": "hotel group",
  "star_rating": null,
  "rooms_count": null,
  "number_of_units": null,
  "amenities": [],
  "has_pool": null,
  "has_spa": null,
  "has_restaurant": null,
  "has_parking": null,
  "booking_url": "https://booking.jupiterhotelgroup.com/",
  "price_from": null,
  "price_to": null,
  "currency": "EUR",
  "official_sources": [
    "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
    "https://www.jupiterhotelgroup.com/en/page/legal-mentions.6722.html",
    "https://www.jupiterhotelgroup.com/en/page/contact-us-jupiter-hotel-group.6715.html",
    "https://booking.jupiterhotelgroup.com/"
  ],
  "address": {
    "full_address": "Avenida Tomás Cabreira 92, Praia da Rocha, 8500-802 Portimão, Algarve, Portugal",
    "street": "Avenida Tomás Cabreira 92",
    "postal_code": "8500-802",
    "city": "Praia da Rocha",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.119377,
    "longitude": -8.536813
  },
  "contact": {
    "phone": "+351 282 105 500",
    "email": "reservas@jupiterhotelgroup.com",
    "website": "https://www.jupiterhotelgroup.com/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/jupiterhotelgroup/",
    "facebook": "https://www.facebook.com/jupiterhotelgroup/",
    "linkedin": "https://www.linkedin.com/company/jupiterhotelgroup",
    "youtube": "https://www.youtube.com/@jupiterhotelgroup",
    "tiktok": "https://www.tiktok.com/@jupiterhotelgroup",
    "x_twitter": "https://x.com/JupiterHotelGrp"
  },
  "media": {
    "featured_image": "https://hapi.mmcreation.com/media/458/Fotos_2025/Aerea_5.jpg",
    "image_source_url": "https://www.jupiterhotelgroup.com/en/page/about-jupiter-hotel-group.6745.html"
  },
  "content": {
    "short_description": "Jupiter Hotel Group is a Portuguese hotel group with Algarve units in Praia da Rocha, Portimão and Albufeira.",
    "full_description": "Jupiter Hotel Group is a Portuguese hotel group with Algarve units including Jupiter Algarve Hotel - Beach & Spa in Praia da Rocha, Jupiter Marina Hotel - Couples & Spa in Portimão and Jupiter Albufeira Hotel - Family & Fun in Albufeira.\n\nThe group website presents a portfolio of four- and five-star hotel units, with central reservations and contact support for individual bookings, groups and hotel enquiries.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "hotel accommodation",
      "central reservations",
      "group bookings",
      "meetings and events enquiries"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Jupiter Hotel Group | Hotels in Algarve, Portugal",
    "meta_description": "Portuguese hotel group with Algarve units in Praia da Rocha, Portimão and Albufeira, including Jupiter Algarve, Jupiter Marina and Jupiter Albufeira.",
    "slug": "jupiter-hotel-group"
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Jupiter Hotel Group",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/about-jupiter-hotel-group.6745.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "category",
      "value": "accommodation",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "City, Region, Country, address.full_address, address.street, address.postal_code, address.city, address.region, address.country",
      "value": "Avenida Tomás Cabreira 92, Praia da Rocha, 8500-802 Portimão, Algarve, Portugal",
      "source_type": "official_brand_social_profile",
      "source_url": "https://www.linkedin.com/company/jupiterhotelgroup",
      "checked_at": "2026-05-18"
    },
    {
      "field": "address.full_address",
      "value": "Avenida Tomás Cabreira 92, Praia da Rocha, 8500-802 Portimão, Algarve, Portugal",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/legal-mentions.6722.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "address.latitude,address.longitude",
      "value": "37.119377,-8.536813",
      "source_type": "official_certification_page",
      "source_url": "https://greenkey.abaae.pt/empreendimento/jupiter-algarve-hotel/",
      "checked_at": "2026-05-18"
    },
    {
      "field": "contact.phone",
      "value": "+351 282 105 500",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/contact-us-jupiter-hotel-group.6715.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "contact.email",
      "value": "reservas@jupiterhotelgroup.com",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/contact-us-jupiter-hotel-group.6715.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "contact.website",
      "value": "https://www.jupiterhotelgroup.com/",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/about-jupiter-hotel-group.6745.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/jupiterhotelgroup/",
      "source_type": "official_brand_social_profile",
      "source_url": "https://www.instagram.com/jupiterhotelgroup/",
      "checked_at": "2026-05-18"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/jupiterhotelgroup/",
      "source_type": "official_brand_social_profile",
      "source_url": "https://www.facebook.com/jupiterhotelgroup/",
      "checked_at": "2026-05-18"
    },
    {
      "field": "socials.linkedin",
      "value": "https://www.linkedin.com/company/jupiterhotelgroup",
      "source_type": "official_brand_social_profile",
      "source_url": "https://www.linkedin.com/company/jupiterhotelgroup",
      "checked_at": "2026-05-18"
    },
    {
      "field": "socials.youtube",
      "value": "https://www.youtube.com/@jupiterhotelgroup",
      "source_type": "official_brand_social_profile",
      "source_url": "https://www.youtube.com/@jupiterhotelgroup",
      "checked_at": "2026-05-18"
    },
    {
      "field": "socials.tiktok",
      "value": "https://www.tiktok.com/@jupiterhotelgroup",
      "source_type": "official_brand_social_profile",
      "source_url": "https://www.facebook.com/jupiterhotelgroup/",
      "checked_at": "2026-05-18"
    },
    {
      "field": "socials.x_twitter",
      "value": "https://x.com/JupiterHotelGrp",
      "source_type": "official_brand_social_profile",
      "source_url": "https://x.com/JupiterHotelGrp",
      "checked_at": "2026-05-18"
    },
    {
      "field": "media.featured_image",
      "value": "https://hapi.mmcreation.com/media/458/Fotos_2025/Aerea_5.jpg",
      "source_type": "official_website_image",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/about-jupiter-hotel-group.6745.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "content.short_description",
      "value": "Jupiter Hotel Group is a Portuguese hotel group with Algarve units in Praia da Rocha, Portimão and Albufeira.",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "content.full_description",
      "value": "Portuguese hotel group with Algarve units including Jupiter Algarve Hotel, Jupiter Marina Hotel and Jupiter Albufeira Hotel, with central reservations and contact support.",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "business_details.services",
      "value": "hotel accommodation, central reservations, group bookings, meetings and events enquiries",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/contact-us-jupiter-hotel-group.6715.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "category_data.vertical,category_data.accommodation_type",
      "value": "accommodation, hotel group",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "category_data.booking_url",
      "value": "https://booking.jupiterhotelgroup.com/",
      "source_type": "official_booking_link",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    },
    {
      "field": "seo.meta_title,seo.meta_description",
      "value": "Jupiter Hotel Group accommodation listing based on verified Algarve hotel units",
      "source_type": "official_website",
      "source_url": "https://www.jupiterhotelgroup.com/en/page/hotels-in-the-algarve-lisbon-and-porto.6627.html",
      "checked_at": "2026-05-18"
    }
  ],
  "missing_or_unverified_fields": [
    "google_business_profile_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "business_opening_hours",
    "price_level",
    "group_star_rating_as_single_value",
    "group_rooms_count_as_single_value",
    "single_property_amenities"
  ]
}
$json$::jsonb;
begin
  select id into v_category_id
  from public.categories
  where slug = 'accommodation'
  limit 1;

  select id into v_city_id
  from public.cities
  where slug = 'praia-da-rocha'
     or lower(name) = lower('Praia da Rocha')
  order by case when slug = 'praia-da-rocha' then 0 else 1 end
  limit 1;

  select id into v_region_id
  from public.regions
  where slug = 'algarve'
     or lower(name) = 'algarve'
  order by case when slug = 'algarve' then 0 else 1 end
  limit 1;

  if v_category_id is null then
    raise exception 'Required category accommodation was not found';
  end if;

  if v_city_id is null then
    raise exception 'Required city praia-da-rocha was not found';
  end if;

  select id, slug
  into v_listing_id, v_old_slug
  from public.listings
  where slug = v_slug
     or (
       lower(name) = lower(v_name)
       and city_id = v_city_id
     )
  order by case when slug = v_slug then 0 else 1 end, updated_at desc
  limit 1;

  if v_listing_id is null then
    insert into public.listings (
      name,
      slug,
      description,
      short_description,
      owner_id,
      category_id,
      city_id,
      region_id,
      tier,
      status,
      is_curated,
      website_url,
      contact_phone,
      contact_email,
      address,
      latitude,
      longitude,
      instagram_url,
      facebook_url,
      linkedin_url,
      twitter_url,
      youtube_url,
      tiktok_url,
      google_business_url,
      google_rating,
      google_review_count,
      featured_image_url,
      price_from,
      price_to,
      price_currency,
      tags,
      category_data,
      meta_title,
      meta_description,
      published_at
    ) values (
      v_name,
      v_slug,
      btrim(v_description),
      v_short_description,
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.jupiterhotelgroup.com/',
      '+351 282 105 500',
      'reservas@jupiterhotelgroup.com',
      'Avenida Tomás Cabreira 92, Praia da Rocha, 8500-802 Portimão, Algarve, Portugal',
      37.119377,
      -8.536813,
      'https://www.instagram.com/jupiterhotelgroup/',
      'https://www.facebook.com/jupiterhotelgroup/',
      'https://www.linkedin.com/company/jupiterhotelgroup',
      'https://x.com/JupiterHotelGrp',
      'https://www.youtube.com/@jupiterhotelgroup',
      'https://www.tiktok.com/@jupiterhotelgroup',
      null,
      null,
      null,
      v_featured_image_url,
      null,
      null,
      'EUR',
      array[
        'Jupiter Hotel Group',
        'Algarve hotels',
        'Praia da Rocha hotel group',
        'Portimão accommodation',
        'Albufeira hotels',
        'central reservations'
      ],
      v_category_data,
      'Jupiter Hotel Group | Hotels in Algarve, Portugal',
      'Portuguese hotel group with Algarve units in Praia da Rocha, Portimão and Albufeira, including Jupiter Algarve, Jupiter Marina and Jupiter Albufeira.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_description),
      short_description = v_short_description,
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      is_curated = false,
      website_url = 'https://www.jupiterhotelgroup.com/',
      contact_phone = '+351 282 105 500',
      contact_email = 'reservas@jupiterhotelgroup.com',
      whatsapp_number = null,
      instagram_url = 'https://www.instagram.com/jupiterhotelgroup/',
      facebook_url = 'https://www.facebook.com/jupiterhotelgroup/',
      linkedin_url = 'https://www.linkedin.com/company/jupiterhotelgroup',
      twitter_url = 'https://x.com/JupiterHotelGrp',
      youtube_url = 'https://www.youtube.com/@jupiterhotelgroup',
      tiktok_url = 'https://www.tiktok.com/@jupiterhotelgroup',
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = 'Avenida Tomás Cabreira 92, Praia da Rocha, 8500-802 Portimão, Algarve, Portugal',
      latitude = 37.119377,
      longitude = -8.536813,
      featured_image_url = v_featured_image_url,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Jupiter Hotel Group',
        'Algarve hotels',
        'Praia da Rocha hotel group',
        'Portimão accommodation',
        'Albufeira hotels',
        'central reservations'
      ],
      category_data = v_category_data,
      meta_title = 'Jupiter Hotel Group | Hotels in Algarve, Portugal',
      meta_description = 'Portuguese hotel group with Algarve units in Praia da Rocha, Portimão and Albufeira, including Jupiter Algarve, Jupiter Marina and Jupiter Albufeira.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  update public.listing_images
  set is_featured = false
  where listing_id = v_listing_id;

  if exists (
    select 1
    from public.listing_images
    where listing_id = v_listing_id
      and image_url = v_featured_image_url
  ) then
    update public.listing_images
    set
      alt_text = coalesce(nullif(alt_text, ''), v_name),
      display_order = 0,
      is_featured = true
    where listing_id = v_listing_id
      and image_url = v_featured_image_url;
  else
    insert into public.listing_images (
      listing_id,
      image_url,
      alt_text,
      display_order,
      is_featured
    ) values (
      v_listing_id,
      v_featured_image_url,
      v_name,
      0,
      true
    );
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id
      and slug <> v_slug;

    if v_old_slug is not null and v_old_slug <> v_slug then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update set
        listing_id = excluded.listing_id,
        is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, v_slug, true)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;
  end if;
end $$;

commit;
