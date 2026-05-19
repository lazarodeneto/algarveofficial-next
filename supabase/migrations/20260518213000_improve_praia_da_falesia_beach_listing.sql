begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Falésia",
  "slug": "praia-da-falesia-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Olhos de Água / Açoteias, near Vilamoura",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Falésia is a long cliff-backed beach in Albufeira, running through the Açoteias and Alfamar coastal area towards the Vilamoura side. Official sources verify its broad sand, red and golden cliff landscape, parking, seasonal support and 2026 Blue Flag sections.",
  "full_description": "Praia da Falésia is one of the Algarve's longest and most visually recognisable cliff-backed beaches, extending along the Albufeira coast from the Olhos de Água and Açoteias side towards Alfamar and the Vilamoura-facing end. VisitPortugal identifies the official beach entry as Praia da Falésia - Açoteias / Alfamar and describes access through both the Açoteias and Alfamar areas.\n\nThe setting is defined by scale and colour rather than a small-cove feel. A broad sandy shoreline sits below high red, ochre and pale-gold cliffs, with resort-area access points above the beach. It is especially useful for long beach walks, wide coastal views and visitors staying around Açoteias, Olhos de Água, Alfamar or the western Vilamoura side.\n\nPraia da Falésia should be treated as a long beach system with several named access points, not one single entrance. VisitPortugal lists safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and bodyboard. ABAAE verifies 2026 Blue Flag status for Falésia Açoteias and Falésia Alfamar, with the bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September for those checked sections.\n\nVisitors should confirm the best access point for their plans, because parking, stairs, concessions and beach support can vary by section. Step-free access and assisted-bathing support were not independently verified for this listing. Keep to marked routes, stay away from cliff edges and cliff bases, and follow local flags and signage before entering the water.",
  "highlights": [
    "Long cliff-backed beach along the Açoteias and Alfamar side of Albufeira",
    "Broad sand below red, ochre and pale-gold cliffs",
    "Useful for long shoreline walks when tide and conditions allow",
    "Parking, showers, bar, restaurant and seasonal surveillance listed by VisitPortugal",
    "2026 Blue Flag status verified for Falésia Açoteias and Falésia Alfamar by ABAAE",
    "Internal nearby cards link only to published AlgarveOfficial listings"
  ],
  "best_time_to_visit": "The official 2026 bathing season for checked Falésia sections runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for long walks, milder temperatures and easier access planning. Early morning and late afternoon are useful for softer light on the cliffs. Check tide, wind, beach flags and local signage before swimming or walking below cliffs.",
  "parking_info": "VisitPortugal lists parking for Praia da Falésia - Açoteias / Alfamar. Current capacity, payment rules, traffic restrictions and the easiest parking approach vary by access point and were not independently verified during this review. Visitors should confirm the section they plan to use before driving, especially in summer.",
  "accessibility_info": "Step-free access was not verified for this listing. Praia da Falésia is a long cliff-backed beach system, and access can vary by section. VisitPortugal lists access by car, motorcycle and on foot, but current ramp access, beach wheelchair availability, accessible toilets and assisted bathing were not independently verified; visitors with reduced mobility should confirm current conditions locally before travelling.",
  "lifeguard_info": "ABAAE lists the 2026 bathing season for Falésia Açoteias and Falésia Alfamar from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing and coverage by access section were not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 for Falésia Açoteias and Falésia Alfamar via ABAAE. The official ABAAE pages list the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "ABAAE lists Falésia Açoteias and Falésia Alfamar for this bathing-season period, and VisitPortugal lists safety or surveillance. Exact daily staffing and section coverage were not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.086149%2C-8.168335",
  "coordinates": {
    "latitude": 37.086149,
    "longitude": -8.168335,
    "source": "ABAAE official Falésia Açoteias beach entry."
  },
  "latitude": 37.086149,
  "longitude": -8.168335,
  "beach_code": "PTCH3H",
  "coordinate_points": [
    {
      "name": "Falésia Açoteias",
      "latitude": 37.086149,
      "longitude": -8.168335,
      "verification_status": "Verified by ABAAE"
    }
  ],
  "beach_type": "Long cliff-backed maritime sandy beach",
  "landscape": "A broad sandy beach running below high red, ochre and pale-gold cliffs, with resort-area access points above the shoreline and a long open coastal perspective towards the Vilamoura side.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot and identifies access through the Açoteias and Alfamar areas. Current parking, stairs, ramps, concessions and temporary restrictions should be checked for the specific access point used.",
  "facilities": [
    { "name": "Blue Flag 2026 for Falésia Açoteias", "status": "Verified / seasonal display" },
    { "name": "Blue Flag 2026 for Falésia Alfamar", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026 for checked sections" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Bodyboard", "status": "Conditions dependent" },
    { "name": "Step-free access", "status": "Not verified" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "2026 Blue Flag status verified by ABAAE for Falésia Açoteias and Falésia Alfamar",
    "2026 bathing season verified by ABAAE for checked sections",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Showers, bar, restaurant and sunshade rental listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season for checked Falésia sections runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for long walks, milder temperatures and easier access planning.",
    "know_before_you_go": "Praia da Falésia is a long beach system with several access points. ABAAE verifies 2026 Blue Flag status for Falésia Açoteias and Falésia Alfamar. VisitPortugal lists parking, surveillance, showers, bar, restaurant, sunshade rental, light boat rental, windsurfing and bodyboard. Current access, parking, staffing and accessibility support should be checked by section.",
    "notes": [
      "ABAAE lists the 2026 bathing season as 15 May to 15 October for Falésia Açoteias and Falésia Alfamar.",
      "ABAAE lists the 2026 Blue Flag season as 1 July to 30 September for Falésia Açoteias and Falésia Alfamar.",
      "VisitPortugal identifies the official beach entry as Praia da Falésia - Açoteias / Alfamar.",
      "VisitPortugal lists parking, surveillance, showers, bar, restaurant, sunshade rental, light boat rental, windsurfing and bodyboard.",
      "Current daily lifeguard staffing, accessible equipment, assisted bathing and parking rules were not independently verified.",
      "Visitors should avoid cliff edges and cliff bases and keep to marked access routes.",
      "Nearby card sections use only internal published AlgarveOfficial listings."
    ]
  },
  "important_notes": "ABAAE verifies 2026 Blue Flag status for Falésia Açoteias and Falésia Alfamar, with the 2026 bathing season from 15 May to 15 October and the Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, safety or surveillance, showers, bar, restaurant, sunshade rental, light boat rental, windsurfing and bodyboard. Current daily staffing, parking rules and accessibility support were not independently verified.",
  "suitable_for": [
    "Visitors staying in Açoteias, Olhos de Água, Alfamar or the western Vilamoura area",
    "Long beach walks when tide and conditions allow",
    "Visitors wanting a wide sandy beach",
    "Photography of red and golden cliffs",
    "Families using supervised seasonal areas and checking local conditions",
    "Water-sports users when conditions are suitable",
    "Visitors combining the beach with nearby internal AlgarveOfficial restaurant or business listings"
  ],
  "not_suitable_for": [
    "Visitors looking for a small sheltered cove",
    "Visitors requiring confirmed step-free access to the sand",
    "Visitors requiring assisted-bathing support without checking current arrangements",
    "Anyone planning to walk close to cliff bases or use informal cliff-edge paths",
    "Visitors expecting identical facilities across every Falésia access point"
  ],
  "best_for": [
    "Long beach walks",
    "Red-cliff scenery",
    "Wide sandy beach days",
    "Photography",
    "Resort-area access",
    "Families using supervised seasonal areas"
  ],
  "nearby_beaches": [
    {
      "name": "Praia dos Olhos de Água",
      "type": "Nearby internal beach listing",
      "distance": "~2.0 km",
      "description": "A published AlgarveOfficial beach listing west of the Falésia / Açoteias area, linked internally from this page.",
      "href": "/listing/praia-dos-olhos-de-agua-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Santa Eulália",
      "type": "Nearby internal beach listing",
      "distance": "~4.1 km",
      "description": "A published AlgarveOfficial resort beach listing west of Praia da Falésia, linked internally from this page.",
      "href": "/listing/praia-de-santa-eulalia-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Vilamoura",
      "type": "Nearby internal beach listing",
      "distance": "~4.9 km",
      "description": "A published AlgarveOfficial beach listing near the Vilamoura side of the coast, linked internally from this page.",
      "href": "/listing/praia-de-vilamoura-loule",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Oura",
      "type": "Nearby internal beach listing",
      "distance": "~5.2 km",
      "description": "A published AlgarveOfficial Albufeira resort beach listing west of Falésia, linked internally from this page.",
      "href": "/listing/praia-da-oura-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Quarteira",
      "type": "Nearby internal beach listing",
      "distance": "~6.0 km",
      "description": "A published AlgarveOfficial urban beach listing east of the Vilamoura side, linked internally from this page.",
      "href": "/listing/praia-de-quarteira-loule",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Al Quimia",
      "type": "Restaurant",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia da Falésia, based on stored listing coordinates and listing text.",
      "href": "/listing/al-quimia-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Adega Ticosta Restaurante Tradicional Português",
      "type": "Restaurant",
      "distance": "~1.6 km",
      "description": "Published AlgarveOfficial Portuguese restaurant listing near the Açoteias and Olhos de Água area, based on stored listing coordinates and listing text.",
      "href": "/listing/adega-ticosta-restaurante-tradicional-portugues-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Versatile Restaurante",
      "type": "Restaurant",
      "distance": "~2.3 km",
      "description": "Published AlgarveOfficial restaurant listing near the Falésia and Olhos de Água area, based on stored listing coordinates.",
      "href": "/listing/versatile-restaurante-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Taverna",
      "type": "Restaurant",
      "distance": "~3.1 km",
      "description": "Published AlgarveOfficial Italian restaurant listing on the Vilamoura side, based on stored listing coordinates and listing text.",
      "href": "/listing/taverna-vilamoura",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "O Rocha Baixinha",
      "type": "Restaurant",
      "distance": "~3.2 km",
      "description": "Published AlgarveOfficial restaurant listing near the Rocha Baixinha and Vilamoura side, based on stored listing coordinates.",
      "href": "/listing/o-rocha-baixinha-vilamoura",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "SAYANNA Wellness & Spa - EPIC SANA Algarve",
      "type": "Wellness spa",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial wellness listing near Praia da Falésia, based on stored listing coordinates and listing text.",
      "href": "/listing/sayanna-wellness-spa-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Pine Cliffs Golf Course",
      "type": "Golf",
      "distance": "~1.0 km",
      "description": "Published AlgarveOfficial golf listing above the Atlantic cliffs in Albufeira, based on stored listing coordinates and listing text.",
      "href": "/listing/pine-cliffs-golf-course",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Serenity - the Art of Well Being, Pine Cliffs Algarve",
      "type": "Wellness spa",
      "distance": "~1.1 km",
      "description": "Published AlgarveOfficial wellness listing near the Falésia and Pine Cliffs area, based on stored listing coordinates and listing text.",
      "href": "/listing/serenity-the-art-of-well-being-pine-cliffs-algarve-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Hotel Portobay Falésia",
      "type": "Nearby business",
      "distance": "~1.6 km",
      "description": "Published AlgarveOfficial nearby business listing in the Falésia area, based on stored listing coordinates.",
      "href": "/listing/hotel-portobay-falesia-vilamoura",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Olhos de Água",
    "Açoteias",
    "Albufeira",
    "Vilamoura",
    "Quarteira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Praia da Falésia shoreline walk",
      "description": "A long beach walk along the Falésia shoreline may be possible when tide, weather and sea conditions allow. Visitors should avoid cliff bases and check local signage.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Açoteias and Falésia access paths",
      "description": "VisitPortugal identifies access through Açoteias and Alfamar. Current path condition, steps, parking and any temporary restrictions should be checked for the specific access point used.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Choose your access point before travelling; Falésia is a long beach system rather than one single entrance.",
    "Arrive earlier in summer for easier parking and a calmer start to a long beach day.",
    "Keep away from cliff edges and cliff bases, especially after rain or strong wind.",
    "Check tide and sea conditions before planning a long shoreline walk.",
    "Confirm current accessible access and assistance before travelling if reduced mobility support is required.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants and businesses around Açoteias, Olhos de Água and the Vilamoura side."
  ],
  "photography_notes": "Praia da Falésia is strongest for red and ochre cliff textures, wide sand, long coastal perspectives and late-day colour. Use safe marked viewpoints and keep well back from cliff edges.",
  "family_notes": "Praia da Falésia can suit families who want a wide sandy beach and who use supervised seasonal areas. Families should still choose the most suitable access point, check flags, watch children near the water and stay away from cliffs and unstable slopes.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Keep away from cliff edges, cliff bases and informal paths, and take care around access stairs or steep paths.",
  "accessibility_notes": "Step-free access and assisted-bathing support were not verified for this listing. Because Falésia is a long cliff-backed beach with several access points, visitors with reduced mobility should confirm current ramp, stair, parking and beach-support conditions locally before travelling.",
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
      "question": "Where is Praia da Falésia?",
      "answer": "Praia da Falésia is on the Albufeira coast, around the Olhos de Água, Açoteias and Alfamar area, extending towards the Vilamoura side."
    },
    {
      "question": "Is there parking at Praia da Falésia?",
      "answer": "VisitPortugal lists parking for Praia da Falésia - Açoteias / Alfamar. Current capacity, payment rules and the best access point should be checked locally."
    },
    {
      "question": "Are there lifeguards at Praia da Falésia?",
      "answer": "VisitPortugal lists safety or surveillance, and ABAAE lists the 2026 bathing season for Falésia Açoteias and Falésia Alfamar from 15 May to 15 October. Exact daily lifeguard staffing was not independently verified."
    },
    {
      "question": "Is Praia da Falésia a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Falésia Açoteias and Falésia Alfamar as 2026 Blue Flag beach sections, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Is Praia da Falésia accessible for visitors with reduced mobility?",
      "answer": "Step-free access was not verified for this listing. Because Falésia has several cliff-backed access points, visitors with reduced mobility should confirm the current route, parking and support before travelling."
    },
    {
      "question": "Are there restaurants near Praia da Falésia?",
      "answer": "Yes. VisitPortugal lists bar and restaurant services, and this page links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia da Falésia?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia dos Olhos de Água, Praia de Santa Eulália, Praia de Vilamoura, Praia da Oura and Praia de Quarteira."
    },
    {
      "question": "What is the best time to visit Praia da Falésia?",
      "answer": "The official 2026 bathing season for checked Falésia sections runs from 15 May to 15 October. May, June and September are practical for long walks and milder temperatures, while June to September is the main service period."
    }
  ],
  "seo": {
    "meta_title": "Praia da Falésia, Albufeira | Beach Guide",
    "meta_description": "Praia da Falésia in Albufeira is a long red-cliff beach with broad sand, resort-area access, parking, facilities and 2026 Blue Flag sections.",
    "keywords": [
      "Praia da Falésia",
      "Praia da Falesia",
      "Falesia Beach",
      "Albufeira beach",
      "Açoteias beach",
      "Alfamar beach",
      "Olhos de Água beaches",
      "Algarve beaches",
      "Portugal beaches"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Falésia - Açoteias / Alfamar",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar",
      "facts_verified": [
        "Beach name and official section name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Access through Açoteias and Alfamar",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing and bodyboard",
        "Access by car or motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Falésia Açoteias",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/falesia-acoteias/",
      "facts_verified": [
        "Official Falésia Açoteias coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.086149, -8.168335",
        "Beach code PTCH3H",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Falésia Alfamar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/falesia-alfamar/",
      "facts_verified": [
        "Official Falésia Alfamar coastal beach entry",
        "Municipality of Albufeira",
        "2026 bathing season from 15 May to 15 October",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Falésia Açoteias listed among Albufeira's 2026 Blue Flag locations",
        "Falésia Alfamar listed among Albufeira's 2026 Blue Flag locations"
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
    "Beach name, municipality, access through Açoteias and Alfamar, facilities and 2026 Blue Flag sections were verified from VisitPortugal and ABAAE.",
    "The 2026 bathing season for Falésia Açoteias and Falésia Alfamar was verified from ABAAE as 15 May to 15 October.",
    "ABAAE verifies Falésia Açoteias and Falésia Alfamar as 2026 Blue Flag beach sections and lists the 2026 Blue Flag season from 1 July to 30 September.",
    "This update avoids third-party ranking claims in the public listing text and relies on official tourism and Blue Flag data.",
    "Step-free access, assisted bathing, adapted equipment and accessible toilets were not independently verified.",
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
  where slug = 'praia-da-falesia-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-falesia-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.086149,
         longitude = -8.168335,
         meta_title = 'Praia da Falésia, Albufeira | Beach Guide',
         meta_description = 'Praia da Falésia in Albufeira is a long red-cliff beach with broad sand, resort-area access, parking, facilities and 2026 Blue Flag sections.',
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
     set alt_text = 'Praia da Falésia red cliffs and wide sand',
         is_featured = true,
         display_order = 0
   where id = '05e9ea1b-77bf-4be0-9638-a4fe559c87b1'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia da Falésia cliff-top view over the shoreline',
         is_featured = false,
         display_order = 1
   where id = 'b6d2259b-4973-4b88-b570-868721ad07a7'
     and listing_id = v_listing_id;
end $$;

commit;
