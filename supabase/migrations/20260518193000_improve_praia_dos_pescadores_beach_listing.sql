begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Pescadores",
  "slug": "praia-dos-pescadores-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Pescadores is a central urban beach directly in front of Albufeira's historic centre. Official sources verify its fishing-boat heritage, direct city access, support infrastructure, parking, restaurants nearby and accessible-beach recognition.",
  "full_description": "Praia dos Pescadores is one of Albufeira's central maritime beaches, set on the broad sandy seafront directly below the historic centre. VisitPortugal places it in the central section of the extensive sand in front of Albufeira and notes the traditional fishing boats that usually line the eastern end of the beach.\n\nThis is an urban beach rather than a quiet natural cove. Its appeal is practical and cultural: direct access from the city centre, a long sandy setting, nearby restaurants and bars, and a strong connection with Albufeira's fishing identity. VisitPortugal describes it as very busy and supported by complete beach infrastructure, while Visit Albufeira presents it as one of the city's most emblematic beaches in front of the historic centre.\n\nOfficial sources list safety or surveillance, sunshade rental, parking, bar, restaurant, windsurfing and accessible-beach recognition. Diário da República lists Pescadores as a 2026 bathing water with the bathing season from 15 May to 15 October. Current daily lifeguard staffing, parking rules and accessible support should still be checked locally before visiting.\n\nBlue Flag wording requires care. VisitPortugal lists Blue Flag as a beach service, but ABAAE's individual Pescadores page checked during this review showed 2025 dates, and Pescadores was not found in the ABAAE 2026 awarded list for Albufeira. For this listing, 2026 Blue Flag status is therefore not claimed. Nearby cards on AlgarveOfficial link only to already-published internal listings.",
  "highlights": [
    "Central urban beach directly below Albufeira's historic centre",
    "Traditional fishing-boat heritage verified by VisitPortugal",
    "Direct city-centre access with restaurants and bars nearby",
    "Parking, surveillance, bar, restaurant and sunshade rental listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Official 2026 bathing season listed from 15 May to 15 October"
  ],
  "best_time_to_visit": "The official 2026 bathing season for Pescadores runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for central Albufeira beach walks and lower heat. Early morning is useful for a calmer old-town beach visit, and late afternoon suits seafront walks and photography. Check beach flags, wind and sea conditions before swimming or windsurfing.",
  "parking_info": "VisitPortugal lists parking for Praia dos Pescadores. Current capacity, payment conditions, traffic restrictions and the easiest parking approach for the old-town seafront were not independently verified during this review. Because this is a central urban beach, visitors should confirm local parking conditions before travelling in peak periods.",
  "accessibility_info": "VisitPortugal lists Praia dos Pescadores as an accessible beach. Visit Albufeira references multiple access options for the central seafront, including lift, stairs, ramps and tunnel context. Current step-free route conditions, beach wheelchair availability, accessible toilets and assisted bathing were not independently verified; visitors with reduced mobility should confirm the best access point locally.",
  "lifeguard_info": "Diário da República lists Pescadores as a 2026 bathing water from 15 May to 15 October, and VisitPortugal lists safety or surveillance. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: not verified for 2026. VisitPortugal lists Blue Flag as a beach service, but the individual ABAAE Pescadores page checked during this review showed 2025 season dates and Pescadores was not found in the ABAAE 2026 awarded list for Albufeira checked on 18 May 2026.",
  "blue_flag_status": "not_verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "15 May 2026 to 15 October 2026",
    "notes": "Diário da República lists Pescadores for this 2026 bathing-season period, and VisitPortugal lists safety or surveillance. Exact daily staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.088991%2C-8.252283",
  "coordinates": {
    "latitude": 37.088991,
    "longitude": -8.252283,
    "source": "ABAAE official Pescadores beach entry."
  },
  "latitude": 37.088991,
  "longitude": -8.252283,
  "beach_code": "PTCV7X",
  "beach_type": "Central urban maritime sandy beach",
  "landscape": "A wide sandy beach directly below Albufeira's historic centre, with the urban seafront, promenade areas and traditional fishing-boat context shaping the visitor experience.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot and describes direct access from the city centre. Visit Albufeira references central-seafront access options including lift, stairs, ramps and tunnel context. Current route conditions should be checked locally.",
  "facilities": [
    { "name": "Official 2026 bathing season", "status": "15 May to 15 October 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal / current conditions not verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / nearby opening should be checked" },
    { "name": "Windsurfing", "status": "Conditions dependent" },
    { "name": "Blue Flag 2026", "status": "Not verified" },
    { "name": "Beach wheelchair or assisted bathing", "status": "Not verified for current season" }
  ],
  "includes": [
    "Official 2026 bathing season verified by Diário da República",
    "Seasonal surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "Bar, restaurant and sunshade rental listed by VisitPortugal",
    "Internal nearby listing cards only"
  ],
  "important_information": {
    "best_time_to_visit": "The official 2026 bathing season for Pescadores runs from 15 May to 15 October. June to September is the main period for seasonal beach services, while May, June and September are practical for central Albufeira beach walks and lower heat.",
    "know_before_you_go": "Praia dos Pescadores is a central urban beach with direct access from Albufeira's historic centre. VisitPortugal lists surveillance, parking, accessible-beach recognition, bar, restaurant, sunshade rental and windsurfing. Blue Flag status is not claimed for 2026 because Pescadores was not found in ABAAE's 2026 awarded list during this review.",
    "notes": [
      "Diário da República lists Pescadores as a 2026 bathing water from 15 May to 15 October.",
      "VisitPortugal lists parking, surveillance, accessible-beach recognition, bar, restaurant, sunshade rental and windsurfing.",
      "VisitPortugal describes the beach as very busy and directly accessible from the city centre.",
      "The individual ABAAE Pescadores page checked during this review showed 2025 dates.",
      "Pescadores was not found in the ABAAE 2026 awarded list for Albufeira checked on 18 May 2026.",
      "Current daily lifeguard staffing, accessible equipment and parking rules were not independently verified.",
      "Visitors should follow local flags, signage and beach notices before entering the water."
    ]
  },
  "important_notes": "Diário da República lists Pescadores as a 2026 bathing water from 15 May to 15 October. VisitPortugal lists parking, safety or surveillance, accessible-beach recognition, bar, restaurant, sunshade rental and windsurfing. Blue Flag status is not claimed for 2026 because Pescadores was not found in the ABAAE 2026 awarded list for Albufeira during this review.",
  "suitable_for": [
    "Visitors staying in Albufeira old town",
    "Short central beach visits",
    "Families using supervised seasonal areas",
    "Visitors wanting restaurants and bars nearby",
    "Accessible-beach users, subject to current confirmation",
    "Seafront walks",
    "Photography of Albufeira's urban beach setting"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a quiet natural cove in high season",
    "Visitors requiring confirmed assisted bathing without checking current arrangements",
    "Anyone expecting current 2026 Blue Flag status without local confirmation",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "best_for": [
    "Central Albufeira beach access",
    "Old-town beach visits",
    "Restaurants nearby",
    "Families using supervised seasonal areas",
    "Fishing-boat heritage",
    "Accessible-beach recognition, subject to current confirmation"
  ],
  "nearby_beaches": [
    {
      "name": "Praia do Peneco",
      "type": "Nearby internal beach listing",
      "distance": "Same central seafront",
      "description": "A published AlgarveOfficial old-town beach listing beside Praia dos Pescadores, linked internally from this page.",
      "href": "/listing/praia-do-peneco-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia da Oura",
      "type": "Nearby internal beach listing",
      "distance": "~2.3 km",
      "description": "A published AlgarveOfficial Albufeira resort beach listing east of the old-town seafront.",
      "href": "/listing/praia-da-oura-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de São Rafael",
      "type": "Nearby internal beach listing",
      "distance": "~3.0 km",
      "description": "A published AlgarveOfficial cliff-backed beach listing west of central Albufeira.",
      "href": "/listing/praia-de-sao-rafael-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Praia de Santa Eulália",
      "type": "Nearby internal beach listing",
      "distance": "~3.3 km",
      "description": "A published AlgarveOfficial Albufeira beach listing east of Praia dos Pescadores.",
      "href": "/listing/praia-de-santa-eulalia-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Restaurante Os Arcos",
      "type": "Restaurant",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Pescadores, based on stored listing coordinates.",
      "href": "/listing/restaurante-os-arcos-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Ambrosio",
      "type": "Restaurant",
      "distance": "~0.1 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Pescadores, based on stored listing coordinates.",
      "href": "/listing/ambrosio-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Taberna Saudade",
      "type": "Restaurant",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Pescadores, based on stored listing coordinates.",
      "href": "/listing/taberna-saudade-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Casa da Fonte",
      "type": "Restaurant",
      "distance": "~0.2 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Pescadores, based on stored listing coordinates.",
      "href": "/listing/casa-da-fonte-albufeira",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Cabana Fresca",
      "type": "Restaurant",
      "distance": "~0.3 km",
      "description": "Published AlgarveOfficial restaurant listing near Praia dos Pescadores, based on stored listing coordinates.",
      "href": "/listing/cabana-fresca-albufeira",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Coast and Country Tours",
      "type": "Experience",
      "distance": "~0.5 km",
      "description": "Published AlgarveOfficial experience listing near central Albufeira, based on stored listing coordinates.",
      "href": "/listing/coast-and-country-tours-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarve Charters",
      "type": "Experience",
      "distance": "~1.3 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/algarve-charters-quinta-do-lago",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "X Ride Algarve",
      "type": "Experience",
      "distance": "~1.3 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/x-ride-algarve-almancil",
      "verification_status": "Verified internal published listing"
    },
    {
      "name": "Algarexperience",
      "type": "Experience",
      "distance": "~1.4 km",
      "description": "Published AlgarveOfficial experience listing near the Albufeira Marina area, based on stored listing coordinates.",
      "href": "/listing/algarexperience-almancil",
      "verification_status": "Verified internal published listing"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Sesmarias",
    "Galé",
    "Guia",
    "Olhos de Água"
  ],
  "walking_trails_nearby": [
    {
      "name": "Urban Front Beaches",
      "description": "Visit Albufeira identifies the central urban beach context that links Praia dos Pescadores with Praia do Peneco and Praia do Inatel. Route conditions and any access changes should be checked locally.",
      "verification_status": "Verified"
    },
    {
      "name": "Albufeira old-town seafront walk",
      "description": "A practical short walk along the central seafront and old-town access points. Individual places are verified by official tourism sources, but route conditions should be checked locally.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Use the beach as a practical old-town beach stop rather than a quiet natural escape.",
    "Check local flags and signage before swimming or windsurfing.",
    "Confirm current parking conditions before driving into the central seafront area.",
    "Confirm the most suitable accessible route before travelling if step-free access or assistance is required.",
    "Use the internal nearby cards for published AlgarveOfficial restaurants and experiences around central Albufeira.",
    "Visit early or later in the day for a calmer central beach walk."
  ],
  "photography_notes": "Praia dos Pescadores is strongest for central Albufeira seafront views, fishing-boat context, the old-town backdrop and broad sandy beach scenes. Early morning and late afternoon usually provide softer light across the bay.",
  "family_notes": "Praia dos Pescadores can suit families who want a central beach with facilities nearby and who use supervised seasonal areas. Families should still check beach flags, watch children around water-sports activity and confirm current access or assistance needs before travelling.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. The central seafront can be busy, so take extra care around access points, water-sports areas and crowded sections.",
  "accessibility_notes": "VisitPortugal lists Praia dos Pescadores as an accessible beach. Current accessible route conditions, assisted bathing, adapted equipment and accessible toilets were not independently verified; confirm locally before relying on accessibility support.",
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
      "question": "Where is Praia dos Pescadores?",
      "answer": "Praia dos Pescadores is in Albufeira, directly in front of the historic centre on the central urban seafront."
    },
    {
      "question": "Is there parking at Praia dos Pescadores?",
      "answer": "VisitPortugal lists parking for Praia dos Pescadores. Current capacity, payment rules and central Albufeira traffic conditions were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia dos Pescadores?",
      "answer": "VisitPortugal lists safety or surveillance, and Diário da República lists the 2026 bathing season from 15 May to 15 October. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia dos Pescadores a Blue Flag beach?",
      "answer": "Current 2026 Blue Flag status was not verified. VisitPortugal lists Blue Flag as a service, but Pescadores was not found in ABAAE's 2026 awarded list for Albufeira during this review."
    },
    {
      "question": "Is Praia dos Pescadores accessible for visitors with reduced mobility?",
      "answer": "VisitPortugal lists Praia dos Pescadores as an accessible beach. Current step-free route details, assisted bathing, adapted equipment and accessible toilets should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia dos Pescadores?",
      "answer": "Yes. VisitPortugal notes restaurants and bars nearby, and this page links to nearby published AlgarveOfficial restaurant listings based on stored internal listing coordinates."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings to Praia dos Pescadores?",
      "answer": "Nearby published AlgarveOfficial beach listings linked from this page include Praia do Peneco, Praia da Oura, Praia de São Rafael and Praia de Santa Eulália."
    },
    {
      "question": "What is the best time to visit Praia dos Pescadores?",
      "answer": "The official 2026 bathing season runs from 15 May to 15 October. June to September is the main beach-service period, while May, June and September are practical for central beach walks and lower heat."
    }
  ],
  "seo": {
    "meta_title": "Praia dos Pescadores, Albufeira | Beach Guide",
    "meta_description": "Praia dos Pescadores in Albufeira is a central urban beach with fishing-boat heritage, direct old-town access, facilities, parking and restaurants nearby.",
    "keywords": [
      "Praia dos Pescadores",
      "Fishermen's Beach Albufeira",
      "Albufeira beach",
      "Albufeira old town beach",
      "central Albufeira beach",
      "Algarve beaches",
      "Portugal beaches",
      "accessible beach Albufeira"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Pescadores",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-pescadores",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Central position on the sandy seafront in front of Albufeira",
        "Traditional fishing boats at the eastern end",
        "Direct access from the city centre",
        "Busy beach character",
        "Support infrastructure and restaurants/bars nearby",
        "Facilities including surveillance, sunshade rental, parking, bar, restaurant, windsurfing and accessible-beach recognition"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia dos Pescadores",
      "source_url": "https://visitalbufeira.pt/praia/praia-dos-pescadores",
      "facts_verified": [
        "Praia dos Pescadores as one of Albufeira's emblematic beaches",
        "Location in front of the historic town centre",
        "Historic fishing-harbour character",
        "Central seafront access context"
      ]
    },
    {
      "source_name": "Visit Albufeira - Urban Front Beaches",
      "source_url": "https://visitalbufeira.pt/experiencias/praias-da-frente-urbana/",
      "facts_verified": [
        "Urban-front beach context",
        "Central location near the historic centre",
        "Relationship with Praia do Peneco and Praia do Inatel"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Pescadores",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/pescadores/",
      "facts_verified": [
        "Official Pescadores coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates 37.088991, -8.252283",
        "Beach code PTCV7X",
        "Individual page checked and found to show 2025 bathing-season and Blue Flag-season dates"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Albufeira 2026 Blue Flag awarded list checked",
        "Pescadores not found among the Albufeira 2026 awarded locations during this review",
        "Nearby Albufeira 2026 awarded beaches include Peneco, Oura, S. Rafael, Salgados and Santa Eulália"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Pescadores bathing water listed for Albufeira",
        "Bathing water code PTCV7X",
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
    "Beach name, municipality, central location, fishing-boat heritage, direct city access and busy character were verified from official tourism sources.",
    "The 2026 bathing season was verified from Diário da República as 15 May to 15 October.",
    "VisitPortugal lists Blue Flag as a beach service, but ABAAE's 2026 awarded list checked on 18 May 2026 did not include Pescadores among Albufeira's 2026 awarded locations.",
    "The individual ABAAE Pescadores page checked during this review showed 2025 bathing-season and Blue Flag-season dates, so it was used for coordinates and historical context, not as proof of current 2026 Blue Flag status.",
    "Accessibility is verified at recognition level through VisitPortugal, but current assisted bathing, adapted equipment and accessible toilets were not independently verified.",
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
  where slug = 'praia-dos-pescadores-albufeira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-dos-pescadores-albufeira not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.088991,
         longitude = -8.252283,
         meta_title = 'Praia dos Pescadores, Albufeira | Beach Guide',
         meta_description = 'Praia dos Pescadores in Albufeira is a central urban beach with fishing-boat heritage, direct old-town access, facilities, parking and restaurants nearby.',
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
     set alt_text = 'Praia dos Pescadores shoreline at sunset below Albufeira'
   where id = 'd26e94ae-9e17-45b9-bbde-38aed13a2f19'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Praia dos Pescadores sandy beach and promenade viewed from above'
   where id = '4eea16f6-fa61-4178-9c58-5dbd53ceb680'
     and listing_id = v_listing_id;
end $$;

commit;
