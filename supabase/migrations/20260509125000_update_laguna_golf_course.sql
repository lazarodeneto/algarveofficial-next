begin;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Golf', 'golf', true, false, 30)
on conflict (slug) do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Vilamoura', 'vilamoura', true, false)
on conflict (slug) do nothing;

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_old_slug text;
  v_city_id uuid;
  v_region_id uuid;
  v_category_id uuid;
  v_course_id uuid;
  v_scorecard jsonb := $scorecard$
[
  {"hole": 1, "par": 5, "hcp": 16, "tee_1": 480, "tee_2": 460, "tee_3": 443, "tee_4": 403, "tee_5": 315, "tee_6": 250},
  {"hole": 2, "par": 3, "hcp": 12, "tee_1": 133, "tee_2": 121, "tee_3": 115, "tee_4": 103, "tee_5": 103, "tee_6": 70},
  {"hole": 3, "par": 4, "hcp": 4, "tee_1": 357, "tee_2": 342, "tee_3": 336, "tee_4": 323, "tee_5": 220, "tee_6": 165},
  {"hole": 4, "par": 3, "hcp": 6, "tee_1": 196, "tee_2": 150, "tee_3": 140, "tee_4": 135, "tee_5": 130, "tee_6": 85},
  {"hole": 5, "par": 4, "hcp": 8, "tee_1": 315, "tee_2": 298, "tee_3": 289, "tee_4": 220, "tee_5": 218, "tee_6": 170},
  {"hole": 6, "par": 4, "hcp": 18, "tee_1": 300, "tee_2": 280, "tee_3": 273, "tee_4": 221, "tee_5": 200, "tee_6": 160},
  {"hole": 7, "par": 4, "hcp": 10, "tee_1": 321, "tee_2": 303, "tee_3": 293, "tee_4": 235, "tee_5": 230, "tee_6": 170},
  {"hole": 8, "par": 5, "hcp": 14, "tee_1": 474, "tee_2": 456, "tee_3": 446, "tee_4": 374, "tee_5": 315, "tee_6": 260},
  {"hole": 9, "par": 4, "hcp": 2, "tee_1": 378, "tee_2": 364, "tee_3": 358, "tee_4": 320, "tee_5": 218, "tee_6": 165},
  {"hole": 10, "par": 5, "hcp": 17, "tee_1": 484, "tee_2": 464, "tee_3": 454, "tee_4": 419, "tee_5": 320, "tee_6": 260},
  {"hole": 11, "par": 4, "hcp": 7, "tee_1": 372, "tee_2": 356, "tee_3": 346, "tee_4": 304, "tee_5": 215, "tee_6": 170},
  {"hole": 12, "par": 3, "hcp": 5, "tee_1": 181, "tee_2": 148, "tee_3": 138, "tee_4": 124, "tee_5": 122, "tee_6": 65},
  {"hole": 13, "par": 4, "hcp": 1, "tee_1": 405, "tee_2": 398, "tee_3": 379, "tee_4": 320, "tee_5": 235, "tee_6": 180},
  {"hole": 14, "par": 4, "hcp": 3, "tee_1": 334, "tee_2": 318, "tee_3": 308, "tee_4": 272, "tee_5": 210, "tee_6": 155},
  {"hole": 15, "par": 5, "hcp": 13, "tee_1": 507, "tee_2": 491, "tee_3": 481, "tee_4": 443, "tee_5": 316, "tee_6": 205},
  {"hole": 16, "par": 4, "hcp": 15, "tee_1": 354, "tee_2": 334, "tee_3": 324, "tee_4": 282, "tee_5": 225, "tee_6": 171},
  {"hole": 17, "par": 3, "hcp": 11, "tee_1": 153, "tee_2": 140, "tee_3": 130, "tee_4": 107, "tee_5": 97, "tee_6": 65},
  {"hole": 18, "par": 4, "hcp": 9, "tee_1": 377, "tee_2": 360, "tee_3": 352, "tee_4": 295, "tee_5": 218, "tee_6": 175}
]
$scorecard$::jsonb;
  v_category_data jsonb := $category$
{
  "vertical": "golf",
  "country": "Portugal",
  "golf": {
    "course_type": "links-style",
    "holes": 18,
    "par": 72,
    "length_meters": 6121,
    "course_rating": 71.8,
    "slope": 135,
    "designer": "Joseph Lee",
    "year_opened": 1990,
    "last_renovation": null,
    "layout_type": "links-style",
    "difficulty": "medium",
    "is_tournament_course": null,
    "is_signature": null
  },
  "facilities": {
    "driving_range": true,
    "short_game_area": true,
    "putting_green": true,
    "academy": null,
    "clubhouse": true,
    "restaurant": true,
    "pro_shop": true,
    "buggy": true,
    "caddie": null,
    "locker_room": null
  },
  "access": {
    "type": null,
    "allows_visitors": null,
    "membership_required": null
  },
  "positioning": {
    "tier": "unverified",
    "target": "golfers",
    "price_range": null
  },
  "media": {
    "featured_image": null,
    "image_source_url": null
  },
  "seo": {
    "meta_title": "Laguna Golf Course | Golf Course in Vilamoura, Algarve",
    "meta_description": "Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve, designed by Joseph Lee.",
    "slug": "laguna-golf-course-vilamoura"
  },
  "address": {
    "full_address": "Caminho da Fonte do Ulme, 8125-406 Vilamoura, Algarve, Portugal",
    "street": "Caminho da Fonte do Ulme",
    "postal_code": "8125-406",
    "city": "Vilamoura",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.101389,
    "longitude": -8.116389
  },
  "contact": {
    "phone": "+351 289 310 180",
    "email": "booking@vilamouragolf.com",
    "website": "https://www.vilamouragolf.com/en/golf-courses/laguna/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/vilamouragolf/",
    "facebook": "https://www.facebook.com/vilamouragolfcourses",
    "linkedin": "https://www.linkedin.com/company/vilamoura-golf/",
    "youtube": null,
    "tiktok": null,
    "x_twitter": null
  },
  "content": {
    "short_description": "Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve.",
    "full_description": "Laguna Golf Course is located on Caminho da Fonte do Ulme in Vilamoura, Algarve. Official and tourism sources identify it as an 18-hole, par-72 course designed by Joseph Lee and opened in 1990.\n\nOfficial course information describes open, links-style fairways, strategic water features and a shared Laguna and Millennium clubhouse. Tourism sources also note flat terrain, water hazards, 79 bunkers, a clubhouse, pro shop, restaurant, bar, putting green and driving range with bunker and chipping area.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": null,
    "price_level": null,
    "services": [
      "golf course",
      "tee time booking",
      "club rental",
      "buggy rental"
    ],
    "amenities": [
      "clubhouse",
      "pro shop",
      "restaurant",
      "bar",
      "buggy bar",
      "putting green",
      "driving range",
      "bunker practice area",
      "chipping area"
    ]
  },
  "holes": 18,
  "holes_count": 18,
  "par": 72,
  "length_meters": 6121,
  "course_rating": 71.8,
  "slope": 135,
  "slope_rating": 135,
  "designer": "Joseph Lee",
  "architect": "Joseph Lee",
  "booking_url": "https://dompedro.golfmanager.com/consumer/ebookings/3",
  "scorecard_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y",
  "scorecard_pdf_url": null,
  "map_image_url": null,
  "course_map_url": null,
  "opening_hours": null,
  "services": [
    "golf course",
    "tee time booking",
    "club rental",
    "buggy rental"
  ],
  "amenities": [
    "clubhouse",
    "pro shop",
    "restaurant",
    "bar",
    "buggy bar",
    "putting green",
    "driving range",
    "bunker practice area",
    "chipping area"
  ],
  "official_sources": [
    "https://www.vilamouragolf.com/en/golf-courses/laguna/",
    "https://www.vilamouragolf.com/en/",
    "https://www.visitportugal.com/en/content/laguna-golf-course",
    "https://visit-loule.pt/en/40008/dom-pedro-laguna-golf-course",
    "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y",
    "https://dompedro.golfmanager.com/consumer/ebookings/3"
  ],
  "facilities_list": [
    "clubhouse",
    "pro shop",
    "restaurant",
    "bar",
    "buggy bar",
    "putting green",
    "driving range",
    "bunker practice area",
    "chipping area"
  ],
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official Vilamoura Golf Laguna page, official Vilamoura Golf footer contact details, Visit Portugal, Visit Loulé and official Datagolf scorecard data. The course is listed in Vilamoura, Algarve, with the course address confirmed by Visit Portugal and Visit Loulé as Caminho da Fonte do Ulme, 8125-406, Vilamoura. Official social links found on the Vilamoura Golf website are parent-brand Vilamoura Golf Facebook, Instagram and LinkedIn profiles. No official YouTube, TikTok or X/Twitter profile for Laguna Golf Course was safely confirmed.",
  "sources": [
    {"field": "Nome", "value": "Laguna", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Vilamoura", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Caminho da Fonte do Ulme, 8125-406 Vilamoura, Algarve, Portugal", "source_type": "official_tourism_website", "source_url": "https://www.visitportugal.com/en/content/laguna-golf-course", "checked_at": "2026-05-09"},
    {"field": "address.latitude", "value": "37.101389", "source_type": "golf_course_reference", "source_url": "https://www.portugalgolf.net/en/golf-courses/laguna-vilamoura-golf-course/117/", "checked_at": "2026-05-09"},
    {"field": "address.longitude", "value": "-8.116389", "source_type": "golf_course_reference", "source_url": "https://www.portugalgolf.net/en/golf-courses/laguna-vilamoura-golf-course/117/", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 289 310 180", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "booking@vilamouragolf.com", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/vilamouragolf/", "source_type": "official_website_social_link", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/vilamouragolfcourses", "source_type": "official_website_social_link", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://www.linkedin.com/company/vilamoura-golf/", "source_type": "official_website_social_link", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "business_details.services", "value": "golf course; tee time booking; club rental; buggy rental", "source_type": "official_website_and_tourism_sources", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "business_details.amenities", "value": "clubhouse; pro shop; restaurant; bar; buggy bar; putting green; driving range; bunker practice area; chipping area", "source_type": "golf_course_reference", "source_url": "https://www.portugalgolf.net/en/golf-courses/laguna-vilamoura-golf-course/117/", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_tourism_website", "source_url": "https://www.visitportugal.com/en/content/laguna-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "72", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "6121", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "71.8", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "135", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "Joseph Lee", "source_type": "official_tourism_website", "source_url": "https://www.visitportugal.com/en/content/laguna-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "1990", "source_type": "official_tourism_website", "source_url": "https://www.visitportugal.com/en/content/laguna-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.facilities", "value": "clubhouse; pro shop; restaurant; bar; buggy bar; putting green; driving range; bunker practice area; chipping area", "source_type": "golf_course_reference", "source_url": "https://www.portugalgolf.net/en/golf-courses/laguna-vilamoura-golf-course/117/", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://dompedro.golfmanager.com/consumer/ebookings/3", "source_type": "official_booking_link", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=043-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve.", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official Vilamoura Golf course facts, Visit Portugal, Visit Loulé and scorecard data.", "source_type": "official_website", "source_url": "https://www.vilamouragolf.com/en/golf-courses/laguna/", "checked_at": "2026-05-09"}
  ],
  "missing_or_unverified_fields": [
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "opening_hours",
    "price_level",
    "featured_image",
    "official_youtube_profile",
    "official_tiktok_profile",
    "official_x_twitter_profile",
    "academy",
    "caddie",
    "locker_room",
    "access_type",
    "allows_visitors",
    "membership_required",
    "is_tournament_course",
    "is_signature",
    "official tee colour names for the six Datagolf scorecard distance columns"
  ]
}
$category$::jsonb;
begin
  select id into v_category_id
  from public.categories
  where slug = 'golf'
  limit 1;

  select id into v_city_id
  from public.cities
  where slug = 'vilamoura'
     or lower(name) = lower('Vilamoura')
  order by case when slug = 'vilamoura' then 0 else 1 end
  limit 1;

  select id into v_region_id
  from public.regions
  where slug = 'algarve'
     or lower(name) = 'algarve'
  order by case when slug = 'algarve' then 0 else 1 end
  limit 1;

  v_category_data := jsonb_set(v_category_data, '{scorecard}', v_scorecard, true);
  v_category_data := jsonb_set(
    v_category_data,
    '{scorecard_holes}',
    (
      select coalesce(jsonb_agg(jsonb_build_object(
        'hole_number', hole,
        'par', par,
        'stroke_index', hcp,
        'tee_1', tee_1,
        'tee_2', tee_2,
        'tee_3', tee_3,
        'tee_4', tee_4,
        'tee_5', tee_5,
        'tee_6', tee_6
      ) order by hole), '[]'::jsonb)
      from jsonb_to_recordset(v_scorecard) as rows(
        hole int,
        par int,
        hcp int,
        tee_1 int,
        tee_2 int,
        tee_3 int,
        tee_4 int,
        tee_5 int,
        tee_6 int
      )
    ),
    true
  );

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug in ('laguna-golf-course-vilamoura', 'laguna-golf-course', 'vilamoura-laguna', 'dom-pedro-laguna')
     or lower(name) in (lower('Laguna Golf Course'), lower('Laguna'), lower('Vilamoura Laguna Course'), lower('Dom Pedro Laguna'))
  order by case slug
    when 'laguna-golf-course-vilamoura' then 0
    when 'laguna-golf-course' then 1
    when 'vilamoura-laguna' then 2
    when 'dom-pedro-laguna' then 3
    else 4
  end, updated_at desc
  limit 1;

  if v_listing_id is null then
    insert into public.listings (
      name,
      slug,
      description,
      short_description,
      owner_id,
      category_id,
      city_id,
      region_id,
      tier,
      status,
      is_curated,
      website_url,
      contact_phone,
      contact_email,
      address,
      latitude,
      longitude,
      instagram_url,
      facebook_url,
      linkedin_url,
      twitter_url,
      youtube_url,
      tiktok_url,
      google_business_url,
      google_rating,
      google_review_count,
      category_data,
      tags,
      meta_title,
      meta_description,
      published_at
    ) values (
      'Laguna Golf Course',
      'laguna-golf-course-vilamoura',
      'Laguna Golf Course is located on Caminho da Fonte do Ulme in Vilamoura, Algarve. Official and tourism sources identify it as an 18-hole, par-72 course designed by Joseph Lee and opened in 1990.' || E'\n\n' ||
        'Official course information describes open, links-style fairways, strategic water features and a shared Laguna and Millennium clubhouse. Tourism sources also note flat terrain, water hazards, 79 bunkers, a clubhouse, pro shop, restaurant, bar, putting green and driving range with bunker and chipping area.',
      'Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.vilamouragolf.com/en/golf-courses/laguna/',
      '+351 289 310 180',
      'booking@vilamouragolf.com',
      'Caminho da Fonte do Ulme, 8125-406 Vilamoura, Algarve, Portugal',
      37.101389,
      -8.116389,
      'https://www.instagram.com/vilamouragolf/',
      'https://www.facebook.com/vilamouragolfcourses',
      'https://www.linkedin.com/company/vilamoura-golf/',
      null,
      null,
      null,
      null,
      null,
      null,
      v_category_data,
      array['golf', 'vilamoura', 'laguna', 'joseph-lee', 'vilamoura-golf'],
      'Laguna Golf Course | Golf Course in Vilamoura, Algarve',
      'Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve, designed by Joseph Lee.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Laguna Golf Course',
      slug = 'laguna-golf-course-vilamoura',
      description = 'Laguna Golf Course is located on Caminho da Fonte do Ulme in Vilamoura, Algarve. Official and tourism sources identify it as an 18-hole, par-72 course designed by Joseph Lee and opened in 1990.' || E'\n\n' ||
        'Official course information describes open, links-style fairways, strategic water features and a shared Laguna and Millennium clubhouse. Tourism sources also note flat terrain, water hazards, 79 bunkers, a clubhouse, pro shop, restaurant, bar, putting green and driving range with bunker and chipping area.',
      short_description = 'Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.vilamouragolf.com/en/golf-courses/laguna/',
      contact_phone = '+351 289 310 180',
      contact_email = 'booking@vilamouragolf.com',
      address = 'Caminho da Fonte do Ulme, 8125-406 Vilamoura, Algarve, Portugal',
      latitude = 37.101389,
      longitude = -8.116389,
      instagram_url = 'https://www.instagram.com/vilamouragolf/',
      facebook_url = 'https://www.facebook.com/vilamouragolfcourses',
      linkedin_url = 'https://www.linkedin.com/company/vilamoura-golf/',
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      category_data = v_category_data,
      tags = array['golf', 'vilamoura', 'laguna', 'joseph-lee', 'vilamoura-golf'],
      meta_title = 'Laguna Golf Course | Golf Course in Vilamoura, Algarve',
      meta_description = 'Laguna Golf Course is an 18-hole, par-72 golf course in Vilamoura, Algarve, designed by Joseph Lee.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id;

    insert into public.listing_slugs (listing_id, slug, is_current)
    select distinct v_listing_id, alias_slug, false
    from (
      values
        (v_old_slug),
        ('laguna-golf-course'),
        ('vilamoura-laguna'),
        ('dom-pedro-laguna')
    ) as aliases(alias_slug)
    where alias_slug is not null
      and alias_slug <> 'laguna-golf-course-vilamoura'
    on conflict (slug) do update
    set is_current = false
    where public.listing_slugs.listing_id = excluded.listing_id;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'laguna-golf-course-vilamoura', true)
    on conflict (slug) do update
    set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;
  end if;

  select id into v_course_id
  from public.golf_courses
  where listing_id = v_listing_id
    and is_default = true
  order by created_at, id
  limit 1;

  if v_course_id is null then
    insert into public.golf_courses (
      listing_id,
      name,
      holes_count,
      is_default,
      holes,
      par,
      slope,
      course_rating,
      length_meters,
      designer,
      year_opened,
      last_renovation,
      layout_type,
      difficulty,
      is_tournament_course,
      is_signature
    ) values (
      v_listing_id,
      'Laguna Golf Course',
      18,
      true,
      18,
      72,
      to_jsonb(135),
      to_jsonb(71.8),
      to_jsonb(6121),
      'Joseph Lee',
      1990,
      null,
      'links-style',
      'medium',
      false,
      false
    )
    returning id into v_course_id;
  else
    update public.golf_courses
    set
      name = 'Laguna Golf Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 72,
      slope = to_jsonb(135),
      course_rating = to_jsonb(71.8),
      length_meters = to_jsonb(6121),
      designer = 'Joseph Lee',
      year_opened = 1990,
      last_renovation = null,
      layout_type = 'links-style',
      difficulty = 'medium',
      is_tournament_course = false,
      is_signature = false,
      updated_at = now()
    where id = v_course_id;
  end if;

  update public.golf_courses
  set is_default = false,
      updated_at = now()
  where listing_id = v_listing_id
    and id <> v_course_id
    and is_default = true;

  delete from public.golf_holes
  where listing_id = v_listing_id;

  insert into public.golf_holes (
    listing_id,
    course_id,
    hole_number,
    par,
    stroke_index,
    distance_white,
    distance_yellow,
    distance_red
  )
  select
    v_listing_id,
    v_course_id,
    hole,
    par,
    hcp,
    null,
    null,
    null
  from jsonb_to_recordset(v_scorecard) as rows(
    hole int,
    par int,
    hcp int
  )
  order by hole;
end;
$$;

commit;
