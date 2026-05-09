begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.cities (name, slug, is_active, is_featured)
values ('Olhão', 'olhao', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_city_id uuid;
  v_event_data jsonb := $event$
{
  "Nome": "Festival do Marisco",
  "URL_slug": "festival-do-marisco",
  "City": "Olhão",
  "city_slug": "olhao",
  "Region": "Algarve",
  "region_slug": "algarve",
  "Country": "Portugal",
  "category": "events",
  "tier": "unverified",
  "status": "published",
  "owner_id": "280be9b4-c0fe-48f3-b371-f490d8cccfd5",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official Município de Olhão and Visit Algarve sources confirm Festival do Marisco 2026 in Olhão from 10 to 15 August 2026. Fesnima identifies Jardim Pescador Olhanense as the annual venue for the event. Official social search verified Facebook and Instagram for the festival; LinkedIn, YouTube, TikTok and X/Twitter were checked but no official current festival profile was verified.",
  "vertical": "event",
  "event_type": "seafood, gastronomy and concert festival",
  "event_status": null,
  "event_date": "2026-08-10",
  "event_end_date": "2026-08-15",
  "start_date": "2026-08-10",
  "end_date": "2026-08-15",
  "venue_name": "Jardim Pescador Olhanense",
  "ticket_url": null,
  "booking_url": null,
  "organizer_name": "Empresa Municipal Fesnima and Município de Olhão",
  "price_from": null,
  "currency": "EUR",
  "gastro_type": "seafood_festival",
  "cuisine_focus": [
    "seafood",
    "portuguese"
  ],
  "tasting_included": true,
  "address": {
    "full_address": "Jardim Pescador Olhanense, Avenida 5 de Outubro, 8700-307 Olhão, Algarve, Portugal",
    "street": "Avenida 5 de Outubro",
    "postal_code": "8700-307",
    "city": "Olhão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.0235,
    "longitude": -7.8437
  },
  "location": {
    "address": "Jardim Pescador Olhanense, Avenida 5 de Outubro, 8700-307 Olhão, Algarve, Portugal",
    "latitude": 37.0235,
    "longitude": -7.8437
  },
  "contact": {
    "phone": "+351 289 090 287",
    "email": "geral@fesnima.pt",
    "website": "https://festivaldomarisco.com/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/festival.marisco.olhao/",
    "facebook": "https://www.facebook.com/festivaldomariscodeolhao/",
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
    "short_description": "Festival do Marisco is a seafood, gastronomy and concert event in Olhão from 10 to 15 August 2026.",
    "full_description": "Festival do Marisco takes place in Olhão from 10 to 15 August 2026. Official tourism and municipal sources identify the event as organised by Fesnima and the Municipality of Olhão.\n\nThe festival is held at Jardim Pescador Olhanense, with seafood, gastronomy and live concerts forming the core programme.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "seafood festival",
      "gastronomy event",
      "live concerts",
      "cultural event"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Festival do Marisco | Seafood Festival in Olhão, Algarve",
    "meta_description": "Festival do Marisco takes place at Jardim Pescador Olhanense in Olhão from 10 to 15 August 2026, with seafood, gastronomy and concerts.",
    "slug": "festival-do-marisco"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "seafood, gastronomy and concert festival",
    "event_status": null,
    "start_date": "2026-08-10",
    "end_date": "2026-08-15",
    "venue_name": "Jardim Pescador Olhanense",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Empresa Municipal Fesnima and Município de Olhão",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://cm-olhao.pt/38789/municipio-de-olhao-apresenta-cartaz-do-festival-do-marisco-2026-na-btl",
      "https://cm-olhao.pt/38794/municipio-de-olhao-em-destaque-na-btl-2026",
      "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "https://fesnima.cm-olhao.pt/menu/1227/eventos",
      "https://cm-olhao.pt/2697/jardim-pescador-olhanense",
      "https://festivaldomarisco.com/",
      "https://www.facebook.com/festivaldomariscodeolhao/",
      "https://www.instagram.com/festival.marisco.olhao/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "seafood, gastronomy and concert festival",
    "event_status": null,
    "start_date": "2026-08-10",
    "end_date": "2026-08-15",
    "venue_name": "Jardim Pescador Olhanense",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Empresa Municipal Fesnima and Município de Olhão",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://cm-olhao.pt/38789/municipio-de-olhao-apresenta-cartaz-do-festival-do-marisco-2026-na-btl",
      "https://cm-olhao.pt/38794/municipio-de-olhao-em-destaque-na-btl-2026",
      "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "https://fesnima.cm-olhao.pt/menu/1227/eventos",
      "https://cm-olhao.pt/2697/jardim-pescador-olhanense",
      "https://festivaldomarisco.com/",
      "https://www.facebook.com/festivaldomariscodeolhao/",
      "https://www.instagram.com/festival.marisco.olhao/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Festival do Marisco",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "festival-do-marisco",
      "source_type": "official_website",
      "source_url": "https://festivaldomarisco.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Olhão",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Jardim Pescador Olhanense, Avenida 5 de Outubro, 8700-307 Olhão, Algarve, Portugal",
      "source_type": "official_municipal_website",
      "source_url": "https://cm-olhao.pt/2697/jardim-pescador-olhanense",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.street",
      "value": "Avenida 5 de Outubro",
      "source_type": "official_municipal_website",
      "source_url": "https://cm-olhao.pt/2697/jardim-pescador-olhanense",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.postal_code",
      "value": "8700-307",
      "source_type": "official_accessibility_reference",
      "source_url": "https://www.tur4all.com/resources/jardim-pescador-olhanense",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Olhão",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.0235",
      "source_type": "map_reference",
      "source_url": "https://mapcarta.com/pt/35981924",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-7.8437",
      "source_type": "map_reference",
      "source_url": "https://mapcarta.com/pt/35981924",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+351 289 090 287",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "geral@fesnima.pt",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://festivaldomarisco.com/",
      "source_type": "official_website",
      "source_url": "https://festivaldomarisco.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/festival.marisco.olhao/",
      "source_type": "official_website_social_link",
      "source_url": "https://festivaldomarisco.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/festivaldomariscodeolhao/",
      "source_type": "official_website_social_link",
      "source_url": "https://festivaldomarisco.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Festival do Marisco is a seafood, gastronomy and concert event in Olhão from 10 to 15 August 2026.",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official event dates, Olhão location, venue, gastronomy and concert programme.",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "seafood festival; gastronomy event; live concerts; cultural event",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Festival do Marisco | Seafood Festival in Olhão, Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Festival do Marisco takes place at Jardim Pescador Olhanense in Olhão from 10 to 15 August 2026, with seafood, gastronomy and concerts.",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "festival-do-marisco",
      "source_type": "official_website",
      "source_url": "https://festivaldomarisco.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "seafood, gastronomy and concert festival",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-08-10",
      "source_type": "official_municipal_website",
      "source_url": "https://cm-olhao.pt/38789/municipio-de-olhao-apresenta-cartaz-do-festival-do-marisco-2026-na-btl",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-08-15",
      "source_type": "official_municipal_website",
      "source_url": "https://cm-olhao.pt/38789/municipio-de-olhao-apresenta-cartaz-do-festival-do-marisco-2026-na-btl",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Jardim Pescador Olhanense",
      "source_type": "official_municipal_website",
      "source_url": "https://fesnima.cm-olhao.pt/menu/1227/eventos",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Empresa Municipal Fesnima and Município de Olhão",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16408/festival-do-marisco-2026",
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
  where slug = 'olhao'
     or lower(name) in ('olhão', 'olhao')
  order by case when slug = 'olhao' then 0 else 1 end
  limit 1;

  if v_city_id is null then
    raise exception 'Missing Olhão city';
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
    'Festival do Marisco',
    'festival-do-marisco',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'gastronomy',
    '2026-08-10',
    '2026-08-15',
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
    array['events', 'olhao', 'festival-do-marisco', 'seafood', 'gastronomy', 'concerts'],
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
