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
  "Nome": "Festival da Sardinha",
  "URL_slug": "festival-da-sardinha",
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
  "verification_confidence": "medium",
  "verification_notes": "Official Festival da Sardinha website confirms the 2025 edition took place from 5 to 10 August 2025 in Portimão’s riverside area and states there is an appointment set for 2026, but no official 2026 exact dates were found. The user-provided August 2026 timing is therefore treated as unverified and category_data.start_date/end_date are null. Official festival site confirms Facebook and Instagram links for the Portimão municipal parent profiles; LinkedIn, YouTube, TikTok and X/Twitter were checked but no official festival profile was verified.",
  "vertical": "event",
  "event_type": "food festival, music and gastronomy",
  "event_status": "2026 return confirmed; exact dates pending",
  "event_date": null,
  "event_end_date": null,
  "start_date": null,
  "end_date": null,
  "date_status": "2026 return confirmed; exact dates pending",
  "date_placeholder": {
    "start_date": "2026-08-01",
    "end_date": "2026-08-01",
    "reason": "Sortable public listing placeholder only; official 2026 exact dates are pending."
  },
  "venue_name": "Zona Ribeirinha de Portimão",
  "ticket_url": null,
  "booking_url": null,
  "organizer_name": "Câmara Municipal de Portimão",
  "price_from": null,
  "currency": "EUR",
  "gastro_type": "sardine_festival",
  "cuisine_focus": [
    "portuguese",
    "seafood"
  ],
  "address": {
    "full_address": "Zona Ribeirinha de Portimão, junto ao Clube Naval de Portimão, Portimão, Algarve, Portugal",
    "street": null,
    "postal_code": null,
    "city": "Portimão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "location": {
    "address": "Zona Ribeirinha de Portimão, junto ao Clube Naval de Portimão, Portimão, Algarve, Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": "282 248 500",
    "email": "portimao.arena@cm-portimao.pt",
    "website": "https://festivaldasardinha.pt/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/portimaooficial/",
    "facebook": "https://www.facebook.com/portimaomunicipio",
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
    "short_description": "Festival da Sardinha is Portimão’s riverside sardine, music and gastronomy festival, confirmed as returning in 2026.",
    "full_description": "Festival da Sardinha is held in Portimão’s riverside area, with the official festival site confirming a 2026 return while exact 2026 dates remain unverified.\n\nOfficial festival information describes grilled sardines, music, entertainment, exhibitors, regional sweets and agro-food products, and reports 127,619 entries at the 2025 edition.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "sardine festival",
      "gastronomy festival",
      "music",
      "entertainment",
      "exhibitors",
      "regional sweets",
      "regional agro-food products",
      "family activities"
    ],
    "amenities": []
  },
  "seo": {
    "meta_title": "Festival da Sardinha | Food Festival in Portimão, Algarve",
    "meta_description": "Festival da Sardinha is Portimão’s riverside sardine, music and gastronomy festival, confirmed as returning in 2026 with exact dates pending.",
    "slug": "festival-da-sardinha"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "food festival, music and gastronomy",
    "event_status": "2026 return confirmed; exact dates pending",
    "start_date": null,
    "end_date": null,
    "venue_name": "Zona Ribeirinha de Portimão",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Câmara Municipal de Portimão",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://festivaldasardinha.pt/",
      "https://festivaldasardinha.pt/sobre-o-festival/",
      "https://festivaldasardinha.pt/imprensa/",
      "https://www.vivaportimao.pt/a-nao-perder/evento?idEvento=2194",
      "https://eventos.visitalgarve.pt/16409/festival-da-sardinha"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "food festival, music and gastronomy",
    "event_status": "2026 return confirmed; exact dates pending",
    "start_date": null,
    "end_date": null,
    "venue_name": "Zona Ribeirinha de Portimão",
    "ticket_url": null,
    "booking_url": null,
    "organizer_name": "Câmara Municipal de Portimão",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://festivaldasardinha.pt/",
      "https://festivaldasardinha.pt/sobre-o-festival/",
      "https://festivaldasardinha.pt/imprensa/",
      "https://www.vivaportimao.pt/a-nao-perder/evento?idEvento=2194",
      "https://eventos.visitalgarve.pt/16409/festival-da-sardinha"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Festival da Sardinha",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "festival-da-sardinha",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16409/festival-da-sardinha",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16409/festival-da-sardinha",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16409/festival-da-sardinha",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Zona Ribeirinha de Portimão, junto ao Clube Naval de Portimão, Portimão, Algarve, Portugal",
      "source_type": "official_municipal_tourism_website",
      "source_url": "https://www.vivaportimao.pt/a-nao-perder/evento?idEvento=2194",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16409/festival-da-sardinha",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_tourism_board",
      "source_url": "https://eventos.visitalgarve.pt/16409/festival-da-sardinha",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.phone",
      "value": "282 248 500",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/imprensa/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "portimao.arena@cm-portimao.pt",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/imprensa/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://festivaldasardinha.pt/",
      "source_type": "official_municipal_tourism_website",
      "source_url": "https://www.vivaportimao.pt/a-nao-perder/evento?idEvento=2194",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/portimaooficial/",
      "source_type": "official_website_social_link",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/portimaomunicipio",
      "source_type": "official_website_social_link",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Festival da Sardinha is Portimão’s riverside sardine, music and gastronomy festival, confirmed as returning in 2026.",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official festival return confirmation, riverside location, sardines, music, entertainment, exhibitors, regional products and 2025 attendance.",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "sardine festival; gastronomy festival; music; entertainment; exhibitors; regional sweets; regional agro-food products; family activities",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Festival da Sardinha | Food Festival in Portimão, Algarve",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Festival da Sardinha is Portimão’s riverside sardine, music and gastronomy festival, confirmed as returning in 2026 with exact dates pending.",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "festival-da-sardinha",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "food festival, music and gastronomy",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/sobre-o-festival/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_status",
      "value": "2026 return confirmed; exact dates pending",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Zona Ribeirinha de Portimão",
      "source_type": "official_municipal_tourism_website",
      "source_url": "https://www.vivaportimao.pt/a-nao-perder/evento?idEvento=2194",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Câmara Municipal de Portimão",
      "source_type": "official_website",
      "source_url": "https://festivaldasardinha.pt/imprensa/",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "official_2026_exact_dates",
    "start_date",
    "end_date",
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
    "ticket_url",
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
    'Festival da Sardinha',
    'festival-da-sardinha',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'gastronomy',
    '2026-08-01',
    '2026-08-01',
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
    array['events', 'portimao', 'festival-da-sardinha', 'sardines', 'gastronomy', 'music', 'zona-ribeirinha'],
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
