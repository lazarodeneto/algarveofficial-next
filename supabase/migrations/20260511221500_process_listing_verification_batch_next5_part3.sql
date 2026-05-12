-- Verification batch: 2026-05-11-next-5-part-3
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
    '42dd05ee-0f5c-4888-9eb0-cadc5ce9a863',
    'ebff68db-ca26-4fab-8f59-23968c7c1227',
    'listing-verification-20260511-next-5-part-3',
    'completed_with_proposals',
    $json${
      "name": "Paul McGinley Golf Academy",
      "slug": "paul-mcginley-golf-academy-quinta-do-lago",
      "status": "draft",
      "category": "Concierge Services",
      "city": "Quinta do Lago",
      "address": "Quinta do Lago Driving Range, Av. André Jordan (Roundabout 4), 8135-026 Almancil, Portugal",
      "website_url": "https://www.quintadolago.com/en/golf/academy/",
      "contact_phone": "+351289394368",
      "contact_email": "academy@quintadolago.com",
      "facebook_url": "https://www.facebook.com/QuintaDoLagoResort",
      "instagram_url": "https://www.instagram.com/quintadolago/",
      "short_description": "Elite golf coaching and performance analysis at Quinta do Lago, home to the world’s only Paul McGinley Academy and the TaylorMade Performance Centre."
    }$json$::jsonb,
    $json${
      "category_id": "85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9",
      "category": "Golf",
      "contact_phone": "+351 289 394 368",
      "short_description": "Paul McGinley Golf Academy is the Quinta do Lago golf academy at the driving range, offering coaching, TrackMan analysis and performance programmes."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.quintadolago.com/en/golf/academy/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official academy page identifies the Paul McGinley Academy and Quinta do Lago golf academy context.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.quintadolago.com/en/resort/resort-map/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official resort map lists Paul McGinley Academy at Quinta do Lago Driving Range with phone +351 289 394 368 and academy@quintadolago.com.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.quintadolago.com/en/events/golf-school-quinta-do-lago/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official event page confirms Paul McGinley Academy as the golf school location and academy contact email.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    86,
    'high',
    $$Official Quinta do Lago sources confirm this is a golf academy. Category is proposed for admin review because category changes affect taxonomy and navigation.$$,
    true
  ),
  (
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    'listing-verification-20260511-next-5-part-3',
    'completed_with_proposals',
    $json${
      "name": "Amendoeira Academy Course",
      "slug": "amendoeira-academy-course-lagoa",
      "status": "published",
      "category": "Concierge Services",
      "city": "Lagoa",
      "address": "Amendoeira Golf Resort, Morgado da Lameira, 8365-006 Alcantarilha, Portugal",
      "website_url": "https://www.amendoeiraresort.com/en/golf/",
      "contact_phone": null,
      "contact_email": null,
      "facebook_url": null,
      "instagram_url": "https://www.instagram.com/amendoeiragolf/",
      "short_description": "Floodlit 9-hole par-3 academy course at Amendoeira Golf Resort—ideal for beginners and short-game practice."
    }$json$::jsonb,
    $json${
      "category_id": "85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9",
      "category": "Golf",
      "contact_phone": "+351 282 320 671",
      "contact_email": "reservations@amendoeiraresort.com",
      "facebook_url": "https://www.facebook.com/AmendoeiraGolf",
      "youtube_url": "https://www.youtube.com/@amendoeiragolfresort8886"
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.amendoeiraresort.com/en/golf/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official Amendoeira Golf page confirms the Pitch & Putt Academy Course, floodlit 9-hole golf course, contact phone/email and official social links.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.amendoeiraresort.com/en/contact/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official contact route is linked from the golf page and supports resort contact context.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://amendoeira.golfmanager.com/consumer/portal",
        "source_type": "official_booking_link",
        "confidence": "medium",
        "notes": "Official booking link is exposed by the Amendoeira golf page.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    88,
    'high',
    $$Official Amendoeira source confirms the listing is a golf academy course. Contact and social proposals use only links found on the official golf page.$$,
    true
  ),
  (
    'c34b4e06-6a8f-4ae9-abb3-4fb798ebfe37',
    '776106b4-f576-4ee3-af22-17f2b4a1902e',
    'listing-verification-20260511-next-5-part-3',
    'completed_with_proposals',
    $json${
      "name": "The Els Club Vilamoura",
      "slug": "the-els-club-vilamoura",
      "status": "published",
      "category": "Golf",
      "city": "Vilamoura",
      "address": "Vilamoura, Loulé, Algarve",
      "website_url": "https://www.elsclubvilamoura.com/",
      "contact_phone": "+351289310333",
      "contact_email": "info@elsclubvilamoura.com",
      "facebook_url": "https://www.facebook.com/theelsclubvilamoura/",
      "instagram_url": "https://www.instagram.com/theelsclubvilamoura/",
      "linkedin_url": "https://pt.linkedin.com/company/the-els-club-vilamoura",
      "short_description": "Private 18-hole golf club in Vilamoura, redesigned from the Victoria Course with Ernie Els’ design vision and Algarve setting."
    }$json$::jsonb,
    $json${
      "address": "Caminho da Fonte do Ulme, Vilamoura, Portugal"
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.elsclubvilamoura.com/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official site confirms The Els Club Vilamoura, 18-hole championship course, info@elsclubvilamoura.com and address Caminho da Fonte do Ulme, Vilamoura, Portugal.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.portugalinvitational.com/the-els-club/",
        "source_type": "official_event_venue_reference",
        "confidence": "medium",
        "notes": "Official Portugal Invitational venue page supports the Els Club Vilamoura identity and golf facilities.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.pgatour.com/pt/pgatour-champions/tournaments/2026/portugal-invitational/S2026060/overview",
        "source_type": "official_sports_body",
        "confidence": "medium",
        "notes": "PGA TOUR page supports The Els Club Vilamoura as an Algarve tournament venue.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    82,
    'high',
    $$Core fields are mostly correct. Only the generic address is proposed for replacement with the official site address.$$,
    true
  ),
  (
    '51a7ad36-9974-43ee-bf01-9dffed1884a9',
    '1ac08644-4707-48d3-8cb8-32e0f5237ec5',
    'listing-verification-20260511-next-5-part-3',
    'completed_with_proposals',
    $json${
      "name": "Golf Clubs Rental Algarve",
      "slug": "golf-clubs-rental-algarve-lagos",
      "status": "published",
      "category": "Concierge Services",
      "city": "Lagos",
      "address": "Rua José Ferreira Canelas, Loja 11, 8600-744 Lagos, Portugal",
      "website_url": "https://www.golfclubsrentalalgarve.com/",
      "contact_phone": "+351 918 027 832",
      "contact_email": "info@lagosgolfshop.com",
      "facebook_url": "https://www.facebook.com/GolfClubsRentalAlgarve/",
      "instagram_url": "https://www.instagram.com/golfclubsrentalalgarve/",
      "short_description": "Premium golf club hire and equipment rental in Lagos with free delivery across the western Algarve — travel light and play top-quality sets on arrival."
    }$json$::jsonb,
    $json${
      "category_id": "85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9",
      "category": "Golf",
      "short_description": "Golf Clubs Rental Algarve is a Lagos-based golf equipment rental and Lagos Golf Shop service offering club hire, trolley rental and delivery across the Algarve."
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.golfclubsrentalalgarve.com/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official site confirms name, golf club hire and trolley rental services, Lagos Golf Shop, address, mobile and email.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://maps.app.goo.gl/rT1CDAEe2EXkstxY6",
        "source_type": "official_map_link",
        "confidence": "medium",
        "notes": "Official site links this Google Maps location.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.facebook.com/GolfClubsRentalAlgarve/",
        "source_type": "verified_branch_social_profile",
        "confidence": "medium",
        "notes": "Existing profile matches the business name; the official website did not expose social links during this check.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    78,
    'medium',
    $$Official site confirms a golf equipment rental business, so Golf is a better app category than Concierge Services. Social links were not changed because the official page did not link them.$$,
    true
  ),
  (
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    'listing-verification-20260511-next-5-part-3',
    'completed_with_proposals',
    $json${
      "name": "Residence Golf Club by Garvetur",
      "slug": "residence-golf-club-by-garvetur-vilamoura",
      "status": "published",
      "category": "Concierge Services",
      "city": "Vilamoura",
      "address": "Rua Clube de Tiro, Condomínio Residence Golf Club, 8125-428 Vilamoura, Portugal",
      "website_url": "https://www.garveturholidays.com/residencegolf/en/",
      "contact_phone": "+351 289 389 998",
      "contact_email": "vil.algardia@garvetur.pt",
      "facebook_url": "https://www.facebook.com/residencegolfclub/",
      "instagram_url": "https://www.instagram.com/garveturholidays/",
      "short_description": "Serviced apartments in a quiet Vilamoura setting, close to golf, with pool access, gardens, and easy reach of the marina and beaches."
    }$json$::jsonb,
    $json${
      "category_id": "f3feff9a-000d-434f-9042-1280fc0de4ed",
      "category": "Accommodation",
      "address": "Receção Garvetur - Praça Cupertino de Miranda, Algardia Marina Parque Vilamoura, Vilamoura, 8125-403, Portugal",
      "facebook_url": "https://www.facebook.com/garvetur.holiday/",
      "linkedin_url": "https://www.linkedin.com/company/garvetur-sa/",
      "youtube_url": "https://www.youtube.com/garvetur1995"
    }$json$::jsonb,
    '{}'::jsonb,
    $json$[
      {
        "url": "https://www.garveturholidays.com/residencegolf/en/",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official site confirms Residence Golf Club by Garvetur, accommodation/apartment positioning, phone and footer social links.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.garveturholidays.com/residencegolf/en/contact-us",
        "source_type": "official_website",
        "confidence": "high",
        "notes": "Official contact page confirms Garvetur reception address, phone, reservation phone and email.",
        "checked_at": "2026-05-11"
      },
      {
        "url": "https://www.garveturholidays.com/residencegolf/en/location",
        "source_type": "official_website",
        "confidence": "medium",
        "notes": "Official location route is part of the same property site and supports Vilamoura location context.",
        "checked_at": "2026-05-11"
      }
    ]$json$::jsonb,
    80,
    'high',
    $$Official Garvetur pages describe this as serviced accommodation, not concierge services. Address proposal uses the official Garvetur reception address, so admin should confirm whether the listing should store reception or property address.$$,
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
    '8ea2bbea-7f4a-4781-a53f-8ad7611f0640',
    'ebff68db-ca26-4fab-8f59-23968c7c1227',
    '42dd05ee-0f5c-4888-9eb0-cadc5ce9a863',
    'category_id',
    '"78f9428d-d33e-4513-ac3e-415f36254845"'::jsonb,
    '"85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9"'::jsonb,
    '["https://www.quintadolago.com/en/golf/academy/","https://www.quintadolago.com/en/resort/resort-map/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '41d01105-584e-474d-9a86-74f2f788fa33',
    'ebff68db-ca26-4fab-8f59-23968c7c1227',
    '42dd05ee-0f5c-4888-9eb0-cadc5ce9a863',
    'category',
    '"Concierge Services"'::jsonb,
    '"Golf"'::jsonb,
    '["https://www.quintadolago.com/en/golf/academy/","https://www.quintadolago.com/en/resort/resort-map/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '127ba1c0-ad88-44ac-bc76-8a17112f2bcf',
    'ebff68db-ca26-4fab-8f59-23968c7c1227',
    '42dd05ee-0f5c-4888-9eb0-cadc5ce9a863',
    'contact_phone',
    '"+351289394368"'::jsonb,
    '"+351 289 394 368"'::jsonb,
    '["https://www.quintadolago.com/en/resort/resort-map/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'fbbfa9eb-c8b3-4b0e-a378-3c1edc9c8918',
    'ebff68db-ca26-4fab-8f59-23968c7c1227',
    '42dd05ee-0f5c-4888-9eb0-cadc5ce9a863',
    'short_description',
    '"Elite golf coaching and performance analysis at Quinta do Lago, home to the world’s only Paul McGinley Academy and the TaylorMade Performance Centre."'::jsonb,
    '"Paul McGinley Golf Academy is the Quinta do Lago golf academy at the driving range, offering coaching, TrackMan analysis and performance programmes."'::jsonb,
    '["https://www.quintadolago.com/en/golf/academy/","https://www.quintadolago.com/en/events/golf-school-quinta-do-lago/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'deb7cd49-488e-48a0-a060-233b38d21a8a',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'category_id',
    '"78f9428d-d33e-4513-ac3e-415f36254845"'::jsonb,
    '"85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9"'::jsonb,
    '["https://www.amendoeiraresort.com/en/golf/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '74bf9e66-6abf-420c-a82f-31c99b1ab086',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'category',
    '"Concierge Services"'::jsonb,
    '"Golf"'::jsonb,
    '["https://www.amendoeiraresort.com/en/golf/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    'a209e075-6700-44e2-8a49-a4564e77b01b',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'contact_phone',
    'null'::jsonb,
    '"+351 282 320 671"'::jsonb,
    '["https://www.amendoeiraresort.com/en/golf/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '9e117e38-e9c9-4242-8b72-dae9f8e920ac',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'contact_email',
    'null'::jsonb,
    '"reservations@amendoeiraresort.com"'::jsonb,
    '["https://www.amendoeiraresort.com/en/golf/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '9492eeea-d915-4fdb-a12b-7818949252da',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'facebook_url',
    'null'::jsonb,
    '"https://www.facebook.com/AmendoeiraGolf"'::jsonb,
    '["https://www.amendoeiraresort.com/en/golf/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    '842d9fb7-1eaf-4bac-bfe8-7cafdbba6dc1',
    'e1a11a66-9664-4795-affa-d443aef813cb',
    '0a085bba-a09b-4cb3-82ec-f5024b1b12d6',
    'youtube_url',
    'null'::jsonb,
    '"https://www.youtube.com/@amendoeiragolfresort8886"'::jsonb,
    '["https://www.amendoeiraresort.com/en/golf/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    'ae443d6f-7b64-4489-897c-69046c427d35',
    '776106b4-f576-4ee3-af22-17f2b4a1902e',
    'c34b4e06-6a8f-4ae9-abb3-4fb798ebfe37',
    'address',
    '"Vilamoura, Loulé, Algarve"'::jsonb,
    '"Caminho da Fonte do Ulme, Vilamoura, Portugal"'::jsonb,
    '["https://www.elsclubvilamoura.com/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '34b2cbf9-0260-490b-aae4-eddb6d574fbb',
    '1ac08644-4707-48d3-8cb8-32e0f5237ec5',
    '51a7ad36-9974-43ee-bf01-9dffed1884a9',
    'category_id',
    '"78f9428d-d33e-4513-ac3e-415f36254845"'::jsonb,
    '"85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9"'::jsonb,
    '["https://www.golfclubsrentalalgarve.com/"]'::jsonb,
    'official_website',
    'medium',
    'pending'
  ),
  (
    'e77ddd2d-f9c6-4e84-9604-836a0323e011',
    '1ac08644-4707-48d3-8cb8-32e0f5237ec5',
    '51a7ad36-9974-43ee-bf01-9dffed1884a9',
    'category',
    '"Concierge Services"'::jsonb,
    '"Golf"'::jsonb,
    '["https://www.golfclubsrentalalgarve.com/"]'::jsonb,
    'official_website',
    'medium',
    'pending'
  ),
  (
    'ac548568-6a74-4362-be08-7eeedfbfea5d',
    '1ac08644-4707-48d3-8cb8-32e0f5237ec5',
    '51a7ad36-9974-43ee-bf01-9dffed1884a9',
    'short_description',
    '"Premium golf club hire and equipment rental in Lagos with free delivery across the western Algarve — travel light and play top-quality sets on arrival."'::jsonb,
    '"Golf Clubs Rental Algarve is a Lagos-based golf equipment rental and Lagos Golf Shop service offering club hire, trolley rental and delivery across the Algarve."'::jsonb,
    '["https://www.golfclubsrentalalgarve.com/"]'::jsonb,
    'official_website',
    'medium',
    'pending'
  ),
  (
    'ec9c0810-db27-49e4-aaf6-dfcaa14b8a96',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    'category_id',
    '"78f9428d-d33e-4513-ac3e-415f36254845"'::jsonb,
    '"f3feff9a-000d-434f-9042-1280fc0de4ed"'::jsonb,
    '["https://www.garveturholidays.com/residencegolf/en/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '4c8eb58e-4adf-4be2-8f10-dd21b70e17df',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    'category',
    '"Concierge Services"'::jsonb,
    '"Accommodation"'::jsonb,
    '["https://www.garveturholidays.com/residencegolf/en/"]'::jsonb,
    'official_website',
    'high',
    'pending'
  ),
  (
    '9b1931fc-c0f2-443d-8c06-96616ee89b1c',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    'address',
    '"Rua Clube de Tiro, Condomínio Residence Golf Club, 8125-428 Vilamoura, Portugal"'::jsonb,
    '"Receção Garvetur - Praça Cupertino de Miranda, Algardia Marina Parque Vilamoura, Vilamoura, 8125-403, Portugal"'::jsonb,
    '["https://www.garveturholidays.com/residencegolf/en/contact-us"]'::jsonb,
    'official_website',
    'medium',
    'pending'
  ),
  (
    '8b4b93d2-fa23-4570-99c9-8d48fac8306c',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    'facebook_url',
    '"https://www.facebook.com/residencegolfclub/"'::jsonb,
    '"https://www.facebook.com/garvetur.holiday/"'::jsonb,
    '["https://www.garveturholidays.com/residencegolf/en/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    '7023a260-e7bb-41e1-84bc-23a8b56dfb51',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    'linkedin_url',
    'null'::jsonb,
    '"https://www.linkedin.com/company/garvetur-sa/"'::jsonb,
    '["https://www.garveturholidays.com/residencegolf/en/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  ),
  (
    '1aba06db-c2d5-4586-b61e-72ae8cc59dbc',
    '2cc1e465-5dae-47aa-9a1e-30e292561069',
    '2f4b35d0-2456-4b01-a364-a783c6a497cf',
    'youtube_url',
    'null'::jsonb,
    '"https://www.youtube.com/garvetur1995"'::jsonb,
    '["https://www.garveturholidays.com/residencegolf/en/"]'::jsonb,
    'official_website_social_link',
    'high',
    'pending'
  );
