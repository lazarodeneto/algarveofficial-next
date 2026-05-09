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
  "Nome": "Festival Mar Me Quer",
  "URL_slug": "festival-mar-me-quer",
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
  "verification_notes": "Official Festival Mar Me Quer website confirms the 2026 edition at Zona Ribeirinha de Portimão on 12, 13 and 14 August. Official contact page confirms organization email addresses. Ticketing sources confirm the venue, dates, 18:00 session times, promoter and first-lot prices. Official website footer/social section and matching official profiles verify Instagram and Facebook; LinkedIn, YouTube, TikTok and X/Twitter were checked but no official profile was verified.",
  "vertical": "event",
  "event_type": "summer music festival",
  "event_status": null,
  "event_date": "2026-08-12",
  "event_end_date": "2026-08-14",
  "start_date": "2026-08-12",
  "end_date": "2026-08-14",
  "start_time": "18:00",
  "venue_name": "Zona Ribeirinha de Portimão",
  "ticket_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
  "booking_url": null,
  "organizer_name": "Domingo no Mundo, Soc. Entretenimento, Lda.",
  "price_from": 20,
  "currency": "EUR",
  "performance_type": "festival",
  "venue_type": "waterfront",
  "artists": [
    "Maiara & Maraisa",
    "Veigh",
    "Orochi"
  ],
  "address": {
    "full_address": "Zona Ribeirinha de Portimão, Portimão, Algarve, Portugal",
    "street": null,
    "postal_code": null,
    "city": "Portimão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "location": {
    "address": "Zona Ribeirinha de Portimão, Portimão, Algarve, Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": null,
    "email": "geral@domingonomundo.pt",
    "website": "https://marmequer.pt/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/festival.marmequer/",
    "facebook": "https://www.facebook.com/marmequer.pt/",
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
    "short_description": "Festival Mar Me Quer is a summer music festival at Zona Ribeirinha de Portimão from 12 to 14 August 2026.",
    "full_description": "Festival Mar Me Quer returns to Zona Ribeirinha de Portimão on 12, 13 and 14 August 2026 for its fifth summer festival edition.\n\nOfficial and ticketing sources describe a music-focused festival with announced artists including Maiara & Maraisa, Veigh and Orochi, alongside themes of music, sustainability, inclusion and local heritage.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": "Sessions listed at 18:00",
    "price_level": null,
    "services": [
      "summer music festival",
      "live music",
      "ticketed event",
      "sign language interpretation",
      "cultural event"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Festival Mar Me Quer | Summer Music Festival in Portimão, Algarve",
    "meta_description": "Festival Mar Me Quer takes place at Zona Ribeirinha de Portimão from 12 to 14 August 2026, with live music and summer festival programming.",
    "slug": "festival-mar-me-quer"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "summer music festival",
    "event_status": null,
    "start_date": "2026-08-12",
    "end_date": "2026-08-14",
    "venue_name": "Zona Ribeirinha de Portimão",
    "ticket_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
    "booking_url": null,
    "organizer_name": "Domingo no Mundo, Soc. Entretenimento, Lda.",
    "price_from": 20,
    "currency": "EUR",
    "official_sources": [
      "https://marmequer.pt/",
      "https://marmequer.pt/contactos/",
      "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "https://www.wook.pt/en/bilheteira/eventos/mar-me-quer-portimao-2026/33446768",
      "https://www.instagram.com/festival.marmequer/",
      "https://www.facebook.com/marmequer.pt/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "summer music festival",
    "event_status": null,
    "start_date": "2026-08-12",
    "end_date": "2026-08-14",
    "venue_name": "Zona Ribeirinha de Portimão",
    "ticket_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
    "booking_url": null,
    "organizer_name": "Domingo no Mundo, Soc. Entretenimento, Lda.",
    "price_from": 20,
    "currency": "EUR",
    "official_sources": [
      "https://marmequer.pt/",
      "https://marmequer.pt/contactos/",
      "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "https://www.wook.pt/en/bilheteira/eventos/mar-me-quer-portimao-2026/33446768",
      "https://www.instagram.com/festival.marmequer/",
      "https://www.facebook.com/marmequer.pt/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Festival Mar Me Quer",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "festival-mar-me-quer",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_ticketing_page",
      "source_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Zona Ribeirinha de Portimão, Portimão, Algarve, Portugal",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_ticketing_page",
      "source_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "geral@domingonomundo.pt",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/contactos/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://marmequer.pt/",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/festival.marmequer/",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.instagram.com/festival.marmequer/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/marmequer.pt/",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.facebook.com/marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Festival Mar Me Quer is a summer music festival at Zona Ribeirinha de Portimão from 12 to 14 August 2026.",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official dates, Portimão waterfront venue, music festival positioning, announced artists and programme themes.",
      "source_type": "official_ticketing_page",
      "source_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.opening_hours",
      "value": "Sessions listed at 18:00",
      "source_type": "official_ticketing_page",
      "source_url": "https://www.wook.pt/en/bilheteira/eventos/mar-me-quer-portimao-2026/33446768",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "summer music festival; live music; ticketed event; sign language interpretation; cultural event",
      "source_type": "official_ticketing_page",
      "source_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Festival Mar Me Quer | Summer Music Festival in Portimão, Algarve",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Festival Mar Me Quer takes place at Zona Ribeirinha de Portimão from 12 to 14 August 2026, with live music and summer festival programming.",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "festival-mar-me-quer",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "summer music festival",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-08-12",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-08-14",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Zona Ribeirinha de Portimão",
      "source_type": "official_website",
      "source_url": "https://marmequer.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "source_type": "official_ticketing_page",
      "source_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Domingo no Mundo, Soc. Entretenimento, Lda.",
      "source_type": "official_ticketing_page",
      "source_url": "https://palkotickets.pt/2865604918-mar-me-quer-portimao-2026/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.price_from",
      "value": "20",
      "source_type": "official_ticketing_page",
      "source_url": "https://www.wook.pt/en/bilheteira/eventos/mar-me-quer-portimao-2026/33446768",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "phone",
    "street",
    "postal_code",
    "address.latitude",
    "address.longitude",
    "featured_image",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
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
    'Festival Mar Me Quer',
    'festival-mar-me-quer',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'music',
    '2026-08-12',
    '2026-08-14',
    '18:00',
    null,
    v_event_data #>> '{address,full_address}',
    v_event_data #>> '{category_data,venue_name}',
    v_city_id,
    v_event_data #>> '{category_data,ticket_url}',
    'From €20',
    false,
    false,
    null,
    array[]::uuid[],
    array['events', 'portimao', 'festival-mar-me-quer', 'music', 'summer-festival', 'zona-ribeirinha'],
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
