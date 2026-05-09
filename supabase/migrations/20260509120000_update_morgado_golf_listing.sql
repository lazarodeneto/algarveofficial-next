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
  {"hole": 1, "par": 4, "hcp": 14, "tee_1": 333, "tee_2": 299, "tee_3": 288, "tee_4": 250},
  {"hole": 2, "par": 4, "hcp": 5, "tee_1": 373, "tee_2": 343, "tee_3": 328, "tee_4": 273},
  {"hole": 3, "par": 5, "hcp": 1, "tee_1": 530, "tee_2": 492, "tee_3": 478, "tee_4": 428},
  {"hole": 4, "par": 4, "hcp": 8, "tee_1": 381, "tee_2": 315, "tee_3": 303, "tee_4": 266},
  {"hole": 5, "par": 3, "hcp": 10, "tee_1": 209, "tee_2": 184, "tee_3": 152, "tee_4": 143},
  {"hole": 6, "par": 4, "hcp": 11, "tee_1": 353, "tee_2": 321, "tee_3": 309, "tee_4": 281},
  {"hole": 7, "par": 5, "hcp": 12, "tee_1": 480, "tee_2": 443, "tee_3": 432, "tee_4": 381},
  {"hole": 8, "par": 3, "hcp": 9, "tee_1": 193, "tee_2": 167, "tee_3": 158, "tee_4": 119},
  {"hole": 9, "par": 4, "hcp": 18, "tee_1": 320, "tee_2": 263, "tee_3": 239, "tee_4": 200},
  {"hole": 10, "par": 5, "hcp": 4, "tee_1": 501, "tee_2": 457, "tee_3": 447, "tee_4": 394},
  {"hole": 11, "par": 3, "hcp": 16, "tee_1": 162, "tee_2": 146, "tee_3": 133, "tee_4": 97},
  {"hole": 12, "par": 4, "hcp": 17, "tee_1": 325, "tee_2": 299, "tee_3": 292, "tee_4": 266},
  {"hole": 13, "par": 5, "hcp": 7, "tee_1": 477, "tee_2": 444, "tee_3": 430, "tee_4": 382},
  {"hole": 14, "par": 4, "hcp": 15, "tee_1": 339, "tee_2": 314, "tee_3": 302, "tee_4": 265},
  {"hole": 15, "par": 4, "hcp": 6, "tee_1": 311, "tee_2": 277, "tee_3": 265, "tee_4": 229},
  {"hole": 16, "par": 5, "hcp": 2, "tee_1": 511, "tee_2": 481, "tee_3": 468, "tee_4": 408},
  {"hole": 17, "par": 3, "hcp": 13, "tee_1": 206, "tee_2": 159, "tee_3": 145, "tee_4": 104},
  {"hole": 18, "par": 4, "hcp": 3, "tee_1": 408, "tee_2": 356, "tee_3": 352, "tee_4": 320}
]
$scorecard$::jsonb;
  v_category_data jsonb := $category$
{
  "vertical": "golf",
  "country": "Portugal",
  "course_type": null,
  "holes_count": 18,
  "par": 73,
  "length_meters": 6412,
  "course_rating": 72.8,
  "slope_rating": 134,
  "designer": "European Golf Design",
  "architect": "European Golf Design",
  "year_opened": 2003,
  "booking_url": "https://morgadoalamos.golfmanager.com/consumer/home",
  "scorecard_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=063-1&stat=Y",
  "scorecard_pdf_url": null,
  "map_image_url": null,
  "course_map_url": null,
  "official_sources": [
    "https://www.nauhotels.com/en/golf/morgado-golf-course",
    "https://www.nauhotels.com/localizacao-e-contacto",
    "https://morgadoalamos.golfmanager.com/consumer/home",
    "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=063-1&stat=Y"
  ],
  "golf": {
    "course_type": null,
    "holes": 18,
    "par": 73,
    "length_meters": 6412,
    "course_rating": 72.8,
    "slope": 134,
    "designer": "European Golf Design",
    "year_opened": 2003,
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
    "meta_title": "Morgado Golf Course | Golf Course in Portimão, Algarve",
    "meta_description": "Morgado Golf Course is an 18-hole, par-73 golf course at Morgado do Reguengo Resort in Portimão, Algarve.",
    "slug": "morgado-golf-course"
  },
  "address": {
    "full_address": "Morgado Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal",
    "street": "Morgado do Reguengo Resort",
    "postal_code": "8501-912",
    "city": "Portimão",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "location": {
    "address": "Morgado Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": "+351 282 402 150",
    "email": "info@golfedomorgado.com",
    "website": "https://www.nauhotels.com/en/golf/morgado-golf-course"
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
    "short_description": "Morgado Golf Course is an 18-hole, par-73 course at Morgado do Reguengo Resort in Portimão.",
    "full_description": "Morgado Golf Course is located at Morgado do Reguengo Resort in Portimão, Algarve. The official NAU Hotels page lists it as an 18-hole, par-73 course designed by European Golf Design and inaugurated in 2003.\n\nOfficial course information describes wide fairways, Scottish-inspired bunkers, fruit trees and olive groves. Facilities include practice tees, chipping greens, putting greens, a golf academy, clubhouse with restaurant and bar, pro shop, equipment rentals and private or group lessons.",
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
  "opening_hours": null,
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official NAU Hotels Morgado Golf Course page, official NAU Hotels contact page, official booking link and official Datagolf scorecard data. The official NAU course page verifies the course name, Portimão Algarve address, 18 holes, par 73, European Golf Design architect, 2003 inauguration, course rating/slope options, facilities, phone and email. Official social links on the Morgado Golf Course page identify NAU Hotels Instagram, Facebook and LinkedIn profiles. No official YouTube, TikTok or X/Twitter profile was safely confirmed from official sources.",
  "sources": [
    {"field": "Nome", "value": "Morgado Golf Course", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Portimão", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Morgado Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 282 402 150", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "info@golfedomorgado.com", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://www.nauhotels.com/en/golf/morgado-golf-course", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/nauhotels/", "source_type": "official_website_social_link", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/nauhotels", "source_type": "official_website_social_link", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://www.linkedin.com/company/nauhotels/posts/?feedView=all", "source_type": "official_website_social_link", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "73", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "6412", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=063-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "72.8", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=063-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "134", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=063-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "European Golf Design", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "2003", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.facilities", "value": "2 practice tees; 2 chipping greens; 2 putting greens; golf academy; clubhouse with restaurant and bar; pro shop; equipment rentals; private and group lessons", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://morgadoalamos.golfmanager.com/consumer/home", "source_type": "official_booking_link", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=063-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Morgado Golf Course is an 18-hole, par-73 course at Morgado do Reguengo Resort in Portimão.", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official NAU Hotels Morgado Golf Course facts and facilities.", "source_type": "official_website", "source_url": "https://www.nauhotels.com/en/golf/morgado-golf-course", "checked_at": "2026-05-09"}
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
    "official tee colour names for the four Datagolf scorecard distance columns"
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
        'tee_4', tee_4
      ) order by hole), '[]'::jsonb)
      from jsonb_to_recordset(v_scorecard) as rows(
        hole int,
        par int,
        hcp int,
        tee_1 int,
        tee_2 int,
        tee_3 int,
        tee_4 int
      )
    ),
    true
  );

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug in ('morgado-golf-course', 'morgado-golf')
     or lower(name) = lower('Morgado Golf Course')
  order by case slug
    when 'morgado-golf-course' then 0
    when 'morgado-golf' then 1
    else 2
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
      'Morgado Golf Course',
      'morgado-golf-course',
      'Morgado Golf Course is located at Morgado do Reguengo Resort in Portimão, Algarve. The official NAU Hotels page lists it as an 18-hole, par-73 course designed by European Golf Design and inaugurated in 2003.' || E'\n\n' ||
        'Official course information describes wide fairways, Scottish-inspired bunkers, fruit trees and olive groves. Facilities include practice tees, chipping greens, putting greens, a golf academy, clubhouse with restaurant and bar, pro shop, equipment rentals and private or group lessons.',
      'Morgado Golf Course is an 18-hole, par-73 course at Morgado do Reguengo Resort in Portimão.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.nauhotels.com/en/golf/morgado-golf-course',
      '+351 282 402 150',
      'info@golfedomorgado.com',
      'Morgado Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal',
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
      array['golf', 'portimao', 'morgado', 'nau-hotels', 'european-golf-design'],
      'Morgado Golf Course | Golf Course in Portimão, Algarve',
      'Morgado Golf Course is an 18-hole, par-73 golf course at Morgado do Reguengo Resort in Portimão, Algarve.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Morgado Golf Course',
      slug = 'morgado-golf-course',
      description = 'Morgado Golf Course is located at Morgado do Reguengo Resort in Portimão, Algarve. The official NAU Hotels page lists it as an 18-hole, par-73 course designed by European Golf Design and inaugurated in 2003.' || E'\n\n' ||
        'Official course information describes wide fairways, Scottish-inspired bunkers, fruit trees and olive groves. Facilities include practice tees, chipping greens, putting greens, a golf academy, clubhouse with restaurant and bar, pro shop, equipment rentals and private or group lessons.',
      short_description = 'Morgado Golf Course is an 18-hole, par-73 course at Morgado do Reguengo Resort in Portimão.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.nauhotels.com/en/golf/morgado-golf-course',
      contact_phone = '+351 282 402 150',
      contact_email = 'info@golfedomorgado.com',
      address = 'Morgado Golf Course, Morgado do Reguengo Resort, 8501-912 Portimão, Algarve, Portugal',
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
      tags = array['golf', 'portimao', 'morgado', 'nau-hotels', 'european-golf-design'],
      meta_title = 'Morgado Golf Course | Golf Course in Portimão, Algarve',
      meta_description = 'Morgado Golf Course is an 18-hole, par-73 golf course at Morgado do Reguengo Resort in Portimão, Algarve.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id;

    if v_old_slug is not null and v_old_slug <> 'morgado-golf-course' then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update
      set is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'morgado-golf-course', true)
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
      'Morgado Golf Course',
      18,
      true,
      18,
      73,
      to_jsonb(134),
      to_jsonb(72.8),
      to_jsonb(6412),
      'European Golf Design',
      2003,
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
      name = 'Morgado Golf Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 73,
      slope = to_jsonb(134),
      course_rating = to_jsonb(72.8),
      length_meters = to_jsonb(6412),
      designer = 'European Golf Design',
      year_opened = 2003,
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
