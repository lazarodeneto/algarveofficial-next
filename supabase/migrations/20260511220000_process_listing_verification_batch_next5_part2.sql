-- Verification batch: 2026-05-11-next-5-part-2
-- Purpose: record exactly five externally checked listings as structured audits/proposals.
-- This migration intentionally does not mutate public listing rows directly.

WITH inserted_audits AS (
  INSERT INTO public.listing_verification_audits (
    id,
    listing_id,
    batch_id,
    status,
    current_data,
    proposed_data,
    applied_data,
    sources,
    confidence_score,
    confidence_label,
    notes,
    needs_admin_review
  )
  VALUES
  (
    '54701f91-b985-4de7-8492-c46079594759',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    'listing-verification-20260511-next-5-part-2',
    'completed_with_proposals',
    $json${
      "name": "THE LUX Thai Massage Alvor",
      "slug": "the-lux-thai-massage-alvor-quarteira",
      "status": "published",
      "category": "Wellness & Spas",
      "city": "Quarteira",
      "address": "Urbialvor building, R. Dom Sancho I 18, 8500-013 Alvor",
      "website_url": null,
      "contact_phone": "912 073 366",
      "contact_email": null,
      "socials": {},
      "short_description": "THE LUX Thai Massage Alvor offers refined wellness and spa experiences in Quarteira's Vilamoura Prestige, blending expert health services with serene surroundings."
    }$json$::jsonb,
    $json${
      "city_id": "e5e42f92-ed3c-4b7a-8b2f-10eb3d9ffb15",
      "city": "Alvor",
      "slug": "the-lux-thai-massage-alvor",
      "website_url": "https://www.theluxthai.com/",
      "contact_email": "comingsoon@theluxthai.com",
      "facebook_url": "https://www.facebook.com/people/The-lux-Thai-Massage-alvor/100083562482789/",
      "opening_hours": {
        "monday": "10:00-19:00",
        "tuesday": "10:00-19:00",
        "wednesday": "10:00-19:00",
        "thursday": "10:00-19:00",
        "friday": "10:00-19:00",
        "saturday": "10:00-19:00",
        "sunday": "10:00-19:00"
      },
      "short_description": "THE LUX Thai Massage Alvor is a Thai massage and wellness spa at Urbialvor, R. Dom Sancho I 18 in Alvor."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.theluxthai.com/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official site confirms the Alvor branch name, phone, address, website, generic email and official Facebook link.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.waze.com/live-map/directions/pt/faro/alvor/the-lux-thai-massage-alvor?to=place.ChIJR7YGFeAvGw0RQ61hk8GkS1I",
        "source_type": "map_reference",
        "confidence": "medium",
        "notes": "Supports Alvor address, phone and 10:00-19:00 daily opening hours.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://xn--directrio-de-empresas-qcc.cybo.com/PT-biz/nava-thai-massage-alvor",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports Alvor city, address, phone, email and opening hours; legacy business.site URL was not used as official website.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    82,
    'high',
    $$Official site confirms the listing is in Alvor, not Quarteira. City/slug/description should be reviewed together because public URL changes are sensitive.$$,
    true
  ),
  (
    '17dec8aa-9905-4066-a3d1-47f9fc0de948',
    '2c36a11a-9499-4442-b7ba-21ba11288590',
    'listing-verification-20260511-next-5-part-2',
    'completed_with_proposals',
    $json${
      "name": "Prato Feio",
      "slug": "prato-feio-almancil",
      "status": "published",
      "category": "Restaurants",
      "city": "Almancil",
      "address": "R. do Calvário n°86, 8135-123 Almancil",
      "website_url": null,
      "contact_phone": "289 358 031",
      "contact_email": null,
      "socials": {},
      "short_description": "Prato Feio is a fine dining restaurant located in Almancil, within the prestigious Golden Triangle of the Algarve."
    }$json$::jsonb,
    $json${
      "short_description": "Prato Feio is a traditional restaurant in Almancil serving made-to-order food, take-away and group dinners by reservation."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.loulelocal.pt/Prato-Feio",
        "source_type": "official_municipal_commerce_directory",
        "confidence": "high",
        "notes": "Loulé Comércio Local confirms Prato Feio, R. do Calvário nº86, 8135-123 Almancil, phone 289358031 and traditional/take-away/group-dinner description.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.top-rated.online/cities/Almancil/place/p/16316345/Prato%2BFeio",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports current address, phone and active restaurant status.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.tripadvisor.pt/Restaurant_Review-g262054-d19460701-Reviews-Prato_Feio-Almancil_Loule_Faro_District_Algarve.html",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports active restaurant status, phone and address; no official website or social profile was verified.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    70,
    'medium',
    $$Core listing data is supported by municipal/local commerce evidence. No official website or social profile was verified; only the over-polished short description is proposed for review.$$,
    true
  ),
  (
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    'listing-verification-20260511-next-5-part-2',
    'completed_with_proposals',
    $json${
      "name": "DON GULL",
      "slug": "don-gull-quinta-do-lago",
      "status": "published",
      "category": "Restaurants",
      "city": "Quinta do Lago",
      "address": "R. Sra. do Loreto 7 Loja A, 8600-683 Lagos",
      "website_url": null,
      "contact_phone": "910 076 434",
      "contact_email": null,
      "socials": {},
      "short_description": "DON GULL is a fine dining restaurant located in Quinta do Lago, within the prestigious Golden Triangle of the Algarve."
    }$json$::jsonb,
    $json${
      "city_id": "41683f77-47ef-4a97-8321-174e77364009",
      "city": "Lagos",
      "slug": "don-gull-lagos",
      "website_url": "https://www.facebook.com/dongull.restaurante",
      "facebook_url": "https://www.facebook.com/dongull.restaurante",
      "instagram_url": "https://www.instagram.com/don.gull/",
      "short_description": "DON GULL is a European, fusion and Portuguese restaurant at R. Sra. do Loreto 7 Loja A in Lagos."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://restaurantguru.com/DON-GULL-Lagos-Faro-District",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports DON GULL in Lagos, R. Sra. do Loreto 7 Loja A, phone +351 910 076 434, Facebook website and Instagram @don.gull.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://maps.apple.com/place?place-id=I7A980F132954C357",
        "source_type": "map_reference",
        "confidence": "medium",
        "notes": "Supports DON GULL phone and Facebook URL but gives a different Lagos street address, so address changes were not proposed.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.restaurantji.com/pt/lagos/don-gull-/",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports active restaurant status, Lagos location and Instagram link, but gives a different street address from current listing.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    60,
    'medium',
    $$Multiple sources agree DON GULL is in Lagos, not Quinta do Lago. Address evidence conflicts, so the current address was not changed in proposed_data and needs admin review before any location edits.$$,
    true
  ),
  (
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    'listing-verification-20260511-next-5-part-2',
    'completed_with_proposals',
    $json${
      "name": "Pinheiros Altos Golf Course",
      "slug": "pinheiros-altos-golf-course-almancil",
      "status": "published",
      "category": "Concierge Services",
      "city": "Almancil",
      "address": "Urbanização Pinheiros Altos 175, 8135-162 Faro",
      "website_url": null,
      "contact_phone": "289 359 900",
      "contact_email": null,
      "socials": {},
      "short_description": "Pinheiros Altos Golf Course in Almancil offers an exclusive golfing experience within the prestigious Golden Triangle, complemented by on-site lodging for a seamless stay."
    }$json$::jsonb,
    $json${
      "category_id": "85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9",
      "category": "Golf",
      "address": "Sitio dos Pinheiros, Quinta do Lago, 8135-863 Almancil, Algarve, Portugal",
      "website_url": "https://pinheirosaltos.com/",
      "contact_phone": "+351 289 359 900",
      "facebook_url": "https://www.facebook.com/pages/Pinheiros-Altos-Golf-Resort/108448479264",
      "twitter_url": "https://twitter.com/pinheirosaltos",
      "youtube_url": "https://www.youtube.com/PinheirosAltosGolf",
      "short_description": "Pinheiros Altos Golf Course is a 27-hole golf resort in Quinta do Lago, Almancil, with Pines, Corks and Olives nine-hole courses."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://pinheirosaltos.com/contact-us",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official contact page confirms resort name, address, phone and official social links in the header.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.1golf.eu/en/club/pinheiros-altos-golf-course/",
        "source_type": "golf_directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports Pinheiros Altos as a golf course with 9/9/9 holes, address, phone, email and website.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://algarvegolf.net/pinheirosaltos/",
        "source_type": "golf_booking_directory",
        "confidence": "medium",
        "notes": "Supports Pinheiros Altos as an Algarve golf course with facilities and Quinta do Lago location.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    88,
    'high',
    $$Official source confirms this is a golf listing, not concierge services. Address and social/profile fields should be reviewed before publication because several source pages use older social URLs.$$,
    true
  ),
  (
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'listing-verification-20260511-next-5-part-2',
    'completed_with_proposals',
    $json${
      "name": "Feel Albufeira Indian Restaurant",
      "slug": "feel-albufeira-indian-restaurant-albufeira",
      "status": "published",
      "category": "Restaurants",
      "city": "Albufeira",
      "address": "EDF paraiso, R. José Fontana f2, 8200-282 Albufeira",
      "website_url": null,
      "contact_phone": "928 228 791",
      "contact_email": null,
      "socials": {},
      "short_description": "Experience refined Indian cuisine at Feel Albufeira Indian Restaurant, a distinguished dining destination in Albufeira, Private Algarve."
    }$json$::jsonb,
    $json${
      "address": "Rua Jose Fontana, Edf Paraiso da Oura, 8200-282 Albufeira, Algarve, Portugal",
      "website_url": "https://www.feelalbufeira.com/",
      "contact_email": "feelalbufeira4@gmail.com",
      "facebook_url": "https://www.facebook.com/feelalbufeira",
      "instagram_url": "https://www.instagram.com/feelalbufeira",
      "opening_hours": {
        "monday": "11:30-23:59",
        "tuesday": "11:30-23:59",
        "wednesday": "11:30-23:59",
        "thursday": "11:30-23:59",
        "friday": "11:30-23:59",
        "saturday": "11:30-23:59",
        "sunday": "11:30-23:59"
      },
      "short_description": "Feel Albufeira Indian Restaurant is an Indian restaurant and bar on Rua Jose Fontana in Albufeira, open daily for Indian cuisine and cocktails."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.feelalbufeira.com/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official site confirms address, phone, email, website, opening hours, Facebook and Instagram profiles.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.tripadvisor.com/Restaurant_Review-g189112-d25381056-Reviews-Feel_Albufeira_Indian_Restaurant-Albufeira_Faro_District_Algarve.html",
        "source_type": "claimed_directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Claimed Tripadvisor listing supports active status, address, phone and website.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://restaurantguru.com/Feelalbufeira-Albufeira",
        "source_type": "directory_supporting_evidence",
        "confidence": "medium",
        "notes": "Supports phone, address, website, Instagram and restaurant category.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    90,
    'high',
    $$Official site provides high-confidence website, email, social and hours. No direct listing update was applied because this batch is intended for admin-reviewed proposals.$$,
    true
  )
  RETURNING id
)
SELECT count(*) AS inserted_audit_count
FROM inserted_audits;

INSERT INTO public.listing_update_proposals (
  id,
  listing_id,
  audit_id,
  field_name,
  old_value,
  proposed_value,
  source_urls,
  source_type,
  confidence_label,
  status
)
VALUES
  (
    '2e495d2f-ada4-4102-b0c2-02d40d92ab3c',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'city_id',
    '"e013dc82-4903-4ef5-8440-8ee742dd8aef"'::jsonb,
    '"e5e42f92-ed3c-4b7a-8b2f-10eb3d9ffb15"'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '024c9923-8251-4718-b21b-ea5c3fbbd488',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'city',
    '"Quarteira"'::jsonb,
    '"Alvor"'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'bb3fee85-a391-44cc-b27c-47ca918a3e02',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'slug',
    '"the-lux-thai-massage-alvor-quarteira"'::jsonb,
    '"the-lux-thai-massage-alvor"'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website',
    'medium',
    'pending'
  ),
  (
    'cbbb0ed8-2f6e-46f7-bb60-1e09d541bcad',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'website_url',
    'null'::jsonb,
    '"https://www.theluxthai.com/"'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '0a7bcd52-7502-4c9d-9dd2-a0e412e4e882',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'contact_email',
    'null'::jsonb,
    '"comingsoon@theluxthai.com"'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website',
    'medium',
    'pending'
  ),
  (
    '86bc4d25-6315-476e-ae92-0ed2c017591f',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/people/The-lux-Thai-Massage-alvor/100083562482789/"'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    '38e2af92-972d-423a-bf29-62d8cd2193db',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'opening_hours',
    'null'::jsonb,
    '{"monday":"10:00-19:00","tuesday":"10:00-19:00","wednesday":"10:00-19:00","thursday":"10:00-19:00","friday":"10:00-19:00","saturday":"10:00-19:00","sunday":"10:00-19:00"}'::jsonb,
    '["https://www.waze.com/live-map/directions/pt/faro/alvor/the-lux-thai-massage-alvor?to=place.ChIJR7YGFeAvGw0RQ61I","https://xn--directrio-de-empresas-qcc.cybo.com/PT-biz/nava-thai-massage-alvor"]'::jsonb,
    'map_and_directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '2326b7e6-c89c-40a3-b212-268c65b9d7bb',
    '4fb89bdd-1cc6-4a6e-92c3-b357cf526724',
    '54701f91-b985-4de7-8492-c46079594759',
    'short_description',
    '"THE LUX Thai Massage Alvor offers refined wellness and spa experiences in Quarteira''s Vilamoura Prestige, blending expert health services with serene surroundings."'::jsonb,
    '"THE LUX Thai Massage Alvor is a Thai massage and wellness spa at Urbialvor, R. Dom Sancho I 18 in Alvor."'::jsonb,
    '["https://www.theluxthai.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'ea446aa2-62f6-4a6c-add5-ddec3c73be11',
    '2c36a11a-9499-4442-b7ba-21ba11288590',
    '17dec8aa-9905-4066-a3d1-47f9fc0de948',
    'short_description',
    '"Prato Feio is a fine dining restaurant located in Almancil, within the prestigious Golden Triangle of the Algarve."'::jsonb,
    '"Prato Feio is a traditional restaurant in Almancil serving made-to-order food, take-away and group dinners by reservation."'::jsonb,
    '["https://www.loulelocal.pt/Prato-Feio"]'::jsonb,
    'official_municipal_commerce_directory',
    'high',
    'pending'
  ),
  (
    '88d6ba2c-8130-4002-b9fa-d8d8867f2fe2',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'city_id',
    '"0af59e61-b1bd-4192-a9e5-50950767e72b"'::jsonb,
    '"41683f77-47ef-4a97-8321-174e77364009"'::jsonb,
    '["https://restaurantguru.com/DON-GULL-Lagos-Faro-District","https://www.restaurantji.com/pt/lagos/don-gull-/"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'b7bfc5f7-1f2b-4cc6-a674-dac3d08d8626',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'city',
    '"Quinta do Lago"'::jsonb,
    '"Lagos"'::jsonb,
    '["https://restaurantguru.com/DON-GULL-Lagos-Faro-District","https://www.restaurantji.com/pt/lagos/don-gull-/"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '458e5807-99b4-4545-a10b-0146fb880299',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'slug',
    '"don-gull-quinta-do-lago"'::jsonb,
    '"don-gull-lagos"'::jsonb,
    '["https://restaurantguru.com/DON-GULL-Lagos-Faro-District"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '56632408-a185-45ed-b31b-282aa2f58814',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'website_url',
    'null'::jsonb,
    '"https://www.facebook.com/dongull.restaurante"'::jsonb,
    '["https://maps.apple.com/place?place-id=I7A980F132954C357","https://restaurantguru.com/DON-GULL-Lagos-Faro-District"]'::jsonb,
    'map_and_directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '81e5f2e5-90fb-4ac4-8c4c-2548633a8096',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/dongull.restaurante"'::jsonb,
    '["https://maps.apple.com/place?place-id=I7A980F132954C357","https://restaurantguru.com/DON-GULL-Lagos-Faro-District"]'::jsonb,
    'map_and_directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '3da0ea34-5161-4f05-93bb-fe5033127156',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'instagram_url',
    'null'::jsonb,
    '"https://www.instagram.com/don.gull/"'::jsonb,
    '["https://restaurantguru.com/DON-GULL-Lagos-Faro-District","https://www.restaurantji.com/pt/lagos/don-gull-/"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    'e8e986e0-a772-4d70-92b3-96a5d82ff92b',
    '6089ff0c-4dc3-4e36-a358-f17203f22c3c',
    '6eca809d-f489-47f7-8c66-b6380cdf3ce5',
    'short_description',
    '"DON GULL is a fine dining restaurant located in Quinta do Lago, within the prestigious Golden Triangle of the Algarve."'::jsonb,
    '"DON GULL is a European, fusion and Portuguese restaurant at R. Sra. do Loreto 7 Loja A in Lagos."'::jsonb,
    '["https://restaurantguru.com/DON-GULL-Lagos-Faro-District"]'::jsonb,
    'directory_supporting_evidence',
    'medium',
    'pending'
  ),
  (
    '0db1d60c-901d-43e7-bba1-e75c0643dd8f',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'category_id',
    '"78f9428d-d33e-4513-ac3e-415f36254845"'::jsonb,
    '"85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9"'::jsonb,
    '["https://pinheirosaltos.com/contact-us","https://www.1golf.eu/en/club/pinheiros-altos-golf-course/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '87c98a8a-5032-4ee9-9f32-8a30fc8f8629',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'category',
    '"Concierge Services"'::jsonb,
    '"Golf"'::jsonb,
    '["https://pinheirosaltos.com/contact-us","https://www.1golf.eu/en/club/pinheiros-altos-golf-course/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'ff8375a6-553f-44d1-8c32-fabf4eddeb15',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'address',
    '"Urbanização Pinheiros Altos 175, 8135-162 Faro"'::jsonb,
    '"Sitio dos Pinheiros, Quinta do Lago, 8135-863 Almancil, Algarve, Portugal"'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '94108593-7b15-425f-83d7-8f4d4526e584',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'website_url',
    'null'::jsonb,
    '"https://pinheirosaltos.com/"'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'fe81afbf-2679-4795-b398-c5432a0cdace',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'contact_phone',
    '"289 359 900"'::jsonb,
    '"+351 289 359 900"'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'e950a068-43f0-4384-bed5-4dff778eb68d',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/pages/Pinheiros-Altos-Golf-Resort/108448479264"'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    'b97f2321-ca91-4d0c-a4c4-72a43022992f',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'twitter_url',
    'null'::jsonb,
    '"https://twitter.com/pinheirosaltos"'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    '5188d0fd-5bf5-469a-9518-d1accc9b684c',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'youtube_url',
    'null'::jsonb,
    '"https://www.youtube.com/PinheirosAltosGolf"'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    '47b3f96e-464d-4c5c-bbf3-a9b81b38d08d',
    '769b0886-27e9-4e2d-81f5-0ff09195cfdc',
    '523f4b13-5766-4ae7-bf82-400b401d29c6',
    'short_description',
    '"Pinheiros Altos Golf Course in Almancil offers an exclusive golfing experience within the prestigious Golden Triangle, complemented by on-site lodging for a seamless stay."'::jsonb,
    '"Pinheiros Altos Golf Course is a 27-hole golf resort in Quinta do Lago, Almancil, with Pines, Corks and Olives nine-hole courses."'::jsonb,
    '["https://pinheirosaltos.com/contact-us"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '0c6c1590-b56d-4119-81de-2bc47c91ae9f',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'address',
    '"EDF paraiso, R. José Fontana f2, 8200-282 Albufeira"'::jsonb,
    '"Rua Jose Fontana, Edf Paraiso da Oura, 8200-282 Albufeira, Algarve, Portugal"'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'baea21b1-96f5-4fef-98c1-add2d410df63',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'website_url',
    'null'::jsonb,
    '"https://www.feelalbufeira.com/"'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'a1f02a82-438a-4dbc-bff3-08aeb7ad6535',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'contact_email',
    'null'::jsonb,
    '"feelalbufeira4@gmail.com"'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'b0805ba0-53b7-41f0-afa4-8c83a53ca755',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/feelalbufeira"'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    'f093f793-e3de-4e0f-9a83-df8185897260',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'instagram_url',
    'null'::jsonb,
    '"https://www.instagram.com/feelalbufeira"'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    'f3415db6-f448-4330-8f66-1d9966619d8f',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'opening_hours',
    'null'::jsonb,
    '{"monday":"11:30-23:59","tuesday":"11:30-23:59","wednesday":"11:30-23:59","thursday":"11:30-23:59","friday":"11:30-23:59","saturday":"11:30-23:59","sunday":"11:30-23:59"}'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '36df0f59-3a8d-4800-be31-cab25983b0b2',
    'b83ad028-7fae-461b-a037-50f2e514369e',
    'cfc44dd8-9f1e-4045-b31b-5b5acf3c0e72',
    'short_description',
    '"Experience refined Indian cuisine at Feel Albufeira Indian Restaurant, a distinguished dining destination in Albufeira, Private Algarve."'::jsonb,
    '"Feel Albufeira Indian Restaurant is an Indian restaurant and bar on Rua Jose Fontana in Albufeira, open daily for Indian cuisine and cocktails."'::jsonb,
    '["https://www.feelalbufeira.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  );
