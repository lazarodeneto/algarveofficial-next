begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.cities (name, slug, is_active, is_featured)
values ('Carvoeiro', 'carvoeiro', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_city_id uuid;
  v_event_data jsonb := $event$
{
  "Nome": "Carvoeiro Noite Black & White",
  "URL_slug": "carvoeiro-noite-black-white",
  "City": "Carvoeiro",
  "city_slug": "carvoeiro",
  "Region": "Algarve",
  "region_slug": "algarve",
  "Country": "Portugal",
  "category": "events",
  "tier": "unverified",
  "status": "published",
  "owner_id": "280be9b4-c0fe-48f3-b371-f490d8cccfd5",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official Município de Lagoa event information confirms Carvoeiro Noite Black & White as a June event held at Praia do Carvoeiro, organised by Município de Lagoa with Ibérica Eventos & Espetáculos. Official event social profiles confirm the 2026 date as 20 June 2026. Carvoeiro is an allowed Algarve city. Official social search verified Facebook and Instagram; LinkedIn, YouTube, TikTok and X/Twitter were checked but no official event profile was verified.",
  "vertical": "event",
  "event_type": "street party, music and summer opening event",
  "event_status": null,
  "event_date": "2026-06-20",
  "event_end_date": "2026-06-20",
  "start_date": "2026-06-20",
  "end_date": "2026-06-20",
  "venue_name": "Praia do Carvoeiro",
  "ticket_url": null,
  "booking_url": null,
  "organizer_name": "Município de Lagoa",
  "price_from": null,
  "currency": "EUR",
  "performance_type": "street_party",
  "venue_type": "beach",
  "seating_type": "standing",
  "address": {
    "full_address": "Praia do Carvoeiro, Carvoeiro, Lagoa, Algarve, Portugal",
    "street": null,
    "postal_code": null,
    "city": "Carvoeiro",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.096196,
    "longitude": -8.472004
  },
  "location": {
    "address": "Praia do Carvoeiro, Carvoeiro, Lagoa, Algarve, Portugal",
    "latitude": 37.096196,
    "longitude": -8.472004
  },
  "contact": {
    "phone": "+351 282 380 400",
    "email": "geral@cm-lagoa.pt",
    "website": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white"
  },
  "socials": {
    "instagram": "https://www.instagram.com/carvoeiroblackwhite/",
    "facebook": "https://www.facebook.com/carvoeiroblackwhite/",
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
    "short_description": "Carvoeiro Noite Black & White is a summer-opening street party at Praia do Carvoeiro on 20 June 2026.",
    "full_description": "Carvoeiro Noite Black & White takes place at Praia do Carvoeiro in Lagoa, Algarve, with the 2026 edition confirmed by official event social profiles for 20 June 2026.\n\nOfficial Município de Lagoa information describes the event as a June celebration with music, street entertainment, performances and multiple entertainment areas across the town centre and Praia do Carvoeiro.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "street party",
      "music",
      "street entertainment",
      "summer opening event",
      "performances",
      "free shuttle buses"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Carvoeiro Noite Black & White | Summer Street Party in Carvoeiro, Algarve",
    "meta_description": "Carvoeiro Noite Black & White takes place at Praia do Carvoeiro on 20 June 2026, with music, street entertainment and summer-opening celebrations.",
    "slug": "carvoeiro-noite-black-white"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "street party, music and summer opening event",
    "event_status": null,
    "start_date": "2026-06-20",
    "end_date": "2026-06-20",
    "venue_name": "Praia do Carvoeiro",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Município de Lagoa",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "https://www.facebook.com/carvoeiroblackwhite/",
      "https://www.instagram.com/carvoeiroblackwhite/",
      "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "street party, music and summer opening event",
    "event_status": null,
    "start_date": "2026-06-20",
    "end_date": "2026-06-20",
    "venue_name": "Praia do Carvoeiro",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Município de Lagoa",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "https://www.facebook.com/carvoeiroblackwhite/",
      "https://www.instagram.com/carvoeiroblackwhite/",
      "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Carvoeiro Noite Black & White",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "carvoeiro-noite-black-white",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Carvoeiro",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Praia do Carvoeiro, Carvoeiro, Lagoa, Algarve, Portugal",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Carvoeiro",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.096196",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.472004",
      "source_type": "official_beach_quality_program",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+351 282 380 400",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "geral@cm-lagoa.pt",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/carvoeiroblackwhite/",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.instagram.com/carvoeiroblackwhite/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/carvoeiroblackwhite/",
      "source_type": "official_municipal_website_social_link",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Carvoeiro Noite Black & White is a summer-opening street party at Praia do Carvoeiro on 20 June 2026.",
      "source_type": "official_event_social_profile",
      "source_url": "https://www.facebook.com/carvoeiroblackwhite/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official event date, Praia do Carvoeiro location, music, street entertainment, performances and summer-opening positioning.",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "street party; music; street entertainment; summer opening event; performances; free shuttle buses",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Carvoeiro Noite Black & White | Summer Street Party in Carvoeiro, Algarve",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Carvoeiro Noite Black & White takes place at Praia do Carvoeiro on 20 June 2026, with music, street entertainment and summer-opening celebrations.",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "carvoeiro-noite-black-white",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "street party, music and summer opening event",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/viver/agenda-de-atividades/eventos-ancora",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-06-20",
      "source_type": "official_event_social_profile",
      "source_url": "https://www.facebook.com/carvoeiroblackwhite/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-06-20",
      "source_type": "official_event_social_profile",
      "source_url": "https://www.facebook.com/carvoeiroblackwhite/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Praia do Carvoeiro",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Município de Lagoa",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/evento/carvoeiro-noite-black-white",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "street",
    "postal_code",
    "featured_image",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "opening_hours_2026",
    "price_level",
    "amenities",
    "event_status",
    "ticket_url",
    "booking_url",
    "price_from",
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
  where slug = 'carvoeiro'
     or lower(name) = 'carvoeiro'
  order by case when slug = 'carvoeiro' then 0 else 1 end
  limit 1;

  if v_city_id is null then
    raise exception 'Missing Carvoeiro city';
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
    'Carvoeiro Noite Black & White',
    'carvoeiro-noite-black-white',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'music',
    '2026-06-20',
    '2026-06-20',
    null,
    null,
    v_event_data #>> '{address,full_address}',
    v_event_data #>> '{category_data,venue_name}',
    v_city_id,
    null,
    null,
    false,
    false,
    null,
    array[]::uuid[],
    array['events', 'carvoeiro', 'carvoeiro-noite-black-white', 'street-party', 'music', 'summer-opening', 'praia-do-carvoeiro'],
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
