begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Olhos de Água",
  "slug": "praia-dos-olhos-de-agua-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Olhos de Água / Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Olhos de Água is a village beach in Albufeira known for freshwater springs visible at low tide, small fishing boats, ochre cliffs, restaurants and official 2026 Blue Flag status.",
  "full_description": "Praia dos Olhos de Água is a maritime beach in the parish area of Albufeira and Olhos de Água, east of central Albufeira. VisitPortugal describes Olhos de Água as a former fishing village and links the beach name to freshwater springs at the eastern end of the sand, which can be seen bubbling through the sand at low tide.\n\nThe setting is compact and village-facing rather than remote. The sand sits below ochre-toned cliffs and rocky sections, with restaurants, beach bars and the settlement immediately behind the beach. Visit Albufeira also records the area's fishing heritage, noting that small traditional boats can still be seen on the shore, alongside a small artisanal fishing area.\n\nOfficial sources verify a practical service base. VisitPortugal lists safety or surveillance, sunshade rental, showers, outdoor parking, bar, restaurant and accessible-beach recognition. ABAAE verifies Olhos d'Água as a 2026 Blue Flag coastal beach, with the official bathing season from 15 May to 15 October 2026 and the Blue Flag season from 1 July to 30 September 2026.\n\nVisitors should plan around tide if they want to see the freshwater springs. Current parking capacity, daily lifeguard staffing, concession operation and accessible-beach support should still be checked locally, especially during summer. Use official access routes, take care around rocks and cliff areas, and follow local flags and signage before entering the water. Nearby cards on AlgarveOfficial link only to already-published internal listings.",
  "highlights": [
    "Freshwater springs visible in the sand and rocks at low tide",
    "Compact village beach in Albufeira with fishing heritage",
    "Ochre cliffs, rocky sections and small traditional boats on the shore",
    "Parking, showers, bars, restaurants and seasonal surveillance listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE",
    "Internal nearby cards link only to published AlgarveOfficial listings"
  ],
  "best_time_to_visit": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for a less pressured visit. Low tide is the best time to look for the freshwater springs. Check tide, sea state, wind, flags and local signage before swimming or walking around rocky sections.",
  "parking_info": "VisitPortugal lists outdoor parking for Praia dos Olhos de Água, and the municipal beach information describes tarmac road access through Olhos de Água. Current capacity, payment rules, time limits and the closest available spaces were not independently verified during this review.",
  "accessibility_info": "VisitPortugal lists Praia dos Olhos de Água as an accessible beach. The municipal page summary describes access to the sand by ramp and stairs, but current gradient, beach wheelchair availability, assisted bathing, accessible toilets and seasonal staffing were not independently verified; visitors with reduced mobility should confirm current arrangements before travelling.",
  "lifeguard_info": "ABAAE lists the 2026 bathing season from 15 May to 15 October, while VisitPortugal lists safety or surveillance and Visit Albufeira lists lifeguards. Exact daily lifeguard staffing and coverage hours were not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE for Olhos d'Água. The ABAAE page lists the 2026 Blue Flag season from 1 July to 30 September and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "ABAAE lists this official bathing-season period. VisitPortugal lists safety or surveillance and Visit Albufeira lists lifeguards, but exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.089726%2C-8.189878",
  "coordinates": {
    "latitude": 37.089726,
    "longitude": -8.189878,
    "source": "ABAAE official Olhos d'Água beach entry."
  },
  "latitude": 37.089726,
  "longitude": -8.189878,
  "beach_code": "PTCV9U",
  "beach_type": "Compact sandy urban village beach",
  "landscape": "A sandy beach below ochre limestone cliffs and rocky sections, with freshwater springs visible at low tide, traditional boats on the shore and the Olhos de Água village-resort area immediately behind the sand.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. The municipal beach information describes tarmac road access through Olhos de Água and access to the sand by ramp and stairs. Current route conditions and any temporary restrictions should be checked locally.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Lifeguards listed by Visit Albufeira", "status": "Seasonal / exact staffing not verified" },
    { "name": "Outdoor parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Accessible beach recognition", "status": "Verified by VisitPortugal / current support not verified" },
    { "name": "Ramp and stair access to the sand", "status": "Verified from municipal page summary / current condition not verified" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small artisanal fishing area", "status": "Verified by Visit Albufeira" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE",
    "2026 bathing season verified by ABAAE",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Showers, bar, restaurant and sunshade rental listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season runs from 15 May to 15 October. Low tide is the best time to look for the freshwater springs.",
    "know_before_you_go": "Olhos de Água is a compact village beach with rocky sections and cliffs. Services, lifeguard staffing, parking and accessibility support can vary by season. Check local signs, flags and tide conditions before swimming or exploring around the rocks.",
    "notes": [
      "ABAAE lists the 2026 bathing season from 15 May to 15 October.",
      "ABAAE lists the 2026 Blue Flag season from 1 July to 30 September.",
      "The ABAAE page showed the Blue Flag as not hoisted at the time checked on 18 May 2026.",
      "Freshwater springs are a low-tide feature and should not be expected to be visible at all tide states.",
      "VisitPortugal lists outdoor parking, surveillance, showers, bar, restaurant, sunshade rental and accessible-beach recognition.",
      "Current daily lifeguard staffing, accessible equipment, assisted bathing and parking rules were not independently verified.",
      "Nearby card sections use only internal published AlgarveOfficial listings."
    ]
  },
  "important_notes": "ABAAE verifies Olhos d'Água as a 2026 Blue Flag coastal beach, with the 2026 bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September. Freshwater springs are visible at low tide according to VisitPortugal and Visit Albufeira. Current daily staffing, parking rules and accessibility support were not independently verified.",
  "suitable_for": [
    "Visitors staying in Olhos de Água or eastern Albufeira",
    "Families using supervised seasonal areas and checking local conditions",
    "Visitors interested in the low-tide freshwater springs",
    "Short beach visits with restaurants nearby",
    "Photography from the village and cliff viewpoints",
    "Visitors combining the beach with nearby internal AlgarveOfficial restaurant or business listings"
  ],
  "not_suitable_for": [
    "Visitors looking for a remote or undeveloped beach",
    "Visitors requiring confirmed assisted-bathing support without checking current arrangements",
    "Visitors needing guaranteed step-free conditions across the whole access route",
    "Anyone planning to sit close to cliff bases or climb on unstable rock sections",
    "Visitors expecting the freshwater springs to be visible at high tide"
  ],
  "best_for": [
    "Village beach atmosphere",
    "Freshwater springs at low tide",
    "Restaurants nearby",
    "Fishing heritage",
    "Families using supervised seasonal areas",
    "Photography"
  ],
  "nearby_beaches": [
    {
      "name": "Praia da Falésia",
      "type": "Nearby internal beach listing",
      "distance": "~2.0 km",
      "description": "A published AlgarveOfficial beach listing east of Olhos de Água, linked internally from this page.",
      "href": "/listing/praia-da-falesia-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Santa Eulália",
      "type": "Nearby internal beach listing",
      "distance": "~2.2 km",
      "description": "A published AlgarveOfficial beach listing west of Olhos de Água, linked internally from this page.",
      "href": "/listing/praia-de-santa-eulalia-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Oura",
      "type": "Nearby internal beach listing",
      "distance": "~3.3 km",
      "description": "A published AlgarveOfficial Albufeira beach listing west of Santa Eulália, linked internally from this page.",
      "href": "/listing/praia-da-oura-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia dos Pescadores",
      "type": "Nearby internal beach listing",
      "distance": "~5.5 km",
      "description": "A published AlgarveOfficial central Albufeira beach listing, linked internally from this page.",
      "href": "/listing/praia-dos-pescadores-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia do Peneco",
      "type": "Nearby internal beach listing",
      "distance": "~5.5 km",
      "description": "A published AlgarveOfficial central Albufeira beach listing also known as Praia do Túnel, linked internally from this page.",
      "href": "/listing/praia-do-peneco-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Versatile Restaurante",
      "type": "Restaurant",
      "distance": "~0.5 km",
      "description": "Published AlgarveOfficial restaurant listing near Olhos de Água, based on stored listing coordinates.",
      "href": "/listing/versatile-restaurante-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Adega Ticosta Restaurante Tradicional Português",
      "type": "Restaurant",
      "distance": "~1.2 km",
      "description": "Published AlgarveOfficial Portuguese restaurant listing near Olhos de Água, based on stored listing coordinates.",
      "href": "/listing/adega-ticosta-restaurante-tradicional-portugues-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Al Quimia",
      "type": "Restaurant",
      "distance": "~2.1 km",
      "description": "Published AlgarveOfficial restaurant listing in Albufeira, based on stored listing coordinates.",
      "href": "/listing/al-quimia-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Casa Velha Restaurant",
      "type": "Restaurant",
      "distance": "~2.7 km",
      "description": "Published AlgarveOfficial restaurant listing in Albufeira, based on stored listing coordinates.",
      "href": "/listing/casa-velha-restaurant-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "400 Degrees Restaurante Italiano & Cocktail Albufeira",
      "type": "Restaurant",
      "distance": "~2.8 km",
      "description": "Published AlgarveOfficial restaurant listing in Albufeira, based on stored listing coordinates.",
      "href": "/listing/400-degrees-restaurante-italiano-cocktail-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Pine Cliffs Golf Course",
      "type": "Golf",
      "distance": "~1.5 km",
      "description": "Published AlgarveOfficial golf listing near the Olhos de Água and Açoteias area, based on stored listing coordinates.",
      "href": "/listing/pine-cliffs-golf-course",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Club Med da Balaia",
      "type": "Family attraction",
      "distance": "~1.1 km",
      "description": "Published AlgarveOfficial family-attractions listing near the Balaia and Olhos de Água area, based on stored listing coordinates.",
      "href": "/listing/club-med-da-balaia-quinta-do-lago",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Olhos de Água",
    "Albufeira",
    "Santa Eulália",
    "Açoteias",
    "Vilamoura"
  ],
  "walking_trails_nearby": [
    {
      "name": "Olhos de Água village and beach walk",
      "description": "A short local walk around the beach, village frontage and nearby viewpoints may be practical, but it was not verified as a formal signed trail during this review.",
      "verification_status": "Not verified"
    },
    {
      "name": "Low-tide shoreline towards Barranco das Belharucas",
      "description": "The shoreline east of Olhos de Água has rocky sections and tide-sensitive areas. Attempt only when local conditions are safe and signage allows.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Check tide times if seeing the freshwater springs is important.",
    "Use official access routes and take care around stairs, ramps, rocks and cliff areas.",
    "Arrive earlier in summer if you want easier access to parking and serviced areas.",
    "Check local flags and signage before swimming.",
    "Confirm current accessible-beach support before travelling if adapted equipment or assistance is required.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants, beaches and businesses around Olhos de Água and Albufeira."
  ],
  "photography_notes": "Praia dos Olhos de Água is strongest for village-beach views, small boats, ochre cliffs and low-tide freshwater springs. Use safe viewpoints and avoid cliff edges or unstable rock areas.",
  "family_notes": "Praia dos Olhos de Água can suit families who want a serviced village beach and who use supervised seasonal areas. Families should still check flags, supervise children near rocks and fishing equipment, and avoid cliff bases.",
  "safety_notes": "Sea, wind and tide conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take care around rocks at low tide and keep away from cliff edges, cliff bases and restricted areas.",
  "accessibility_notes": "VisitPortugal lists Praia dos Olhos de Água as an accessible beach, but current beach wheelchair availability, assisted bathing, accessible toilets and the best route to the sand were not independently verified. The municipal page summary describes ramp and stair access, so visitors with reduced mobility should confirm current conditions before travelling.",
  "gallery_notes": {
    "status": "One clearly identifiable Supabase-hosted Olhos de Água image retained; one less certain cliff-only image removed from the public gallery.",
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
      "question": "Where is Praia dos Olhos de Água?",
      "answer": "Praia dos Olhos de Água is in Albufeira, in the Olhos de Água village area east of central Albufeira."
    },
    {
      "question": "Is there parking at Praia dos Olhos de Água?",
      "answer": "VisitPortugal lists outdoor parking for Praia dos Olhos de Água. Current capacity, payment rules and the closest spaces were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia dos Olhos de Água?",
      "answer": "VisitPortugal lists safety or surveillance, Visit Albufeira lists lifeguards, and ABAAE lists the 2026 bathing season from 15 May to 15 October. Exact daily staffing was not independently verified."
    },
    {
      "question": "Is Praia dos Olhos de Água a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Olhos d'Água as a 2026 Blue Flag coastal beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "What makes Praia dos Olhos de Água distinctive?",
      "answer": "Official tourism sources verify freshwater springs that emerge through the sand and rocks at low tide, giving the beach and village their name."
    },
    {
      "question": "Is Praia dos Olhos de Água accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal lists the beach as accessible, and municipal information describes ramp and stair access to the sand. Current adapted equipment, assisted bathing and route condition should be confirmed before travelling."
    },
    {
      "question": "Are there restaurants near Praia dos Olhos de Água?",
      "answer": "Yes. VisitPortugal lists bar and restaurant services, Visit Albufeira lists beach bars and restaurants, and this page links to nearby published AlgarveOfficial restaurant listings."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia dos Olhos de Água?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia da Falésia, Praia de Santa Eulália, Praia da Oura, Praia dos Pescadores and Praia do Peneco."
    }
  ],
  "seo": {
    "meta_title": "Praia dos Olhos de Água, Albufeira | Beach Guide",
    "meta_description": "Praia dos Olhos de Água in Albufeira is a village beach with low-tide freshwater springs, fishing boats, services and 2026 Blue Flag status.",
    "keywords": [
      "Praia dos Olhos de Água",
      "Olhos de Água beach",
      "Praia de Olhos de Agua",
      "Albufeira beaches",
      "freshwater springs Algarve",
      "Blue Flag Olhos de Água",
      "Algarve beaches",
      "Portugal beaches"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Olhos de Água",
      "source_url": "https://www.visitportugal.com/en/content/praia-dos-olhos-de-agua",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Former fishing-village context",
        "Freshwater springs at the eastern end of the beach",
        "Springs visible at low tide",
        "Ochre cliff setting",
        "Services including Blue Flag, safety or surveillance, sunshade rental, showers, outdoor parking, bar, restaurant and accessible beach",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia de Olhos de Água",
      "source_url": "https://visitalbufeira.pt/praia/praia-de-olhos-de-agua",
      "facts_verified": [
        "Freshwater springs emerging from the sand at low tide",
        "Fishing heritage",
        "Small traditional boats on the shore",
        "Cove-like beach sheltered by cliffs",
        "Beach bars, restaurants, lifeguards and small artisanal fishing area",
        "Nearby official beach context including Falésia, Barranco das Belharucas, Maria Luísa, Santa Eulália and Oura"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Olhos d'Água",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/olhos-dagua/",
      "facts_verified": [
        "Official Olhos d'Água coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.089726, -8.189878",
        "Beach code PTCV9U",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Olhos de Água",
      "source_url": "https://www.cm-albufeira.pt/praias/olhos-de-agua",
      "facts_verified": [
        "Municipal beach page for Olhos de Água",
        "Urban coastal bathing water with intensive use and strong demand, based on official page summary",
        "Golden sand, limestone cliffs and rocky formations, based on official page summary",
        "Tarmac road access through Olhos de Água, based on official page summary",
        "Access to the sand by ramp and stairs, based on official page summary"
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
    "Beach name, municipality, former fishing-village context, low-tide freshwater springs, cliff setting, facilities, coordinates, beach code and 2026 Blue Flag season were verified from VisitPortugal, Visit Albufeira, ABAAE and municipal sources.",
    "ABAAE verifies the 2026 bathing season as 15 May to 15 October and the 2026 Blue Flag season as 1 July to 30 September.",
    "At the time checked on 18 May 2026, ABAAE showed the Blue Flag as not hoisted, so Blue Flag is treated as seasonal display rather than permanently hoisted.",
    "Current daily lifeguard staffing, concession operation, parking rules, beach wheelchair availability, assisted bathing and accessible toilets were not independently verified.",
    "The municipal page did not return accessible full text through direct fetch, so municipal details are used from official search-result summary and cross-checked cautiously with other official sources where possible.",
    "Nearby beaches, restaurants and attractions in card sections use only internal published AlgarveOfficial listing URLs, per editorial requirement.",
    "No external competitor website CTA was retained; website_url and google_business_url are cleared for this beach listing.",
    "The existing Supabase-hosted gallery was reviewed visually. One clearly identifiable Olhos de Água image was retained, one less certain cliff-only image was removed, and no duplicate image remains."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-dos-olhos-de-agua-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-dos-olhos-de-agua-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         featured_image_url = 'https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/listing-images/admin-listings/1778703442490-17cd7d9a-afdb-4ddb-8405-8a32529a368a.webp',
         latitude = 37.089726,
         longitude = -8.189878,
         meta_title = 'Praia dos Olhos de Água, Albufeira | Beach Guide',
         meta_description = 'Praia dos Olhos de Água in Albufeira is a village beach with low-tide freshwater springs, fishing boats, services and 2026 Blue Flag status.',
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
   where id = 'cd67db1d-5997-48b6-b861-3cec04e2c7d9'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia dos Olhos de Água beach with fishing boats and village buildings',
         is_featured = true,
         display_order = 0
   where id = '4a3ed4a2-8aec-4cff-8eaa-dd3981f40960'
     and listing_id = v_listing_id;
end $$;

commit;
