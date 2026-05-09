begin;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Golf', 'golf', true, false, 30)
on conflict (slug) do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Lagos', 'lagos', true, false)
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
  {"hole": 1, "par": 5, "hcp": 9, "white": 444, "yellow": 415, "red": 383},
  {"hole": 2, "par": 4, "hcp": 15, "white": 314, "yellow": 300, "red": 287},
  {"hole": 3, "par": 4, "hcp": 1, "white": 401, "yellow": 387, "red": 372},
  {"hole": 4, "par": 5, "hcp": 5, "white": 451, "yellow": 393, "red": 382},
  {"hole": 5, "par": 3, "hcp": 17, "white": 184, "yellow": 159, "red": 144},
  {"hole": 6, "par": 4, "hcp": 7, "white": 350, "yellow": 334, "red": 309},
  {"hole": 7, "par": 3, "hcp": 11, "white": 149, "yellow": 131, "red": 118},
  {"hole": 8, "par": 4, "hcp": 13, "white": 318, "yellow": 296, "red": 275},
  {"hole": 9, "par": 4, "hcp": 3, "white": 356, "yellow": 326, "red": 292},
  {"hole": 10, "par": 5, "hcp": 10, "white": 485, "yellow": 449, "red": 426},
  {"hole": 11, "par": 4, "hcp": 2, "white": 338, "yellow": 305, "red": 278},
  {"hole": 12, "par": 3, "hcp": 12, "white": 144, "yellow": 134, "red": 124},
  {"hole": 13, "par": 4, "hcp": 6, "white": 336, "yellow": 314, "red": 278},
  {"hole": 14, "par": 4, "hcp": 18, "white": 338, "yellow": 328, "red": 283},
  {"hole": 15, "par": 3, "hcp": 14, "white": 151, "yellow": 129, "red": 111},
  {"hole": 16, "par": 4, "hcp": 8, "white": 332, "yellow": 326, "red": 297},
  {"hole": 17, "par": 5, "hcp": 16, "white": 430, "yellow": 404, "red": 390},
  {"hole": 18, "par": 4, "hcp": 4, "white": 341, "yellow": 323, "red": 277}
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
    "length_meters": 5890,
    "course_rating": 72.1,
    "slope": 130,
    "designer": "Peter Sauerman",
    "year_opened": 2012,
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
    "academy": null,
    "clubhouse": true,
    "restaurant": true,
    "pro_shop": true,
    "buggy": true,
    "caddie": null,
    "locker_room": true
  },
  "access": {
    "type": null,
    "allows_visitors": true,
    "membership_required": false
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
    "meta_title": "Espiche Golf | Golf Course in Lagos, Algarve",
    "meta_description": "Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve, designed by Peter Sauerman.",
    "slug": "espiche-golf"
  },
  "address": {
    "full_address": "Sítio dos Matos Brancos, 701 - N, 8600-114 Espiche, Lagos, Algarve, Portugal",
    "street": "Sítio dos Matos Brancos, 701 - N",
    "postal_code": "8600-114",
    "city": "Lagos",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.119944,
    "longitude": -8.756833
  },
  "contact": {
    "phone": "+351 282 688 250",
    "email": "reception@espichegolf.pt",
    "website": "https://www.espichegolf.pt/en/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/espiche_golf/",
    "facebook": "https://www.facebook.com/EspicheGolf/",
    "linkedin": "https://pt.linkedin.com/company/espiche-golf",
    "youtube": null,
    "tiktok": null,
    "x_twitter": "https://x.com/EspicheGolfSA"
  },
  "content": {
    "short_description": "Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve.",
    "full_description": "Espiche Golf is located at Sítio dos Matos Brancos in Espiche, Lagos, Algarve. The official course information identifies it as an 18-hole, par-72 course designed by Peter Sauerman and opened in 2012.\n\nOfficial sources describe the course as integrated into the surrounding Algarve landscape, with vineyards, views toward the Monchique mountains, lakes, streams and native vegetation. Facilities include a driving range, practice putting green, short game area, equipment rental, pro shop, locker rooms, lessons, buggy bar, clubhouse and Gecko Restaurant.",
    "google_review_positive_themes_used": []
  },
  "business_details": {
    "google_business_url": null,
    "google_rating": null,
    "google_review_count": null,
    "opening_hours": "Reception is open daily from 7:30am and closes between 6:00pm and 7:00pm throughout the year.",
    "price_level": null,
    "services": [
      "golf course",
      "tee time booking",
      "equipment rental",
      "golf lessons",
      "membership"
    ],
    "amenities": [
      "driving range",
      "practice putting green",
      "short game area",
      "pro shop",
      "locker rooms",
      "changing rooms",
      "showers",
      "buggy bar",
      "clubhouse",
      "restaurant",
      "45 buggies",
      "electric trolleys",
      "pull trolleys"
    ]
  },
  "holes": 18,
  "holes_count": 18,
  "par": 72,
  "length_meters": 5890,
  "course_rating": 72.1,
  "slope": 130,
  "slope_rating": 130,
  "designer": "Peter Sauerman",
  "architect": "Peter Sauerman",
  "booking_url": "https://espiche.golfmanager.com/",
  "scorecard_url": "https://algarvegolf.net/espichegolf/scorecard.htm",
  "scorecard_pdf_url": null,
  "map_image_url": null,
  "course_map_url": null,
  "opening_hours": "Reception is open daily from 7:30am and closes between 6:00pm and 7:00pm throughout the year.",
  "services": [
    "golf course",
    "tee time booking",
    "equipment rental",
    "golf lessons",
    "membership"
  ],
  "amenities": [
    "driving range",
    "practice putting green",
    "short game area",
    "pro shop",
    "locker rooms",
    "changing rooms",
    "showers",
    "buggy bar",
    "clubhouse",
    "restaurant",
    "45 buggies",
    "electric trolleys",
    "pull trolleys"
  ],
  "official_sources": [
    "https://www.espichegolf.pt/en/",
    "https://www.espichegolf.pt/en/golf/golf-course/",
    "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf",
    "https://www.espichegolf.pt/en/contact/",
    "https://espiche.golfmanager.com/",
    "https://www.visitportugal.com/pt-pt/content/espiche-golf"
  ],
  "facilities_list": [
    "driving range",
    "practice putting green",
    "short game area",
    "equipment rental",
    "pro shop",
    "locker rooms",
    "changing rooms",
    "showers",
    "buggy bar",
    "golf lessons",
    "clubhouse",
    "restaurant",
    "45 buggies",
    "electric trolleys",
    "pull trolleys"
  ],
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official Espiche Golf website, official Espiche Golf fact sheet, Visit Portugal and official social profiles. Espiche is within Lagos municipality in the Algarve and Lagos is the closest valid AlgarveOfficial city. Official website footer lists Instagram, Facebook, Twitter/X, YouTube and LinkedIn social links; Instagram, Facebook, X/Twitter and LinkedIn were independently verified, while the exact official YouTube channel URL could not be safely confirmed from the parsed official website.",
  "sources": [
    {"field": "Nome", "value": "Espiche Golf", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Lagos", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/contact/", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Sítio dos Matos Brancos, 701 - N, 8600-114 Espiche, Lagos, Algarve, Portugal", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/contact/", "checked_at": "2026-05-09"},
    {"field": "address.latitude", "value": "37.119944", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "address.longitude", "value": "-8.756833", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 282 688 250", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/contact/", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "reception@espichegolf.pt", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/contact/", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://www.espichegolf.pt/en/", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/espiche_golf/", "source_type": "official_website_social_link", "source_url": "https://www.espichegolf.pt/en/", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/EspicheGolf/", "source_type": "official_website_social_link", "source_url": "https://www.visitportugal.com/pt-pt/content/espiche-golf", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://pt.linkedin.com/company/espiche-golf", "source_type": "verified_branch_social_profile", "source_url": "https://pt.linkedin.com/company/espiche-golf", "checked_at": "2026-05-09"},
    {"field": "socials.x_twitter", "value": "https://x.com/EspicheGolfSA", "source_type": "official_website_social_link", "source_url": "https://www.visitportugal.com/pt-pt/content/espiche-golf", "checked_at": "2026-05-09"},
    {"field": "business_details.opening_hours", "value": "Reception is open daily from 7:30am and closes between 6:00pm and 7:00pm throughout the year.", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "business_details.services", "value": "golf course; tee time booking; equipment rental; golf lessons; membership", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "business_details.amenities", "value": "driving range; practice putting green; short game area; pro shop; locker rooms; changing rooms; showers; buggy bar; clubhouse; restaurant; 45 buggies; electric trolleys; pull trolleys", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "72", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "5890", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "Peter Sauerman", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "2012", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.facilities", "value": "driving range; practice putting green; short game area; equipment rental; pro shop; locker rooms; changing rooms; showers; buggy bar; golf lessons; clubhouse; restaurant; 45 buggies; electric trolleys; pull trolleys", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://espiche.golfmanager.com/", "source_type": "official_booking_link", "source_url": "https://www.espichegolf.pt/en/", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "72.1", "source_type": "golf_scorecard_reference", "source_url": "https://www.golfpass.com/travel-advisor/courses/35729-espiche-golf-course", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "130", "source_type": "golf_scorecard_reference", "source_url": "https://www.golfpass.com/travel-advisor/courses/35729-espiche-golf-course", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "golf_scorecard_reference", "source_url": "https://algarvegolf.net/espichegolf/scorecard.htm", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve.", "source_type": "official_fact_sheet", "source_url": "https://www.espichegolf.pt/wp-content/uploads/2024/04/Fact-Sheet-EN.pdf", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official Espiche Golf website and official fact sheet facts.", "source_type": "official_website", "source_url": "https://www.espichegolf.pt/en/golf/golf-course/", "checked_at": "2026-05-09"}
  ],
  "missing_or_unverified_fields": [
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "price_level",
    "featured_image",
    "official_youtube_profile",
    "official_tiktok_profile",
    "course_type",
    "difficulty",
    "is_tournament_course",
    "is_signature",
    "caddie",
    "academy",
    "access_type",
    "official_structured_scorecard",
    "course_rating and slope_rating not found on official Espiche Golf website or fact sheet; values sourced from a golf scorecard reference"
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
  where slug = 'lagos'
     or lower(name) = lower('Lagos')
  order by case when slug = 'lagos' then 0 else 1 end
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
  where slug in ('espiche-golf', 'espiche-golf-course')
     or lower(name) in (lower('Espiche Golf'), lower('Espiche Golf Course'))
  order by case slug
    when 'espiche-golf' then 0
    when 'espiche-golf-course' then 1
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
      'Espiche Golf',
      'espiche-golf',
      'Espiche Golf is located at Sítio dos Matos Brancos in Espiche, Lagos, Algarve. The official course information identifies it as an 18-hole, par-72 course designed by Peter Sauerman and opened in 2012.' || E'\n\n' ||
        'Official sources describe the course as integrated into the surrounding Algarve landscape, with vineyards, views toward the Monchique mountains, lakes, streams and native vegetation. Facilities include a driving range, practice putting green, short game area, equipment rental, pro shop, locker rooms, lessons, buggy bar, clubhouse and Gecko Restaurant.',
      'Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.espichegolf.pt/en/',
      '+351 282 688 250',
      'reception@espichegolf.pt',
      'Sítio dos Matos Brancos, 701 - N, 8600-114 Espiche, Lagos, Algarve, Portugal',
      37.119944,
      -8.756833,
      'https://www.instagram.com/espiche_golf/',
      'https://www.facebook.com/EspicheGolf/',
      'https://pt.linkedin.com/company/espiche-golf',
      'https://x.com/EspicheGolfSA',
      null,
      null,
      null,
      null,
      null,
      v_category_data,
      array['golf', 'lagos', 'espiche', 'peter-sauerman', 'western-algarve'],
      'Espiche Golf | Golf Course in Lagos, Algarve',
      'Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve, designed by Peter Sauerman.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Espiche Golf',
      slug = 'espiche-golf',
      description = 'Espiche Golf is located at Sítio dos Matos Brancos in Espiche, Lagos, Algarve. The official course information identifies it as an 18-hole, par-72 course designed by Peter Sauerman and opened in 2012.' || E'\n\n' ||
        'Official sources describe the course as integrated into the surrounding Algarve landscape, with vineyards, views toward the Monchique mountains, lakes, streams and native vegetation. Facilities include a driving range, practice putting green, short game area, equipment rental, pro shop, locker rooms, lessons, buggy bar, clubhouse and Gecko Restaurant.',
      short_description = 'Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.espichegolf.pt/en/',
      contact_phone = '+351 282 688 250',
      contact_email = 'reception@espichegolf.pt',
      address = 'Sítio dos Matos Brancos, 701 - N, 8600-114 Espiche, Lagos, Algarve, Portugal',
      latitude = 37.119944,
      longitude = -8.756833,
      instagram_url = 'https://www.instagram.com/espiche_golf/',
      facebook_url = 'https://www.facebook.com/EspicheGolf/',
      linkedin_url = 'https://pt.linkedin.com/company/espiche-golf',
      twitter_url = 'https://x.com/EspicheGolfSA',
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      category_data = v_category_data,
      tags = array['golf', 'lagos', 'espiche', 'peter-sauerman', 'western-algarve'],
      meta_title = 'Espiche Golf | Golf Course in Lagos, Algarve',
      meta_description = 'Espiche Golf is an 18-hole, par-72 golf course near Lagos in the western Algarve, designed by Peter Sauerman.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id;

    if v_old_slug is not null and v_old_slug <> 'espiche-golf' then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update
      set is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'espiche-golf', true)
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
      'Espiche Golf',
      18,
      true,
      18,
      72,
      to_jsonb(130),
      to_jsonb(72.1),
      to_jsonb(5890),
      'Peter Sauerman',
      2012,
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
      name = 'Espiche Golf',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 72,
      slope = to_jsonb(130),
      course_rating = to_jsonb(72.1),
      length_meters = to_jsonb(5890),
      designer = 'Peter Sauerman',
      year_opened = 2012,
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
