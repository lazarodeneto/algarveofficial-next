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
  "Nome": "Festival F",
  "URL_slug": "festival-f",
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
  "verification_notes": "Official Festival F sources confirm the 2026 edition from 3 to 5 September in Faro and describe it as the 11th edition and the “Último Grande Festival de Verão”. Faro is in the Algarve but is not in the allowed importer city list, so Olhão is used as the closest valid importer city. The verified event location remains Faro’s historic Vila Adentro area. Official social search verified Instagram and Facebook profiles for Festival F; LinkedIn, YouTube, TikTok and X/Twitter were checked but no official Festival F profile was verified.",
  "vertical": "event",
  "event_type": "music and culture festival",
  "event_status": null,
  "event_date": "2026-09-03",
  "event_end_date": "2026-09-05",
  "start_date": "2026-09-03",
  "end_date": "2026-09-05",
  "venue_name": "Vila Adentro, Faro",
  "ticket_url": null,
  "booking_url": null,
  "organizer_name": "Município de Faro, Sons em Trânsito, Teatro das Figuras and AmbiFaro",
  "price_from": null,
  "currency": "EUR",
  "music_genre": [
    "portuguese"
  ],
  "performance_type": "festival",
  "venue_type": "historic_center",
  "address": {
    "full_address": "Vila Adentro, centro histórico de Faro, Faro, Algarve, Portugal",
    "street": null,
    "postal_code": null,
    "city": "Faro",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "location": {
    "address": "Vila Adentro, centro histórico de Faro, Faro, Algarve, Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": "+351 289 870 039",
    "email": "geral@cm-faro.pt",
    "website": "https://www.festivalf.pt/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/festivalf/",
    "facebook": "https://www.facebook.com/FestivalF/",
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
    "short_description": "Festival F is a three-day Portuguese music and culture festival in Faro from 3 to 5 September 2026.",
    "full_description": "Festival F takes place in Faro from 3 to 5 September 2026, with official sources confirming the 11th edition and its identity as the “Último Grande Festival de Verão”.\n\nThe festival is held in the historic Vila Adentro area and is organised by Município de Faro, Sons em Trânsito, Teatro das Figuras and AmbiFaro, with music and cultural programming linked to Portuguese culture.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "music festival",
      "Portuguese music",
      "cultural programming",
      "summer festival",
      "ticketed event"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Festival F | Music Festival in Faro, Algarve",
    "meta_description": "Festival F takes place in Faro from 3 to 5 September 2026, celebrating Portuguese music and culture as the Último Grande Festival de Verão.",
    "slug": "festival-f"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "music and culture festival",
    "event_status": null,
    "start_date": "2026-09-03",
    "end_date": "2026-09-05",
    "venue_name": "Vila Adentro, Faro",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Município de Faro, Sons em Trânsito, Teatro das Figuras and AmbiFaro",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.festivalf.pt/",
      "https://www.festivalf.pt/pt/menu/1019/o-festival.aspx",
      "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "https://www.festivalf.pt/pt/menu/1932/informacoes-uteis.aspx",
      "https://eventos.visitalgarve.pt/16454/festival-f",
      "https://www.cm-faro.pt/8066/festival-f.aspx",
      "https://www.instagram.com/festivalf/",
      "https://www.facebook.com/FestivalF/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "music and culture festival",
    "event_status": null,
    "start_date": "2026-09-03",
    "end_date": "2026-09-05",
    "venue_name": "Vila Adentro, Faro",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Município de Faro, Sons em Trânsito, Teatro das Figuras and AmbiFaro",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.festivalf.pt/",
      "https://www.festivalf.pt/pt/menu/1019/o-festival.aspx",
      "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "https://www.festivalf.pt/pt/menu/1932/informacoes-uteis.aspx",
      "https://eventos.visitalgarve.pt/16454/festival-f",
      "https://www.cm-faro.pt/8066/festival-f.aspx",
      "https://www.instagram.com/festivalf/",
      "https://www.facebook.com/FestivalF/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Festival F",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "festival-f",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Olhão",
      "source_type": "importer_city_mapping",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Vila Adentro, centro histórico de Faro, Faro, Algarve, Portugal",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1932/informacoes-uteis.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Faro",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1932/informacoes-uteis.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+351 289 870 039",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "geral@cm-faro.pt",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16454/festival-f",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://www.festivalf.pt/",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/festivalf/",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.instagram.com/festivalf/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/FestivalF/",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.facebook.com/FestivalF/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Festival F is a three-day Portuguese music and culture festival in Faro from 3 to 5 September 2026.",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official 2026 dates, Faro historic-centre location, festival identity, organisers and music/culture positioning.",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "music festival; Portuguese music; cultural programming; summer festival; ticketed event",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Festival F | Music Festival in Faro, Algarve",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Festival F takes place in Faro from 3 to 5 September 2026, celebrating Portuguese music and culture as the Último Grande Festival de Verão.",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "festival-f",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "music and culture festival",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-09-03",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-09-05",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1118/sobre-o-festival-f.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Vila Adentro, Faro",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1932/informacoes-uteis.aspx",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Município de Faro, Sons em Trânsito, Teatro das Figuras and AmbiFaro",
      "source_type": "official_website",
      "source_url": "https://www.festivalf.pt/pt/menu/1019/o-festival.aspx",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "street",
    "postal_code",
    "address.latitude",
    "address.longitude",
    "featured_image",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "opening_hours_2026",
    "price_level",
    "amenities",
    "event_status",
    "ticket_url_2026",
    "booking_url",
    "price_from_2026",
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
    'Festival F',
    'festival-f',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'music',
    '2026-09-03',
    '2026-09-05',
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
    array['events', 'olhao', 'faro', 'festival-f', 'music', 'culture', 'portuguese-music', 'vila-adentro'],
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
