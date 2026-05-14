begin;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Golf', 'golf', true, false, 30)
on conflict (slug) do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Alvor', 'alvor', true, false)
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
  {"hole": 1, "par": 3, "hcp": 17, "white": 149, "yellow": 134, "red": 124},
  {"hole": 2, "par": 4, "hcp": 11, "white": 337, "yellow": 326, "red": 221},
  {"hole": 3, "par": 4, "hcp": 1, "white": 400, "yellow": 386, "red": 322},
  {"hole": 4, "par": 4, "hcp": 7, "white": 336, "yellow": 309, "red": 295},
  {"hole": 5, "par": 5, "hcp": 15, "white": 413, "yellow": 391, "red": 336},
  {"hole": 6, "par": 4, "hcp": 5, "white": 359, "yellow": 347, "red": 329},
  {"hole": 7, "par": 3, "hcp": 9, "white": 180, "yellow": 174, "red": 164},
  {"hole": 8, "par": 4, "hcp": 13, "white": 292, "yellow": 282, "red": 272},
  {"hole": 9, "par": 4, "hcp": 3, "white": 353, "yellow": 340, "red": 326},
  {"hole": 10, "par": 4, "hcp": 4, "white": 345, "yellow": 324, "red": 315},
  {"hole": 11, "par": 3, "hcp": 18, "white": 111, "yellow": 105, "red": 95},
  {"hole": 12, "par": 4, "hcp": 2, "white": 366, "yellow": 353, "red": 340},
  {"hole": 13, "par": 4, "hcp": 16, "white": 235, "yellow": 221, "red": 212},
  {"hole": 14, "par": 4, "hcp": 8, "white": 337, "yellow": 324, "red": 310},
  {"hole": 15, "par": 3, "hcp": 14, "white": 146, "yellow": 133, "red": 114},
  {"hole": 16, "par": 5, "hcp": 10, "white": 420, "yellow": 416, "red": 384},
  {"hole": 17, "par": 3, "hcp": 12, "white": 147, "yellow": 125, "red": 104},
  {"hole": 18, "par": 5, "hcp": 6, "white": 506, "yellow": 488, "red": 408}
]
$scorecard$::jsonb;
  v_category_data jsonb := $category$
{
  "vertical": "golf",
  "country": "Portugal",
  "golf": {
    "course_type": null,
    "holes": 18,
    "par": 70,
    "length_meters": 5432,
    "course_rating": 70.3,
    "slope": 133,
    "designer": "Sir Henry Cotton",
    "year_opened": 1991,
    "last_renovation": null,
    "layout_type": null,
    "difficulty": null,
    "is_tournament_course": null,
    "is_signature": null
  },
  "facilities": {
    "driving_range": null,
    "short_game_area": null,
    "putting_green": null,
    "academy": true,
    "clubhouse": null,
    "restaurant": null,
    "pro_shop": null,
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
    "meta_title": "Alto Golf Course | Golf Course in Alvor, Algarve",
    "meta_description": "Alto Golf Course is an 18-hole, par-70 golf course in Alvor, Algarve, designed by Sir Henry Cotton and operated by Pestana Golf Resorts.",
    "slug": "alto-golf-course"
  },
  "address": {
    "full_address": "Quinta Alto do Vale, Quatro Estradas, 8501-906 Alvor, Algarve, Portugal",
    "street": "Quinta Alto do Vale, Quatro Estradas",
    "postal_code": "8501-906",
    "city": "Alvor",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.126475,
    "longitude": -8.565586
  },
  "contact": {
    "phone": "+351 282 460 870",
    "email": "info@pestanagolf.com",
    "website": "https://pestanagolf.com/golf/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/pestanagolfresorts/",
    "facebook": "https://www.facebook.com/PestanaGolf",
    "linkedin": "https://www.linkedin.com/company/pestana-golf-resorts/",
    "youtube": "https://www.youtube.com/channel/UCwEURcNNoFpJ5UF7tsN4PWA",
    "tiktok": null,
    "x_twitter": "https://twitter.com/PestanaGolf"
  },
  "content": {
    "short_description": "Alto Golf Course is an 18-hole, par-70 course in Alvor designed by Sir Henry Cotton.",
    "full_description": "Alto Golf Course is located at Quinta Alto do Vale, Quatro Estradas, in Alvor, Algarve. The official Pestana Golf page lists it as an 18-hole, par-70 course with a 5,432 m distance, inaugurated in 1991 and designed by Sir Henry Cotton.\n\nOfficial and tourism sources identify the course as part of Pestana Golf Resorts, with club hire, buggies, trolleys, electric trolleys, individual lessons, group lessons and golf clinic services available.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": "Every day: 08:00 - 19:00",
    "price_level": null,
    "services": [
      "golf course",
      "club hire",
      "buggies",
      "trolleys",
      "electric trolleys",
      "individual lessons",
      "group lessons",
      "golf clinic",
      "tee time booking"
    ],
    "amenities": [
      "buggies",
      "trolleys",
      "electric trolleys"
    ]
  },
  "holes": 18,
  "holes_count": 18,
  "par": 70,
  "length_meters": 5432,
  "course_rating": 70.3,
  "slope": 133,
  "slope_rating": 133,
  "designer": "Sir Henry Cotton",
  "architect": "Sir Henry Cotton",
  "booking_url": "https://book.pestanagolf.com/golf",
  "scorecard_url": "https://pestanagolf.com/wp-content/uploads/2026/02/alto_compressed.pdf",
  "scorecard_pdf_url": "https://pestanagolf.com/wp-content/uploads/2026/02/alto_compressed.pdf",
  "map_image_url": null,
  "course_map_url": null,
  "opening_hours": "Every day: 08:00 - 19:00",
  "services": [
    "golf course",
    "club hire",
    "buggies",
    "trolleys",
    "electric trolleys",
    "individual lessons",
    "group lessons",
    "golf clinic",
    "tee time booking"
  ],
  "amenities": [
    "buggies",
    "trolleys",
    "electric trolleys"
  ],
  "official_sources": [
    "https://pestanagolf.com/golf/",
    "https://pestanagolf.com/contacts/",
    "https://pestanagolf.com/wp-content/uploads/2026/02/alto_compressed.pdf",
    "https://www.visitportugal.com/en/content/pestana-alto-golf",
    "https://visitportimao.com/en/what-to-do/sports-and-adventure/pestana-alto-golf/",
    "https://book.pestanagolf.com/golf"
  ],
  "facilities_list": [
    "club hire",
    "buggies",
    "trolleys",
    "electric trolleys",
    "individual lessons",
    "group lessons",
    "golf clinic"
  ],
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official Pestana Golf course page, official Pestana Golf contacts page, official Pestana Alto Golf scorecard PDF, Visit Portugal and official Pestana Golf social links. Official website footer links to Pestana Golf Facebook, LinkedIn, Twitter/X and YouTube profiles. Instagram was verified as the Pestana Golf Resorts brand profile. No official TikTok profile was safely confirmed.",
  "sources": [
    {"field": "Nome", "value": "Alto Golf", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Alvor", "source_type": "official_website", "source_url": "https://pestanagolf.com/contacts/", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Quinta Alto do Vale, Quatro Estradas, 8501-906 Alvor, Algarve, Portugal", "source_type": "official_website", "source_url": "https://pestanagolf.com/contacts/", "checked_at": "2026-05-09"},
    {"field": "address.latitude", "value": "37.126475", "source_type": "official_brochure_pdf", "source_url": "https://pestanagolf.com/wp-content/uploads/2023/03/Brochura-Golf_AF.pdf", "checked_at": "2026-05-09"},
    {"field": "address.longitude", "value": "-8.565586", "source_type": "official_brochure_pdf", "source_url": "https://pestanagolf.com/wp-content/uploads/2023/03/Brochura-Golf_AF.pdf", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 282 460 870", "source_type": "official_website", "source_url": "https://pestanagolf.com/contacts/", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "info@pestanagolf.com", "source_type": "official_scorecard_pdf", "source_url": "https://pestanagolf.com/wp-content/uploads/2026/02/alto_compressed.pdf", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://pestanagolf.com/golf/", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/pestanagolfresorts/", "source_type": "verified_branch_social_profile", "source_url": "https://www.instagram.com/pestanagolfresorts/", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/PestanaGolf", "source_type": "official_website_social_link", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://www.linkedin.com/company/pestana-golf-resorts/", "source_type": "official_website_social_link", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "socials.youtube", "value": "https://www.youtube.com/channel/UCwEURcNNoFpJ5UF7tsN4PWA", "source_type": "official_website_social_link", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "socials.x_twitter", "value": "https://twitter.com/PestanaGolf", "source_type": "official_website_social_link", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "business_details.opening_hours", "value": "Every day: 08:00 - 19:00", "source_type": "municipal_tourism_website", "source_url": "https://visitportimao.com/en/what-to-do/sports-and-adventure/pestana-alto-golf/", "checked_at": "2026-05-09"},
    {"field": "business_details.services", "value": "club hire; buggies; trolleys; electric trolleys; individual lessons; group lessons; golf clinic", "source_type": "official_tourism_website", "source_url": "https://www.visitportugal.com/en/content/pestana-alto-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "70", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "5432", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "70.3", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=019-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "133", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=019-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "Sir Henry Cotton", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "1991", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://book.pestanagolf.com/golf", "source_type": "official_booking_link", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "official_scorecard_pdf", "source_url": "https://pestanagolf.com/wp-content/uploads/2026/02/alto_compressed.pdf", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Alto Golf Course is an 18-hole, par-70 course in Alvor designed by Sir Henry Cotton.", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official Pestana Golf course facts, official contact details and Visit Portugal service information.", "source_type": "official_website", "source_url": "https://pestanagolf.com/golf/", "checked_at": "2026-05-09"}
  ],
  "missing_or_unverified_fields": [
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "price_level",
    "featured_image",
    "official_tiktok_profile",
    "course_type",
    "difficulty",
    "is_tournament_course",
    "is_signature",
    "driving_range",
    "short_game_area",
    "putting_green",
    "clubhouse",
    "restaurant",
    "pro_shop",
    "caddie",
    "locker_room",
    "access_type",
    "allows_visitors",
    "membership_required"
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
  where slug = 'alvor'
     or lower(name) = lower('Alvor')
  order by case when slug = 'alvor' then 0 else 1 end
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
        'distance_white', white,
        'distance_yellow', yellow,
        'distance_red', red
      ) order by hole), '[]'::jsonb)
      from jsonb_to_recordset(v_scorecard) as rows(
        hole int,
        par int,
        hcp int,
        white int,
        yellow int,
        red int
      )
    ),
    true
  );

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug in ('alto-golf-course', 'alto-golf', 'pestana-alto-golf', 'pestana-alto', 'pestana-alto-golf-course')
     or lower(name) in (lower('Alto Golf Course'), lower('Alto Golf'), lower('Pestana Alto Golf'), lower('Pestana Alto Golf Course'))
  order by case slug
    when 'alto-golf-course' then 0
    when 'alto-golf' then 1
    when 'pestana-alto-golf' then 2
    when 'pestana-alto' then 3
    when 'pestana-alto-golf-course' then 4
    else 5
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
      'Alto Golf Course',
      'alto-golf-course',
      'Alto Golf Course is located at Quinta Alto do Vale, Quatro Estradas, in Alvor, Algarve. The official Pestana Golf page lists it as an 18-hole, par-70 course with a 5,432 m distance, inaugurated in 1991 and designed by Sir Henry Cotton.' || E'\n\n' ||
        'Official and tourism sources identify the course as part of Pestana Golf Resorts, with club hire, buggies, trolleys, electric trolleys, individual lessons, group lessons and golf clinic services available.',
      'Alto Golf Course is an 18-hole, par-70 course in Alvor designed by Sir Henry Cotton.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://pestanagolf.com/golf/',
      '+351 282 460 870',
      'info@pestanagolf.com',
      'Quinta Alto do Vale, Quatro Estradas, 8501-906 Alvor, Algarve, Portugal',
      37.126475,
      -8.565586,
      'https://www.instagram.com/pestanagolfresorts/',
      'https://www.facebook.com/PestanaGolf',
      'https://www.linkedin.com/company/pestana-golf-resorts/',
      'https://twitter.com/PestanaGolf',
      'https://www.youtube.com/channel/UCwEURcNNoFpJ5UF7tsN4PWA',
      null,
      null,
      null,
      null,
      v_category_data,
      array['golf', 'alvor', 'alto-golf', 'sir-henry-cotton', 'pestana-golf'],
      'Alto Golf Course | Golf Course in Alvor, Algarve',
      'Alto Golf Course is an 18-hole, par-70 golf course in Alvor, Algarve, designed by Sir Henry Cotton and operated by Pestana Golf Resorts.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Alto Golf Course',
      slug = 'alto-golf-course',
      description = 'Alto Golf Course is located at Quinta Alto do Vale, Quatro Estradas, in Alvor, Algarve. The official Pestana Golf page lists it as an 18-hole, par-70 course with a 5,432 m distance, inaugurated in 1991 and designed by Sir Henry Cotton.' || E'\n\n' ||
        'Official and tourism sources identify the course as part of Pestana Golf Resorts, with club hire, buggies, trolleys, electric trolleys, individual lessons, group lessons and golf clinic services available.',
      short_description = 'Alto Golf Course is an 18-hole, par-70 course in Alvor designed by Sir Henry Cotton.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://pestanagolf.com/golf/',
      contact_phone = '+351 282 460 870',
      contact_email = 'info@pestanagolf.com',
      address = 'Quinta Alto do Vale, Quatro Estradas, 8501-906 Alvor, Algarve, Portugal',
      latitude = 37.126475,
      longitude = -8.565586,
      instagram_url = 'https://www.instagram.com/pestanagolfresorts/',
      facebook_url = 'https://www.facebook.com/PestanaGolf',
      linkedin_url = 'https://www.linkedin.com/company/pestana-golf-resorts/',
      twitter_url = 'https://twitter.com/PestanaGolf',
      youtube_url = 'https://www.youtube.com/channel/UCwEURcNNoFpJ5UF7tsN4PWA',
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      category_data = v_category_data,
      tags = array['golf', 'alvor', 'alto-golf', 'sir-henry-cotton', 'pestana-golf'],
      meta_title = 'Alto Golf Course | Golf Course in Alvor, Algarve',
      meta_description = 'Alto Golf Course is an 18-hole, par-70 golf course in Alvor, Algarve, designed by Sir Henry Cotton and operated by Pestana Golf Resorts.',
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
        ('alto-golf'),
        ('pestana-alto-golf'),
        ('pestana-alto'),
        ('pestana-alto-golf-course')
    ) as aliases(alias_slug)
    where alias_slug is not null
      and alias_slug <> 'alto-golf-course'
    on conflict (slug) do update
    set is_current = false
    where public.listing_slugs.listing_id = excluded.listing_id;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'alto-golf-course', true)
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
      'Alto Golf Course',
      18,
      true,
      18,
      70,
      133,
      70.3,
      5432,
      'Sir Henry Cotton',
      1991,
      null,
      null,
      null,
      false,
      false
    )
    returning id into v_course_id;
  else
    update public.golf_courses
    set
      name = 'Alto Golf Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 70,
      slope = 133,
      course_rating = 70.3,
      length_meters = 5432,
      designer = 'Sir Henry Cotton',
      year_opened = 1991,
      last_renovation = null,
      layout_type = null,
      difficulty = null,
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
    white,
    yellow,
    red
  from jsonb_to_recordset(v_scorecard) as rows(
    hole int,
    par int,
    hcp int,
    white int,
    yellow int,
    red int
  )
  order by hole;
end;
$$;

commit;
