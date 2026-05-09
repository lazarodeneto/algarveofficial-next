begin;

alter table public.events add column if not exists listing_id uuid references public.listings(id) on delete set null;
alter table public.events add column if not exists event_data jsonb default '{}'::jsonb;

insert into public.cities (name, slug, is_active, is_featured)
values ('Vilamoura', 'vilamoura', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_city_id uuid;
  v_event_data jsonb := $event$
{
  "Nome": "Portugal Invitational",
  "URL_slug": "portugal-invitational",
  "City": "Vilamoura",
  "city_slug": "vilamoura",
  "Region": "Algarve",
  "region_slug": "algarve",
  "Country": "Portugal",
  "category": "events",
  "tier": "unverified",
  "status": "published",
  "owner_id": "280be9b4-c0fe-48f3-b371-f490d8cccfd5",
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Official Portugal Invitational sources confirm the competition dates as 31 July to 2 August 2026 at The Els Club Vilamoura. PGA TOUR’s official tournament page confirms Portugal Invitational at The Els Club Vilamoura, Algarve, from Jul 31 to Aug 2, 2026. Official ticketing page also lists the wider ticket/event window from 27 July to 2 August, but tournament access is listed for Friday to Sunday, 31 July to 2 August. Official social media search found Instagram and LinkedIn profiles clearly matching the event and official website; Facebook, YouTube, TikTok and X/Twitter were not verified.",
  "vertical": "event",
  "event_type": "international golf tournament",
  "event_status": null,
  "event_date": "2026-07-31",
  "event_end_date": "2026-08-02",
  "start_date": "2026-07-31",
  "end_date": "2026-08-02",
  "venue_name": "The Els Club Vilamoura",
  "ticket_url": "https://3cket.com/en/event/portugal-invitational",
  "booking_url": null,
  "organizer_name": "Portugal Invitational",
  "price_from": 20,
  "currency": "EUR",
  "tournament_level": "professional",
  "course_name": "The Els Club Vilamoura",
  "format": "stroke",
  "prize_pool": "$3 million purse",
  "spectator_tickets": true,
  "address": {
    "full_address": "Caminho da Fonte do Ulme, Vilamoura, 8125-507 Quarteira, Portugal",
    "street": "Caminho da Fonte do Ulme",
    "postal_code": "8125-507",
    "city": "Vilamoura",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.100206,
    "longitude": -8.136806
  },
  "location": {
    "address": "Caminho da Fonte do Ulme, Vilamoura, 8125-507 Quarteira, Portugal",
    "latitude": 37.100206,
    "longitude": -8.136806
  },
  "contact": {
    "phone": null,
    "email": "info@portugalinvitational.com",
    "website": "https://www.portugalinvitational.com/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/portugalinvitational/",
    "facebook": null,
    "linkedin": "https://www.linkedin.com/company/portugal-invitational",
    "youtube": null,
    "tiktok": null,
    "x_twitter": null
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "content": {
    "short_description": "Portugal Invitational is a PGA TOUR Champions golf tournament at The Els Club Vilamoura from 31 July to 2 August 2026.",
    "full_description": "Portugal Invitational takes place from 31 July to 2 August 2026 at The Els Club Vilamoura in the Algarve. Official tournament information lists the event as a PGA TOUR Champions competition with a 78-player field, individual stroke play format and a $3 million purse.\n\nThe venue is The Els Club Vilamoura, a private Algarve golf club redesigned from the former Victoria Course with an 18-hole championship course by Ernie Els.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "PGA TOUR Champions tournament",
      "international golf tournament",
      "individual stroke play",
      "ticketed event",
      "volunteer registration",
      "hospitality packages"
    ],
    "amenities": [
      "clubhouse",
      "261 Tap Room",
      "The Arches restaurant",
      "golf boutique",
      "concierge services"
    ]
  },
  "seo": {
    "meta_title": "Portugal Invitational | PGA TOUR Champions in Vilamoura, Algarve",
    "meta_description": "Portugal Invitational takes place at The Els Club Vilamoura from 31 July to 2 August 2026, bringing PGA TOUR Champions golf to the Algarve.",
    "slug": "portugal-invitational"
  },
  "category_data": {
    "vertical": "event",
    "event_type": "international golf tournament",
    "event_status": null,
    "start_date": "2026-07-31",
    "end_date": "2026-08-02",
    "venue_name": "The Els Club Vilamoura",
    "ticket_url": "https://3cket.com/en/event/portugal-invitational",
    "booking_url": null,
    "organizer_name": "Portugal Invitational",
    "price_from": 20,
    "currency": "EUR",
    "official_sources": [
      "https://www.portugalinvitational.com/",
      "https://www.portugalinvitational.com/tournament-info/",
      "https://www.portugalinvitational.com/the-els-club/",
      "https://www.portugalinvitational.com/contacts/",
      "https://www.portugalinvitational.com/buy-tickets/",
      "https://3cket.com/en/event/portugal-invitational",
      "https://www.pgatour.com/pt/pgatour-champions/tournaments/2026/portugal-invitational/S2026060/overview",
      "https://www.elsclubvilamoura.com/",
      "https://visitalgarve.pt/en/visitgolf/1524/dom-pedro-victoria",
      "https://www.instagram.com/portugalinvitational/",
      "https://www.linkedin.com/company/portugal-invitational"
    ]
  },
  "event": {
    "vertical": "event",
    "event_type": "international golf tournament",
    "event_status": null,
    "start_date": "2026-07-31",
    "end_date": "2026-08-02",
    "venue_name": "The Els Club Vilamoura",
    "ticket_url": "https://3cket.com/en/event/portugal-invitational",
    "booking_url": null,
    "organizer_name": "Portugal Invitational",
    "price_from": 20,
    "currency": "EUR",
    "official_sources": [
      "https://www.portugalinvitational.com/",
      "https://www.portugalinvitational.com/tournament-info/",
      "https://www.portugalinvitational.com/the-els-club/",
      "https://www.portugalinvitational.com/contacts/",
      "https://www.portugalinvitational.com/buy-tickets/",
      "https://3cket.com/en/event/portugal-invitational",
      "https://www.pgatour.com/pt/pgatour-champions/tournaments/2026/portugal-invitational/S2026060/overview",
      "https://www.elsclubvilamoura.com/",
      "https://visitalgarve.pt/en/visitgolf/1524/dom-pedro-victoria",
      "https://www.instagram.com/portugalinvitational/",
      "https://www.linkedin.com/company/portugal-invitational"
    ]
  },
  "sources": [
    {
      "field": "Nome",
      "value": "Portugal Invitational",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "URL_slug",
      "value": "portugal-invitational",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "City",
      "value": "Vilamoura",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Region",
      "value": "Algarve",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "Country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category",
      "value": "events",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "algarve_status",
      "value": "VERIFIED_IN_ALGARVE",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.full_address",
      "value": "Caminho da Fonte do Ulme, Vilamoura, 8125-507 Quarteira, Portugal",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.street",
      "value": "Caminho da Fonte do Ulme",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.postal_code",
      "value": "8125-507",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.city",
      "value": "Vilamoura",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.region",
      "value": "Algarve",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.country",
      "value": "Portugal",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.latitude",
      "value": "37.100206",
      "source_type": "official_tourism_board",
      "source_url": "https://visitalgarve.pt/en/visitgolf/1524/dom-pedro-victoria",
      "checked_at": "2026-05-09"
    },
    {
      "field": "address.longitude",
      "value": "-8.136806",
      "source_type": "official_tourism_board",
      "source_url": "https://visitalgarve.pt/en/visitgolf/1524/dom-pedro-victoria",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.email",
      "value": "info@portugalinvitational.com",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "contact.website",
      "value": "https://www.portugalinvitational.com/",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.instagram",
      "value": "https://www.instagram.com/portugalinvitational/",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.instagram.com/portugalinvitational/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "socials.linkedin",
      "value": "https://www.linkedin.com/company/portugal-invitational",
      "source_type": "verified_branch_social_profile",
      "source_url": "https://www.linkedin.com/company/portugal-invitational",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.short_description",
      "value": "Portugal Invitational is a PGA TOUR Champions golf tournament at The Els Club Vilamoura from 31 July to 2 August 2026.",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "content.full_description",
      "value": "Official tournament dates, venue, PGA TOUR Champions association, field, format, purse and Els Club venue details.",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.services",
      "value": "PGA TOUR Champions tournament; international golf tournament; individual stroke play; ticketed event; volunteer registration; hospitality packages",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "business_details.amenities",
      "value": "clubhouse; 261 Tap Room; The Arches restaurant; golf boutique; concierge services",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/the-els-club/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_title",
      "value": "Portugal Invitational | PGA TOUR Champions in Vilamoura, Algarve",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.meta_description",
      "value": "Portugal Invitational takes place at The Els Club Vilamoura from 31 July to 2 August 2026, bringing PGA TOUR Champions golf to the Algarve.",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "seo.slug",
      "value": "portugal-invitational",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.vertical",
      "value": "event",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.event_type",
      "value": "international golf tournament",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.start_date",
      "value": "2026-07-31",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.end_date",
      "value": "2026-08-02",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.venue_name",
      "value": "The Els Club Vilamoura",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/tournament-info/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.ticket_url",
      "value": "https://3cket.com/en/event/portugal-invitational",
      "source_type": "official_website_booking_link",
      "source_url": "https://www.portugalinvitational.com/buy-tickets/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.organizer_name",
      "value": "Portugal Invitational",
      "source_type": "official_website",
      "source_url": "https://www.portugalinvitational.com/contacts/",
      "checked_at": "2026-05-09"
    },
    {
      "field": "category_data.price_from",
      "value": "20",
      "source_type": "official_booking_link",
      "source_url": "https://3cket.com/en/event/portugal-invitational",
      "checked_at": "2026-05-09"
    }
  ],
  "missing_or_unverified_fields": [
    "phone",
    "featured_image",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "opening_hours",
    "price_level",
    "event_status",
    "booking_url",
    "official_facebook_profile",
    "official_youtube_profile",
    "official_tiktok_profile",
    "official_x_twitter_profile"
  ]
}
$event$::jsonb;
begin
  select id into v_city_id
  from public.cities
  where slug = 'vilamoura'
     or lower(name) = 'vilamoura'
  order by case when slug = 'vilamoura' then 0 else 1 end
  limit 1;

  if v_city_id is null then
    raise exception 'Missing Vilamoura city';
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
    'Portugal Invitational',
    'portugal-invitational',
    v_event_data #>> '{content,full_description}',
    v_event_data #>> '{content,short_description}',
    null,
    'golf-tournament',
    '2026-07-31',
    '2026-08-02',
    null,
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
    array['events', 'vilamoura', 'golf', 'portugal-invitational', 'pga-tour-champions', 'the-els-club'],
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
