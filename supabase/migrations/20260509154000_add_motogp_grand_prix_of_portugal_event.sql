begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.cities (name, slug, is_active, is_featured)
values ('Portimão', 'portimao', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_city_id uuid;
  v_event_data jsonb := $event$
{
  "Nome": "MotoGP Grand Prix of Portugal",
  "URL_slug": "motogp-grand-prix-of-portugal",
  "City": "Portimão",
  "city_slug": "portimao",
  "Region": "Algarve",
  "region_slug": "algarve",
  "Country": "Portugal",
  "category": "events",
  "tier": "unverified",
  "status": "published",
  "owner_id": "280be9b4-c0fe-48f3-b371-f490d8cccfd5",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official MotoGP, MotoGP ticketing and Autódromo Internacional do Algarve sources confirm the Repsol Grand Prix of Portugal / MotoGP Grand Prix of Portugal at Autódromo Internacional do Algarve from 20 to 22 November 2026. Official venue website footer confirms Facebook, Instagram, X/Twitter and YouTube. LinkedIn and TikTok were checked but no official venue or event profile was verified.",
  "vertical": "event",
  "event_type": "international motorsport",
  "event_status": null,
  "event_date": "2026-11-20",
  "event_end_date": "2026-11-22",
  "start_date": "2026-11-20",
  "end_date": "2026-11-22",
  "venue_name": "Autódromo Internacional do Algarve",
  "ticket_url": "https://tickets.motogp.com/en/53277-portugal/",
  "booking_url": null,
  "organizer_name": "MotoGP",
  "price_from": null,
  "currency": "EUR",
  "sport_type": "motorsport",
  "competition_level": "international",
  "distance_category": "4.59 km circuit; MotoGP, Moto2 and Moto3",
  "race_categories": [
    "MotoGP",
    "Moto2",
    "Moto3"
  ],
  "circuit": {
    "name": "Autódromo Internacional do Algarve",
    "length_km": 4.59,
    "right_corners": 9,
    "left_corners": 6
  },
  "address": {
    "full_address": "Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, 8500-148 Portimão, Portugal",
    "street": "Sítio do Escampadinho, Mexilhoeira Grande",
    "postal_code": "8500-148",
    "city": "Portimão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.231598,
    "longitude": -8.628296
  },
  "location": {
    "address": "Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, 8500-148 Portimão, Portugal",
    "latitude": 37.231598,
    "longitude": -8.628296
  },
  "contact": {
    "phone": "+351 282 405 600",
    "email": "tickets@autodromodoalgarve.com",
    "website": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/autodromodoalgarve/",
    "facebook": "https://www.facebook.com/AutodromodoAlgarve",
    "linkedin": null,
    "youtube": "https://www.youtube.com/user/AutodromodoAlgarve",
    "tiktok": null,
    "x_twitter": "https://twitter.com/AIAPortimao"
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "content": {
    "short_description": "MotoGP Grand Prix of Portugal is an international motorcycle racing event in Portimão from 20 to 22 November 2026.",
    "full_description": "MotoGP Grand Prix of Portugal takes place at Autódromo Internacional do Algarve in Portimão from 20 to 22 November 2026. Official MotoGP sources list the event as the Repsol Grand Prix of Portugal at the Algarve circuit.\n\nThe official venue page lists MotoGP, Moto2 and Moto3 as present categories, while MotoGP’s official event page gives the circuit length as 4.59 km with 9 right corners and 6 left corners.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "international motorsport event",
      "MotoGP race weekend",
      "Moto2 race category",
      "Moto3 race category",
      "official ticketing",
      "VIP passes"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "MotoGP Grand Prix of Portugal | Motorsport Event in Portimão, Algarve",
    "meta_description": "MotoGP Grand Prix of Portugal takes place at Autódromo Internacional do Algarve in Portimão from 20 to 22 November 2026.",
    "slug": "motogp-grand-prix-of-portugal"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "international motorsport",
    "event_status": null,
    "start_date": "2026-11-20",
    "end_date": "2026-11-22",
    "venue_name": "Autódromo Internacional do Algarve",
    "ticket_url": "https://tickets.motogp.com/en/53277-portugal/",
    "booking_url": null,
    "organizer_name": "MotoGP",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "https://tickets.motogp.com/en/53277-portugal/",
      "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "https://autodromodoalgarve.com/",
      "https://visitalgarve.pt/en/equipamento/5988/autdromo-internacional-do-algarve"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "international motorsport",
    "event_status": null,
    "start_date": "2026-11-20",
    "end_date": "2026-11-22",
    "venue_name": "Autódromo Internacional do Algarve",
    "ticket_url": "https://tickets.motogp.com/en/53277-portugal/",
    "booking_url": null,
    "organizer_name": "MotoGP",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "https://tickets.motogp.com/en/53277-portugal/",
      "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "https://autodromodoalgarve.com/",
      "https://visitalgarve.pt/en/equipamento/5988/autdromo-internacional-do-algarve"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "MotoGP Grand Prix of Portugal",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "motogp-grand-prix-of-portugal",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Portimão",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_motogp_ticket_store",
      "source_url": "https://tickets.motogp.com/en/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, 8500-148 Portimão, Portugal",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.street",
      "value": "Sítio do Escampadinho, Mexilhoeira Grande",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.postal_code",
      "value": "8500-148",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_motogp_ticket_store",
      "source_url": "https://tickets.motogp.com/en/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.231598",
      "source_type": "official_tourism_board",
      "source_url": "https://visitalgarve.pt/en/equipamento/5988/autdromo-internacional-do-algarve",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.628296",
      "source_type": "official_tourism_board",
      "source_url": "https://visitalgarve.pt/en/equipamento/5988/autdromo-internacional-do-algarve",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+351 282 405 600",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "tickets@autodromodoalgarve.com",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/autodromodoalgarve/",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/AutodromodoAlgarve",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.youtube",
      "value": "https://www.youtube.com/user/AutodromodoAlgarve",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.x_twitter",
      "value": "https://twitter.com/AIAPortimao",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "MotoGP Grand Prix of Portugal is an international motorcycle racing event in Portimão from 20 to 22 November 2026.",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official event dates, venue, MotoGP categories and circuit specifications.",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "international motorsport event; MotoGP race weekend; Moto2 race category; Moto3 race category; official ticketing; VIP passes",
      "source_type": "official_motogp_ticket_store",
      "source_url": "https://tickets.motogp.com/en/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "MotoGP Grand Prix of Portugal | Motorsport Event in Portimão, Algarve",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "MotoGP Grand Prix of Portugal takes place at Autódromo Internacional do Algarve in Portimão from 20 to 22 November 2026.",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "motogp-grand-prix-of-portugal",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "international motorsport",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/motogp-grand-prix-of-portugal-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-11-20",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-11-22",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Autódromo Internacional do Algarve",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://tickets.motogp.com/en/53277-portugal/",
      "source_type": "official_motogp_ticket_store",
      "source_url": "https://tickets.motogp.com/en/53277-portugal/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "MotoGP",
      "source_type": "official_motogp",
      "source_url": "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "featured_image",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "opening_hours",
    "price_level",
    "amenities",
    "event_status",
    "booking_url",
    "price_from",
    "official_linkedin_profile",
    "official_tiktok_profile"
  ]
}
$event$::jsonb;
begin
  select id into v_city_id
  from public.cities
  where slug = 'portimao'
     or lower(name) in ('portimão', 'portimao')
  order by case when slug = 'portimao' then 0 else 1 end
  limit 1;

  if v_city_id is null then
    raise exception 'Missing Portimão city';
  end if;

  insert into public.events (
    title, slug, description, short_description, image, category,
    start_date, end_date, start_time, end_time,
    location, venue, city_id, ticket_url, price_range,
    is_featured, is_recurring, recurrence_pattern,
    related_listing_ids, tags, status, submitter_id,
    meta_title, meta_description, event_data, listing_id
  )
  values (
    'MotoGP Grand Prix of Portugal',
    'motogp-grand-prix-of-portugal',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'sporting',
    '2026-11-20',
    '2026-11-22',
    null,
    null,
    v_event_data #>> '{address,full_address}',
    v_event_data #>> '{category_data,venue_name}',
    v_city_id,
    v_event_data #>> '{category_data,ticket_url}',
    null,
    false,
    false,
    null,
    array[]::uuid[],
    array['events', 'portimao', 'motogp', 'motorsport', 'grand-prix', 'autodromo-internacional-do-algarve'],
    'published',
    v_owner_id,
    v_event_data #>> '{seo,meta_title}',
    v_event_data #>> '{seo,meta_description}',
    v_event_data,
    null
  )
  on conflict (slug) do update
  set
    title = excluded.title,
    description = excluded.description,
    short_description = excluded.short_description,
    image = excluded.image,
    category = excluded.category,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    location = excluded.location,
    venue = excluded.venue,
    city_id = excluded.city_id,
    ticket_url = excluded.ticket_url,
    price_range = excluded.price_range,
    is_featured = excluded.is_featured,
    is_recurring = excluded.is_recurring,
    recurrence_pattern = excluded.recurrence_pattern,
    related_listing_ids = excluded.related_listing_ids,
    tags = excluded.tags,
    status = excluded.status,
    submitter_id = excluded.submitter_id,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    event_data = excluded.event_data,
    updated_at = now();
end $$;

commit;
