begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Oura",
  "slug": "praia-da-oura-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Oura is a lively resort beach in Albufeira, set below low cliffs in the Areias de Sao Joao and Oura area. Official sources verify its restaurants, bars, water-sports context, parking, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia da Oura is a central resort-area maritime beach in Albufeira, east of the historic centre and close to the Areias de Sao Joao and Oura visitor district. VisitPortugal places it very close to Albufeira and describes it as being in one of the Algarve's most animated areas, with bars, restaurants and nightlife nearby.\n\nThe beach combines broad sand, low cliffs and a highly serviced urban-resort setting. Visit Albufeira describes Oura Beach as one of Albufeira's liveliest beaches, with hotels, restaurants and bars nearby, a sandy beach framed by low cliffs, and facilities including lifeguards, restaurants, beach bars, water-sports activities, equipment rentals and showers. This makes it best suited to visitors who want an active beach with services close at hand rather than a quiet natural cove.\n\nOfficial sources verify practical support, but current day-by-day operation should still be checked locally. VisitPortugal lists safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and accessible-beach recognition. ABAAE verifies Oura as a 2026 Blue Flag coastal beach, with the bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September.\n\nVisitors should use local flags and signage before swimming or using water-sports services, take care near low cliffs and rocky sections, and confirm current parking and accessibility arrangements before travelling. Nearby cards on AlgarveOfficial link only to already-published internal listings.",
  "highlights": [
    "Lively Albufeira resort beach in the Oura and Areias de Sao Joao area",
    "Sandy beach framed by low cliffs, verified by official Albufeira tourism",
    "Restaurants, bars and nightlife nearby, verified by VisitPortugal and Visit Albufeira",
    "Parking, showers, bar, restaurant and seasonal surveillance listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE"
  ],
  "best_time_to_visit": "The official 2026 bathing season for Oura runs from 15 May to 15 October. June to September is the main period for seasonal beach services and the strongest resort atmosphere. May, June and September are practical for milder temperatures and easier access planning. Visit Albufeira notes that mornings are calmer than the afternoon and evening rhythm around Oura; check local flags, wind and sea conditions before swimming or using water-sports services.",
  "parking_info": "VisitPortugal lists parking for Praia da Oura. Current capacity, payment rules, traffic restrictions and the easiest parking approach were not independently verified during this review. Because Oura is a busy resort area, visitors should confirm current parking and local access conditions before driving in peak periods.",
  "accessibility_info": "VisitPortugal lists Praia da Oura as an accessible beach. Current step-free route conditions, ramp availability, beach wheelchair access, accessible toilets and assisted bathing were not independently verified during this review. Visitors with reduced mobility should confirm the best current access point and seasonal support locally before travelling.",
  "lifeguard_info": "ABAAE lists the 2026 bathing season for Oura from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE Oura page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "ABAAE lists Oura for this bathing-season period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.086046%2C-8.226635",
  "coordinates": {
    "latitude": 37.086046,
    "longitude": -8.226635,
    "source": "ABAAE official Oura beach entry."
  },
  "latitude": 37.086046,
  "longitude": -8.226635,
  "beach_code": "PTCH9F",
  "beach_type": "Urban resort maritime sandy beach",
  "landscape": "A sandy beach backed by the Oura resort area and framed by low cliffs, with rocky sections towards the eastern side and a developed visitor-services setting nearby.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Albufeira describes the beach as having easy access and being close to hotels, restaurants and bars. Current parking, access restrictions and beach-level accessibility should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Lifeguards listed by Visit Albufeira", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Diving context listed by VisitPortugal", "status": "Conditions dependent" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "2026 bathing season verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Showers, bar, restaurant and sunshade rental listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season for Oura runs from 15 May to 15 October. June to September is the main period for seasonal beach services and the strongest resort atmosphere. May, June and September are practical for milder temperatures and easier access planning.",
    "know_before_you_go": "ABAAE verifies Oura as a 2026 Blue Flag beach. VisitPortugal lists parking, surveillance, accessible-beach recognition, showers, bar, restaurant, sunshade rental, light boat rental and windsurfing. Current daily staffing, concession operation, parking rules and accessibility support should be checked locally.",
    "notes": [
      "ABAAE lists the 2026 bathing season as 15 May to 15 October.",
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September.",
      "VisitPortugal describes Oura as very close to Albufeira and in one of the Algarve's animated areas.",
      "VisitPortugal lists parking, surveillance, showers, accessible-beach recognition, bar, restaurant, sunshade rental, light boat rental and windsurfing.",
      "Visit Albufeira describes Oura Beach as lively, close to hotels, restaurants and bars, and framed by low cliffs.",
      "Current daily lifeguard staffing, accessible equipment, assisted bathing and parking rules were not independently verified.",
      "Nearby card sections use only internal published AlgarveOfficial listings."
    ]
  },
  "important_notes": "ABAAE verifies Oura as a 2026 Blue Flag beach, with the 2026 bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, safety or surveillance, accessible-beach recognition, showers, bar, restaurant, sunshade rental, light boat rental and windsurfing. Current daily staffing, parking rules and accessibility support were not independently verified.",
  "suitable_for": [
    "Visitors staying in Oura or Areias de Sao Joao",
    "Beachgoers wanting restaurants and bars nearby",
    "Groups looking for an active resort-beach setting",
    "Families using supervised seasonal areas and checking local conditions",
    "Visitors interested in water-sports services when conditions allow",
    "Accessible-beach users, subject to current confirmation",
    "Visitors combining beach time with nearby internal AlgarveOfficial restaurant or experience listings"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a quiet natural cove in high season",
    "Visitors requiring confirmed assisted bathing without checking current arrangements",
    "Anyone planning to sit close below low cliff faces or climb rocky sections",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Oura resort-area beach access",
    "Restaurants and bars nearby",
    "Groups",
    "Families using supervised seasonal areas",
    "Water sports when conditions are suitable",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia de Santa Eulalia",
      "type": "Nearby internal beach listing",
      "distance": "~1.1 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of Praia da Oura, linked internally from this page.",
      "href": "/listing/praia-de-santa-eulalia-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Pescadores",
      "type": "Nearby internal beach listing",
      "distance": "~2.3 km",
      "description": "A published AlgarveOfficial central Albufeira beach listing west of Praia da Oura, linked internally from this page.",
      "href": "/listing/praia-dos-pescadores-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia do Peneco",
      "type": "Nearby internal beach listing",
      "distance": "~2.3 km",
      "description": "A published AlgarveOfficial old-town beach listing in central Albufeira, linked internally from this page.",
      "href": "/listing/praia-do-peneco-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Olhos de Agua",
      "type": "Nearby internal beach listing",
      "distance": "~3.3 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of Oura, linked internally from this page.",
      "href": "/listing/praia-dos-olhos-de-agua-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Sao Rafael",
      "type": "Nearby internal beach listing",
      "distance": "~5.0 km",
      "description": "A published AlgarveOfficial cliff-backed beach listing west of central Albufeira, linked internally from this page.",
      "href": "/listing/praia-de-sao-rafael-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Restaurante Vivaldo's",
      "type": "Restaurant",
      "distance": "~0.0 km",
      "description": "Published AlgarveOfficial restaurant listing next to Praia da Oura, based on stored listing coordinates.",
      "href": "/listing/restaurante-vivaldos-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Wild&co Steakhouse",
      "type": "Restaurant",
      "distance": "~0.4 km",
      "description": "Published AlgarveOfficial steakhouse listing near Praia da Oura, based on stored listing coordinates and listing text.",
      "href": "/listing/wildco-steakhouse-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "DUNE Steakhouse",
      "type": "Restaurant",
      "distance": "~0.4 km",
      "description": "Published AlgarveOfficial steakhouse listing near Praia da Oura, based on stored listing coordinates and listing text.",
      "href": "/listing/dune-steakhouse-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Feel Albufeira Indian Restaurant",
      "type": "Restaurant",
      "distance": "~0.4 km",
      "description": "Published AlgarveOfficial Indian restaurant listing near Praia da Oura, based on stored listing coordinates and listing text.",
      "href": "/listing/feel-albufeira-indian-restaurant-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Restaurante Cepa Velha",
      "type": "Restaurant",
      "distance": "~0.4 km",
      "description": "Published AlgarveOfficial Portuguese restaurant listing near Praia da Oura, based on stored listing coordinates and listing text.",
      "href": "/listing/restaurante-cepa-velha-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Zebra Safari Tours",
      "type": "Experience",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial experience listing near Praia da Oura, based on stored listing coordinates.",
      "href": "/listing/zebra-safari-tours-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Siddha Ayurveda SPA",
      "type": "Wellness spa",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial wellness listing near Praia da Oura, based on stored listing coordinates.",
      "href": "/listing/siddha-ayurveda-spa-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarve Moments - Tours & Experiences",
      "type": "Experience",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial experience listing near Praia da Oura, based on stored listing coordinates.",
      "href": "/listing/algarve-moments-tours-experiences-almancil",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Areias de Sao Joao",
    "Olhos de Agua",
    "Sesmarias",
    "Guia"
  ],
  "walking_trails_nearby": [
    {
      "name": "Albufeira - Oura",
      "description": "Visit Albufeira identifies Albufeira - Oura as an official local experience area east of the historic centre, with beach, restaurants, entertainment and Rua da Oura context. Route conditions and any access changes should be checked locally.",
      "verification_status": "Verified"
    },
    {
      "name": "Oura to Santa Eulalia shoreline area",
      "description": "A practical nearby beach-walk idea using published AlgarveOfficial beach listings and the verified coastal relationship between Oura and Santa Eulalia. Safe passage, tide conditions and any cliff restrictions should be checked locally.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Use the beach as an active resort-area beach rather than a quiet natural escape.",
    "Check local flags and signage before swimming, windsurfing or using any water-sports service.",
    "Confirm current parking conditions before driving into the Oura area.",
    "Confirm the most suitable accessible route before travelling if step-free access or assistance is required.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants and experiences around Oura.",
    "Visit earlier in the day if you prefer a calmer beach rhythm."
  ],
  "photography_notes": "Praia da Oura is strongest for broad sandy beach views, low cliffs, rocky formations and the contrast between the resort area and the sea. Early morning and late afternoon usually provide softer light across the cliffs and shoreline.",
  "family_notes": "Praia da Oura can suit families who want a serviced beach close to restaurants and who use supervised seasonal areas. Families should still check beach flags, watch children near rocks and water-sports areas, and confirm current access or assistance needs before travelling.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Take care around low cliffs, rocks, water-sports zones and busy access points.",
  "accessibility_notes": "VisitPortugal lists Praia da Oura as an accessible beach. Current accessible route conditions, assisted bathing, adapted equipment and accessible toilets were not independently verified; confirm locally before relying on accessibility support.",
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
      "question": "Where is Praia da Oura?",
      "answer": "Praia da Oura is in Albufeira, east of the historic centre, in the Oura and Areias de Sao Joao resort area."
    },
    {
      "question": "Is there parking at Praia da Oura?",
      "answer": "VisitPortugal lists parking for Praia da Oura. Current capacity, payment rules and local traffic conditions were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia da Oura?",
      "answer": "VisitPortugal lists safety or surveillance, and ABAAE lists the 2026 bathing season from 15 May to 15 October. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia da Oura a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Oura as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Is Praia da Oura accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal lists Praia da Oura as an accessible beach. Current step-free route details, assisted bathing, adapted equipment and accessible toilets should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia da Oura?",
      "answer": "Yes. VisitPortugal and Visit Albufeira both identify restaurants and bars near Praia da Oura, and this page links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia da Oura?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia de Santa Eulalia, Praia dos Pescadores, Praia do Peneco, Praia dos Olhos de Agua and Praia de Sao Rafael."
    },
    {
      "question": "What is the best time to visit Praia da Oura?",
      "answer": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main beach-service period, while May, June and September are practical for milder temperatures and easier access planning."
    }
  ],
  "seo": {
    "meta_title": "Praia da Oura, Albufeira | Beach Guide",
    "meta_description": "Praia da Oura in Albufeira is a lively resort beach with low cliffs, restaurants, bars, parking, facilities, accessible-beach recognition and 2026 Blue Flag status.",
    "keywords": [
      "Praia da Oura",
      "Oura Beach",
      "Praia da Oura Albufeira",
      "Albufeira beach",
      "Oura Albufeira",
      "Areias de Sao Joao",
      "Algarve beaches",
      "Portugal beaches",
      "accessible beach Albufeira"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Oura",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-oura",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Resort and nightlife-area context",
        "Bars and restaurants nearby",
        "Water-sports context including windsurfing and diving",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and accessible-beach recognition",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Oura Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-oura",
      "facts_verified": [
        "Oura Beach official Albufeira tourism listing",
        "Lively beach character",
        "Proximity to nightlife district",
        "Hotels, restaurants and bars nearby",
        "Sandy beach framed by low cliffs",
        "Facilities including lifeguards, restaurants, beach bars, water-sports activities, equipment rentals, showers and easy access",
        "Morning and afternoon visitor-rhythm context"
      ]
    },
    {
      "source_name": "Visit Albufeira - Albufeira - Oura",
      "source_url": "https://visitalbufeira.pt/experiencias/albufeira-oura/",
      "facts_verified": [
        "Oura as a lively area east of Albufeira historic centre",
        "Active nightlife and Rua da Oura context",
        "Accommodation, restaurant and entertainment options",
        "Praia da Oura golden sand and characteristic cliffs"
      ]
    },
    {
      "source_name": "Visit Albufeira - Oura Beach East",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-oura-leste",
      "facts_verified": [
        "Oura-Leste as quieter and more natural section of Oura",
        "Rock formations creating small sheltered coves",
        "Access via pathways and stairways from hotels and elevated boardwalks",
        "Sand divided by rocks"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Oura",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/oura/",
      "facts_verified": [
        "Official Oura coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.086046, -8.226635",
        "Beach code PTCH9F",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Oura listed among Albufeira's 2026 Blue Flag locations",
        "Oura-Leste listed among Albufeira's 2026 Blue Flag locations",
        "Albufeira listed with 25 awarded locations in 2026"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "internal:listings",
      "facts_verified": [
        "Nearby beaches, restaurants and attractions linked only to published internal AlgarveOfficial listings",
        "Approximate distances calculated from stored listing coordinates",
        "Restaurant context taken only from internal published listing names, categories and short descriptions"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, resort context, nightlife-area proximity, low-cliff landscape, facilities, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The 2026 bathing season for Oura was verified from ABAAE as 15 May to 15 October.",
    "ABAAE verifies Oura as a 2026 Blue Flag beach and lists the 2026 Blue Flag season from 1 July to 30 September.",
    "Oura-Leste is listed in the ABAAE 2026 awarded list, but the individual Oura-Leste page checked during this review showed 2025 season dates; this listing therefore uses Oura's individual ABAAE page for exact 2026 season dates.",
    "Accessibility is verified at recognition level through VisitPortugal, but current assisted bathing, adapted equipment, accessible toilets and exact step-free route conditions were not independently verified.",
    "Current daily lifeguard staffing, concession operation and parking rules were not independently verified.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listing URLs, per editorial requirement.",
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
  where slug = 'praia-da-oura-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-oura-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.086046,
         longitude = -8.226635,
         meta_title = 'Praia da Oura, Albufeira | Beach Guide',
         meta_description = 'Praia da Oura in Albufeira is a lively resort beach with low cliffs, restaurants, bars, parking, facilities, accessible-beach recognition and 2026 Blue Flag status.',
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
     set alt_text = 'Praia da Oura sandy beach and low cliffs in Albufeira'
   where id = '4bc084ab-e70f-4459-b646-c558d6b5ed82'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Oura shoreline and rocks at sunset'
   where id = '2dcd82e3-0c1e-452b-b1b6-468dec008e81'
     and listing_id = v_listing_id;
end $$;

commit;
