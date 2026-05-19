begin;

do $$
declare
  v_listing_id uuid;
  v_featured_image_url text := 'https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/listing-images/admin-listings/1778703550839-4fa39af4-8440-4f1a-a46a-46f0f0858353.webp';
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Santa Eulalia",
  "slug": "praia-de-santa-eulalia-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Santa Eulalia is a resort-oriented beach in Albufeira, set between the Oura and Olhos de Agua coastal areas. Official sources verify its wide sand, low cliffs, pine-backed setting, facilities, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia de Santa Eulalia is a maritime beach in Albufeira, set east of Praia da Oura and west of the Olhos de Agua coastal area. VisitPortugal describes it as a beach between golden cliffs covered with pine trees and a landscaped area, with a beach-support leisure complex beside the sand.\n\nThe beach has a polished resort character rather than a remote natural setting. Visit Albufeira describes Santa Eulalia Beach as having a wide sandy area, clear waters and gentle cliffs, with boardwalks and stairways leading to the sand. The same official source lists restaurants, lifeguards, water-sports activities and landscaped areas, making it a practical choice for families, resort guests and visitors who want services close to the beach.\n\nOfficial sources verify a strong service base, but seasonal details should still be checked locally. VisitPortugal lists safety or surveillance, sunshade rental, light boat rental, parking, bar, restaurant, windsurfing and accessible-beach recognition. ABAAE verifies Santa Eulalia as a 2026 Blue Flag coastal beach, with the bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September.\n\nVisitors should confirm current parking, accessibility support, concession operation and daily lifeguard arrangements before relying on them. Use official access routes, take care around low cliffs and rocky sections, and follow local flags and signage before entering the water. Nearby cards on AlgarveOfficial link only to already-published internal listings.",
  "highlights": [
    "Resort-oriented Albufeira beach between Oura and Olhos de Agua",
    "Wide sand, clear water and gentle cliffs verified by Visit Albufeira",
    "Golden cliffs, pine trees and landscaped setting verified by VisitPortugal",
    "Parking, bar, restaurant and seasonal surveillance listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE"
  ],
  "best_time_to_visit": "The official 2026 bathing season for Santa Eulalia runs from 15 May to 15 October. June to September is the main period for seasonal beach services and resort-area demand. May, June and September are practical for milder temperatures and easier access planning. Early morning and late afternoon are useful for softer light on the cliffs and for a calmer beach rhythm; check local flags, wind and sea conditions before swimming or using water-sports services.",
  "parking_info": "VisitPortugal lists parking for Praia de Santa Eulalia. Current capacity, payment rules, traffic restrictions and the easiest parking approach were not independently verified during this review. Because this is a serviced resort-area beach, visitors should confirm current parking and local access conditions before driving in peak periods.",
  "accessibility_info": "VisitPortugal lists Praia de Santa Eulalia as an accessible beach. Visit Albufeira describes boardwalks and stairways leading to the sand. Current step-free route conditions, beach wheelchair access, accessible toilets and assisted bathing were not independently verified; visitors with reduced mobility should confirm the best current access point and seasonal support locally before travelling.",
  "lifeguard_info": "ABAAE lists the 2026 bathing season for Santa Eulalia from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE Santa Eulalia page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "ABAAE lists Santa Eulalia for this bathing-season period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.087917%2C-8.214625",
  "coordinates": {
    "latitude": 37.087917,
    "longitude": -8.214625,
    "source": "ABAAE official Santa Eulalia beach entry."
  },
  "latitude": 37.087917,
  "longitude": -8.214625,
  "beach_code": "PTCT8C",
  "beach_type": "Resort-area maritime sandy beach",
  "landscape": "A wide sandy beach backed by low golden cliffs, pine trees, landscaped resort areas and nearby beach-support facilities.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Albufeira describes easy access, with boardwalks and stairways leading directly to the sand. Current parking, ramp conditions and any temporary restrictions should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Lifeguards listed by Visit Albufeira", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Boardwalk and stairway access", "status": "Verified by Visit Albufeira / current condition should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "2026 bathing season verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Bar, restaurant and sunshade rental listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season for Santa Eulalia runs from 15 May to 15 October. June to September is the main period for seasonal beach services and resort-area demand. May, June and September are practical for milder temperatures and easier access planning.",
    "know_before_you_go": "ABAAE verifies Santa Eulalia as a 2026 Blue Flag beach. VisitPortugal lists parking, surveillance, accessible-beach recognition, bar, restaurant, sunshade rental, light boat rental and windsurfing. Current daily staffing, concession operation, parking rules and accessibility support should be checked locally.",
    "notes": [
      "ABAAE lists the 2026 bathing season as 15 May to 15 October.",
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September.",
      "VisitPortugal describes golden cliffs with pine trees and a landscaped setting.",
      "VisitPortugal lists parking, surveillance, bar, restaurant, accessible-beach recognition, sunshade rental, light boat rental and windsurfing.",
      "Visit Albufeira describes wide sand, clear waters, gentle cliffs, boardwalks, stairways, restaurants, lifeguards and water-sports activities.",
      "Current daily lifeguard staffing, accessible equipment, assisted bathing and parking rules were not independently verified.",
      "Nearby card sections use only internal published AlgarveOfficial listings."
    ]
  },
  "important_notes": "ABAAE verifies Santa Eulalia as a 2026 Blue Flag beach, with the 2026 bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, safety or surveillance, accessible-beach recognition, bar, restaurant, sunshade rental, light boat rental and windsurfing. Current daily staffing, parking rules and accessibility support were not independently verified.",
  "suitable_for": [
    "Visitors staying around Santa Eulalia, Oura or eastern Albufeira",
    "Families using supervised seasonal areas",
    "Visitors wanting restaurants and facilities nearby",
    "Resort beach days",
    "Water-sports users when conditions are suitable",
    "Accessible-beach users, subject to current confirmation",
    "Visitors combining the beach with nearby internal AlgarveOfficial restaurant or experience listings"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a quiet natural cove in high season",
    "Visitors requiring confirmed assisted bathing without checking current arrangements",
    "Anyone planning to sit close below cliff faces or climb rocky sections",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Resort beach days",
    "Families using supervised seasonal areas",
    "Restaurants nearby",
    "Beach services",
    "Water sports when conditions are suitable",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia da Oura",
      "type": "Nearby internal beach listing",
      "distance": "~1.1 km",
      "description": "A published AlgarveOfficial Albufeira resort beach listing west of Praia de Santa Eulalia, linked internally from this page.",
      "href": "/listing/praia-da-oura-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Olhos de Agua",
      "type": "Nearby internal beach listing",
      "distance": "~2.2 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of Santa Eulalia, linked internally from this page.",
      "href": "/listing/praia-dos-olhos-de-agua-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Pescadores",
      "type": "Nearby internal beach listing",
      "distance": "~3.3 km",
      "description": "A published AlgarveOfficial central Albufeira beach listing west of Santa Eulalia, linked internally from this page.",
      "href": "/listing/praia-dos-pescadores-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia do Peneco",
      "type": "Nearby internal beach listing",
      "distance": "~3.3 km",
      "description": "A published AlgarveOfficial old-town beach listing in central Albufeira, linked internally from this page.",
      "href": "/listing/praia-do-peneco-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Falesia",
      "type": "Nearby internal beach listing",
      "distance": "~4.1 km",
      "description": "A published AlgarveOfficial long cliff-backed beach listing east of Santa Eulalia, linked internally from this page.",
      "href": "/listing/praia-da-falesia-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Casa Velha Restaurant",
      "type": "Restaurant",
      "distance": "~0.6 km",
      "description": "Published AlgarveOfficial Portuguese restaurant listing near Praia de Santa Eulalia, based on stored listing coordinates and listing text.",
      "href": "/listing/casa-velha-restaurant-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "400 Degrees Restaurante Italiano & Cocktail Albufeira",
      "type": "Restaurant",
      "distance": "~0.7 km",
      "description": "Published AlgarveOfficial Italian restaurant listing near Praia de Santa Eulalia, based on stored listing coordinates and listing text.",
      "href": "/listing/400-degrees-restaurante-italiano-cocktail-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Lutje Tapas Bar and Grill",
      "type": "Restaurant",
      "distance": "~0.8 km",
      "description": "Published AlgarveOfficial tapas and grill listing near Praia de Santa Eulalia, based on stored listing coordinates and listing text.",
      "href": "/listing/lutje-tapas-bar-and-grill-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Feel Albufeira Indian Restaurant",
      "type": "Restaurant",
      "distance": "~0.9 km",
      "description": "Published AlgarveOfficial Indian restaurant listing near Praia de Santa Eulalia, based on stored listing coordinates and listing text.",
      "href": "/listing/feel-albufeira-indian-restaurant-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Restaurante Vivaldo's",
      "type": "Restaurant",
      "distance": "~1.1 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia de Santa Eulalia and Oura, based on stored listing coordinates.",
      "href": "/listing/restaurante-vivaldos-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Le Club Algarve",
      "type": "Beach club",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial beach-club listing on or near Santa Eulalia Beach, based on stored listing coordinates and listing text.",
      "href": "/listing/le-club-algarve-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Grande Real Santa Eulalia Resort & Hotel SPA",
      "type": "Wellness spa",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial wellness listing near Praia de Santa Eulalia, based on stored listing coordinates.",
      "href": "/listing/grande-real-santa-eulalia-resort-hotel-spa-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Parque Aventura",
      "type": "Experience",
      "distance": "~0.4 km",
      "description": "Published AlgarveOfficial experience listing near Praia de Santa Eulalia, based on stored listing coordinates and listing text.",
      "href": "/listing/parque-aventura-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Zebra Safari Tours",
      "type": "Experience",
      "distance": "~1.0 km",
      "description": "Published AlgarveOfficial experience listing near the Oura and Santa Eulalia area, based on stored listing coordinates.",
      "href": "/listing/zebra-safari-tours-almancil",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Oura",
    "Olhos de Agua",
    "Areias de Sao Joao",
    "Guia"
  ],
  "walking_trails_nearby": [
    {
      "name": "Santa Eulalia beach access and resort paths",
      "description": "Visit Albufeira describes boardwalks and stairways leading directly to the sand. Current route conditions, private-resort access boundaries and any temporary restrictions should be checked locally.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Santa Eulalia to Oura shoreline area",
      "description": "A practical nearby beach-walk idea using published AlgarveOfficial beach listings and the verified coastal relationship between Santa Eulalia and Oura. Safe passage, tide conditions and any cliff restrictions should be checked locally.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Treat Santa Eulalia as a serviced resort-area beach rather than a remote natural beach.",
    "Check local flags and signage before swimming, windsurfing or using any water-sports service.",
    "Confirm current parking conditions before driving into the Santa Eulalia area.",
    "Confirm the most suitable accessible route before travelling if step-free access or assistance is required.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants and businesses around Santa Eulalia.",
    "Visit early or later in the day for softer light on the cliffs and a calmer beach rhythm."
  ],
  "photography_notes": "Praia de Santa Eulalia is strongest for golden cliffs, pine-backed slopes, broad sand and landscaped resort-beach views. Use safe paths and authorised viewpoints, and avoid cliff edges or unstable rock sections.",
  "family_notes": "Praia de Santa Eulalia can suit families who want a serviced beach close to restaurants and who use supervised seasonal areas. Families should still check beach flags, watch children near rocks and water-sports areas, and confirm current access or assistance needs before travelling.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Take care around low cliffs, rocks, water-sports zones and busy access points.",
  "accessibility_notes": "VisitPortugal lists Praia de Santa Eulalia as an accessible beach. Visit Albufeira describes boardwalks and stairways, but current step-free route conditions, assisted bathing, adapted equipment and accessible toilets were not independently verified; confirm locally before relying on accessibility support.",
  "gallery_notes": {
    "status": "One existing Supabase-hosted listing image retained; one existing image was removed from the listing gallery because visual review could not verify it as Praia de Santa Eulalia.",
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
      "question": "Where is Praia de Santa Eulalia?",
      "answer": "Praia de Santa Eulalia is in Albufeira, east of Praia da Oura and west of the Olhos de Agua coastal area."
    },
    {
      "question": "Is there parking at Praia de Santa Eulalia?",
      "answer": "VisitPortugal lists parking for Praia de Santa Eulalia. Current capacity, payment rules and local traffic conditions were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia de Santa Eulalia?",
      "answer": "VisitPortugal lists safety or surveillance, Visit Albufeira lists lifeguards, and ABAAE lists the 2026 bathing season from 15 May to 15 October. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia de Santa Eulalia a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Santa Eulalia as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Is Praia de Santa Eulalia accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal lists Praia de Santa Eulalia as an accessible beach. Current step-free route details, assisted bathing, adapted equipment and accessible toilets should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia de Santa Eulalia?",
      "answer": "Yes. VisitPortugal and Visit Albufeira both identify restaurant support at or near Praia de Santa Eulalia, and this page links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia de Santa Eulalia?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia da Oura, Praia dos Olhos de Agua, Praia dos Pescadores, Praia do Peneco and Praia da Falesia."
    },
    {
      "question": "What is the best time to visit Praia de Santa Eulalia?",
      "answer": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main beach-service period, while May, June and September are practical for milder temperatures and easier access planning."
    }
  ],
  "seo": {
    "meta_title": "Praia de Santa Eulalia, Albufeira | Beach Guide",
    "meta_description": "Praia de Santa Eulalia in Albufeira is a resort beach with low cliffs, pine scenery, parking, facilities, accessible-beach recognition and 2026 Blue Flag status.",
    "keywords": [
      "Praia de Santa Eulalia",
      "Santa Eulalia Beach",
      "Praia de Santa Eulalia Albufeira",
      "Albufeira beach",
      "Oura nearby beach",
      "Olhos de Agua nearby beach",
      "Algarve beaches",
      "Portugal beaches",
      "accessible beach Albufeira"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Santa Eulalia",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-santa-eul%C3%A1lia",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Golden cliffs with pine trees and landscaped area",
        "Beach-support leisure complex with bar and restaurant",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, parking, bar, restaurant, windsurfing and accessible-beach recognition",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Santa Eulalia Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-de-santa-eulalia",
      "facts_verified": [
        "Santa Eulalia Beach official Albufeira tourism listing",
        "Wide sandy area",
        "Clear waters and gentle cliffs",
        "Boardwalks and stairways leading to the sand",
        "Restaurants, lifeguards, water-sports activities and landscaped areas",
        "Pine trees and soft rock formations"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Santa Eulalia",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/santa-eulalia/",
      "facts_verified": [
        "Official Santa Eulalia coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.087917, -8.214625",
        "Beach code PTCT8C",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "internal:listings",
      "facts_verified": [
        "Nearby beaches, restaurants and attractions linked only to published internal AlgarveOfficial listings",
        "Approximate distances calculated from stored listing coordinates",
        "Restaurant and business context taken only from internal published listing names, categories and short descriptions"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, landscape, access context, facilities, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The 2026 bathing season for Santa Eulalia was verified from ABAAE as 15 May to 15 October.",
    "ABAAE verifies Santa Eulalia as a 2026 Blue Flag beach and lists the 2026 Blue Flag season from 1 July to 30 September.",
    "Accessibility is verified at recognition level through VisitPortugal, but current assisted bathing, adapted equipment, accessible toilets and exact step-free route conditions were not independently verified.",
    "Current daily lifeguard staffing, concession operation and parking rules were not independently verified.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listing URLs, per editorial requirement.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing.",
    "Existing Supabase-hosted gallery images were visually checked. One image was removed from this listing because it could not be verified as Praia de Santa Eulalia; no new external images were added."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-santa-eulalia-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-santa-eulalia-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         featured_image_url = v_featured_image_url,
         latitude = 37.087917,
         longitude = -8.214625,
         meta_title = 'Praia de Santa Eulalia, Albufeira | Beach Guide',
         meta_description = 'Praia de Santa Eulalia in Albufeira is a resort beach with low cliffs, pine scenery, parking, facilities, accessible-beach recognition and 2026 Blue Flag status.',
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
     set alt_text = 'Praia de Santa Eulalia beach and low cliffs in Albufeira',
         is_featured = true,
         display_order = 0
   where id = '76c58d46-3d10-4d19-bd25-b265ac55e565'
     and listing_id = v_listing_id;

  delete from public.listing_images
   where id = '6822d585-4f91-4cdf-b8eb-fa38b163295f'
     and listing_id = v_listing_id;
end $$;

commit;
