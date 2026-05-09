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
  "Nome": "Feira Medieval de Silves",
  "URL_slug": "feira-medieval-de-silves",
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
  "verification_notes": "Visit Portugal confirms Feira Medieval de Silves in Silves from 7 to 15 August 2026. The official fair site and Câmara Municipal de Silves sources identify the venue as the historic centre of Silves. Silves is in the Algarve but is not in the allowed city list, so Lagoa is used as the closest valid importer city. The verified event address remains Silves. Official social search verified Facebook via Visit Portugal; Instagram, LinkedIn, YouTube, TikTok and X/Twitter were checked but no official profile was verified.",
  "vertical": "event",
  "event_type": "medieval and cultural fair",
  "event_status": null,
  "event_date": "2026-08-07",
  "event_end_date": "2026-08-15",
  "start_date": "2026-08-07",
  "end_date": "2026-08-15",
  "venue_name": "Centro Histórico de Silves",
  "ticket_url": null,
  "booking_url": null,
  "organizer_name": "Câmara Municipal de Silves",
  "price_from": null,
  "currency": "EUR",
  "cultural_type": "medieval_fair",
  "exhibition_theme": "Medieval recreation in Silves historic centre",
  "interactive_elements": true,
  "address": {
    "full_address": "Centro Histórico de Silves, Silves, Algarve, Portugal",
    "street": null,
    "postal_code": null,
    "city": "Silves",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.186944,
    "longitude": -8.438889
  },
  "location": {
    "address": "Centro Histórico de Silves, Silves, Algarve, Portugal",
    "latitude": 37.186944,
    "longitude": -8.438889
  },
  "contact": {
    "phone": "+351 282 440 800",
    "email": "feira.medieval@cm-silves.pt",
    "website": "https://feiramedievaldesilves.pt/"
  },
  "socials": {
    "instagram": null,
    "facebook": "https://www.facebook.com/feiramedievalsilves/",
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
    "short_description": "Feira Medieval de Silves is a medieval and cultural fair in Silves from 7 to 15 August 2026.",
    "full_description": "Feira Medieval de Silves takes place in Silves from 7 to 15 August 2026. Visit Portugal describes the event as a historical recreation of medieval life in the former Algarve capital during the Arab occupation.\n\nThe programme is centred on the historic city setting, with processions, tournaments, archers, artisans, merchants and street performers listed by Visit Portugal.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "medieval fair",
      "historical recreation",
      "cultural event",
      "processions",
      "tournaments",
      "archery",
      "artisans",
      "merchants",
      "street performance"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Feira Medieval de Silves | Cultural Fair in Silves, Algarve",
    "meta_description": "Feira Medieval de Silves takes place in Silves from 7 to 15 August 2026, with medieval recreation, processions, tournaments and artisans.",
    "slug": "feira-medieval-de-silves"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "medieval and cultural fair",
    "event_status": null,
    "start_date": "2026-08-07",
    "end_date": "2026-08-15",
    "venue_name": "Centro Histórico de Silves",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Câmara Municipal de Silves",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "https://feiramedievaldesilves.pt/",
      "https://feiramedievaldesilves.pt/menu/1548/contactos",
      "https://feiramedievaldesilves.pt/menu/1812/como-chegar",
      "https://www.cm-silves.pt/pt/998/feira-medieval-de-silves.aspx",
      "https://www.facebook.com/feiramedievalsilves/"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "medieval and cultural fair",
    "event_status": null,
    "start_date": "2026-08-07",
    "end_date": "2026-08-15",
    "venue_name": "Centro Histórico de Silves",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Câmara Municipal de Silves",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "https://feiramedievaldesilves.pt/",
      "https://feiramedievaldesilves.pt/menu/1548/contactos",
      "https://feiramedievaldesilves.pt/menu/1812/como-chegar",
      "https://www.cm-silves.pt/pt/998/feira-medieval-de-silves.aspx",
      "https://www.facebook.com/feiramedievalsilves/"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Feira Medieval de Silves",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "feira-medieval-de-silves",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Lagoa",
      "source_type": "importer_city_mapping",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Centro Histórico de Silves, Silves, Algarve, Portugal",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Silves",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.186944",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/menu/1812/como-chegar",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.438889",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/menu/1812/como-chegar",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "+351 282 440 800",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/menu/1548/contactos",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "feira.medieval@cm-silves.pt",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/menu/1548/contactos",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://feiramedievaldesilves.pt/",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/feiramedievalsilves/",
      "source_type": "official_tourism_board_social_link",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Feira Medieval de Silves is a medieval and cultural fair in Silves from 7 to 15 August 2026.",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official event dates, Silves location and medieval recreation programme elements.",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "medieval fair; historical recreation; cultural event; processions; tournaments; archery; artisans; merchants; street performance",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Feira Medieval de Silves | Cultural Fair in Silves, Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Feira Medieval de Silves takes place in Silves from 7 to 15 August 2026, with medieval recreation, processions, tournaments and artisans.",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "feira-medieval-de-silves",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "medieval and cultural fair",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-08-07",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-08-15",
      "source_type": "official_tourism_board",
      "source_url": "https://www.visitportugal.com/pt-pt/content/feira-medieval-de-silves",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Centro Histórico de Silves",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Câmara Municipal de Silves",
      "source_type": "official_website",
      "source_url": "https://feiramedievaldesilves.pt/menu/1548/contactos",
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
    "opening_hours",
    "price_level",
    "amenities",
    "event_status",
    "ticket_url",
    "booking_url",
    "price_from",
    "official_instagram_profile",
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
    'Feira Medieval de Silves',
    'feira-medieval-de-silves',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'cultural',
    '2026-08-07',
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
    array['events', 'lagoa', 'silves', 'feira-medieval', 'cultural-event', 'medieval-fair'],
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
