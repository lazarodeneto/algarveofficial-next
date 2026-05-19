begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Rocha",
  "slug": "praia-da-rocha-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Praia da Rocha / Portimão",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Rocha is Portimão's landmark resort beach, known for broad sand, warm-coloured cliffs, seafront services, beach sports, viewpoints and verified 2026 Blue Flag status.",
  "full_description": "Praia da Rocha is one of Portimão's defining coastal places, set beside the mouth of the River Arade and close to Portimão Marina. VisitPortugal identifies it as a maritime beach in Portimão, with a large sandy shore and rock formations shaped by the sea.\n\nThe visitor experience is resort-oriented and practical rather than secluded. Visit Portimão describes Praia da Rocha as a wide sandy beach sheltered by warm-coloured cliffs, with wooden walkways across the sand, bars and restaurants beside the beach, a beach-sports area and the seafront avenue continuing towards Portimão Marina.\n\nOfficial sources verify a strong service base. VisitPortugal lists safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and accessible-beach recognition. Visit Portimão lists beach support, Blue Flag, nautical centre, lifeguard, first-aid station, accessible beach, WC and sunshade area. ABAAE verifies Rocha as a 2026 Blue Flag coastal beach, with the bathing season and Blue Flag season both listed from 1 June to 30 September 2026.\n\nVisitors should still treat services as seasonal and check local signs before relying on them. The beach is large and heavily used in summer, especially around the main accesses, seafront avenue and restaurant areas. Keep to official routes, use the walkways where appropriate, avoid cliff bases and rock formations, and follow beach flags and lifeguard instructions before entering the water. Nearby cards on AlgarveOfficial link only to already-published internal listings.",
  "highlights": [
    "Landmark Portimão resort beach beside the River Arade mouth",
    "Broad sandy beach backed by warm-coloured cliffs and rock formations",
    "Wooden walkways, bars, restaurants and beach-sports area listed by Visit Portimão",
    "Parking, showers, surveillance and accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE",
    "Internal nearby cards link only to published AlgarveOfficial listings"
  ],
  "best_time_to_visit": "The official 2026 bathing season runs from 1 June to 30 September. June to September is the main period for seasonal beach services, lifeguard supervision and beach concessions. May, June and September are practical for beach walks and viewpoint photography with less peak-summer pressure. Early morning and late afternoon are useful for softer light on the cliffs and easier movement around the seafront. Check flags, wind and sea conditions before swimming.",
  "parking_info": "VisitPortugal lists parking for Praia da Rocha. Current capacity, payment rules, time limits, traffic restrictions and the easiest parking approach were not independently verified during this review. The beach is served by a developed seafront resort area, so visitors should expect parking demand to vary strongly by season and time of day.",
  "accessibility_info": "VisitPortugal and Visit Portimão list Praia da Rocha as an accessible beach, and Visit Portimão lists wooden walkways across the sand. Current ramp routes, beach wheelchair availability, assisted bathing, accessible toilets and the most suitable access point were not independently verified; visitors with reduced mobility should confirm current arrangements before travelling.",
  "lifeguard_info": "ABAAE lists the 2026 bathing season for Rocha from 1 June to 30 September. VisitPortugal lists safety or surveillance and Visit Portimão lists lifeguard and first-aid station. Exact daily staffing and coverage hours were not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE for Rocha. The official ABAAE page lists the 2026 Blue Flag season from 1 June to 30 September and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "ABAAE lists this official bathing-season period. VisitPortugal lists safety or surveillance and Visit Portimão lists lifeguard and first-aid station, but exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.11773%2C-8.53642",
  "coordinates": {
    "latitude": 37.11773,
    "longitude": -8.53642,
    "source": "ABAAE official Rocha beach entry."
  },
  "latitude": 37.11773,
  "longitude": -8.53642,
  "beach_code": "PTCH9Q",
  "beach_type": "Large urban resort maritime sandy beach",
  "landscape": "A broad golden-sand beach below warm ochre cliffs and sea-shaped rock formations, with wooden walkways across the sand, a developed seafront avenue above and Portimão Marina nearby.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Portimão describes wooden walkways along the sand and nearby connections to the seafront avenue and Portimão Marina. Current parking, ramp, stair and concession conditions should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Lifeguard listed by Visit Portimão", "status": "Seasonal / exact staffing not verified" },
    { "name": "First-aid station listed by Visit Portimão", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition", "status": "Verified by official tourism sources / current support not verified" },
    { "name": "Wooden walkways", "status": "Verified by Visit Portimão" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "WC", "status": "Verified by Visit Portimão / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Nautical centre", "status": "Verified by Visit Portimão / seasonal operation should be checked" },
    { "name": "Beach-sports area", "status": "Verified by Visit Portimão" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "2026 bathing season verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Lifeguard and first-aid station listed by Visit Portimão",
    "Parking listed by VisitPortugal",
    "Showers, WC, bar, restaurant and sunshade rental listed by official tourism sources",
    "Accessible-beach recognition listed by official tourism sources",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season runs from 1 June to 30 September. June to September is the main service period; May, June and September are practical for beach walks and photography.",
    "know_before_you_go": "Praia da Rocha is a large resort beach with strong seasonal demand. Services, lifeguard staffing, concessions, accessible support and parking conditions can vary. Check local signs, flags and sea conditions before swimming.",
    "notes": [
      "ABAAE lists the 2026 bathing season from 1 June to 30 September.",
      "ABAAE lists the 2026 Blue Flag season from 1 June to 30 September.",
      "The ABAAE page showed the Blue Flag as not hoisted at the time checked on 18 May 2026.",
      "VisitPortugal lists parking, surveillance, showers, bar, restaurant, sunshade rental, light boat rental, windsurfing and accessible-beach recognition.",
      "Visit Portimão lists beach support, nautical centre, lifeguard, first-aid station, accessible beach, WC and sunshade area.",
      "Current daily lifeguard staffing, accessible equipment, assisted bathing and parking rules were not independently verified.",
      "Nearby card sections use only internal published AlgarveOfficial listings."
    ]
  },
  "important_notes": "ABAAE verifies Rocha as a 2026 Blue Flag coastal beach, with the 2026 bathing season and Blue Flag season from 1 June to 30 September. VisitPortugal and Visit Portimão verify strong beach-support infrastructure, but current daily staffing, parking rules and accessibility support were not independently verified.",
  "suitable_for": [
    "Visitors staying in Praia da Rocha or Portimão",
    "Families using supervised seasonal areas and checking local conditions",
    "Visitors wanting a broad sandy beach with resort services",
    "Beach walks along the Portimão shoreline when conditions allow",
    "Photography from Santa Catarina and Três Castelos viewpoints",
    "Visitors combining the beach with nearby internal AlgarveOfficial restaurant or business listings"
  ],
  "not_suitable_for": [
    "Visitors looking for a remote or undeveloped beach",
    "Visitors who want to avoid resort-area demand in peak summer",
    "Visitors requiring confirmed assisted-bathing support without checking current arrangements",
    "Anyone planning to sit close to cliff bases or climb on rock formations",
    "Visitors expecting quiet conditions around the main seafront access points in high season"
  ],
  "best_for": [
    "Large resort beach days",
    "Families using supervised seasonal areas",
    "Beach sports",
    "Restaurants nearby",
    "Photography",
    "Portimão seafront access"
  ],
  "nearby_beaches": [
    {
      "name": "Praia dos Três Castelos",
      "type": "Nearby internal beach listing",
      "distance": "~0.7 km",
      "description": "A published AlgarveOfficial beach listing immediately west of Praia da Rocha, linked internally from this page.",
      "href": "/listing/praia-dos-tres-castelos-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia do Vau",
      "type": "Nearby internal beach listing",
      "distance": "~1.8 km",
      "description": "A published AlgarveOfficial beach listing west of Praia da Rocha, linked internally from this page.",
      "href": "/listing/praia-do-vau-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia do Alemão",
      "type": "Nearby internal beach listing",
      "distance": "~2.2 km",
      "description": "A published AlgarveOfficial Portimão beach listing west of Vau, linked internally from this page.",
      "href": "/listing/praia-do-alemao-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Prainha",
      "type": "Nearby internal beach listing",
      "distance": "~3.5 km",
      "description": "A published AlgarveOfficial Alvor cove-beach listing west of the Vau and Alemão area, linked internally from this page.",
      "href": "/listing/praia-da-prainha-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Três Irmãos",
      "type": "Nearby internal beach listing",
      "distance": "~3.7 km",
      "description": "A published AlgarveOfficial Alvor beach listing west of Praia da Rocha, linked internally from this page.",
      "href": "/listing/praia-dos-tres-irmaos-portimao",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Vista Restaurant",
      "type": "Restaurant",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial restaurant listing close to Praia da Rocha, based on stored listing coordinates.",
      "href": "/listing/vista-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "NUMA",
      "type": "Restaurant",
      "distance": "~0.8 km",
      "description": "Published AlgarveOfficial restaurant listing in Praia da Rocha / Portimão, based on stored listing coordinates.",
      "href": "/listing/numa-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Restaurante F",
      "type": "Restaurant",
      "distance": "~0.8 km",
      "description": "Published AlgarveOfficial restaurant listing in Praia da Rocha / Portimão, based on stored listing coordinates.",
      "href": "/listing/restaurante-f-portimao",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Allgarbe Restaurante",
      "type": "Restaurant",
      "distance": "~2.5 km",
      "description": "Published AlgarveOfficial restaurant listing in Portimão, based on stored listing coordinates.",
      "href": "/listing/allgarbe-restaurante-portimao",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Budha Açai Lounge - Praia da Rocha",
      "type": "Nearby internal business listing",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial nearby business listing with Praia da Rocha in its listing name, based on stored listing coordinates.",
      "href": "/listing/budha-acai-lounge-praia-da-rocha-vilamoura",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Bela Vista Hotel & SPA",
      "type": "Nearby internal business listing",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial nearby business listing in Portimão, based on stored listing coordinates.",
      "href": "/listing/bela-vista-hotel-spa-quinta-do-lago",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Jupiter Algarve Hotel",
      "type": "Nearby internal business listing",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial nearby business listing in Portimão, based on stored listing coordinates.",
      "href": "/listing/jupiter-algarve-hotel-quinta-do-lago",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Nosoloágua Portimão",
      "type": "Nearby internal business listing",
      "distance": "~0.8 km",
      "description": "Published AlgarveOfficial nearby business listing with Portimão in its listing name, based on stored listing coordinates.",
      "href": "/listing/nosoloagua-portimao-almancil",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Praia da Rocha",
    "Portimão",
    "Ferragudo",
    "Alvor",
    "Lagoa"
  ],
  "walking_trails_nearby": [
    {
      "name": "Praia da Rocha seafront and wooden walkways",
      "description": "Visit Portimão describes wide wooden walkways along the sand. Current route condition and any temporary restrictions should be checked locally.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Praia da Rocha to Três Castelos viewpoint area",
      "description": "Visit Portimão identifies Três Castelos Viewpoint as one of the main viewpoints over Praia da Rocha and the coast. Use safe paths and avoid cliff edges.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Arrive earlier in summer if you want easier parking and a calmer start to the beach day.",
    "Use the wooden walkways where available to move across the sand more easily.",
    "Check local flags and signage before swimming or using water-sports services.",
    "Keep away from cliff bases and rock formations, especially after rain or strong wind.",
    "Use Santa Catarina or Três Castelos viewpoint areas for broad views over the beach.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants, beaches and businesses around Praia da Rocha and Portimão."
  ],
  "photography_notes": "Praia da Rocha photographs well from the sand, the wooden walkways and elevated viewpoint areas. Strong subjects include the broad sand, warm cliffs, rock formations, the River Arade side and late-afternoon light over the coast.",
  "family_notes": "Praia da Rocha can suit families who want a wide beach and a strong service base. Families should still use supervised seasonal areas, check beach flags, supervise children near the water and avoid cliff bases and rock formations.",
  "safety_notes": "Sea and wind conditions can vary. Follow beach flags, signage and instructions from surveillance teams where present. Take care around rock formations and keep away from cliff edges, cliff bases and restricted areas.",
  "accessibility_notes": "Official tourism sources list Praia da Rocha as an accessible beach, and Visit Portimão describes wooden walkways across the sand. Current ramp routes, adapted equipment, assisted bathing and accessible toilets were not independently verified, so visitors with reduced mobility should confirm arrangements locally.",
  "gallery_notes": {
    "status": "Existing Supabase-hosted Praia da Rocha images retained where visually relevant; one exact duplicate image removed from the public gallery.",
    "duplicates_checked": true,
    "duplicate_images_found": true,
    "duplicate_images_removed": ["0f1b7d9a-9b54-4877-8df6-61c88c6a118e"],
    "rights_note": "Image source and licence were not independently re-verified during this content update; no scraped or hotlinked images were added."
  },
  "weather_widget": {
    "enabled": true,
    "source": "Uses listing latitude and longitude in the existing AlgarveOfficial weather component.",
    "fallback": "Weather currently unavailable."
  },
  "faq_items": [
    {
      "question": "Where is Praia da Rocha?",
      "answer": "Praia da Rocha is in Portimão, beside the mouth of the River Arade and close to Portimão Marina."
    },
    {
      "question": "Is there parking at Praia da Rocha?",
      "answer": "VisitPortugal lists parking for Praia da Rocha. Current capacity, payment rules and the easiest parking approach were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia da Rocha?",
      "answer": "VisitPortimão lists lifeguard and first-aid station, VisitPortugal lists safety or surveillance, and ABAAE lists the 2026 bathing season from 1 June to 30 September. Exact daily staffing was not independently verified."
    },
    {
      "question": "Is Praia da Rocha a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Rocha as a 2026 Blue Flag coastal beach, with the Blue Flag season listed from 1 June to 30 September 2026."
    },
    {
      "question": "Is Praia da Rocha accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal and Visit Portimão list Praia da Rocha as an accessible beach, and Visit Portimão describes wooden walkways. Current adapted equipment, assisted bathing and the best access point should be confirmed before travelling."
    },
    {
      "question": "Are there restaurants near Praia da Rocha?",
      "answer": "Yes. Official tourism sources list bars and restaurants, and this page links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia da Rocha?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia dos Três Castelos, Praia do Vau, Praia do Alemão, Praia da Prainha and Praia dos Três Irmãos."
    },
    {
      "question": "What is the best time to visit Praia da Rocha?",
      "answer": "The official 2026 bathing season runs from 1 June to 30 September. June to September is the main service period, while May, June and September are practical for walks and photography with less peak-summer pressure."
    }
  ],
  "seo": {
    "meta_title": "Praia da Rocha, Portimão | Algarve Beach Guide",
    "meta_description": "Praia da Rocha in Portimão is a broad resort beach with ochre cliffs, services, wooden walkways, beach sports and 2026 Blue Flag status.",
    "keywords": [
      "Praia da Rocha",
      "Praia da Rocha Portimão",
      "Portimão beach",
      "Algarve beaches",
      "Portugal beaches",
      "Blue Flag Praia da Rocha",
      "Praia dos Três Castelos",
      "Portimão Marina"
    ]
  },
  "sources_used": [
    {
      "source_name": "Visit Portimão - Praia da Rocha",
      "source_url": "https://visitportimao.com/en/beaches/praia-da-rocha/",
      "facts_verified": [
        "Beach name and Portimão tourism listing",
        "Broad sandy beach extending for over one kilometre",
        "Warm-coloured cliff setting",
        "Wooden walkways along the sand",
        "Bars, restaurants and beach-sports area",
        "Seafront avenue context towards Portimão Marina",
        "Santa Catarina de Ribamar Fort and Três Castelos Viewpoint as viewpoint context",
        "Facilities including beach support, Blue Flag, nautical centre, lifeguard, first-aid station, accessible beach, WC and sunshade area"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Rocha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-rocha",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Portimão",
        "Setting beside the mouth of the River Arade",
        "Large sandy shore with rock formations",
        "Services including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and accessible beach",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Rocha",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/rocha/",
      "facts_verified": [
        "Official Rocha coastal beach entry",
        "Municipality of Portimão",
        "Coordinates 37.11773, -8.53642",
        "Beach code PTCH9Q",
        "2026 bathing season from 1 June to 30 September",
        "2026 Blue Flag season from 1 June to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Rocha listed for Portimão in the official 2026 bathing-water table",
        "Beach code PTCH9Q",
        "2026 bathing season from 1 June to 30 September"
      ]
    },
    {
      "source_name": "Visit Portimão - Rocha Beach Sports Area",
      "source_url": "https://visitportimao.com/en/what-to-do/fun-and-leisure/rocha-beach-sports-area/",
      "facts_verified": [
        "Sports area located on the sands at Praia da Rocha",
        "Beach football, volleyball, basketball and gymnastics context",
        "Location beside the breakwater separating the beach from the marina"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "internal:listings",
      "facts_verified": [
        "Nearby beaches, restaurants and attractions linked only to published internal AlgarveOfficial listings",
        "Approximate distances calculated from stored listing coordinates",
        "Restaurant and business context taken only from internal published listing names, categories and coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, River Arade setting, cliff and rock landscape, facilities, coordinates, beach code and 2026 Blue Flag season were verified from VisitPortugal, Visit Portimão, ABAAE and Diário da República.",
    "ABAAE verifies the 2026 bathing season and Blue Flag season as 1 June to 30 September.",
    "At the time checked on 18 May 2026, ABAAE showed the Blue Flag as not hoisted, so Blue Flag is treated as seasonal display rather than permanently hoisted.",
    "Current daily lifeguard staffing, concession operation, parking rules, beach wheelchair availability, assisted bathing and accessible toilets were not independently verified.",
    "VisitPortugal and Visit Portimão use different length descriptions for the sandy area, so this listing uses non-numeric wording such as broad, long and spacious rather than one fixed measurement.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listing URLs, per editorial requirement.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing.",
    "The existing Supabase-hosted gallery was reviewed visually. One exact duplicate image was removed, broad beach imagery was made featured, and no new external images were added."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-rocha-portimao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-rocha-portimao not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         featured_image_url = 'https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/listing-images/admin-listings/1778781241574-ce96b66b-a5be-4c3e-b40b-0260e04ff428.webp',
         latitude = 37.11773,
         longitude = -8.53642,
         meta_title = 'Praia da Rocha, Portimão | Algarve Beach Guide',
         meta_description = 'Praia da Rocha in Portimão is a broad resort beach with ochre cliffs, services, wooden walkways, beach sports and 2026 Blue Flag status.',
         category_data = coalesce(category_data, '{}'::jsonb)
           || v_patch
           || jsonb_build_object(
             'localized_content',
             coalesce(category_data->'localized_content', '{}'::jsonb)
             || jsonb_build_object('en', v_patch)
           ),
         updated_at = now()
   where id = v_listing_id;

  delete from public.listing_images
   where id = '0f1b7d9a-9b54-4877-8df6-61c88c6a118e'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Rocha broad sandy beach and wooden walkway',
         is_featured = true,
         display_order = 0
   where id = 'd125cfae-b2c7-41c9-bca8-4760316dfaac'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Rocha shoreline with Portimão Marina in the distance',
         is_featured = false,
         display_order = 1
   where id = '7a8afc1d-daf7-42f9-8794-f88b47fe16b9'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Rock formations and cliffs at Praia da Rocha',
         is_featured = false,
         display_order = 2
   where id = '1d614c92-8354-4b34-ab39-061d5a73dfb1'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Wooden walkway across the sand at Praia da Rocha',
         is_featured = false,
         display_order = 3
   where id = 'ce4555aa-a1fb-45b3-afdb-3720df9b7ebb'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Rocha beach-sports area below the seafront buildings',
         is_featured = false,
         display_order = 4
   where id = '96576eb2-3321-48df-8a15-83823e53fe33'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Rocha beachside terrace view towards the sea',
         is_featured = false,
         display_order = 5
   where id = '6835f78b-b90d-43ea-864a-5f15edda2a9f'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Rocha rocky shoreline and turquoise water',
         is_featured = false,
         display_order = 6
   where id = 'faa42789-3614-4b71-85e3-2b585eb01dfc'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Sunshade rental area on Praia da Rocha sand',
         is_featured = false,
         display_order = 7
   where id = '013dffaa-b3f9-4ec7-b91e-527bd2c58391'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Sunset view over Praia da Rocha cliffs and sea stacks',
         is_featured = false,
         display_order = 8
   where id = '18e89146-b5db-4331-8dc4-93e2d5a32ec5'
     and listing_id = v_listing_id;
end $$;

commit;
