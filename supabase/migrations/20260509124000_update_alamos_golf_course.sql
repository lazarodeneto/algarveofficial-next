begin;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Golf', 'golf', true, false, 30)
on conflict (slug) do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Portimão', 'portimao', true, false)
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
  {"hole": 1, "par": 4, "hcp": 12, "tee_1": 304, "tee_2": 282, "tee_3": 248, "tee_4": 223, "tee_5": 158},
  {"hole": 2, "par": 5, "hcp": 7, "tee_1": 487, "tee_2": 463, "tee_3": 446, "tee_4": 324, "tee_5": 281},
  {"hole": 3, "par": 3, "hcp": 18, "tee_1": 137, "tee_2": 117, "tee_3": 108, "tee_4": 112, "tee_5": 69},
  {"hole": 4, "par": 4, "hcp": 4, "tee_1": 324, "tee_2": 294, "tee_3": 240, "tee_4": 205, "tee_5": 132},
  {"hole": 5, "par": 4, "hcp": 13, "tee_1": 336, "tee_2": 316, "tee_3": 287, "tee_4": 190, "tee_5": 145},
  {"hole": 6, "par": 5, "hcp": 3, "tee_1": 501, "tee_2": 467, "tee_3": 430, "tee_4": 297, "tee_5": 222},
  {"hole": 7, "par": 3, "hcp": 15, "tee_1": 176, "tee_2": 150, "tee_3": 122, "tee_4": 118, "tee_5": 65},
  {"hole": 8, "par": 5, "hcp": 1, "tee_1": 483, "tee_2": 453, "tee_3": 390, "tee_4": 310, "tee_5": 250},
  {"hole": 9, "par": 3, "hcp": 11, "tee_1": 171, "tee_2": 148, "tee_3": 116, "tee_4": 103, "tee_5": 99},
  {"hole": 10, "par": 4, "hcp": 10, "tee_1": 312, "tee_2": 274, "tee_3": 214, "tee_4": 171, "tee_5": 141},
  {"hole": 11, "par": 3, "hcp": 5, "tee_1": 190, "tee_2": 157, "tee_3": 116, "tee_4": 113, "tee_5": 73},
  {"hole": 12, "par": 4, "hcp": 14, "tee_1": 304, "tee_2": 254, "tee_3": 176, "tee_4": 173, "tee_5": 130},
  {"hole": 13, "par": 4, "hcp": 6, "tee_1": 340, "tee_2": 291, "tee_3": 258, "tee_4": 218, "tee_5": 150},
  {"hole": 14, "par": 5, "hcp": 2, "tee_1": 450, "tee_2": 413, "tee_3": 373, "tee_4": 337, "tee_5": 252},
  {"hole": 15, "par": 4, "hcp": 16, "tee_1": 277, "tee_2": 241, "tee_3": 206, "tee_4": 203, "tee_5": 163},
  {"hole": 16, "par": 3, "hcp": 8, "tee_1": 166, "tee_2": 143, "tee_3": 112, "tee_4": 114, "tee_5": 80},
  {"hole": 17, "par": 4, "hcp": 17, "tee_1": 324, "tee_2": 285, "tee_3": 207, "tee_4": 210, "tee_5": 171},
  {"hole": 18, "par": 4, "hcp": 9, "tee_1": 344, "tee_2": 317, "tee_3": 257, "tee_4": 261, "tee_5": 176}
]
$scorecard$::jsonb;
  v_category_data jsonb := $category$
{
  "vertical": "golf",
  "country": "Portugal",
  "golf": {
    "course_type": null,
    "holes": 18,
    "par": 71,
    "length_meters": 5626,
    "course_rating": 70.6,
    "slope": 132,
    "designer": "European Golf Design",
    "year_opened": 2006,
    "last_renovation": null,
    "layout_type": null,
    "difficulty": null,
    "is_tournament_course": null,
    "is_signature": null
  },
  "facilities": {
    "driving_range": true,
    "short_game_area": true,
    "putting_green": true,
    "academy": true,
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
    "meta_title": "Álamos Golf Course | Golf Course in Portimão, Algarve",
    "meta_description": "Álamos Golf Course is an 18-hole, par-71 golf course at Morgado do Reguengo Resort in Portimão, Algarve.",
    "slug": "alamos-golf-course"
  },
  "address": {
    "full_address": "Álamos Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal",
    "street": "Morgado do Reguengo Resort",
    "postal_code": "8501-912",
    "city": "Portimão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": "+351 282 402 150",
    "email": "info@golfedomorgado.com",
    "website": "https://www.nauhotels.com/en/golf/alamos-golf"
  },
  "socials": {
    "instagram": "https://www.instagram.com/nauhotels/",
    "facebook": "https://www.facebook.com/nauhotels",
    "linkedin": "https://www.linkedin.com/company/nauhotels/posts/?feedView=all",
    "youtube": null,
    "tiktok": null,
    "x_twitter": null
  },
  "content": {
    "short_description": "Álamos Golf Course is an 18-hole, par-71 course at Morgado do Reguengo Resort in Portimão.",
    "full_description": "Álamos Golf Course is located at Morgado do Reguengo Resort in Portimão, Algarve. The official NAU Hotels page lists it as an 18-hole, par-71 course designed by European Golf Design and inaugurated in 2006.\n\nOfficial course information describes views of Serra de Monchique, lakes and surrounding fields, with relatively short holes and small greens that require technique and precision. Facilities include practice tees, chipping greens, putting greens, a golf academy, clubhouse with restaurant and bar, pro shop, equipment rentals and private or group lessons.",
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
      "golf academy",
      "equipment rentals",
      "private lessons",
      "group lessons",
      "tee time booking"
    ],
    "amenities": [
      "2 practice tees",
      "2 chipping greens",
      "2 putting greens",
      "clubhouse with restaurant and bar",
      "pro shop",
      "golf clubs rental",
      "golf carts rental"
    ]
  },
  "holes": 18,
  "holes_count": 18,
  "par": 71,
  "length_meters": 5626,
  "course_rating": 70.6,
  "slope": 132,
  "slope_rating": 132,
  "designer": "European Golf Design",
  "architect": "European Golf Design",
  "booking_url": "https://morgadoalamos.golfmanager.com/consumer/home",
  "scorecard_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=077-1&stat=Y",
  "scorecard_pdf_url": null,
  "map_image_url": null,
  "course_map_url": null,
  "opening_hours": null,
  "services": [
    "golf course",
    "golf academy",
    "equipment rentals",
    "private lessons",
    "group lessons",
    "tee time booking"
  ],
  "amenities": [
    "2 practice tees",
    "2 chipping greens",
    "2 putting greens",
    "clubhouse with restaurant and bar",
    "pro shop",
    "golf clubs rental",
    "golf carts rental"
  ],
  "official_sources": [
    "https://www.nauhotels.com/en/golf/alamos-golf",
    "https://morgadoalamos.golfmanager.com/consumer/home",
    "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=077-1&stat=Y"
  ],
  "facilities_list": [
    "2 practice tees",
    "2 chipping greens",
    "2 putting greens",
    "golf academy",
    "clubhouse with restaurant and bar",
    "pro shop",
    "equipment rentals",
    "private and group lessons"
  ],
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official NAU Hotels Álamos Golf Course page, official booking link and official Datagolf scorecard data. The official NAU course page verifies the course name, Portimão Algarve address, 18 holes, par 71, European Golf Design architect, 2006 inauguration, course rating/slope options, facilities, phone and email. Official social links on the course page identify NAU Hotels Instagram, Facebook and LinkedIn profiles. No official YouTube, TikTok or X/Twitter profile was safely confirmed from official sources.",
  "sources": [
    {"field": "Nome", "value": "Álamos Golf Course", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Portimão", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Álamos Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 282 402 150", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "info@golfedomorgado.com", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://www.nauhotels.com/en/golf/alamos-golf", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/nauhotels/", "source_type": "official_website_social_link", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/nauhotels", "source_type": "official_website_social_link", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://www.linkedin.com/company/nauhotels/posts/?feedView=all", "source_type": "official_website_social_link", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "business_details.services", "value": "golf course; golf academy; equipment rentals; private lessons; group lessons; tee time booking", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "business_details.amenities", "value": "2 practice tees; 2 chipping greens; 2 putting greens; clubhouse with restaurant and bar; pro shop; golf clubs rental; golf carts rental", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "71", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "5626", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=077-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "70.6", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=077-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "132", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=077-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "European Golf Design", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "2006", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.facilities", "value": "2 practice tees; 2 chipping greens; 2 putting greens; golf academy; clubhouse with restaurant and bar; pro shop; equipment rentals; private and group lessons", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://morgadoalamos.golfmanager.com/consumer/home", "source_type": "official_booking_link", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=077-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Álamos Golf Course is an 18-hole, par-71 course at Morgado do Reguengo Resort in Portimão.", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official NAU Hotels Álamos Golf Course facts and facilities.", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/alamos-golf", "checked_at": "2026-05-09"}
  ],
  "missing_or_unverified_fields": [
    "address.latitude",
    "address.longitude",
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
    "course_type",
    "difficulty",
    "is_tournament_course",
    "is_signature",
    "caddie",
    "locker_room",
    "access_type",
    "allows_visitors",
    "membership_required",
    "official tee colour names for the five Datagolf scorecard distance columns"
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
  where slug = 'portimao'
     or lower(name) in ('portimão', 'portimao')
  order by case when slug = 'portimao' then 0 else 1 end
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
        'tee_5', tee_5
      ) order by hole), '[]'::jsonb)
      from jsonb_to_recordset(v_scorecard) as rows(
        hole int,
        par int,
        hcp int,
        tee_1 int,
        tee_2 int,
        tee_3 int,
        tee_4 int,
        tee_5 int
      )
    ),
    true
  );

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug in ('alamos-golf-course', 'alamos-golf', 'alamos')
     or lower(name) in (lower('Álamos Golf Course'), lower('Alamos Golf Course'), lower('Alamos Golf'))
  order by case slug
    when 'alamos-golf-course' then 0
    when 'alamos-golf' then 1
    when 'alamos' then 2
    else 3
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
      'Álamos Golf Course',
      'alamos-golf-course',
      'Álamos Golf Course is located at Morgado do Reguengo Resort in Portimão, Algarve. The official NAU Hotels page lists it as an 18-hole, par-71 course designed by European Golf Design and inaugurated in 2006.' || E'\n\n' ||
        'Official course information describes views of Serra de Monchique, lakes and surrounding fields, with relatively short holes and small greens that require technique and precision. Facilities include practice tees, chipping greens, putting greens, a golf academy, clubhouse with restaurant and bar, pro shop, equipment rentals and private or group lessons.',
      'Álamos Golf Course is an 18-hole, par-71 course at Morgado do Reguengo Resort in Portimão.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.nauhotels.com/en/golf/alamos-golf',
      '+351 282 402 150',
      'info@golfedomorgado.com',
      'Álamos Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal',
      null,
      null,
      'https://www.instagram.com/nauhotels/',
      'https://www.facebook.com/nauhotels',
      'https://www.linkedin.com/company/nauhotels/posts/?feedView=all',
      null,
      null,
      null,
      null,
      null,
      null,
      v_category_data,
      array['golf', 'portimao', 'alamos', 'nau-hotels', 'european-golf-design'],
      'Álamos Golf Course | Golf Course in Portimão, Algarve',
      'Álamos Golf Course is an 18-hole, par-71 golf course at Morgado do Reguengo Resort in Portimão, Algarve.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Álamos Golf Course',
      slug = 'alamos-golf-course',
      description = 'Álamos Golf Course is located at Morgado do Reguengo Resort in Portimão, Algarve. The official NAU Hotels page lists it as an 18-hole, par-71 course designed by European Golf Design and inaugurated in 2006.' || E'\n\n' ||
        'Official course information describes views of Serra de Monchique, lakes and surrounding fields, with relatively short holes and small greens that require technique and precision. Facilities include practice tees, chipping greens, putting greens, a golf academy, clubhouse with restaurant and bar, pro shop, equipment rentals and private or group lessons.',
      short_description = 'Álamos Golf Course is an 18-hole, par-71 course at Morgado do Reguengo Resort in Portimão.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.nauhotels.com/en/golf/alamos-golf',
      contact_phone = '+351 282 402 150',
      contact_email = 'info@golfedomorgado.com',
      address = 'Álamos Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal',
      latitude = null,
      longitude = null,
      instagram_url = 'https://www.instagram.com/nauhotels/',
      facebook_url = 'https://www.facebook.com/nauhotels',
      linkedin_url = 'https://www.linkedin.com/company/nauhotels/posts/?feedView=all',
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      category_data = v_category_data,
      tags = array['golf', 'portimao', 'alamos', 'nau-hotels', 'european-golf-design'],
      meta_title = 'Álamos Golf Course | Golf Course in Portimão, Algarve',
      meta_description = 'Álamos Golf Course is an 18-hole, par-71 golf course at Morgado do Reguengo Resort in Portimão, Algarve.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id;

    if v_old_slug is not null and v_old_slug <> 'alamos-golf-course' then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update
      set is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'alamos-golf-course', true)
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
      'Álamos Golf Course',
      18,
      true,
      18,
      71,
      to_jsonb(132),
      to_jsonb(70.6),
      to_jsonb(5626),
      'European Golf Design',
      2006,
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
      name = 'Álamos Golf Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 71,
      slope = to_jsonb(132),
      course_rating = to_jsonb(70.6),
      length_meters = to_jsonb(5626),
      designer = 'European Golf Design',
      year_opened = 2006,
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
