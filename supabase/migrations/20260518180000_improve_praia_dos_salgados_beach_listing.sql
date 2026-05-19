begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Salgados",
  "slug": "praia-dos-salgados-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Galé / Guia, Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Salgados is a large sandy beach in western Albufeira, beside the Salgados Lagoon and close to Galé. Official sources verify its dune-backed setting, boardwalk access, seasonal services, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia dos Salgados is a broad maritime beach in western Albufeira, close to Galé and the Salgados Lagoon. VisitPortugal describes it as a large beach where Albufeira's usual ochre-cliff scenery gives way to golden dunes, with the lagoon beyond the dune cordon forming an important stopover and nesting area for birdlife.\n\nThe beach has a more open character than many of Albufeira's smaller cliff coves. Visit Albufeira describes Salgados as one of the municipality's broadest and most natural beaches, set on a continuous sandy expanse connecting Galé towards Armação de Pêra. Wooden boardwalks provide organised access to the sand while helping to protect the dune ecosystem.\n\nPraia dos Salgados is also a practical serviced beach. VisitPortugal lists surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard and accessible-beach recognition. ABAAE verifies Salgados as a 2026 Blue Flag coastal beach, and Diário da República lists the 2026 bathing season from 15 May to 15 October.\n\nVisitors should treat the lagoon and dunes as sensitive natural areas, keep to marked paths, avoid disturbing birds and follow local beach flags before swimming or using water-sports services. Internal AlgarveOfficial listings nearby include Praia da Galé, Praia de Armação de Pêra and Praia de São Rafael.",
  "highlights": [
    "Large sandy beach in western Albufeira near Galé",
    "Dune-backed setting beside the Salgados Lagoon",
    "Wooden boardwalk access verified by Visit Albufeira",
    "Outdoor parking, showers, bar, restaurant and rentals listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE"
  ],
  "best_time_to_visit": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main beach-service period, while May, June and September are practical for boardwalk walks, birdwatching and lower heat. Early morning and late afternoon are useful for photography and lagoon views. Check wind, tide and local beach flags before swimming, bodyboarding or using seasonal water-sports services.",
  "parking_info": "VisitPortugal lists outdoor parking for Praia dos Salgados. Current capacity, payment conditions, traffic restrictions and the most convenient access point were not independently verified during this review.",
  "accessibility_info": "VisitPortugal lists Praia dos Salgados as an accessible beach, and Visit Albufeira describes the nearby Salgados boardwalk route as flat and accessible. Current beach-level step-free access, adapted equipment, accessible toilets and assisted-bathing support were not independently verified; visitors with reduced mobility should confirm the most suitable access point before travelling.",
  "lifeguard_info": "Diário da República lists Salgados as a 2026 bathing beach from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "Diário da República qualifies Salgados as a bathing beach for this period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.088391%2C-8.328967",
  "coordinates": {
    "latitude": 37.088391,
    "longitude": -8.328967,
    "source": "ABAAE official Salgados beach entry."
  },
  "latitude": 37.088391,
  "longitude": -8.328967,
  "beach_type": "Large sandy maritime beach with dunes and lagoon backdrop",
  "landscape": "A broad golden-sand beach backed by dunes, boardwalk access and the Salgados Lagoon wetland landscape.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Albufeira verifies wooden boardwalk access to the beach. Current access, parking and beach-level accessibility conditions should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Wooden boardwalk access", "status": "Verified by Visit Albufeira" },
    { "name": "Outdoor parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal / conditions dependent" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bodyboard", "status": "Conditions dependent" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Outdoor parking listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Boardwalk access verified by Visit Albufeira",
    "Bars, restaurants, showers and rentals listed by VisitPortugal"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main beach-service period, while May, June and September are practical for boardwalk walks, birdwatching and lower heat. Early morning and late afternoon are useful for photography and lagoon views. Check wind, tide and local beach flags before swimming, bodyboarding or using seasonal water-sports services.",
    "know_before_you_go": "ABAAE verifies Salgados as a 2026 Blue Flag beach. Diário da República lists the 2026 bathing season from 15 May to 15 October. VisitPortugal lists parking, surveillance, showers, rentals, bar, restaurant, bodyboard and accessible-beach recognition, but current daily staffing, adapted support, parking conditions and concession operation should be checked locally. The lagoon and dunes are sensitive; use marked paths and boardwalks.",
    "notes": [
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September.",
      "Diário da República lists Salgados as a 2026 bathing beach from 15 May to 15 October.",
      "VisitPortugal lists outdoor parking, surveillance, showers, rentals, bar, restaurant, bodyboard and accessible-beach recognition.",
      "Visit Albufeira verifies wooden boardwalk access and Salgados Lagoon birdwatching context.",
      "Current daily lifeguard staffing, adapted equipment, parking payment and access restrictions were not independently verified.",
      "Visitors should avoid entering protected or sensitive lagoon and dune habitats.",
      "Sea and wind conditions can vary; use local flags and signage before entering the water."
    ]
  },
  "important_notes": "ABAAE verifies Salgados as a 2026 Blue Flag beach, with Blue Flag season from 1 July to 30 September. Diário da República lists the 2026 bathing season from 15 May to 15 October. VisitPortugal lists parking, surveillance, showers, rentals, bar, restaurant, bodyboard and accessible-beach recognition. Current parking conditions, daily lifeguard staffing and adapted support should be checked locally.",
  "suitable_for": [
    "Visitors staying in Galé, Salgados or western Albufeira",
    "Beachgoers wanting a large serviced sandy beach",
    "Families using supervised seasonal areas",
    "Long beach walks",
    "Birdwatching around the lagoon",
    "Accessible-beach users, subject to current confirmation",
    "Bodyboarding when conditions are suitable"
  ],
  "not_suitable_for": [
    "Visitors seeking a small cliff cove",
    "Visitors wanting a fully remote beach with no resort influence",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Anyone planning to walk through dunes or disturb lagoon wildlife",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Wide sandy beach days",
    "Boardwalk walks",
    "Birdwatching",
    "Families using supervised seasonal areas",
    "Long beach walks",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia da Galé",
      "type": "Nearby beach",
      "distance": "~1.4 km",
      "description": "A published AlgarveOfficial Albufeira beach listing immediately east of Salgados.",
      "href": "/listing/praia-da-gale-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Armação de Pêra",
      "type": "Nearby beach",
      "distance": "~2.8 km",
      "description": "A published AlgarveOfficial urban beach listing west of Salgados in the municipality of Silves.",
      "href": "/listing/praia-de-armacao-de-pera-silves",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de São Rafael",
      "type": "Nearby beach",
      "distance": "~4.5 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of the Galé and Salgados area.",
      "href": "/listing/praia-de-sao-rafael-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Senhora da Rocha",
      "type": "Nearby beach",
      "distance": "~5.1 km",
      "description": "A published AlgarveOfficial cliff-cove listing west of Armação de Pêra in nearby Lagoa.",
      "href": "/listing/praia-da-senhora-da-rocha-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Vila Joya Sea",
      "type": "Restaurant",
      "distance": "~1.6 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Salgados, based on stored listing coordinates.",
      "href": "/listing/vila-joya-sea-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Restaurante São Domingos, Galé, Albufeira",
      "type": "Restaurant",
      "distance": "~1.7 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Salgados, based on stored listing coordinates.",
      "href": "/listing/restaurante-sao-domingos-gale-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "A Casa do Avô",
      "type": "Restaurant",
      "distance": "~2.4 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Salgados, based on stored listing coordinates.",
      "href": "/listing/a-casa-do-avo-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Paper Moon Algarve",
      "type": "Restaurant",
      "distance": "~2.7 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Salgados, based on stored listing coordinates.",
      "href": "/listing/paper-moon-algarve-albufeira",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Salgados Golf Course",
      "type": "Golf",
      "distance": "~0.7 km",
      "description": "Published AlgarveOfficial golf listing close to Praia dos Salgados, based on stored listing coordinates.",
      "href": "/listing/salgados-golf-course",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Surf School - Albufeira Surf & Sup",
      "type": "Experience",
      "distance": "~1.4 km",
      "description": "Published AlgarveOfficial experience listing near Praia dos Salgados, based on stored listing coordinates.",
      "href": "/listing/albufeira-surf-sup-albufeira",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Dolphin Emotions by Zoomarine",
      "type": "Family attraction",
      "distance": "~4.4 km",
      "description": "Published AlgarveOfficial family-attraction listing inland from the Salgados and Galé coast.",
      "href": "/listing/dolphin-emotions-by-zoomarine-almancil",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Zoomarine Algarve, Portugal",
      "type": "Family attraction",
      "distance": "~4.5 km",
      "description": "Published AlgarveOfficial family-attraction listing inland from the Salgados and Galé coast.",
      "href": "/listing/zoomarine-algarve-portugal-almancil",
      "verification_status": "Verified internal listing"
    }
  ],
  "walking_trails_nearby": [
    {
      "name": "Passadiços dos Salgados",
      "description": "Visit Albufeira describes the Salgados boardwalk as a flat, accessible wooden route beside the lagoon and suitable for walking, family outings, jogging and birdwatching.",
      "verification_status": "Verified"
    },
    {
      "name": "Salgados to Galé shoreline walk",
      "description": "A long sandy shoreline walk from Salgados towards Galé, best planned according to tide, wind and beach conditions.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Use boardwalks and marked paths to protect the dunes and lagoon habitats.",
    "Bring binoculars if you plan to watch birds around the lagoon.",
    "Arrive earlier in July and August for easier access to parking and serviced areas.",
    "Confirm accessibility support before travelling if adapted equipment or assistance is required.",
    "Check local flags before swimming, bodyboarding or using water-sports services.",
    "Use internal AlgarveOfficial nearby cards for restaurants, attractions and beaches rather than external competitor links."
  ],
  "photography_notes": "Praia dos Salgados is strong for wide beach, dune, lagoon and boardwalk photography. Early morning and late afternoon are usually most practical for softer light and birdwatching around the lagoon.",
  "family_notes": "Praia dos Salgados can suit families because of its wide sand, boardwalk access and official beach services. Families should still choose supervised seasonal areas, check flags and keep children away from sensitive lagoon and dune areas.",
  "safety_notes": "Sea and wind conditions can vary. Follow local flags, signage and instructions from beach surveillance where present. Use marked access paths and avoid entering lagoon or dune areas where access is not permitted.",
  "accessibility_notes": "VisitPortugal lists Praia dos Salgados as an accessible beach, and Visit Albufeira describes the nearby boardwalk route as flat and accessible. Current beach-level route details, adapted equipment, toilets and assisted bathing were not independently verified.",
  "faq_items": [
    {
      "question": "Where is Praia dos Salgados?",
      "answer": "Praia dos Salgados is in western Albufeira, close to Galé and beside the Salgados Lagoon on the central Algarve coast."
    },
    {
      "question": "Is Praia dos Salgados a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Salgados as a 2026 Blue Flag coastal beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Are there lifeguards at Praia dos Salgados?",
      "answer": "Diário da República lists Salgados as a 2026 bathing beach from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified."
    },
    {
      "question": "Is there parking at Praia dos Salgados?",
      "answer": "VisitPortugal lists outdoor parking for Praia dos Salgados. Current capacity, payment conditions and access restrictions were not independently verified."
    },
    {
      "question": "Is Praia dos Salgados accessible?",
      "answer": "VisitPortugal lists Praia dos Salgados as an accessible beach, and Visit Albufeira describes the nearby Salgados boardwalk as flat and accessible. Current beach-level support should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia dos Salgados?",
      "answer": "Yes. VisitPortugal lists a bar and restaurant for the beach, and AlgarveOfficial shows nearby published restaurant listings using internal listing links."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia da Galé, Praia de Armação de Pêra, Praia de São Rafael and Praia da Senhora da Rocha."
    },
    {
      "question": "What is the best time to visit Praia dos Salgados?",
      "answer": "The official 2026 bathing season runs from 15 May to 15 October. May, June and September are practical for boardwalk walks, birdwatching and lower heat."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained after visual inspection on 18 May 2026. Alt text updated for both available images.",
    "duplicate_check": "No duplicate canonical image filenames or visually repeated gallery images were found during this review."
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Salgados",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/797744A0-B4AA-4226-B8D8-D08A50048050",
      "facts_verified": [
        "Beach name and maritime beach classification",
        "Location in Albufeira",
        "Large beach area",
        "Golden dune backdrop and Salgados Lagoon context",
        "Migrating bird and protected species context",
        "Water-sports, surfing and bodyboarding context",
        "Facilities including Blue Flag, security or surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Salgados Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-dos-salgados",
      "facts_verified": [
        "Salgados Beach as one of Albufeira's broadest and most natural beaches",
        "Continuous sandy expanse connecting Galé to Armação de Pêra",
        "Location beside Salgados Lagoon",
        "Birdlife and biodiversity context",
        "Wooden boardwalk access protecting the dune ecosystem"
      ]
    },
    {
      "source_name": "Visit Albufeira - Passadiços dos Salgados",
      "source_url": "https://visitalbufeira.pt/experiencias/passadicos-dos-salgados/",
      "facts_verified": [
        "Passadiços dos Salgados as a walking route",
        "Location next to Salgados Lagoon",
        "Wooden boardwalk across a protected wetland area",
        "Flat and accessible path",
        "Suitability for walks, family outings, jogging and birdwatching"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Salgados",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/salgados/",
      "facts_verified": [
        "Official Salgados coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.088391, -8.328967",
        "Beach code PTCF2J",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Blue Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Salgados listed among Albufeira's 2026 Blue Flag locations",
        "Nearby Albufeira Blue Flag locations including Galé-Leste, Galé-Oeste and São Rafael"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria n.º 204-A/2026/1",
      "source_url": "https://files.diariodarepublica.pt/1s/2026/04/08401/0000200039.pdf",
      "facts_verified": [
        "Salgados bathing water code PTCF2J",
        "Official 2026 bathing season from 15 May to 15 October",
        "Salgados listed in Albufeira, Algarve"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "https://algarveofficial.com/listing/praia-dos-salgados-albufeira",
      "facts_verified": [
        "Nearby beach, restaurant and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026",
        "Approximate nearby distances calculated from internal listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, large sandy beach, dune and lagoon setting, boardwalk access, listed facilities, coordinates and 2026 Blue Flag status were verified from official tourism, ABAAE and Diario da Republica sources.",
    "ABAAE verifies Salgados' 2026 bathing season as 15 May 2026 to 15 October 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time checked on 18 May 2026, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "VisitPortugal lists accessible-beach recognition, but current route details, adapted equipment, toilets and assisted bathing were not independently verified.",
    "Parking is verified only at the level that VisitPortugal lists outdoor parking. Payment, capacity and current restrictions were not independently verified.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listings.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-dos-salgados-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-dos-salgados-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.088391,
         longitude = -8.328967,
         meta_title = 'Praia dos Salgados, Albufeira | Beach Guide',
         meta_description = 'Praia dos Salgados in Albufeira is a large dune-backed beach by Salgados Lagoon, with boardwalk access, services and 2026 Blue Flag status.',
         category_data = coalesce(category_data, '{}'::jsonb)
           || v_patch
           || jsonb_build_object(
             'localized_content',
             coalesce(category_data->'localized_content', '{}'::jsonb)
             || jsonb_build_object('en', v_patch)
           ),
         updated_at = now()
   where id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia dos Salgados shoreline at the lagoon outlet'
   where id = '21c969cd-ba39-4e70-b6c8-586184bacd84'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia dos Salgados wide sandy beach at golden-hour light'
   where id = 'cc2c23ba-338f-4592-abae-ed54b0c0391b'
     and listing_id = v_listing_id;
end $$;

commit;
