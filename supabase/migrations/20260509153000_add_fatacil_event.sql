begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.cities (name, slug, is_active, is_featured)
values ('Lagoa', 'lagoa', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_city_id uuid;
  v_event_data jsonb := $event$
{
  "Nome": "FATACIL",
  "URL_slug": "fatacil",
  "City": "Lagoa",
  "city_slug": "lagoa",
  "Region": "Algarve",
  "region_slug": "algarve",
  "Country": "Portugal",
  "category": "events",
  "tier": "unverified",
  "status": "published",
  "owner_id": "280be9b4-c0fe-48f3-b371-f490d8cccfd5",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official FATACIL and Município de Lagoa sources confirm FATACIL 2026 from 21 to 30 August 2026 at Parque Municipal de Feiras e Exposições de Lagoa. Diário da República confirms public opening hours and ticket prices. Official FATACIL website footer confirms Facebook and Instagram. LinkedIn, YouTube, TikTok and X/Twitter were checked but no official FATACIL profile was verified.",
  "vertical": "event",
  "event_type": "crafts, tourism, agriculture, commerce, industry and concerts fair",
  "event_status": null,
  "event_date": "2026-08-21",
  "event_end_date": "2026-08-30",
  "start_date": "2026-08-21",
  "end_date": "2026-08-30",
  "start_time": "18:00",
  "end_time": "01:00",
  "venue_name": "Parque Municipal de Feiras e Exposições de Lagoa",
  "ticket_url": "https://fatacil.bol.pt/",
  "booking_url": null,
  "organizer_name": "Município de Lagoa",
  "price_from": 5,
  "currency": "EUR",
  "market_type": "trade_fair",
  "product_categories": [
    "crafts",
    "tourism",
    "agriculture",
    "commerce",
    "industry",
    "restaurants"
  ],
  "frequency": "annual",
  "outdoor_indoor": "mixed",
  "address": {
    "full_address": "Parque Municipal de Feiras, 8401-851 Lagoa, Portugal",
    "street": "Parque Municipal de Feiras",
    "postal_code": "8401-851",
    "city": "Lagoa",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "location": {
    "address": "Parque Municipal de Feiras, 8401-851 Lagoa, Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": "+351 282 380 465",
    "email": "fatacil@cm-lagoa.pt",
    "website": "https://www.fatacil.pt/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/fataciloficial/",
    "facebook": "https://www.facebook.com/Fatacil",
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
    "short_description": "FATACIL is a crafts, tourism, agriculture, commerce, industry and concert fair in Lagoa from 21 to 30 August 2026.",
    "full_description": "FATACIL takes place from 21 to 30 August 2026 at Parque Municipal de Feiras e Exposições de Lagoa. Official municipal sources identify it as the Feira de Artesanato, Turismo, Agricultura, Comércio e Indústria de Lagoa.\n\nThe 2026 programme includes daily concerts and exhibitor areas covering agriculture, commerce, industry, handicrafts, institutional participation, restaurants and similar sectors.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": "18:00-01:00",
    "price_level": null,
    "services": [
      "craft fair",
      "tourism fair",
      "agriculture fair",
      "commerce fair",
      "industry fair",
      "concerts",
      "exhibitor stands",
      "restaurants and similar sectors"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "FATACIL | Fair and Concerts in Lagoa, Algarve",
    "meta_description": "FATACIL takes place at Parque Municipal de Feiras e Exposições de Lagoa from 21 to 30 August 2026, with crafts, tourism, agriculture, commerce, industry and concerts.",
    "slug": "fatacil"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "crafts, tourism, agriculture, commerce, industry and concerts fair",
    "event_status": null,
    "start_date": "2026-08-21",
    "end_date": "2026-08-30",
    "venue_name": "Parque Municipal de Feiras e Exposições de Lagoa",
    "ticket_url": "https://fatacil.bol.pt/",
    "booking_url": null,
    "organizer_name": "Município de Lagoa",
    "price_from": 5,
    "currency": "EUR",
    "official_sources": [
      "https://www.fatacil.pt/",
      "https://www.fatacil.pt/pages/5",
      "https://www.fatacil.pt/pages/797",
      "https://www.fatacil.pt/pages/744",
      "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "https://diariodarepublica.pt/dr/detalhe/edital/250-2026-1065985452",
      "https://www.facebook.com/Fatacil",
      "https://www.instagram.com/fataciloficial/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "crafts, tourism, agriculture, commerce, industry and concerts fair",
    "event_status": null,
    "start_date": "2026-08-21",
    "end_date": "2026-08-30",
    "venue_name": "Parque Municipal de Feiras e Exposições de Lagoa",
    "ticket_url": "https://fatacil.bol.pt/",
    "booking_url": null,
    "organizer_name": "Município de Lagoa",
    "price_from": 5,
    "currency": "EUR",
    "official_sources": [
      "https://www.fatacil.pt/",
      "https://www.fatacil.pt/pages/5",
      "https://www.fatacil.pt/pages/797",
      "https://www.fatacil.pt/pages/744",
      "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "https://diariodarepublica.pt/dr/detalhe/edital/250-2026-1065985452",
      "https://www.facebook.com/Fatacil",
      "https://www.instagram.com/fataciloficial/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "FATACIL",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "fatacil",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Lagoa",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Parque Municipal de Feiras, 8401-851 Lagoa, Portugal",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.street",
      "value": "Parque Municipal de Feiras",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.postal_code",
      "value": "8401-851",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Lagoa",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+351 282 380 465",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "fatacil@cm-lagoa.pt",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/pages/797",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://www.fatacil.pt/",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/fataciloficial/",
      "source_type": "official_website_social_link",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/Fatacil",
      "source_type": "official_website_social_link",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "FATACIL is a crafts, tourism, agriculture, commerce, industry and concert fair in Lagoa from 21 to 30 August 2026.",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official dates, venue, fair sectors, daily concert programme and exhibitor scope.",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.opening_hours",
      "value": "18:00-01:00",
      "source_type": "official_government_publication",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/edital/250-2026-1065985452",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "craft fair; tourism fair; agriculture fair; commerce fair; industry fair; concerts; exhibitor stands; restaurants and similar sectors",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "FATACIL | Fair and Concerts in Lagoa, Algarve",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "FATACIL takes place at Parque Municipal de Feiras e Exposições de Lagoa from 21 to 30 August 2026, with crafts, tourism, agriculture, commerce, industry and concerts.",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "fatacil",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "crafts, tourism, agriculture, commerce, industry and concerts fair",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-08-21",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-08-30",
      "source_type": "official_website",
      "source_url": "https://www.fatacil.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Parque Municipal de Feiras e Exposições de Lagoa",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://fatacil.bol.pt/",
      "source_type": "official_website_booking_link",
      "source_url": "https://www.fatacil.pt/pages/744",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Município de Lagoa",
      "source_type": "official_municipal_website",
      "source_url": "https://www.cm-lagoa.pt/noticia/estao-abertas-as-candidaturas-para-expositores-da-45-edicao-da-fatacil",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.price_from",
      "value": "5",
      "source_type": "official_government_publication",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/edital/250-2026-1065985452",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
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
  where slug = 'lagoa'
     or lower(name) = 'lagoa'
  order by case when slug = 'lagoa' then 0 else 1 end
  limit 1;

  if v_city_id is null then
    raise exception 'Missing Lagoa city';
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
    'FATACIL',
    'fatacil',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'market',
    '2026-08-21',
    '2026-08-30',
    '18:00',
    '01:00',
    v_event_data #>> '{address,full_address}',
    v_event_data #>> '{category_data,venue_name}',
    v_city_id,
    v_event_data #>> '{category_data,ticket_url}',
    'From €5',
    false,
    false,
    null,
    array[]::uuid[],
    array['events', 'lagoa', 'fatacil', 'fair', 'crafts', 'tourism', 'agriculture', 'concerts'],
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
