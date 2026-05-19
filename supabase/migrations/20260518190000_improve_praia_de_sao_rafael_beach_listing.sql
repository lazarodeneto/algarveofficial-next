begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de São Rafael",
  "slug": "praia-de-sao-rafael-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de São Rafael is a scenic cliff-backed beach west of Albufeira, known for limestone cliffs, isolated rock formations, seasonal beach support and verified 2026 Blue Flag status.",
  "full_description": "Praia de São Rafael is a maritime beach in the municipality of Albufeira, set west of the city centre along the Sesmarias side of the coast. VisitPortugal describes the beach as sitting between cliffs, with isolated rocks on the sand and in the sea, creating one of the more distinctive rock-framed beach settings close to Albufeira.\n\nThe beach has a compact but varied character. Visit Albufeira describes golden and ochre limestone formations, natural rock outcrops, small coves and sheltered corners, with stairway access from the cliff-top area. This makes São Rafael more scenic and enclosed than the broader sandy beaches at Galé or Salgados, while still remaining close to the city, marina area and western Albufeira accommodation zones.\n\nOfficial sources verify practical beach support. VisitPortugal lists Blue Flag recognition, safety or surveillance, sunshade rental, showers, parking, bar and restaurant. ABAAE verifies S. Rafael as a 2026 Blue Flag coastal beach, with the 2026 bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September.\n\nVisitors should still plan around stairs, cliffs and seasonal operation. Step-free beach access and assisted-bathing support were not verified during this review. Check local flags before swimming, keep away from cliff bases and rockfall-prone areas, and use the internal AlgarveOfficial nearby cards for already-published beaches, restaurants and experiences in the surrounding Albufeira area.",
  "highlights": [
    "Cliff-backed beach west of Albufeira in the Sesmarias coastal area",
    "Limestone cliffs, isolated sea rocks and natural rock outcrops verified by official tourism sources",
    "Bar, restaurant, showers, parking and sunshade rental listed by VisitPortugal",
    "Stairway access from the cliff-top area described by Visit Albufeira",
    "2026 Blue Flag status verified by ABAAE",
    "Internal nearby cards link only to published AlgarveOfficial listings"
  ],
  "best_time_to_visit": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for milder temperatures and easier access planning. Early morning and late afternoon are useful for softer light on the limestone cliffs and rock formations. Check tide, wind, beach flags and local signage before swimming or exploring around rocks.",
  "parking_info": "VisitPortugal lists parking for Praia de São Rafael. The exact capacity, payment rules, current restrictions and walking distance from the parking area to the sand were not independently verified during this review. Visitors should expect beach access to involve the cliff-top/stairway context described by Visit Albufeira.",
  "accessibility_info": "Step-free access was not verified. Visit Albufeira describes stairway access from the cliff-top area, so Praia de São Rafael may be unsuitable for visitors who cannot manage steps unless current local access support or an alternative route is confirmed before travelling. Accessible toilets, adapted equipment and assisted bathing were not verified.",
  "lifeguard_info": "Diário da República and ABAAE list the 2026 bathing season for São Rafael / S. Rafael from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "Diário da República and ABAAE list São Rafael / S. Rafael for this bathing-season period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.074868%2C-8.280752",
  "coordinates": {
    "latitude": 37.074868,
    "longitude": -8.280752,
    "source": "ABAAE official S. Rafael beach entry."
  },
  "latitude": 37.074868,
  "longitude": -8.280752,
  "beach_code": "PTCU7F",
  "beach_type": "Cliff-backed maritime sandy beach",
  "landscape": "A sandy beach framed by golden and ochre limestone cliffs, isolated rocks, natural outcrops, small coves and sea-facing rock formations.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Albufeira describes stairway access from the cliff-top area. Current parking, access restrictions and beach-level accessibility should be checked locally before travelling.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Lifeguard supervision listed by Visit Albufeira", "status": "Seasonal / verify locally" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Stairway access from cliff-top area", "status": "Verified by Visit Albufeira" },
    { "name": "Step-free access", "status": "Not verified" },
    { "name": "Accessible beach equipment", "status": "Not verified" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "2026 bathing season verified by Diário da República and ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Bar, restaurant, showers and sunshade rental listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for milder temperatures and easier access planning. Early morning and late afternoon are useful for softer light on the limestone cliffs and rock formations.",
    "know_before_you_go": "ABAAE verifies S. Rafael as a 2026 Blue Flag beach. VisitPortugal lists parking, surveillance, showers, sunshade rental, bar and restaurant, but current daily staffing, concession operation, parking rules and accessibility support should be checked locally. Visit Albufeira describes stairway access from the cliff-top area.",
    "notes": [
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September.",
      "Diário da República and ABAAE list the 2026 bathing season as 15 May to 15 October.",
      "VisitPortugal lists parking, surveillance, showers, sunshade rental, bar and restaurant.",
      "Step-free access, accessible toilets, adapted equipment and assisted bathing were not verified.",
      "Visit Albufeira describes stairway access from the cliff-top area.",
      "Visitors should keep away from cliff bases and unstable rock areas.",
      "Sea conditions can vary; use local flags and signage before entering the water."
    ]
  },
  "important_notes": "ABAAE verifies S. Rafael as a 2026 Blue Flag beach, and Diário da República lists São Rafael for the 2026 bathing season from 15 May to 15 October. VisitPortugal lists parking, surveillance, showers, sunshade rental, bar and restaurant. Step-free access and assisted-bathing support were not verified.",
  "suitable_for": [
    "Visitors staying in Albufeira, Sesmarias or western Albufeira",
    "Beachgoers looking for limestone cliff scenery",
    "Photography around rock formations",
    "Couples and adults comfortable with stair access",
    "Families using supervised seasonal areas and checking local conditions",
    "Visitors combining the beach with nearby internal AlgarveOfficial restaurant or experience listings"
  ],
  "not_suitable_for": [
    "Visitors requiring confirmed step-free access to the sand",
    "Visitors requiring assisted-bathing support without confirming current arrangements",
    "Anyone planning to sit below cliff faces or climb unstable rocks",
    "Visitors expecting a large open sandy beach like Galé or Salgados",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Cliff and rock scenery",
    "Photography",
    "Short beach visits near Albufeira",
    "Couples",
    "Families using supervised seasonal areas",
    "Restaurants nearby, where internally listed"
  ],
  "nearby_beaches": [
    {
      "name": "Praia dos Pescadores",
      "type": "Nearby internal beach listing",
      "distance": "~3.0 km",
      "description": "A published AlgarveOfficial central Albufeira beach listing, linked internally from this page.",
      "href": "/listing/praia-dos-pescadores-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia do Peneco",
      "type": "Nearby internal beach listing",
      "distance": "~3.0 km",
      "description": "A published AlgarveOfficial old-town beach listing below central Albufeira, linked internally from this page.",
      "href": "/listing/praia-do-peneco-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Galé",
      "type": "Nearby internal beach listing",
      "distance": "~3.2 km",
      "description": "A published AlgarveOfficial western Albufeira beach listing, linked internally from this page.",
      "href": "/listing/praia-da-gale-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Salgados",
      "type": "Nearby internal beach listing",
      "distance": "~4.5 km",
      "description": "A published AlgarveOfficial beach listing near the Salgados Lagoon, linked internally from this page.",
      "href": "/listing/praia-dos-salgados-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Oura",
      "type": "Nearby internal beach listing",
      "distance": "~5.0 km",
      "description": "A published AlgarveOfficial Albufeira resort beach listing, linked internally from this page.",
      "href": "/listing/praia-da-oura-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Restaurante O´pescatore",
      "type": "Restaurant",
      "distance": "~0.9 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de São Rafael, based on stored listing coordinates.",
      "href": "/listing/restaurante-opescatore-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "O Marinheiro",
      "type": "Restaurant",
      "distance": "~1.1 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de São Rafael, based on stored listing coordinates.",
      "href": "/listing/o-marinheiro-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Viva La Ciccia - Steakhouse & Pasta",
      "type": "Restaurant",
      "distance": "~1.4 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de São Rafael, based on stored listing coordinates.",
      "href": "/listing/viva-la-ciccia-steakhouse-pasta-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Odessa Sushi Restaurant",
      "type": "Restaurant",
      "distance": "~1.5 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de São Rafael, based on stored listing coordinates.",
      "href": "/listing/odessa-sushi-restaurant-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "X Ride Algarve",
      "type": "Experience",
      "distance": "~1.7 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/x-ride-algarve-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarexperience",
      "type": "Experience",
      "distance": "~1.7 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/algarexperience-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarve Charters",
      "type": "Experience",
      "distance": "~1.8 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/algarve-charters-quinta-do-lago",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Surf School - Albufeira Surf & Sup",
      "type": "Experience",
      "distance": "~3.2 km",
      "description": "Published AlgarveOfficial experience listing near the western Albufeira coast, based on stored listing coordinates.",
      "href": "/listing/albufeira-surf-sup-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Sesmarias",
    "Galé",
    "Guia"
  ],
  "walking_trails_nearby": [
    {
      "name": "Local São Rafael cliff-top access paths",
      "description": "The beach is reached from the cliff-top access area described by Visit Albufeira. Any coastal walking beyond the formal access should be checked locally for safety, signage and cliff restrictions.",
      "verification_status": "Limited verification"
    }
  ],
  "visitor_tips": [
    "Use local signage and beach flags before swimming.",
    "Confirm current parking and access conditions before planning a full beach day.",
    "Expect stairway access from the cliff-top area unless a current alternative is confirmed locally.",
    "Keep away from cliff bases, overhangs and unstable rock areas.",
    "Use the internal nearby cards for published AlgarveOfficial beaches, restaurants and experiences around Albufeira.",
    "Visit earlier or later in the day for softer light on the limestone formations."
  ],
  "photography_notes": "Praia de São Rafael photographs well for limestone cliffs, isolated rock formations, small coves and cliff-framed sea views. Early morning and late afternoon usually give softer light, but visitors should stay clear of cliff edges, overhangs and unstable rocks.",
  "family_notes": "São Rafael can work for families who are comfortable with stair access and who use supervised seasonal areas. Parents should check flags, watch children around rocks and waves, and avoid cliff bases or narrow corners where local signs warn of danger.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Keep a safe distance from cliff bases, cliff edges, overhangs and isolated rocks, especially after rain, wind or visible erosion.",
  "accessibility_notes": "Step-free access, adapted equipment, accessible toilets and assisted bathing were not verified. Because Visit Albufeira describes stairway access from the cliff-top area, visitors with reduced mobility should confirm current local conditions before travelling.",
  "gallery_notes": {
    "status": "Existing Supabase-hosted listing images retained; no new external images added.",
    "duplicates_checked": true,
    "duplicate_images_found": false,
    "rights_note": "Image source and licence were not independently re-verified during this content update; no scraped or hotlinked images were added."
  },
  "weather_widget": {
    "enabled": true,
    "source": "Uses listing latitude and longitude in the existing AlgarveOfficial weather component.",
    "fallback": "Weather currently unavailable."
  },
  "faq_items": [
    {
      "question": "Where is Praia de São Rafael?",
      "answer": "Praia de São Rafael is in the municipality of Albufeira, west of the city centre in the Sesmarias coastal area. ABAAE lists the beach address as Estrada das Sesmarias, 8200 Albufeira."
    },
    {
      "question": "Is there parking at Praia de São Rafael?",
      "answer": "VisitPortugal lists parking for Praia de São Rafael. Current capacity, payment rules and the walking distance from parking to the sand were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia de São Rafael?",
      "answer": "VisitPortugal lists safety or surveillance, and the official 2026 bathing season is 15 May to 15 October. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia de São Rafael a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies S. Rafael as a 2026 Blue Flag beach. The Blue Flag season is listed from 1 July to 30 September 2026."
    },
    {
      "question": "Is Praia de São Rafael accessible for visitors with reduced mobility?",
      "answer": "Step-free access was not verified. Visit Albufeira describes stairway access from the cliff-top area, so visitors with reduced mobility should confirm current local access conditions before travelling."
    },
    {
      "question": "Are there restaurants near Praia de São Rafael?",
      "answer": "VisitPortugal lists a bar and restaurant at Praia de São Rafael. This page also links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia de São Rafael?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia dos Pescadores, Praia do Peneco, Praia da Galé, Praia dos Salgados and Praia da Oura."
    },
    {
      "question": "What is the best time to visit Praia de São Rafael?",
      "answer": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main seasonal beach period, while May, June and September are practical for milder conditions and photography around the cliffs."
    }
  ],
  "seo": {
    "meta_title": "Praia de São Rafael, Albufeira | Beach Guide",
    "meta_description": "Praia de São Rafael in Albufeira is a cliff-backed beach with limestone scenery, seasonal services, parking listed by VisitPortugal and verified 2026 Blue Flag status.",
    "keywords": [
      "Praia de São Rafael",
      "São Rafael Beach",
      "Albufeira beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Blue Flag São Rafael",
      "Sesmarias beach",
      "cliff beach Albufeira"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de São Rafael",
      "source_url": "https://www.visitportugal.com/pt-pt/node/141573",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Beach set between cliffs",
        "Isolated rocks on the sand and in the sea",
        "Blue Flag, surveillance, sunshade rental, showers, parking, bar and restaurant listed as services",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia de São Rafael",
      "source_url": "https://visitalbufeira.pt/praia/praia-de-sao-rafael",
      "facts_verified": [
        "Limestone cliffs shaped by natural erosion",
        "Golden and ochre rock formations",
        "Natural rock outcrops forming small coves and sheltered corners",
        "Beach restaurant, lifeguard supervision, sunbed rental and stairway access from the cliff tops"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - S. Rafael",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/s-rafael/",
      "facts_verified": [
        "Official S. Rafael coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.074868, -8.280752",
        "Address at Estrada das Sesmarias",
        "Beach code PTCU7F",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "S. Rafael listed among Albufeira's 2026 Blue Flag locations",
        "Albufeira listed with 25 awarded locations in 2026"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "São Rafael bathing water listed for Albufeira",
        "Bathing water code PTCU7F",
        "Official 2026 bathing season from 15 May to 15 October"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "internal:listings",
      "facts_verified": [
        "Nearby beaches, restaurants and attractions linked only to published internal AlgarveOfficial listings",
        "Approximate distances calculated from stored listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, coordinates, beach code, 2026 bathing season and 2026 Blue Flag season were verified from ABAAE and Diário da República.",
    "VisitPortugal verifies the cliff setting, isolated rocks, parking, surveillance, showers, sunshade rental, bar and restaurant.",
    "Visit Albufeira verifies the limestone rock landscape, small coves and stairway access from the cliff-top area.",
    "ABAAE showed the flag as not hoisted at the time checked on 18 May 2026, so public wording treats Blue Flag as seasonal rather than permanently active.",
    "Step-free access, accessible toilets, adapted equipment and assisted bathing were not verified and are not claimed.",
    "Current parking capacity, payment rules, concession operation and daily lifeguard staffing were not independently verified.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listing URLs, per editorial requirement.",
    "Praia dos Arrifes, Praia da Coelha, Marina de Albufeira and other real nearby places are not linked in the card sections unless an already-published internal AlgarveOfficial listing is available.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing.",
    "Existing Supabase-hosted gallery images were visually checked and no duplicate image was found; no new external images were added."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-sao-rafael-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-sao-rafael-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.074868,
         longitude = -8.280752,
         meta_title = 'Praia de São Rafael, Albufeira | Beach Guide',
         meta_description = 'Praia de São Rafael in Albufeira is a cliff-backed beach with limestone scenery, seasonal services, parking listed by VisitPortugal and verified 2026 Blue Flag status.',
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
     set alt_text = 'Praia de São Rafael sandy beach with sea and limestone cliffs'
   where id = '4d75774d-2056-44d2-9864-818ecbc28e4c'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia de São Rafael limestone cliff and Atlantic water at the shoreline'
   where id = '503b400b-4135-4af1-b70c-ea8141f0a7ac'
     and listing_id = v_listing_id;
end $$;

commit;
