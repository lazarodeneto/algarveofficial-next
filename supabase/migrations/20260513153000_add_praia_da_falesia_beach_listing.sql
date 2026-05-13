begin;

insert into public.categories (name, slug, icon, display_order, is_active, is_featured)
values ('Beaches', 'beaches', 'Umbrella', 30, true, true)
on conflict (slug) do update set
  name = excluded.name,
  icon = coalesce(public.categories.icon, excluded.icon),
  is_active = true,
  updated_at = now();

insert into public.cities (name, slug, short_description, latitude, longitude, is_active, is_featured)
values (
  'Olhos de Água / Vilamoura',
  'olhos-de-agua-vilamoura',
  'Coastal corridor linking Olhos de Água, Praia da Falésia and the Vilamoura side of the Algarve coast.',
  37.086149,
  -8.168335,
  true,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  short_description = coalesce(public.cities.short_description, excluded.short_description),
  latitude = coalesce(public.cities.latitude, excluded.latitude),
  longitude = coalesce(public.cities.longitude, excluded.longitude),
  is_active = true,
  updated_at = now();

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_old_slug text;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid := null;
  v_slug text := 'praia-da-falesia-albufeira-loule';
  v_name text := 'Praia da Falésia';
  v_short_description text := $short$
Praia da Falésia is a long cliff-backed beach linking Olhos de Água and the Vilamoura side of the Algarve coast, within the Albufeira / Loulé resort corridor. It is known for its red and ochre cliffs, wide sandy shoreline, resort-adjacent access points and verified international recognition from Tripadvisor.
$short$;
  v_description text := $description$
Praia da Falésia is the wide cliff-backed strand that links Olhos de Água and the Vilamoura side of the coast, with official tourism sources describing several kilometres of sand between the two. The beach is named for its long line of cliffs, where red, copper, ochre and golden tones are especially strong late in the day. The setting is open and expansive rather than cove-like: visitors come for long walks, wide views, resort-adjacent access points and the contrast between pale sand and coloured cliff face.

The wider Falésia stretch is divided into recognised bathing areas and access points, including Falésia Açoteias, Falésia Alfamar and Rocha Baixinha sections. VisitPortugal records paved-road access in the central Açoteias area and access by Alfamar, while Blue Flag data identifies named sections with coordinates and 2026 seasonal bathing information. At Falésia Açoteias, the Blue Flag platform describes road access, parking at the access point and wooden stairs to the sand; visitors should therefore avoid assuming step-free access across the whole beach.

International recognition is a key part of Falésia's profile: Tripadvisor named Praia da Falésia the world's No. 1 beach in its 2024 Travellers' Choice Best of the Best Beaches awards, and Albufeira Tourism reported a No. 5 worldwide and No. 3 Europe ranking in the 2026 awards. Even so, this remains a natural cliff coastline: sea conditions, access, concessions and supervision can vary by season and by beach section. Nearby route ideas include Olhos de Água, Barranco das Belharucas, Rocha Baixinha, Vilamoura Marina and the Cerro da Vila area.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Falésia",
  "slug": "praia-da-falesia-albufeira-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Olhos de Água / Vilamoura",
  "concelho": "Albufeira / Loulé",
  "municipality": "Albufeira / Loulé",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Falésia is a long cliff-backed beach linking Olhos de Água and the Vilamoura side of the Algarve coast, within the Albufeira / Loulé resort corridor. It is known for its red and ochre cliffs, wide sandy shoreline, resort-adjacent access points and verified international recognition from Tripadvisor.",
  "full_description": "Praia da Falésia is the wide cliff-backed strand that links Olhos de Água and the Vilamoura side of the coast, with official tourism sources describing several kilometres of sand between the two. The beach is named for its long line of cliffs, where red, copper, ochre and golden tones are especially strong late in the day. The setting is open and expansive rather than cove-like: visitors come for long walks, wide views, resort-adjacent access points and the contrast between pale sand and coloured cliff face.\n\nThe wider Falésia stretch is divided into recognised bathing areas and access points, including Falésia Açoteias, Falésia Alfamar and Rocha Baixinha sections. VisitPortugal records paved-road access in the central Açoteias area and access by Alfamar, while Blue Flag data identifies named sections with coordinates and 2026 seasonal bathing information. At Falésia Açoteias, the Blue Flag platform describes road access, parking at the access point and wooden stairs to the sand; visitors should therefore avoid assuming step-free access across the whole beach.\n\nInternational recognition is a key part of Falésia's profile: Tripadvisor named Praia da Falésia the world's No. 1 beach in its 2024 Travellers' Choice Best of the Best Beaches awards, and Albufeira Tourism reported a No. 5 worldwide and No. 3 Europe ranking in the 2026 awards. Even so, this remains a natural cliff coastline: sea conditions, access, concessions and supervision can vary by season and by beach section. Nearby route ideas include Olhos de Água, Barranco das Belharucas, Rocha Baixinha, Vilamoura Marina and the Cerro da Vila area.",
  "coordinates": {
    "latitude": 37.086149,
    "longitude": -8.168335,
    "notes": "Coordinates are for the official Blue Flag Falésia Açoteias access point, not for the entire multi-kilometre beach."
  },
  "beach_type": "Long sandy maritime beach; cliff-backed coastal beach with named official bathing sections.",
  "landscape": "Wide Atlantic-facing sand backed by a continuous red and ochre cliff line, with pine forest and cliff-top walking areas verified at Falésia Açoteias.",
  "access": "Multiple access points. VisitPortugal verifies paved-road access in the central Açoteias area and access by Alfamar; the Blue Flag platform verifies road access, parking at the access point and wooden stair access at Falésia Açoteias. Access varies by section and should be checked locally before visiting.",
  "highlights": [
    "Several-kilometre sandy beach between Olhos de Água and Vilamoura, verified by VisitPortugal",
    "Red, copper, ochre and golden cliff scenery, especially photogenic late in the day",
    "Named the world's No. 1 beach in Tripadvisor's 2024 Travellers' Choice Best of the Best Beaches awards",
    "Reported by Albufeira Tourism as No. 5 worldwide and No. 3 in Europe in Tripadvisor's 2026 awards",
    "Multiple official 2026 Blue Flag-listed bathing areas along the wider Falésia / Rocha Baixinha stretch",
    "Resort-adjacent access points around Açoteias, Alfamar, Rocha Baixinha and the Vilamoura side"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Long beach walks",
    "Couples",
    "Families",
    "Coastal walks",
    "Resort access",
    "Swimming when conditions allow",
    "Seasonal water sports"
  ],
  "suitable_for": [
    "Visitors looking for a long sandy beach",
    "Photographers",
    "Couples",
    "Families who choose a suitable access point",
    "Resort guests",
    "Coastal walkers",
    "Visitors combining beach time with Vilamoura or Olhos de Água"
  ],
  "not_suitable_for": [
    "Visitors who require guaranteed step-free access across the entire beach",
    "Those seeking a small secluded cove",
    "Visitors uncomfortable with cliff or stair access at some sections",
    "Beachgoers expecting identical facilities along the full stretch"
  ],
  "facilities": [
    { "name": "Concessioned beach areas", "status": "Verified" },
    { "name": "Road access at Açoteias / Alfamar sections", "status": "Verified" },
    { "name": "Parking at the Falésia Açoteias access point", "status": "Verified" },
    { "name": "Wooden stair access at Falésia Açoteias", "status": "Verified" },
    { "name": "2026 Blue Flag-listed sections: Falésia Açoteias, Falésia Alfamar, Rocha Baixinha, Rocha Baixinha-Nascente and Rocha Baixinha-Poente", "status": "Seasonal" },
    { "name": "Showers, bar, restaurant, parasol rental, light boat rental and windsurf listed by VisitPortugal for Falésia - Açoteias / Alfamar", "status": "Seasonal" },
    { "name": "Public toilets", "status": "Not verified" }
  ],
  "includes": [
    "Concessioned beach areas",
    "Road access at Açoteias / Alfamar sections",
    "Parking at the Falésia Açoteias access point",
    "Wooden stair access at Falésia Açoteias",
    "2026 Blue Flag-listed sections: Falésia Açoteias, Falésia Alfamar, Rocha Baixinha, Rocha Baixinha-Nascente and Rocha Baixinha-Poente",
    "Showers, bar, restaurant, parasol rental, light boat rental and windsurf listed by VisitPortugal for Falésia - Açoteias / Alfamar"
  ],
  "important_information": {
    "best_time_to_visit": "May, June and September are usually the most comfortable months for long walks and photography with more space than peak summer. July and August are best for the fullest seasonal beach atmosphere and resort-side services, but visitors should expect more people and should verify access, facilities and supervision locally. Late afternoon is particularly strong for photographing the red and ochre cliffs.",
    "know_before_you_go": "Praia da Falésia should be treated as a long beach system with several named access points and official bathing sections rather than one single fixed entrance.\nFor 2026, official Blue Flag sources list bathing season dates of 15 May to 15 October and Blue Flag season dates of 1 July to 30 September for checked Falésia / Rocha Baixinha sections.\nSome access points involve stairs, including wooden stairs at Falésia Açoteias; visitors with reduced mobility should confirm current step-free access before visiting.\nFacilities, rentals, concessions and support services may be seasonal and may differ between Açoteias, Alfamar, Rocha Baixinha and the Vilamoura side.\nSea conditions can vary. Visitors should check beach flags, local signage and lifeguard instructions before entering the water.\nThis is a cliff-backed coastline. Visitors should keep to marked paths, avoid cliff edges and avoid standing close to the base of cliffs.",
    "notes": [
      "Praia da Falésia should be treated as a long beach system with several named access points and official bathing sections rather than one single fixed entrance.",
      "For 2026, official Blue Flag sources list bathing season dates of 15 May to 15 October and Blue Flag season dates of 1 July to 30 September for checked Falésia / Rocha Baixinha sections.",
      "Some access points involve stairs, including wooden stairs at Falésia Açoteias; visitors with reduced mobility should confirm current step-free access before visiting.",
      "Facilities, rentals, concessions and support services may be seasonal and may differ between Açoteias, Alfamar, Rocha Baixinha and the Vilamoura side.",
      "Sea conditions can vary. Visitors should check beach flags, local signage and lifeguard instructions before entering the water.",
      "This is a cliff-backed coastline. Visitors should keep to marked paths, avoid cliff edges and avoid standing close to the base of cliffs."
    ]
  },
  "important_notes": "Praia da Falésia should be treated as a long beach system with several named access points and official bathing sections rather than one single fixed entrance.\nFor 2026, official Blue Flag sources list bathing season dates of 15 May to 15 October and Blue Flag season dates of 1 July to 30 September for checked Falésia / Rocha Baixinha sections.\nSome access points involve stairs, including wooden stairs at Falésia Açoteias; visitors with reduced mobility should confirm current step-free access before visiting.\nFacilities, rentals, concessions and support services may be seasonal and may differ between Açoteias, Alfamar, Rocha Baixinha and the Vilamoura side.\nSea conditions can vary. Visitors should check beach flags, local signage and lifeguard instructions before entering the water.\nThis is a cliff-backed coastline. Visitors should keep to marked paths, avoid cliff edges and avoid standing close to the base of cliffs.",
  "best_time_to_visit": "May, June and September are usually the most comfortable months for long walks and photography with more space than peak summer. July and August are best for the fullest seasonal beach atmosphere and resort-side services, but visitors should expect more people and should verify access, facilities and supervision locally. Late afternoon is particularly strong for photographing the red and ochre cliffs.",
  "nearby_attractions": [
    {
      "name": "Praia do Barranco das Belharucas",
      "type": "Beach",
      "description": "Located at the western end of the wider Falésia beach system, separated from Olhos de Água by rocks that VisitPortugal says may be crossed on foot at low tide.",
      "verification_status": "Verified"
    },
    {
      "name": "Rocha Baixinha",
      "type": "Beach section",
      "description": "The eastern part of the extensive Falésia beach system, close to Vilamoura Marina and divided into recognised beach areas.",
      "verification_status": "Verified"
    },
    {
      "name": "Olhos de Água",
      "type": "Coastal village / beach area",
      "description": "A traditional fishing village area known for freshwater springs visible among the rocks and sand at low tide.",
      "verification_status": "Verified"
    },
    {
      "name": "Marina de Vilamoura",
      "type": "Marina",
      "description": "A major Algarve marina and visitor hub close to the eastern side of the Falésia / Rocha Baixinha beach area.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vilamoura",
      "type": "Beach",
      "description": "Neighbouring beach on the Vilamoura side, close to the marina and part of the wider resort coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Cerro da Vila",
      "type": "Archaeological site",
      "description": "Roman ruins in the Vilamoura area, referenced by VisitPortugal as being near the road that gives access to Praia da Falésia.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Olhos de Água",
    "Albufeira",
    "Vilamoura",
    "Quarteira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Falésia Açoteias cliff-top paths",
      "description": "The Blue Flag platform describes pine woodland above the cliff at Falésia Açoteias with several trails allowing walks overlooking the coastline. Visitors should keep to safe, marked routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Falésia long beach walk",
      "description": "An informal shoreline walk along the long sandy stretch between Olhos de Água and the Vilamoura side. This is verified as a long beach setting, not as a formal marked trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Olhos de Água to Barranco das Belharucas low-tide connection",
      "description": "VisitPortugal notes that Barranco das Belharucas is separated from Olhos de Água by rocks that may be crossed on foot at low tide. This should be treated as a tide-dependent connection, not a guaranteed route.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose the access point according to your plan: Açoteias and Alfamar are strong for cliff scenery, while Rocha Baixinha and the Vilamoura side are useful for marina and resort combinations.",
    "Allow extra time in peak summer, as this is a highly recognised and resort-adjacent beach.",
    "Bring water for longer walks; the beach can feel much longer on foot than it appears from a viewpoint.",
    "Check tide, sea flags and local signage before swimming or walking near rocks.",
    "For visitors with reduced mobility, confirm the current access point and any beach assistance before travelling.",
    "Late afternoon offers particularly warm cliff colours for photography."
  ],
  "photography_notes": "The strongest visual identity is the contrast between the wide sand and the red, copper and ochre cliffs. Late afternoon and sunset light are especially useful for cliff colour, but visitors should stay away from cliff edges and the base of the cliffs when composing photographs.",
  "family_notes": "The wide sandy setting and concessioned sections can suit families, especially when choosing an access point with verified support services. Sea conditions can vary, and families should check local flags, supervision and access conditions before settling on a section of the beach.",
  "safety_notes": "Sea conditions can vary. Visitors should follow beach flags, local signage and instructions from lifeguards where present. The beach is backed by cliffs in several sections, so visitors should avoid cliff edges, avoid climbing the cliffs and avoid sitting close to the cliff base.",
  "accessibility_notes": "Accessibility information is not fully verified for the whole Praia da Falésia stretch. The Blue Flag platform verifies wooden stair access at Falésia Açoteias, which may be challenging for visitors with reduced mobility. Visitors who need step-free access or assisted bathing should confirm current conditions with the municipality, local signage or official beach services before visiting.",
  "blue_flag": {
    "year": 2026,
    "awarded": true,
    "sections": [
      "Falésia Açoteias",
      "Falésia Alfamar",
      "Rocha Baixinha",
      "Rocha Baixinha-Nascente",
      "Rocha Baixinha-Poente"
    ],
    "bathing_season": "15 May to 15 October 2026",
    "blue_flag_season": "1 July to 30 September 2026",
    "notes": "Blue Flag information is verified for named 2026 official bathing sections and should be treated as seasonal."
  },
  "seo": {
    "meta_title": "Praia da Falésia, Albufeira & Loulé",
    "meta_description": "Praia da Falésia in Albufeira and Loulé: long sandy beach, red cliffs, resort access, Blue Flag sections and Tripadvisor recognition.",
    "keywords": [
      "Praia da Falésia",
      "Praia da Falésia Albufeira",
      "Praia da Falésia Loulé",
      "Olhos de Água beach",
      "Vilamoura beach",
      "Algarve beaches",
      "Portugal beaches",
      "red cliffs Algarve",
      "long beach Algarve",
      "resort access beach Algarve",
      "Tripadvisor best beach Portugal",
      "Blue Flag beaches Algarve"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Nearby attractions",
      "links": [
        { "label": "Praia do Barranco das Belharucas" },
        { "label": "Rocha Baixinha" },
        { "label": "Olhos de Água" },
        { "label": "Marina de Vilamoura" },
        { "label": "Praia de Vilamoura" },
        { "label": "Cerro da Vila" }
      ]
    },
    {
      "title": "Nearby towns",
      "links": [
        { "label": "Olhos de Água" },
        { "label": "Albufeira" },
        { "label": "Vilamoura" },
        { "label": "Quarteira" }
      ]
    },
    {
      "title": "Best for",
      "links": [
        { "label": "Scenic views" },
        { "label": "Photography" },
        { "label": "Long beach walks" },
        { "label": "Families" },
        { "label": "Resort access" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "Uploaded BEACH GPT brief",
      "source_url": "Uploaded file in conversation",
      "facts_verified": [
        "Required AlgarveOfficial JSON structure",
        "Source hierarchy and anti-hallucination rules",
        "Requirement to mark uncertain facilities, accessibility and seasonal information clearly"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Falésia - Açoteias / Alfamar",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar",
      "facts_verified": [
        "Beach exists as Praia da Falésia - Açoteias / Alfamar",
        "Maritime beach classification",
        "Long beach setting between Olhos de Água and Vilamoura",
        "Red, copper and golden cliff landscape",
        "Concessioned areas",
        "Paved-road access in the central Açoteias area",
        "Alfamar access context",
        "Listed facilities and activities for the beach area"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Rocha Baixinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-rocha-baixinha",
      "facts_verified": [
        "Rocha Baixinha is at the eastern end of the extensive Praia da Falésia",
        "Proximity to Vilamoura Marina",
        "Rocha Baixinha is divided into west and east areas"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Falésia Açoteias listed among 2026 Blue Flag-awarded locations",
        "Falésia Alfamar listed among 2026 Blue Flag-awarded locations",
        "Rocha Baixinha sections listed among 2026 Blue Flag-awarded locations"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Falésia Açoteias",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/falesia-acoteias/",
      "facts_verified": [
        "Official Falésia Açoteias beach section",
        "Albufeira municipality listing",
        "Coordinates 37.086149, -8.168335",
        "2026 bathing season and Blue Flag season dates",
        "Road access, parking at the access point and wooden stair access described in the Blue Flag platform profile",
        "Cliff-top pine woodland and walking trail context from the Blue Flag platform profile"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Falésia Alfamar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/falesia-alfamar/",
      "facts_verified": [
        "Official Falésia Alfamar beach section",
        "Coordinates for the Alfamar section",
        "2026 bathing season and Blue Flag season dates"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Rocha Baixinha-Nascente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/rocha-baixinha-nascente/",
      "facts_verified": [
        "Official Rocha Baixinha-Nascente beach section",
        "Address on Avenida da Praia da Falésia, 8125 Loulé",
        "2026 bathing season and Blue Flag season dates"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Rocha Baixinha-Poente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/rocha-baixinha-poente/",
      "facts_verified": [
        "Official Rocha Baixinha-Poente beach section",
        "Address on Avenida da Praia da Falésia, 8125 Loulé",
        "2026 bathing season and Blue Flag season dates"
      ]
    },
    {
      "source_name": "Tripadvisor Media Center - Travellers' Choice Best of the Best Beaches 2024",
      "source_url": "https://tripadvisor.mediaroom.com/Travellers-Choice-Best-of-the-Best-Beaches-2024",
      "facts_verified": [
        "Praia da Falésia named No. 1 beach in the world in Tripadvisor's 2024 Travellers' Choice Best of the Best Beaches awards",
        "Ranking methodology based on quality and quantity of ratings over a 12-month period"
      ]
    },
    {
      "source_name": "Turismo de Albufeira / APAL - Praia da Falésia 2026 Tripadvisor ranking",
      "source_url": "https://turismodealbufeira.com/noticia/158/praia-da-falesia-eleita-a-5-melhor-do-mundo-nos-travellers-choice-best-of-the-best-2026-da-tripadvisor",
      "facts_verified": [
        "Reported 2026 Tripadvisor Travellers' Choice Best of the Best ranking: 5th worldwide",
        "Reported 2026 European ranking: 3rd in Europe"
      ]
    },
    {
      "source_name": "VisitPortugal - Vilamoura e a sua marina",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73801",
      "facts_verified": [
        "Praia da Falésia lies to the west of Vilamoura Marina and extends for kilometres toward Olhos de Água",
        "Vilamoura tourism and resort context",
        "Cerro da Vila reference near the road to Praia da Falésia"
      ]
    },
    {
      "source_name": "VisitPortugal - Hotel PortoBay Falésia",
      "source_url": "https://www.visitportugal.com/pt-pt/content/hotel-portobay-fal%C3%A9sia",
      "facts_verified": [
        "Resort accommodation located above Praia da Falésia in Olhos de Água",
        "Official tourism-listed reference to direct sea / beach access for this hotel"
      ]
    },
    {
      "source_name": "VisitPortugal - AP Adriana Beach Resort",
      "source_url": "https://www.visitportugal.com/pt-pt/content/ap-adriana-beach-resort",
      "facts_verified": [
        "Resort accommodation near Praia da Falésia / Rocha Baixinha",
        "Official tourism-listed reference to direct access to Praia da Falésia at 200 metres"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Barranco das Belharucas",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-barranco-das-belharucas",
      "facts_verified": [
        "Barranco das Belharucas is at the western end of Praia da Falésia",
        "Low-tide foot connection context from Olhos de Água",
        "Nearby beach and route relevance"
      ]
    },
    {
      "source_name": "VisitPortugal - Marina de Vilamoura",
      "source_url": "https://www.visitportugal.com/pt-pt/content/marina-de-vilamoura",
      "facts_verified": [
        "Marina de Vilamoura exists as a nearby marina and visitor hub",
        "Major marina context near surrounding beaches and resorts"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia dos Olhos de Água",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-olhos-de-%C3%A1gua",
      "facts_verified": [
        "Olhos de Água coastal village and beach context",
        "Freshwater springs visible at low tide",
        "Nearby town / beach relevance"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, maritime beach classification, long sandy setting, cliff landscape and general access context were verified from VisitPortugal and ABAAE / Blue Flag sources.",
    "The listing treats Praia da Falésia as a wider beach system between Olhos de Água and the Vilamoura side, including named official sections such as Falésia Açoteias, Falésia Alfamar and Rocha Baixinha.",
    "Administrative boundary requires manual final check before publication: official sources reviewed list key Falésia / Rocha Baixinha bathing sections under Albufeira, while the wider visitor experience reaches the Vilamoura / Loulé side and some Rocha Baixinha entries carry a Loulé address.",
    "Coordinates provided are for the official Blue Flag Falésia Açoteias access point, not for the entire multi-kilometre beach.",
    "Blue Flag information is verified for named 2026 official bathing sections and should be treated as seasonal; flags may not be physically flying outside the stated Blue Flag season.",
    "Resort access was verified only for specific tourism-listed accommodation entries and should not be presented as universal beach access or as private beach ownership.",
    "Public toilets, dog rules, current lifeguard timetables and exact facility availability across every access point were not fully verified and should be checked manually before publication.",
    "No unsupported claims were added about guaranteed calm sea, guaranteed safe swimming or full accessibility."
  ]
}
$json$::jsonb;
begin
  select id into v_category_id
  from public.categories
  where slug = 'beaches'
  limit 1;

  select id into v_city_id
  from public.cities
  where slug = 'olhos-de-agua-vilamoura'
  limit 1;

  if v_category_id is null then
    raise exception 'Required category beaches was not found';
  end if;

  if v_city_id is null then
    raise exception 'Required city olhos-de-agua-vilamoura was not found';
  end if;

  select id, slug
    into v_listing_id, v_old_slug
  from public.listings
  where slug = v_slug
     or lower(name) = lower(v_name)
  order by case when slug = v_slug then 0 else 1 end, updated_at desc
  limit 1;

  if v_listing_id is null then
    insert into public.listings (
      name,
      slug,
      description,
      short_description,
      owner_id,
      category_id,
      city_id,
      region_id,
      tier,
      status,
      is_curated,
      website_url,
      address,
      latitude,
      longitude,
      tags,
      category_data,
      meta_title,
      meta_description,
      published_at
    ) values (
      v_name,
      v_slug,
      btrim(v_description),
      btrim(v_short_description),
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar',
      'Praia da Falésia, Olhos de Água / Vilamoura, Albufeira / Loulé, Algarve, Portugal',
      37.086149,
      -8.168335,
      array[
        'Praia da Falésia',
        'Albufeira beaches',
        'Loulé beaches',
        'Olhos de Água beach',
        'Vilamoura beach',
        'red cliffs Algarve',
        'Blue Flag beaches Algarve',
        'Tripadvisor best beach Portugal',
        'long beach walks',
        'resort access'
      ],
      v_category_data,
      'Praia da Falésia, Albufeira & Loulé',
      'Praia da Falésia in Albufeira and Loulé: long sandy beach, red cliffs, resort access, Blue Flag sections and Tripadvisor recognition.',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_description),
      short_description = btrim(v_short_description),
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-da-fal%C3%A9sia-a%C3%A7oteias-alfamar',
      contact_phone = null,
      contact_email = null,
      whatsapp_number = null,
      instagram_url = null,
      facebook_url = null,
      linkedin_url = null,
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = 'Praia da Falésia, Olhos de Água / Vilamoura, Albufeira / Loulé, Algarve, Portugal',
      latitude = 37.086149,
      longitude = -8.168335,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Falésia',
        'Albufeira beaches',
        'Loulé beaches',
        'Olhos de Água beach',
        'Vilamoura beach',
        'red cliffs Algarve',
        'Blue Flag beaches Algarve',
        'Tripadvisor best beach Portugal',
        'long beach walks',
        'resort access'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Falésia, Albufeira & Loulé',
      meta_description = 'Praia da Falésia in Albufeira and Loulé: long sandy beach, red cliffs, resort access, Blue Flag sections and Tripadvisor recognition.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id
      and slug <> v_slug;

    if v_old_slug is not null and v_old_slug <> v_slug then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update set
        listing_id = excluded.listing_id,
        is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, v_slug, true)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;
  end if;
end $$;

commit;
