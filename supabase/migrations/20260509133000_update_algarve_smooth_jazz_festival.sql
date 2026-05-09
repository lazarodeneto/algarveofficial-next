begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Events', 'events', true, true, 22)
on conflict (slug) do nothing;

-- Some live event sync triggers still reference historical category UUIDs.
insert into public.categories (id, name, slug, is_active, is_featured, display_order)
values
  ('3b6ef365-60b2-4a92-9cb1-9dfd4f5a98d2'::uuid, 'Events Legacy Sync', 'events-legacy-sync', false, false, 98),
  ('22dcc3a0-2bfd-4369-8f77-1c2cefc00816'::uuid, 'Premier Events Legacy Sync', 'premier-events-legacy-sync', false, false, 99)
on conflict do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Albufeira', 'albufeira', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_event_id uuid;
  v_temp_listing_id uuid;
  v_city_id uuid;
  v_region_id uuid;
  v_category_id uuid;
  v_tags text[] := array['events', 'albufeira', 'smooth-jazz', 'music-festival', 'pine-cliffs'];
  v_category_data jsonb := $category$
{
  "vertical": "event",
  "category": "events",
  "country": "Portugal",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official festival page verifies the 9th Algarve Smooth Jazz Festival runs 12–17 May 2026 at Pine Cliffs Resort in Albufeira. Venue address is verified from Pine Cliffs Resort and Marriott official pages. Coordinates are sourced from the Cvent venue page because the official venue pages link to Google Maps but do not expose numeric coordinates.",
  "event": {
    "vertical": "event",
    "event_type": "music festival",
    "event_status": null,
    "start_date": "2026-05-12",
    "end_date": "2026-05-17",
    "venue_name": "Pine Cliffs Resort",
    "ticket_url": "https://smoothjazzshop.eu/algarve/en",
    "booking_url": "https://smoothjazzshop.eu/algarve/en",
    "organizer_name": "smooth entertainment GmbH",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.smoothjazzeurope.eu/travels-events/algarve-smooth-jazz-festival/",
      "https://smoothjazzshop.eu/algarve/en",
      "https://www.smoothjazzeurope.eu/information/imprint/"
    ]
  },
  "event_type": "music festival",
  "event_status": null,
  "start_date": "2026-05-12",
  "end_date": "2026-05-17",
  "event_date": "2026-05-12",
  "event_end_date": "2026-05-17",
  "venue_name": "Pine Cliffs Resort",
  "ticket_url": "https://smoothjazzshop.eu/algarve/en",
  "booking_url": "https://smoothjazzshop.eu/algarve/en",
  "organizer_name": "smooth entertainment GmbH",
  "price_from": null,
  "currency": "EUR",
  "official_sources": [
    "https://www.smoothjazzeurope.eu/travels-events/algarve-smooth-jazz-festival/",
    "https://smoothjazzshop.eu/algarve/en",
    "https://www.smoothjazzeurope.eu/information/imprint/"
  ],
  "address": {
    "full_address": "Pine Cliffs Resort, Pinhal do Concelho, 8200-912 Albufeira, Portugal",
    "street": "Pinhal do Concelho",
    "postal_code": "8200-912",
    "city": "Albufeira",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.096604,
    "longitude": -8.178937
  },
  "location": {
    "address": "Pine Cliffs Resort, Pinhal do Concelho, 8200-912 Albufeira, Portugal",
    "latitude": 37.096604,
    "longitude": -8.178937
  },
  "contact": {
    "phone": "+49 821 2292711",
    "email": "shop@smooth-entertainment.eu",
    "website": "https://www.smoothjazzeurope.eu/travels-events/algarve-smooth-jazz-festival/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/smooth.jazz.europe/",
    "facebook": "https://www.facebook.com/SmoothJazzEurope",
    "linkedin": null,
    "youtube": "https://www.youtube.com/@SmoothJazzEurope",
    "tiktok": null,
    "x_twitter": "https://twitter.com/SmoothJazzEuro"
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "content": {
    "short_description": "Algarve Smooth Jazz Festival is a 12–17 May 2026 music festival at Pine Cliffs Resort in Albufeira.",
    "full_description": "Algarve Smooth Jazz Festival is scheduled for 12–17 May 2026 at Pine Cliffs Resort in Albufeira, with the official page describing it as the 9th edition of the festival.\n\nThe official programme information lists six days, three areas, more than 20 artists, 17 shows and parties, with ticket and accommodation packages available through the event’s online shop.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "live music concerts",
      "midnight jams",
      "festival packages",
      "optional excursions"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Algarve Smooth Jazz Festival | Music Festival in Albufeira",
    "meta_description": "Algarve Smooth Jazz Festival takes place 12–17 May 2026 at Pine Cliffs Resort in Albufeira, with live music shows, parties and festival packages.",
    "slug": "algarve-smooth-jazz-festival"
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Algarve Smooth Jazz Festival",
      "source_type": "official_website",
      "source_url": "https://www.smoothjazzeurope.eu/travels-events/algarve-smooth-jazz-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Pine Cliffs Resort, Pinhal do Concelho, 8200-912 Albufeira, Portugal",
      "source_type": "official_website",
      "source_url": "https://www.pinecliffs.com/en/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.096604",
      "source_type": "venue_coordinates_page",
      "source_url": "https://www.cvent.com/venues/pt-PT/albufeira/luxury-hotel/pine-cliffs-a-luxury-collection-resort-algarve/venue-ab13d20b-ace3-498d-a236-83a4ffc7ef60",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.178937",
      "source_type": "venue_coordinates_page",
      "source_url": "https://www.cvent.com/venues/pt-PT/albufeira/luxury-hotel/pine-cliffs-a-luxury-collection-resort-algarve/venue-ab13d20b-ace3-498d-a236-83a4ffc7ef60",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+49 821 2292711",
      "source_type": "official_website",
      "source_url": "https://www.smoothjazzeurope.eu/information/imprint/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "shop@smooth-entertainment.eu",
      "source_type": "official_website",
      "source_url": "https://www.smoothjazzeurope.eu/information/imprint/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-05-12",
      "source_type": "official_website",
      "source_url": "https://www.smoothjazzeurope.eu/travels-events/algarve-smooth-jazz-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-05-17",
      "source_type": "official_website",
      "source_url": "https://www.smoothjazzeurope.eu/travels-events/algarve-smooth-jazz-festival/",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "media.featured_image",
    "media.image_source_url",
    "business_details.google_business_url",
    "business_details.google_rating",
    "business_details.google_review_count",
    "business_details.opening_hours",
    "business_details.price_level",
    "category_data.event_status",
    "category_data.price_from",
    "socials.linkedin",
    "socials.tiktok",
    "google_review_positive_themes"
  ]
}
$category$::jsonb;
begin
  select id into v_city_id from public.cities where slug = 'albufeira' limit 1;
  select id into v_region_id from public.regions where slug = 'algarve' limit 1;
  select id into v_category_id from public.categories where slug = 'events' limit 1;

  select id into v_listing_id
  from public.listings
  where slug = 'algarve-smooth-jazz-festival'
     or name = 'Algarve Smooth Jazz Festival'
  order by case when slug = 'algarve-smooth-jazz-festival' then 0 else 1 end, updated_at desc
  limit 1;

  if v_listing_id is null then
    insert into public.listings (
      name, slug, description, short_description,
      owner_id, category_id, city_id, region_id,
      tier, status, is_curated,
      website_url, contact_phone, contact_email,
      address, latitude, longitude,
      instagram_url, facebook_url, linkedin_url, twitter_url, youtube_url, tiktok_url,
      google_business_url, google_rating, google_review_count,
      featured_image_url, category_data, tags,
      price_from, price_currency, meta_title, meta_description
    )
    values (
      'Algarve Smooth Jazz Festival',
      'algarve-smooth-jazz-festival',
      v_category_data #>> '{content,full_description}',
      v_category_data #>> '{content,short_description}',
      v_owner_id, v_category_id, v_city_id, v_region_id,
      'unverified', 'published', false,
      v_category_data #>> '{contact,website}',
      v_category_data #>> '{contact,phone}',
      v_category_data #>> '{contact,email}',
      v_category_data #>> '{address,full_address}',
      (v_category_data #>> '{address,latitude}')::numeric,
      (v_category_data #>> '{address,longitude}')::numeric,
      v_category_data #>> '{socials,instagram}',
      v_category_data #>> '{socials,facebook}',
      null,
      v_category_data #>> '{socials,x_twitter}',
      v_category_data #>> '{socials,youtube}',
      null,
      null, null, null,
      null, v_category_data, v_tags,
      null, 'EUR',
      v_category_data #>> '{seo,meta_title}',
      v_category_data #>> '{seo,meta_description}'
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = 'Algarve Smooth Jazz Festival',
      slug = 'algarve-smooth-jazz-festival',
      description = v_category_data #>> '{content,full_description}',
      short_description = v_category_data #>> '{content,short_description}',
      owner_id = v_owner_id,
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified',
      status = 'published',
      is_curated = false,
      website_url = v_category_data #>> '{contact,website}',
      contact_phone = v_category_data #>> '{contact,phone}',
      contact_email = v_category_data #>> '{contact,email}',
      address = v_category_data #>> '{address,full_address}',
      latitude = (v_category_data #>> '{address,latitude}')::numeric,
      longitude = (v_category_data #>> '{address,longitude}')::numeric,
      instagram_url = v_category_data #>> '{socials,instagram}',
      facebook_url = v_category_data #>> '{socials,facebook}',
      linkedin_url = null,
      twitter_url = v_category_data #>> '{socials,x_twitter}',
      youtube_url = v_category_data #>> '{socials,youtube}',
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      featured_image_url = null,
      category_data = v_category_data,
      tags = v_tags,
      price_from = null,
      price_currency = 'EUR',
      meta_title = v_category_data #>> '{seo,meta_title}',
      meta_description = v_category_data #>> '{seo,meta_description}',
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs set is_current = false where listing_id = v_listing_id;
    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'algarve-smooth-jazz-festival', true)
    on conflict (slug) do update
      set is_current = true
      where public.listing_slugs.listing_id = excluded.listing_id;
  end if;

  select id into v_event_id
  from public.events
  where slug = 'algarve-smooth-jazz-festival'
  limit 1;

  if v_event_id is null then
    insert into public.events (
      title, slug, description, short_description, image, category,
      start_date, end_date, start_time, end_time,
      location, venue, city_id, ticket_url, price_range,
      is_featured, is_recurring, recurrence_pattern,
      related_listing_ids, tags, status, submitter_id,
      meta_title, meta_description, event_data, listing_id
    )
    values (
      'Algarve Smooth Jazz Festival',
      'algarve-smooth-jazz-festival',
      v_category_data #>> '{content,full_description}',
      v_category_data #>> '{content,short_description}',
      null,
      'music festival',
      '2026-05-12',
      '2026-05-17',
      null,
      null,
      v_category_data #>> '{address,full_address}',
      'Pine Cliffs Resort',
      v_city_id,
      'https://smoothjazzshop.eu/algarve/en',
      null,
      false,
      false,
      null,
      array[]::uuid[],
      v_tags,
      'published',
      v_owner_id,
      v_category_data #>> '{seo,meta_title}',
      v_category_data #>> '{seo,meta_description}',
      v_category_data,
      v_listing_id
    )
    returning id, listing_id into v_event_id, v_temp_listing_id;
  end if;

  update public.events
  set
    title = 'Algarve Smooth Jazz Festival',
    slug = 'algarve-smooth-jazz-festival',
    description = v_category_data #>> '{content,full_description}',
    short_description = v_category_data #>> '{content,short_description}',
    image = null,
    category = 'music festival',
    start_date = '2026-05-12',
    end_date = '2026-05-17',
    start_time = null,
    end_time = null,
    location = v_category_data #>> '{address,full_address}',
    venue = 'Pine Cliffs Resort',
    city_id = v_city_id,
    ticket_url = 'https://smoothjazzshop.eu/algarve/en',
    price_range = null,
    is_featured = false,
    is_recurring = false,
    recurrence_pattern = null,
    related_listing_ids = array[]::uuid[],
    tags = v_tags,
    status = 'published',
    submitter_id = v_owner_id,
    meta_title = v_category_data #>> '{seo,meta_title}',
    meta_description = v_category_data #>> '{seo,meta_description}',
    event_data = v_category_data,
    listing_id = v_listing_id,
    updated_at = now()
  where id = v_event_id;

  if v_temp_listing_id is not null and v_temp_listing_id <> v_listing_id then
    delete from public.listings where id = v_temp_listing_id;
  end if;

  delete from public.listings as duplicate_listing
  where duplicate_listing.id <> v_listing_id
    and (
      duplicate_listing.slug = 'algarve-smooth-jazz-festival'
      or duplicate_listing.name = 'Algarve Smooth Jazz Festival'
    )
    and not exists (
      select 1
      from public.events as linked_event
      where linked_event.listing_id = duplicate_listing.id
    );

  -- Restore rich listing metadata in case the event sync trigger overwrote it.
  update public.listings
  set
    category_id = v_category_id,
    description = v_category_data #>> '{content,full_description}',
    short_description = v_category_data #>> '{content,short_description}',
    address = v_category_data #>> '{address,full_address}',
    latitude = (v_category_data #>> '{address,latitude}')::numeric,
    longitude = (v_category_data #>> '{address,longitude}')::numeric,
    website_url = v_category_data #>> '{contact,website}',
    contact_phone = v_category_data #>> '{contact,phone}',
    contact_email = v_category_data #>> '{contact,email}',
    instagram_url = v_category_data #>> '{socials,instagram}',
    facebook_url = v_category_data #>> '{socials,facebook}',
    linkedin_url = null,
    twitter_url = v_category_data #>> '{socials,x_twitter}',
    youtube_url = v_category_data #>> '{socials,youtube}',
    tiktok_url = null,
    category_data = v_category_data,
    tags = v_tags,
    meta_title = v_category_data #>> '{seo,meta_title}',
    meta_description = v_category_data #>> '{seo,meta_description}',
    updated_at = now()
  where id = v_listing_id;
end $$;

commit;
