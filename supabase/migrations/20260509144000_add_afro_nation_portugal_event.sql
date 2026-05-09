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
  "Nome": "Afro Nation Portugal",
  "URL_slug": "afro-nation-portugal",
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
  "verification_notes": "Official Afro Nation sources confirm the festival dates as 3 to 5 July 2026 and the location as Praia da Rocha beach, Portimão, Algarve, Portugal. Official website footer links confirm Instagram, TikTok, Facebook, X/Twitter and YouTube. LinkedIn was checked and verified as the official Afro Nation company profile by matching brand identity, but it is not linked from the official website footer.",
  "vertical": "event",
  "event_type": "beach music festival",
  "event_status": null,
  "event_date": "2026-07-03",
  "event_end_date": "2026-07-05",
  "start_date": "2026-07-03",
  "end_date": "2026-07-05",
  "start_time": "16:00",
  "venue_name": "Praia da Rocha beach",
  "ticket_url": "https://www.afronation.com/book-tickets",
  "booking_url": null,
  "organizer_name": "Afro Nation",
  "price_from": null,
  "currency": "EUR",
  "performance_type": "festival",
  "venue_type": "beach",
  "vip_packages": true,
  "address": {
    "full_address": "Praia da Rocha beach, Portimão, Algarve, Portugal",
    "street": null,
    "postal_code": null,
    "city": "Portimão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.1174806,
    "longitude": -8.536238888888889
  },
  "location": {
    "address": "Praia da Rocha beach, Portimão, Algarve, Portugal",
    "latitude": 37.1174806,
    "longitude": -8.536238888888889
  },
  "contact": {
    "phone": null,
    "email": "hello@afronation.com",
    "website": "https://www.afronation.com/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/afronation/",
    "facebook": "https://www.facebook.com/afronationfestival",
    "linkedin": "https://www.linkedin.com/company/afronation",
    "youtube": "https://www.youtube.com/@AfroNation",
    "tiktok": "https://www.tiktok.com/@afronation_",
    "x_twitter": "https://twitter.com/AfroNation"
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "content": {
    "short_description": "Afro Nation Portugal is a three-day beach music festival at Praia da Rocha, Portimão, from 3 to 5 July 2026.",
    "full_description": "Afro Nation Portugal takes place from 3 to 5 July 2026 at Praia da Rocha beach in Portimão, Algarve. The official festival website describes it as a celebration of culture through music, food, art and more.\n\nThe official FAQ confirms the festival is held on the beach and lists 4pm as the daily start time. Official ticketing is available only through the Afro Nation website.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": "Festival starts at 16:00",
    "price_level": null,
    "services": [
      "beach music festival",
      "live music",
      "food",
      "art",
      "ticketed event",
      "VIP ticket options",
      "accessibility support"
    ],
    "amenities": [
      "water points",
      "medical and first aid staff",
      "accessible viewing platform"
    ]
  },
  "seo": {
    "meta_title": "Afro Nation Portugal | Beach Music Festival in Portimão, Algarve",
    "meta_description": "Afro Nation Portugal takes place at Praia da Rocha beach in Portimão from 3 to 5 July 2026, with music, food, art and culture.",
    "slug": "afro-nation-portugal"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "beach music festival",
    "event_status": null,
    "start_date": "2026-07-03",
    "end_date": "2026-07-05",
    "venue_name": "Praia da Rocha beach",
    "ticket_url": "https://www.afronation.com/book-tickets",
    "booking_url": null,
    "organizer_name": "Afro Nation",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.afronation.com/",
      "https://www.afronation.com/faqs",
      "https://www.afronation.com/book-tickets",
      "https://www.afronation.com/accessibility",
      "https://eventos.visitalgarve.pt/27710/afro-nation-2024",
      "https://www.linkedin.com/company/afronation"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "beach music festival",
    "event_status": null,
    "start_date": "2026-07-03",
    "end_date": "2026-07-05",
    "venue_name": "Praia da Rocha beach",
    "ticket_url": "https://www.afronation.com/book-tickets",
    "booking_url": null,
    "organizer_name": "Afro Nation",
    "price_from": null,
    "currency": "EUR",
    "official_sources": [
      "https://www.afronation.com/",
      "https://www.afronation.com/faqs",
      "https://www.afronation.com/book-tickets",
      "https://www.afronation.com/accessibility",
      "https://eventos.visitalgarve.pt/27710/afro-nation-2024",
      "https://www.linkedin.com/company/afronation"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Afro Nation Portugal",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "afro-nation-portugal",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Praia da Rocha beach, Portimão, Algarve, Portugal",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Portimão",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.1174806",
      "source_type": "official_tourism_board_reference",
      "source_url": "https://euroveloportugal.com/en/poi/praia-da-rocha-2",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.536238888888889",
      "source_type": "official_tourism_board_reference",
      "source_url": "https://euroveloportugal.com/en/poi/praia-da-rocha-2",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "hello@afronation.com",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://www.afronation.com/",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/afronation/",
      "source_type": "official_website_social_link",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.facebook",
      "value": "https://www.facebook.com/afronationfestival",
      "source_type": "official_website_social_link",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.linkedin",
      "value": "https://www.linkedin.com/company/afronation",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.linkedin.com/company/afronation",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.youtube",
      "value": "https://www.youtube.com/@AfroNation",
      "source_type": "official_website_social_link",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.tiktok",
      "value": "https://www.tiktok.com/@afronation_",
      "source_type": "official_website_social_link",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.x_twitter",
      "value": "https://twitter.com/AfroNation",
      "source_type": "official_website_social_link",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Afro Nation Portugal is a three-day beach music festival at Praia da Rocha, Portimão, from 3 to 5 July 2026.",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official festival dates, Praia da Rocha location, cultural programming and ticketing details.",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.opening_hours",
      "value": "Festival starts at 16:00",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "beach music festival; live music; food; art; ticketed event; VIP ticket options; accessibility support",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.amenities",
      "value": "water points; medical and first aid staff; accessible viewing platform",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Afro Nation Portugal | Beach Music Festival in Portimão, Algarve",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Afro Nation Portugal takes place at Praia da Rocha beach in Portimão from 3 to 5 July 2026, with music, food, art and culture.",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "afro-nation-portugal",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "beach music festival",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-07-03",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-07-05",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "Praia da Rocha beach",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://www.afronation.com/book-tickets",
      "source_type": "official_website_booking_link",
      "source_url": "https://www.afronation.com/faqs",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Afro Nation",
      "source_type": "official_website",
      "source_url": "https://www.afronation.com/",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "phone",
    "street",
    "postal_code",
    "featured_image",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "price_level",
    "event_status",
    "booking_url",
    "price_from_eur"
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
    'Afro Nation Portugal',
    'afro-nation-portugal',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'music',
    '2026-07-03',
    '2026-07-05',
    '16:00',
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
    array['events', 'portimao', 'praia-da-rocha', 'afro-nation', 'beach-music-festival'],
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
