begin;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Golf', 'golf', true, false, 30)
on conflict (slug) do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Quinta do Lago', 'quinta-do-lago', true, false)
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
  {"hole": 1, "par": 4, "hcp": 13, "tee_1": 368, "tee_2": 332, "tee_3": 307, "tee_4": 307},
  {"hole": 2, "par": 5, "hcp": 7, "tee_1": 500, "tee_2": 480, "tee_3": 415, "tee_4": 415},
  {"hole": 3, "par": 4, "hcp": 5, "tee_1": 387, "tee_2": 360, "tee_3": 285, "tee_4": 285},
  {"hole": 4, "par": 3, "hcp": 17, "tee_1": 171, "tee_2": 138, "tee_3": 113, "tee_4": 105},
  {"hole": 5, "par": 5, "hcp": 1, "tee_1": 500, "tee_2": 480, "tee_3": 435, "tee_4": 435},
  {"hole": 6, "par": 4, "hcp": 9, "tee_1": 348, "tee_2": 315, "tee_3": 290, "tee_4": 249},
  {"hole": 7, "par": 3, "hcp": 15, "tee_1": 175, "tee_2": 155, "tee_3": 127, "tee_4": 127},
  {"hole": 8, "par": 4, "hcp": 3, "tee_1": 363, "tee_2": 340, "tee_3": 307, "tee_4": 307},
  {"hole": 9, "par": 4, "hcp": 11, "tee_1": 355, "tee_2": 320, "tee_3": 285, "tee_4": 285},
  {"hole": 10, "par": 4, "hcp": 6, "tee_1": 406, "tee_2": 375, "tee_3": 328, "tee_4": 328},
  {"hole": 11, "par": 3, "hcp": 16, "tee_1": 184, "tee_2": 151, "tee_3": 112, "tee_4": 112},
  {"hole": 12, "par": 5, "hcp": 12, "tee_1": 460, "tee_2": 425, "tee_3": 380, "tee_4": 380},
  {"hole": 13, "par": 4, "hcp": 18, "tee_1": 325, "tee_2": 285, "tee_3": 255, "tee_4": 255},
  {"hole": 14, "par": 4, "hcp": 2, "tee_1": 383, "tee_2": 350, "tee_3": 318, "tee_4": 276},
  {"hole": 15, "par": 3, "hcp": 8, "tee_1": 196, "tee_2": 160, "tee_3": 125, "tee_4": 125},
  {"hole": 16, "par": 4, "hcp": 14, "tee_1": 372, "tee_2": 322, "tee_3": 270, "tee_4": 259},
  {"hole": 17, "par": 5, "hcp": 4, "tee_1": 510, "tee_2": 490, "tee_3": 402, "tee_4": 354},
  {"hole": 18, "par": 4, "hcp": 10, "tee_1": 413, "tee_2": 370, "tee_3": 338, "tee_4": 338}
]
$scorecard$::jsonb;
  v_category_data jsonb := $category$
{
  "vertical": "golf",
  "country": "Portugal",
  "golf": {
    "course_type": null,
    "holes": 18,
    "par": 72,
    "length_meters": 6416,
    "course_rating": 73.7,
    "slope": 139,
    "designer": "William Mitchell",
    "year_opened": 1974,
    "last_renovation": null,
    "layout_type": null,
    "difficulty": null,
    "is_tournament_course": true,
    "is_signature": null
  },
  "facilities": {
    "driving_range": true,
    "short_game_area": null,
    "putting_green": null,
    "academy": null,
    "clubhouse": true,
    "restaurant": null,
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
    "meta_title": "Quinta do Lago South Course | Golf Course in Quinta do Lago, Algarve",
    "meta_description": "Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve, designed by William Mitchell.",
    "slug": "quinta-do-lago-south-course"
  },
  "address": {
    "full_address": "Quinta do Lago, 8135-024 Almancil, Algarve, Portugal",
    "street": "Quinta do Lago",
    "postal_code": "8135-024",
    "city": "Quinta do Lago",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": null,
    "longitude": null
  },
  "contact": {
    "phone": "+351 289 390 705/6",
    "email": "golf@quintadolago.com",
    "website": "https://www.quintadolago.com/en/golf/golf-courses-south/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/qdlresort/",
    "facebook": "https://www.facebook.com/QDLResort/",
    "linkedin": "https://pt.linkedin.com/company/qdlresort",
    "youtube": "https://www.youtube.com/user/TheQuintadolagogolf/videos",
    "tiktok": null,
    "x_twitter": "https://twitter.com/qdlresort"
  },
  "content": {
    "short_description": "Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve.",
    "full_description": "Quinta do Lago South Course is located in Quinta do Lago, Algarve. The official Quinta do Lago page describes it as a par-72 course designed in 1974 by William Mitchell and set among umbrella pines, lakes and wild flowers overlooking the Ria Formosa Natural Park.\n\nOfficial course information states that the South Course has hosted the Portuguese Open eight times and lists club rental, proshop, practice area, buggy rental, buggy bar, electric trolley, trolley rental and clubhouse facilities.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": "Golf Course and Reception open daily from 7:00 to 20:30; Driving Range open daily from 7:00 to 19:00",
    "price_level": null,
    "services": [
      "golf course",
      "tee time booking",
      "club rental",
      "buggy rental",
      "electric trolley",
      "trolley rental"
    ],
    "amenities": [
      "proshop",
      "practice area",
      "buggy bar",
      "clubhouse",
      "driving range"
    ]
  },
  "holes": 18,
  "holes_count": 18,
  "par": 72,
  "length_meters": 6416,
  "course_rating": 73.7,
  "slope": 139,
  "slope_rating": 139,
  "designer": "William Mitchell",
  "architect": "William Mitchell",
  "booking_url": "https://eu.golfmanager.com/quintadolago/consumer/book?area=7&resourceType=35",
  "scorecard_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y",
  "scorecard_pdf_url": null,
  "map_image_url": null,
  "course_map_url": null,
  "opening_hours": "Golf Course and Reception open daily from 7:00 to 20:30; Driving Range open daily from 7:00 to 19:00",
  "services": [
    "golf course",
    "tee time booking",
    "club rental",
    "buggy rental",
    "electric trolley",
    "trolley rental"
  ],
  "amenities": [
    "proshop",
    "practice area",
    "buggy bar",
    "clubhouse",
    "driving range"
  ],
  "official_sources": [
    "https://www.quintadolago.com/en/golf/golf-courses-south/",
    "https://www.quintadolago.com/en/contact-us/",
    "https://eu.golfmanager.com/quintadolago/consumer/book?area=7&resourceType=35",
    "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y"
  ],
  "facilities_list": [
    "club rental",
    "proshop",
    "practice area",
    "buggy rental",
    "buggy bar",
    "electric trolley",
    "trolley rental",
    "clubhouse",
    "driving range"
  ],
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official Quinta do Lago South Course page, official Quinta do Lago contact page, official booking link, Facebook profile, LinkedIn profile, YouTube profile and official Datagolf scorecard data. Official social links are parent-brand Quinta do Lago profiles. Instagram, LinkedIn, YouTube and X/Twitter were found from the official website footer; Facebook was verified as the official Quinta do Lago profile by matching brand name, Almancil location and official brand positioning. No official TikTok profile was safely confirmed. The official course page states 6,500 metres; Datagolf scorecard total lists 6,416 metres from the longest tee set, so 6,416 is used for structured scorecard-based length_meters.",
  "sources": [
    {"field": "Nome", "value": "South Course", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Quinta do Lago", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/contact-us/", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Quinta do Lago, 8135-024 Almancil, Algarve, Portugal", "source_type": "official_contact_page", "source_url": "https://www.quintadolago.com/en/contact-us/", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 289 390 705/6", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/contact-us/", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "golf@quintadolago.com", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/contact-us/", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://www.quintadolago.com/en/golf/golf-courses-south/", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/qdlresort/", "source_type": "official_website_social_link", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/QDLResort/", "source_type": "verified_branch_social_profile", "source_url": "https://www.facebook.com/QDLResort/", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://pt.linkedin.com/company/qdlresort", "source_type": "official_website_social_link", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "socials.youtube", "value": "https://www.youtube.com/user/TheQuintadolagogolf/videos", "source_type": "official_website_social_link", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "socials.x_twitter", "value": "https://twitter.com/qdlresort", "source_type": "official_website_social_link", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "business_details.opening_hours", "value": "Golf Course and Reception open daily from 7:00 to 20:30; Driving Range open daily from 7:00 to 19:00", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "business_details.services", "value": "club rental; buggy rental; electric trolley; trolley rental; tee time booking", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "business_details.amenities", "value": "proshop; practice area; buggy bar; clubhouse; driving range", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "72", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "6416", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "73.7", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "139", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "William Mitchell", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "1974", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "category_data.facilities", "value": "club rental; proshop; practice area; buggy rental; buggy bar; electric trolley; trolley rental; clubhouse; driving range", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://eu.golfmanager.com/quintadolago/consumer/book?area=7&resourceType=35", "source_type": "official_booking_link", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "official_scorecard_reference", "source_url": "https://scoring-pt.datagolf.pt/scripts/show_card.asp?Club=ALL&ack=8428ACK987&ncourse=009-1&stat=Y", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve.", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official Quinta do Lago South Course facts, official contact details, official services and Datagolf scorecard data.", "source_type": "official_website", "source_url": "https://www.quintadolago.com/en/golf/golf-courses-south/", "checked_at": "2026-05-09"}
  ],
  "missing_or_unverified_fields": [
    "address.latitude",
    "address.longitude",
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "price_level",
    "featured_image",
    "official_tiktok_profile",
    "course_type",
    "short_game_area",
    "putting_green",
    "academy",
    "restaurant",
    "caddie",
    "locker_room",
    "access_type",
    "allows_visitors",
    "membership_required",
    "difficulty",
    "is_signature",
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
  where slug = 'quinta-do-lago'
     or lower(name) = lower('Quinta do Lago')
  order by case when slug = 'quinta-do-lago' then 0 else 1 end
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
  where slug in ('quinta-do-lago-south-course', 'quinta-do-lago-south')
     or lower(name) in (lower('Quinta do Lago South Course'), lower('South Course'), lower('South Course Quinta do Lago'))
  order by case slug
    when 'quinta-do-lago-south-course' then 0
    when 'quinta-do-lago-south' then 1
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
      'Quinta do Lago South Course',
      'quinta-do-lago-south-course',
      'Quinta do Lago South Course is located in Quinta do Lago, Algarve. The official Quinta do Lago page describes it as a par-72 course designed in 1974 by William Mitchell and set among umbrella pines, lakes and wild flowers overlooking the Ria Formosa Natural Park.' || E'\n\n' ||
        'Official course information states that the South Course has hosted the Portuguese Open eight times and lists club rental, proshop, practice area, buggy rental, buggy bar, electric trolley, trolley rental and clubhouse facilities.',
      'Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.quintadolago.com/en/golf/golf-courses-south/',
      '+351 289 390 705/6',
      'golf@quintadolago.com',
      'Quinta do Lago, 8135-024 Almancil, Algarve, Portugal',
      null,
      null,
      'https://www.instagram.com/qdlresort/',
      'https://www.facebook.com/QDLResort/',
      'https://pt.linkedin.com/company/qdlresort',
      'https://twitter.com/qdlresort',
      'https://www.youtube.com/user/TheQuintadolagogolf/videos',
      null,
      null,
      null,
      null,
      v_category_data,
      array['golf', 'quinta-do-lago', 'south-course', 'william-mitchell', 'algarve-golf'],
      'Quinta do Lago South Course | Golf Course in Quinta do Lago, Algarve',
      'Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve, designed by William Mitchell.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Quinta do Lago South Course',
      slug = 'quinta-do-lago-south-course',
      description = 'Quinta do Lago South Course is located in Quinta do Lago, Algarve. The official Quinta do Lago page describes it as a par-72 course designed in 1974 by William Mitchell and set among umbrella pines, lakes and wild flowers overlooking the Ria Formosa Natural Park.' || E'\n\n' ||
        'Official course information states that the South Course has hosted the Portuguese Open eight times and lists club rental, proshop, practice area, buggy rental, buggy bar, electric trolley, trolley rental and clubhouse facilities.',
      short_description = 'Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.quintadolago.com/en/golf/golf-courses-south/',
      contact_phone = '+351 289 390 705/6',
      contact_email = 'golf@quintadolago.com',
      address = 'Quinta do Lago, 8135-024 Almancil, Algarve, Portugal',
      latitude = null,
      longitude = null,
      instagram_url = 'https://www.instagram.com/qdlresort/',
      facebook_url = 'https://www.facebook.com/QDLResort/',
      linkedin_url = 'https://pt.linkedin.com/company/qdlresort',
      twitter_url = 'https://twitter.com/qdlresort',
      youtube_url = 'https://www.youtube.com/user/TheQuintadolagogolf/videos',
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      category_data = v_category_data,
      tags = array['golf', 'quinta-do-lago', 'south-course', 'william-mitchell', 'algarve-golf'],
      meta_title = 'Quinta do Lago South Course | Golf Course in Quinta do Lago, Algarve',
      meta_description = 'Quinta do Lago South Course is an 18-hole, par-72 golf course in Quinta do Lago, Algarve, designed by William Mitchell.',
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
        ('quinta-do-lago-south')
    ) as aliases(alias_slug)
    where alias_slug is not null
      and alias_slug <> 'quinta-do-lago-south-course'
    on conflict (slug) do update
    set is_current = false
    where public.listing_slugs.listing_id = excluded.listing_id;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'quinta-do-lago-south-course', true)
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
      'Quinta do Lago South Course',
      18,
      true,
      18,
      72,
      to_jsonb(139),
      to_jsonb(73.7),
      to_jsonb(6416),
      'William Mitchell',
      1974,
      null,
      null,
      null,
      true,
      false
    )
    returning id into v_course_id;
  else
    update public.golf_courses
    set
      name = 'Quinta do Lago South Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 72,
      slope = to_jsonb(139),
      course_rating = to_jsonb(73.7),
      length_meters = to_jsonb(6416),
      designer = 'William Mitchell',
      year_opened = 1974,
      last_renovation = null,
      layout_type = null,
      difficulty = null,
      is_tournament_course = true,
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
