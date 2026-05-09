begin;

insert into public.categories (name, slug, is_active, is_featured, display_order)
values ('Golf', 'golf', true, false, 30)
on conflict (slug) do nothing;

insert into public.regions (name, slug, is_active, is_featured)
values ('Algarve', 'algarve', true, true)
on conflict (slug) do nothing;

insert into public.cities (name, slug, is_active, is_featured)
values ('Lagoa', 'lagoa', true, false)
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
  {"hole": 1, "par": 4, "hcp": 7, "gold": 415, "white": 410, "yellow": 388, "blue": 362, "red": 320},
  {"hole": 2, "par": 3, "hcp": 17, "gold": 174, "white": 169, "yellow": 147, "blue": 126, "red": 96},
  {"hole": 3, "par": 4, "hcp": 11, "gold": 324, "white": 319, "yellow": 310, "blue": 268, "red": 214},
  {"hole": 4, "par": 5, "hcp": 3, "gold": 546, "white": 520, "yellow": 478, "blue": 433, "red": 388},
  {"hole": 5, "par": 4, "hcp": 9, "gold": 365, "white": 336, "yellow": 309, "blue": 281, "red": 236},
  {"hole": 6, "par": 5, "hcp": 5, "gold": 541, "white": 517, "yellow": 489, "blue": 461, "red": 414},
  {"hole": 7, "par": 3, "hcp": 13, "gold": 199, "white": 194, "yellow": 181, "blue": 154, "red": 125},
  {"hole": 8, "par": 4, "hcp": 1, "gold": 388, "white": 363, "yellow": 335, "blue": 317, "red": 276},
  {"hole": 9, "par": 4, "hcp": 15, "gold": 355, "white": 350, "yellow": 325, "blue": 264, "red": 218},
  {"hole": 10, "par": 4, "hcp": 8, "gold": 458, "white": 445, "yellow": 433, "blue": 418, "red": 373},
  {"hole": 11, "par": 3, "hcp": 16, "gold": 149, "white": 132, "yellow": 115, "blue": 105, "red": 96},
  {"hole": 12, "par": 4, "hcp": 6, "gold": 319, "white": 314, "yellow": 299, "blue": 286, "red": 253},
  {"hole": 13, "par": 5, "hcp": 2, "gold": 613, "white": 591, "yellow": 521, "blue": 485, "red": 449},
  {"hole": 14, "par": 4, "hcp": 10, "gold": 348, "white": 343, "yellow": 327, "blue": 281, "red": 258},
  {"hole": 15, "par": 4, "hcp": 14, "gold": 367, "white": 332, "yellow": 303, "blue": 267, "red": 244},
  {"hole": 16, "par": 3, "hcp": 18, "gold": 138, "white": 124, "yellow": 112, "blue": 106, "red": 83},
  {"hole": 17, "par": 4, "hcp": 4, "gold": 403, "white": 372, "yellow": 353, "blue": 315, "red": 286},
  {"hole": 18, "par": 5, "hcp": 12, "gold": 496, "white": 465, "yellow": 433, "blue": 405, "red": 373}
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
    "length_meters": 6598,
    "course_rating": 74.5,
    "slope": 142,
    "designer": "Sir Nick Faldo",
    "year_opened": 2008,
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
    "restaurant": null,
    "pro_shop": true,
    "buggy": null,
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
    "meta_title": "Amendoeira Faldo Course | Golf Course in the Algarve",
    "meta_description": "Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha, Algarve.",
    "slug": "amendoeira-faldo-course"
  },
  "address": {
    "full_address": "Morgado da Lameira, 8365-302 Alcantarilha, Algarve, Portugal",
    "street": "Morgado da Lameira",
    "postal_code": "8365-302",
    "city": "Lagoa",
    "region": "Algarve",
    "country": "Portugal",
    "latitude": 37.1470852,
    "longitude": -8.3606298
  },
  "contact": {
    "phone": "+351 282 320 800",
    "email": "amendoeira@amendoeiraresort.com",
    "website": "https://www.amendoeiraresort.com/en/golf/"
  },
  "socials": {
    "instagram": "https://www.instagram.com/amendoeiragolf/",
    "facebook": "https://www.facebook.com/AmendoeiraGolf/",
    "linkedin": "https://pt.linkedin.com/company/amendoeira-golf-resort",
    "youtube": "https://www.youtube.com/channel/UCfQQYMe2D_snlpuRx6lStxw",
    "tiktok": null,
    "x_twitter": null
  },
  "content": {
    "short_description": "Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha.",
    "full_description": "Amendoeira Faldo Course is located at Amendoeira Golf Resort, Morgado da Lameira, Alcantarilha, in the Algarve. The official Amendoeira Golf Resort page lists the Faldo Course as a par-72 course designed by Sir Nick Faldo.\n\nOfficial course information describes strategic play, cacti, wild herbs, Holm oaks, olive trees and crushed-limestone bunkers. The resort also lists a golf academy, driving range, practice putting greens, long and short game practice areas, tee-time booking and membership options.",
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
      "golf academy",
      "private lessons",
      "shared lessons",
      "playing lessons",
      "membership"
    ],
    "amenities": [
      "driving range",
      "practice putting greens",
      "long game practice areas",
      "short game practice areas",
      "academy course",
      "Trackman",
      "BodiTrak",
      "SAM PuttLab",
      "clubhouse",
      "golf shop"
    ]
  },
  "holes": 18,
  "holes_count": 18,
  "par": 72,
  "length_meters": 6598,
  "course_rating": 74.5,
  "slope": 142,
  "slope_rating": 142,
  "designer": "Sir Nick Faldo",
  "architect": "Sir Nick Faldo",
  "booking_url": "https://amendoeira.golfmanager.com/consumer/portal",
  "scorecard_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf",
  "scorecard_pdf_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf",
  "map_image_url": null,
  "course_map_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf",
  "opening_hours": null,
  "services": [
    "golf course",
    "tee time booking",
    "golf academy",
    "private lessons",
    "shared lessons",
    "playing lessons",
    "membership"
  ],
  "amenities": [
    "driving range",
    "practice putting greens",
    "long game practice areas",
    "short game practice areas",
    "academy course",
    "Trackman",
    "BodiTrak",
    "SAM PuttLab",
    "clubhouse",
    "golf shop"
  ],
  "official_sources": [
    "https://www.amendoeiraresort.com/en/golf/",
    "https://www.amendoeiraresort.com/en/contact/",
    "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf",
    "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldoslop/Faldo_Course_Slope_Rating.pdf",
    "https://amendoeira.golfmanager.com/consumer/portal",
    "https://visitalgarve.pt/visitgolf/1694/amendoeira-faldo",
    "https://www.visitportugal.com/en/NR/exeres/447FFB09-9260-47C1-8567-A2815CAE7BB3"
  ],
  "facilities_list": [
    "driving range",
    "practice putting greens",
    "long game practice areas",
    "short game practice areas",
    "academy course",
    "Trackman",
    "BodiTrak",
    "SAM PuttLab",
    "clubhouse",
    "golf shop",
    "golf academy"
  ],
  "algarve_status": "VERIFIED_IN_ALGARVE",
  "verification_confidence": "high",
  "verification_notes": "Verified from the official Amendoeira Golf Resort website, official contact details, official Faldo Course scorecard PDF, official slope rating data and official/verified brand social profiles. The official address is Morgado da Lameira, Alcantarilha, Algarve; Lagoa is used as the closest valid AlgarveOfficial city. Official social profiles were checked for Instagram, Facebook, LinkedIn, YouTube, TikTok and X/Twitter; TikTok and X/Twitter were not safely confirmed.",
  "sources": [
    {"field": "Nome", "value": "Faldo Course", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "City", "value": "Lagoa", "source_type": "official_address_geographic_mapping", "source_url": "https://www.amendoeiraresort.com/en/contact/", "checked_at": "2026-05-09"},
    {"field": "address.full_address", "value": "Morgado da Lameira, 8365-302 Alcantarilha, Algarve, Portugal", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/contact/", "checked_at": "2026-05-09"},
    {"field": "address.latitude", "value": "37.1470852", "source_type": "official_tourism_website", "source_url": "https://visitalgarve.pt/equipamento/5732/amendoeira-golf-resort", "checked_at": "2026-05-09"},
    {"field": "address.longitude", "value": "-8.3606298", "source_type": "official_tourism_website", "source_url": "https://visitalgarve.pt/equipamento/5732/amendoeira-golf-resort", "checked_at": "2026-05-09"},
    {"field": "contact.phone", "value": "+351 282 320 800", "source_type": "official_scorecard_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf", "checked_at": "2026-05-09"},
    {"field": "contact.email", "value": "amendoeira@amendoeiraresort.com", "source_type": "official_scorecard_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf", "checked_at": "2026-05-09"},
    {"field": "contact.website", "value": "https://www.amendoeiraresort.com/en/golf/", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "socials.instagram", "value": "https://www.instagram.com/amendoeiragolf/", "source_type": "verified_branch_social_profile", "source_url": "https://www.instagram.com/amendoeiragolf/", "checked_at": "2026-05-09"},
    {"field": "socials.facebook", "value": "https://www.facebook.com/AmendoeiraGolf/", "source_type": "verified_branch_social_profile", "source_url": "https://www.facebook.com/AmendoeiraGolf/", "checked_at": "2026-05-09"},
    {"field": "socials.linkedin", "value": "https://pt.linkedin.com/company/amendoeira-golf-resort", "source_type": "verified_branch_social_profile", "source_url": "https://pt.linkedin.com/company/amendoeira-golf-resort", "checked_at": "2026-05-09"},
    {"field": "socials.youtube", "value": "https://www.youtube.com/channel/UCfQQYMe2D_snlpuRx6lStxw", "source_type": "verified_branch_social_profile", "source_url": "https://www.youtube.com/channel/UCfQQYMe2D_snlpuRx6lStxw", "checked_at": "2026-05-09"},
    {"field": "business_details.services", "value": "golf course; tee time booking; golf academy; private lessons; shared lessons; playing lessons; membership", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "business_details.amenities", "value": "driving range; practice putting greens; long game practice areas; short game practice areas; academy course; Trackman; BodiTrak; SAM PuttLab; clubhouse; golf shop", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.holes_count", "value": "18", "source_type": "official_tourism_website", "source_url": "https://visitalgarve.pt/visitgolf/1694/amendoeira-faldo", "checked_at": "2026-05-09"},
    {"field": "category_data.par", "value": "72", "source_type": "official_scorecard_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.length_meters", "value": "6598", "source_type": "official_scorecard_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.course_rating", "value": "74.5", "source_type": "official_slope_rating_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldoslop/Faldo_Course_Slope_Rating.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.slope_rating", "value": "142", "source_type": "official_slope_rating_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldoslop/Faldo_Course_Slope_Rating.pdf", "checked_at": "2026-05-09"},
    {"field": "category_data.designer", "value": "Sir Nick Faldo", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.year_opened", "value": "2008", "source_type": "official_tourism_website", "source_url": "https://visitalgarve.pt/visitgolf/1694/amendoeira-faldo", "checked_at": "2026-05-09"},
    {"field": "category_data.facilities", "value": "driving range; practice putting greens; long game practice areas; short game practice areas; academy course; Trackman; BodiTrak; SAM PuttLab; clubhouse; golf shop; golf academy", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.booking_url", "value": "https://amendoeira.golfmanager.com/consumer/portal", "source_type": "official_booking_link", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "category_data.scorecard_url", "value": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf", "source_type": "official_scorecard_pdf", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "scorecard", "value": "18-hole scorecard", "source_type": "official_scorecard_pdf", "source_url": "https://amendoeira.backhotelite.com/uploads/files/cms_apps/pdf/faldo/Faldo_Course_Scorecard.pdf", "checked_at": "2026-05-09"},
    {"field": "content.short_description", "value": "Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha.", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"},
    {"field": "content.full_description", "value": "Description based on official Amendoeira Golf Resort course facts, official contact details, official scorecard, official slope rating and official facilities information.", "source_type": "official_website", "source_url": "https://www.amendoeiraresort.com/en/golf/", "checked_at": "2026-05-09"}
  ],
  "missing_or_unverified_fields": [
    "google_business_url",
    "google_rating",
    "google_review_count",
    "google_review_positive_themes",
    "opening_hours",
    "price_level",
    "featured_image",
    "official_tiktok_profile",
    "official_x_twitter_profile",
    "course_type",
    "difficulty",
    "is_tournament_course",
    "is_signature",
    "buggy",
    "caddie",
    "locker_room",
    "restaurant",
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
  where slug = 'lagoa'
     or lower(name) = lower('Lagoa')
  order by case when slug = 'lagoa' then 0 else 1 end
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
  where slug in ('amendoeira-faldo-course', 'amendoeira-faldo')
     or lower(name) in (lower('Amendoeira Faldo Course'), lower('Faldo Course'))
  order by case slug
    when 'amendoeira-faldo-course' then 0
    when 'amendoeira-faldo' then 1
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
      'Amendoeira Faldo Course',
      'amendoeira-faldo-course',
      'Amendoeira Faldo Course is located at Amendoeira Golf Resort, Morgado da Lameira, Alcantarilha, in the Algarve. The official Amendoeira Golf Resort page lists the Faldo Course as a par-72 course designed by Sir Nick Faldo.' || E'\n\n' ||
        'Official course information describes strategic play, cacti, wild herbs, Holm oaks, olive trees and crushed-limestone bunkers. The resort also lists a golf academy, driving range, practice putting greens, long and short game practice areas, tee-time booking and membership options.',
      'Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha.',
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.amendoeiraresort.com/en/golf/',
      '+351 282 320 800',
      'amendoeira@amendoeiraresort.com',
      'Morgado da Lameira, 8365-302 Alcantarilha, Algarve, Portugal',
      37.1470852,
      -8.3606298,
      'https://www.instagram.com/amendoeiragolf/',
      'https://www.facebook.com/AmendoeiraGolf/',
      'https://pt.linkedin.com/company/amendoeira-golf-resort',
      null,
      'https://www.youtube.com/channel/UCfQQYMe2D_snlpuRx6lStxw',
      null,
      null,
      null,
      null,
      v_category_data,
      array['golf', 'lagoa', 'amendoeira', 'faldo-course', 'sir-nick-faldo'],
      'Amendoeira Faldo Course | Golf Course in the Algarve',
      'Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha, Algarve.',
      now()
    )
    returning id, slug into v_listing_id, v_old_slug;
  else
    update public.listings
    set
      name = 'Amendoeira Faldo Course',
      slug = 'amendoeira-faldo-course',
      description = 'Amendoeira Faldo Course is located at Amendoeira Golf Resort, Morgado da Lameira, Alcantarilha, in the Algarve. The official Amendoeira Golf Resort page lists the Faldo Course as a par-72 course designed by Sir Nick Faldo.' || E'\n\n' ||
        'Official course information describes strategic play, cacti, wild herbs, Holm oaks, olive trees and crushed-limestone bunkers. The resort also lists a golf academy, driving range, practice putting greens, long and short game practice areas, tee-time booking and membership options.',
      short_description = 'Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha.',
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'unverified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.amendoeiraresort.com/en/golf/',
      contact_phone = '+351 282 320 800',
      contact_email = 'amendoeira@amendoeiraresort.com',
      address = 'Morgado da Lameira, 8365-302 Alcantarilha, Algarve, Portugal',
      latitude = 37.1470852,
      longitude = -8.3606298,
      instagram_url = 'https://www.instagram.com/amendoeiragolf/',
      facebook_url = 'https://www.facebook.com/AmendoeiraGolf/',
      linkedin_url = 'https://pt.linkedin.com/company/amendoeira-golf-resort',
      twitter_url = null,
      youtube_url = 'https://www.youtube.com/channel/UCfQQYMe2D_snlpuRx6lStxw',
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      category_data = v_category_data,
      tags = array['golf', 'lagoa', 'amendoeira', 'faldo-course', 'sir-nick-faldo'],
      meta_title = 'Amendoeira Faldo Course | Golf Course in the Algarve',
      meta_description = 'Amendoeira Faldo Course is an 18-hole, par-72 golf course at Amendoeira Golf Resort in Alcantarilha, Algarve.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id;

    if v_old_slug is not null and v_old_slug <> 'amendoeira-faldo-course' then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update
      set is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, 'amendoeira-faldo-course', true)
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
      'Amendoeira Faldo Course',
      18,
      true,
      18,
      72,
      to_jsonb(142),
      to_jsonb(74.5),
      to_jsonb(6598),
      'Sir Nick Faldo',
      2008,
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
      name = 'Amendoeira Faldo Course',
      holes_count = 18,
      is_default = true,
      holes = 18,
      par = 72,
      slope = to_jsonb(142),
      course_rating = to_jsonb(74.5),
      length_meters = to_jsonb(6598),
      designer = 'Sir Nick Faldo',
      year_opened = 2008,
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
