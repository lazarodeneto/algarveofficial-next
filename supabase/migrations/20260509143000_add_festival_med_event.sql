begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.cities (name, slug, is_active, is_featured)
values ('Almancil', 'almancil', true, true)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_city_id uuid;
  v_event_data jsonb := $event$
{
  "Nome": "Festival MED",
  "URL_slug": "festival-med",
  "City": "Almancil",
  "city_slug": "almancil",
  "Region": "Algarve",
  "region_slug": "algarve",
  "Country": "Portugal",
  "category": "events",
  "tier": "unverified",
  "status": "published",
  "owner_id": "280be9b4-c0fe-48f3-b371-f490d8cccfd5",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official Festival MED and Visit Portugal sources confirm the event in Loulé from 25 to 28 June 2026. Loulé is in the Algarve but is not in the allowed city list, so Almancil is used as the closest valid importer city. The verified event address remains Praça da República, Loulé. Official website footer confirms Instagram and Facebook only; no official LinkedIn, YouTube, TikTok, or X/Twitter profile was verified.",
  "vertical": "event",
  "event_type": "world music and culture festival",
  "event_status": null,
  "event_date": "2026-06-25",
  "event_end_date": "2026-06-28",
  "start_date": "2026-06-25",
  "end_date": "2026-06-28",
  "venue_name": "Loulé historic centre",
  "ticket_url": "https://centrohistoricoloule.bol.pt/",
  "booking_url": null,
  "organizer_name": "Câmara Municipal de Loulé",
  "price_from": 10,
  "currency": "EUR",
  "festival_type": "music",
  "address": {
    "full_address": "Praça da República, Loulé, Portugal",
    "street": "Praça da República",
    "postal_code": null,
    "city": "Loulé",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.138173,
    "longitude": -8.022273
  },
  "location": {
    "address": "Praça da República, Loulé, Portugal",
    "latitude": 37.138173,
    "longitude": -8.022273
  },
  "contact": {
    "phone": null,
    "email": "festivalmed@cm-loule.pt",
    "website": "https://festivalmed.cm-loule.pt/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/festivalmedloule/",
    "facebook": "https://www.facebook.com/festivalmedloule/",
    "linkedin": null,
    "youtube": null,
    "tiktok": null,
    "x_twitter": null
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "content": {
    "short_description": "Festival MED is a world music and culture festival in Loulé’s historic centre from 25 to 28 June 2026.",
    "full_description": "Festival MED takes place in Loulé’s historic centre from 25 to 28 June 2026, with the official programme centred on world music and cultural diversity.\n\nThe official event page describes music alongside gastronomy, visual arts, street entertainment, handicrafts, dance, cinema, poetry, conferences and other cultural programming.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "world music festival",
      "cultural events",
      "gastronomy",
      "visual arts",
      "street entertainment",
      "handicrafts",
      "dance",
      "cinema",
      "poetry",
      "conferences"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Festival MED | World Music Festival in Loulé, Algarve",
    "meta_description": "Festival MED takes place in Loulé’s historic centre from 25 to 28 June 2026, with world music, gastronomy, arts and cultural programming.",
    "slug": "festival-med"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "world music and culture festival",
    "event_status": null,
    "start_date": "2026-06-25",
    "end_date": "2026-06-28",
    "venue_name": "Loulé historic centre",
    "ticket_url": "https://centrohistoricoloule.bol.pt/",
    "booking_url": null,
    "organizer_name": "Câmara Municipal de Loulé",
    "price_from": 10,
    "currency": "EUR",
    "official_sources": [
      "https://festivalmed.cm-loule.pt/",
      "https://festivalmed.cm-loule.pt/en/",
      "https://www.visitportugal.com/en/content/festival-med",
      "https://centrohistoricoloule.bol.pt/",
      "https://cineteatrolouletano.bol.pt/Comprar/Bilhetes/173550-festival_med_2026_bilhete_festival-centro_historico/Sessoes"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "world music and culture festival",
    "event_status": null,
    "start_date": "2026-06-25",
    "end_date": "2026-06-28",
    "venue_name": "Loulé historic centre",
    "ticket_url": "https://centrohistoricoloule.bol.pt/",
    "booking_url": null,
    "organizer_name": "Câmara Municipal de Loulé",
    "price_from": 10,
    "currency": "EUR",
    "official_sources": [
      "https://festivalmed.cm-loule.pt/",
      "https://festivalmed.cm-loule.pt/en/",
      "https://www.visitportugal.com/en/content/festival-med",
      "https://centrohistoricoloule.bol.pt/",
      "https://cineteatrolouletano.bol.pt/Comprar/Bilhetes/173550-festival_med_2026_bilhete_festival-centro_historico/Sessoes"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Festival MED",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "festival-med",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Almancil",
      "source_type": "importer_city_mapping",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Praça da República, Loulé, Portugal",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.street",
      "value": "Praça da República",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Loulé",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/en/info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/en/content/festival-med",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.138173",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.022273",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "festivalmed@cm-loule.pt",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://festivalmed.cm-loule.pt/",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/festivalmedloule/",
      "source_type": "official_website_social_link",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/festivalmedloule/",
      "source_type": "official_website_social_link",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Festival MED is a world music and culture festival in Loulé’s historic centre from 25 to 28 June 2026.",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "World music and cultural programming in Loulé’s historic centre from 25 to 28 June 2026.",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "world music festival; cultural events; gastronomy; visual arts; street entertainment; handicrafts; dance; cinema; poetry; conferences",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Festival MED | World Music Festival in Loulé, Algarve",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Festival MED takes place in Loulé’s historic centre from 25 to 28 June 2026, with world music, gastronomy, arts and cultural programming.",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "festival-med",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "world music and culture festival",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-06-25",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/en/content/festival-med",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-06-28",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/en/content/festival-med",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Loulé historic centre",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/en/content/festival-med",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://centrohistoricoloule.bol.pt/",
      "source_type": "official_website_booking_link",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Câmara Municipal de Loulé",
      "source_type": "official_website",
      "source_url": "https://festivalmed.cm-loule.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.price_from",
      "value": "10",
      "source_type": "official_booking_link",
      "source_url": "https://cineteatrolouletano.bol.pt/Comprar/Bilhetes/173550-festival_med_2026_bilhete_festival-centro_historico/Sessoes",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "phone",
    "postal_code",
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
    "official_linkedin_profile",
    "official_youtube_profile",
    "official_tiktok_profile",
    "official_x_twitter_profile"
  ]
}
$event$::jsonb;
begin
  select id into v_city_id
  from public.cities
  where slug = 'almancil'
     or lower(name) = 'almancil'
  order by case when slug = 'almancil' then 0 else 1 end
  limit 1;

  if v_city_id is null then
    raise exception 'Missing Almancil city';
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
    'Festival MED',
    'festival-med',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'festival',
    '2026-06-25',
    '2026-06-28',
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
    array['events', 'almancil', 'loule', 'festival-med', 'world-music', 'culture-festival'],
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
