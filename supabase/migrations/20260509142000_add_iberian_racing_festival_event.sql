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
  "Nome": "Iberian Racing Festival",
  "URL_slug": "iberian-racing-festival",
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
  "verification_notes": "Official event page confirms the Iberian Racing Festival at Autódromo Internacional do Algarve from 15 to 17 May 2026. Venue address is verified from the official AIA reception/contact page. Social links are official venue profiles found via the official AIA website footer, with LinkedIn verified by matching official website and address.",
  "vertical": "event",
  "event_type": "motorsport",
  "event_status": null,
  "event_date": "2026-05-15",
  "event_end_date": "2026-05-17",
  "start_date": "2026-05-15",
  "end_date": "2026-05-17",
  "venue_name": "Autódromo Internacional do Algarve",
  "ticket_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
  "booking_url": null,
  "organizer_name": null,
  "price_from": 10,
  "currency": "EUR",
  "sport_type": "motorsport",
  "competition_level": "international",
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
    "website": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/autodromodoalgarve/",
    "facebook": "https://www.facebook.com/AutodromodoAlgarve",
    "linkedin": "https://www.linkedin.com/company/autodromodoalgarve",
    "youtube": "https://www.youtube.com/user/AutodromodoAlgarve",
    "tiktok": null,
    "x_twitter": "https://twitter.com/AIAPortimao"
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "content": {
    "short_description": "A three-day motorsport festival at Autódromo Internacional do Algarve in Portimão from 15 to 17 May 2026.",
    "full_description": "Iberian Racing Festival returns to Autódromo Internacional do Algarve in Portimão from 15 to 17 May 2026. The official event page describes a weekend of motor racing with multiple competitive grids, including sports prototypes, GT cars and single-seaters.\n\nThe event is hosted at Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, with weekend paddock access listed by the venue at €10.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "motorsport event",
      "race calendar event",
      "weekend paddock access"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Iberian Racing Festival | Motorsport Event in Portimão, Algarve",
    "meta_description": "Iberian Racing Festival takes place at Autódromo Internacional do Algarve in Portimão from 15 to 17 May 2026, featuring multiple motorsport grids.",
    "slug": "iberian-racing-festival"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "motorsport",
    "event_status": null,
    "start_date": "2026-05-15",
    "end_date": "2026-05-17",
    "venue_name": "Autódromo Internacional do Algarve",
    "ticket_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
    "booking_url": null,
    "organizer_name": null,
    "price_from": 10,
    "currency": "EUR",
    "official_sources": [
      "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "https://autodromodoalgarve.com/reception/",
      "https://www.raceready.pt/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "motorsport",
    "event_status": null,
    "start_date": "2026-05-15",
    "end_date": "2026-05-17",
    "venue_name": "Autódromo Internacional do Algarve",
    "ticket_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
    "booking_url": null,
    "organizer_name": null,
    "price_from": 10,
    "currency": "EUR",
    "official_sources": [
      "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "https://autodromodoalgarve.com/reception/",
      "https://www.raceready.pt/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Iberian Racing Festival",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "iberian-racing-festival",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, 8500-148 Portimão, Portugal",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.street",
      "value": "Sítio do Escampadinho, Mexilhoeira Grande",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.postal_code",
      "value": "8500-148",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/reception/",
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
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "tickets@autodromodoalgarve.com",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/autodromodoalgarve/",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/AutodromodoAlgarve",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.linkedin",
      "value": "https://www.linkedin.com/company/autodromodoalgarve",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.linkedin.com/company/autodromodoalgarve",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.youtube",
      "value": "https://www.youtube.com/user/AutodromodoAlgarve",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.x_twitter",
      "value": "https://twitter.com/AIAPortimao",
      "source_type": "official_website_social_link",
      "source_url": "https://autodromodoalgarve.com/reception/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "A three-day motorsport festival at Autódromo Internacional do Algarve in Portimão from 15 to 17 May 2026.",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official event description, date, venue, racing categories and paddock access price.",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "motorsport event; race calendar event; weekend paddock access",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Iberian Racing Festival | Motorsport Event in Portimão, Algarve",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Iberian Racing Festival takes place at Autódromo Internacional do Algarve in Portimão from 15 to 17 May 2026, featuring multiple motorsport grids.",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "iberian-racing-festival",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "motorsport",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-05-15",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-05-17",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Autódromo Internacional do Algarve",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.price_from",
      "value": "10",
      "source_type": "official_website",
      "source_url": "https://autodromodoalgarve.com/race-calendar/iberian-racing-festival/",
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
    "event_status",
    "booking_url",
    "organizer_name",
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
    'Iberian Racing Festival',
    'iberian-racing-festival',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'sporting',
    '2026-05-15',
    '2026-05-17',
    null,
    null,
    v_event_data #>> '{address,full_address}',
    v_event_data #>> '{category_data,venue_name}',
    v_city_id,
    v_event_data #>> '{category_data,ticket_url}',
    'From €10',
    false,
    false,
    null,
    array[]::uuid[],
    array['events', 'portimao', 'motorsport', 'iberian-racing-festival', 'autodromo-internacional-do-algarve'],
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
    listing_id = null,
    updated_at = now();
end $$;

commit;
