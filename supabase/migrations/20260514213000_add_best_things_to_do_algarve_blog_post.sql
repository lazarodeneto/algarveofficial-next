WITH seed_author AS (
  SELECT COALESCE(
    (
      SELECT user_id
      FROM public.user_roles
      WHERE role IN ('admin', 'editor')
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, user_id
      LIMIT 1
    ),
    (
      SELECT id
      FROM public.public_profiles
      LIMIT 1
    ),
    '00000000-0000-0000-0000-000000000001'::uuid
  ) AS author_id
),
article AS (
  SELECT
    '12 Best Things to Do in the Algarve: Caves, Boat Trips, Old Towns, Islands and Family Attractions'::text AS title,
    'best-things-to-do-algarve-portugal'::text AS slug,
    'Discover the best things to do in the Algarve, from Benagil Cave and Ponta da Piedade to Ria Formosa islands, Silves Castle, Tavira, Faro, Sagres and family attractions.'::text AS excerpt,
    $article$
      <h2>12 Best Things to Do in the Algarve: Caves, Boat Trips, Old Towns, Islands and Family Attractions</h2>

      <h2>The Algarve is more than beaches</h2>
      <p>The Algarve is famous for beaches, but the best trips go beyond lying on the sand. This is a region of sea caves, cliff walks, old towns, island lagoons, castles, local markets, family attractions, surf beaches and sunset viewpoints.</p>
      <p>The coastline changes from the dramatic limestone cliffs of Lagos, Lagoa and Albufeira to the protected island landscapes of the Ria Formosa. Inland, towns such as Silves and Loulé reveal a more historic and local Algarve. Further west, Sagres and the Costa Vicentina feel wilder, windier and more Atlantic.</p>
      <p>This guide highlights the best things to do in the Algarve for first-time visitors, families, couples, golfers, nature lovers and travellers who want a richer experience of southern Portugal.</p>

      <h2>Quick guide: best Algarve activities by travel style</h2>
      <table>
        <thead>
          <tr><th>Travel style</th><th>Best things to do</th></tr>
        </thead>
        <tbody>
          <tr><td>First-time visitors</td><td>Benagil Cave, Ponta da Piedade, Lagos, Praia da Marinha</td></tr>
          <tr><td>Families</td><td>Zoomarine, boat trips, Tavira Island, Praia da Rocha, Ria Formosa</td></tr>
          <tr><td>Couples</td><td>Tavira, sunset in Sagres, Lagos old town, Falésia walks</td></tr>
          <tr><td>Nature lovers</td><td>Ria Formosa, Seven Hanging Valleys Trail, Costa Vicentina</td></tr>
          <tr><td>Culture and history</td><td>Silves Castle, Faro Old Town, Tavira, Loulé Market</td></tr>
          <tr><td>Adventure</td><td>Kayak tours, coastal hiking, surf in the western Algarve</td></tr>
          <tr><td>No-car visitors</td><td>Faro, Lagos, Tavira, boat trips, train-connected towns</td></tr>
          <tr><td>Photography</td><td>Benagil, Ponta da Piedade, Marinha, Falésia, Cabo de São Vicente</td></tr>
        </tbody>
      </table>

      <h2>1. Take a boat trip to Benagil Cave</h2>
      <p><strong>Best for:</strong> iconic Algarve scenery, boat tours, photography<br><strong>Where:</strong> Lagoa / Benagil<br><strong>Good to know:</strong> access rules change, so check current conditions before booking</p>
      <p>Benagil Cave, also known as Algar de Benagil, is one of the Algarve’s most famous natural attractions. Visit Algarve describes the famous Benagil algar in Lagoa as “O Templo”, with a small opening at the top that allows sunlight to enter the cave.</p>
      <p>For many visitors, a Benagil boat trip is the classic Algarve experience: cliffs, sea caves, hidden beaches and views of the central coastline from the water. The most common departure points include Benagil, Portimão, Albufeira, Carvoeiro and Armação de Pêra, depending on the operator and sea conditions.</p>
      <p>The important detail is safety and regulation. Since August 2024, published local reporting has stated that disembarking or using the sand inside Benagil Cave is prohibited, as is swimming into the cave or renting kayaks without a guide in the cave area.</p>
      <p><strong>Why do it:</strong> Benagil is one of the Algarve’s most memorable sea-cave experiences, especially for visitors who want dramatic coastal scenery without a long hike.</p>

      <h2>2. Visit Ponta da Piedade in Lagos</h2>
      <p><strong>Best for:</strong> cliffs, sea caves, viewpoints, boat trips, photography<br><strong>Where:</strong> Lagos<br><strong>Nearby:</strong> Praia Dona Ana, Praia do Camilo, Lagos Old Town</p>
      <p>Ponta da Piedade is one of the most beautiful coastal landscapes in the Algarve. Visit Algarve describes it as a place with magnificent Atlantic views and cliffs carved by the sea and time.</p>
      <p>There are two main ways to experience it. The first is from above, walking the clifftop paths and viewpoints. The second is from the water, by small boat, kayak or guided sea tour. VisitPortugal’s Lagos guide describes Ponta da Piedade as the highlight of the area, with rock formations, jagged shapes and caves best enjoyed on a boat trip.</p>
      <p>Ponta da Piedade works especially well as part of a Lagos day: morning in the old town, lunch near the marina or historic centre, then an afternoon boat trip or coastal walk.</p>
      <p><strong>Why do it:</strong> this is one of the Algarve’s best places to understand the region’s golden-cliff landscape.</p>

      <h2>3. Explore the Ria Formosa islands</h2>
      <p><strong>Best for:</strong> nature, boat trips, island beaches, birdlife, quiet escapes<br><strong>Where:</strong> Faro, Olhão, Tavira, Fuseta<br><strong>Main islands:</strong> Ilha Deserta / Barreta, Culatra, Armona, Tavira Island</p>
      <p>The Ria Formosa is one of the Algarve’s most important natural areas. VisitPortugal describes it as a humid zone of international importance, formed by canals, islands, marshland and sandy beaches extending for 60 km along the Algarve coast between Garrão and Manta Rota.</p>
      <p>This is the Algarve for visitors who want slower, more natural beach days. From Faro, you can reach Ilha Deserta and Ilha do Farol. From Olhão, boats connect to Culatra, Armona and Farol. From Tavira, visitors can reach Tavira Island and nearby beach areas.</p>
      <p>The experience is different from the central Algarve cliffs. Here, the beauty is flatter, wider and calmer: dunes, lagoons, wooden walkways, fishing communities, salt air and long beaches.</p>
      <p><strong>Why do it:</strong> Ria Formosa shows a quieter, more ecological side of the Algarve, ideal for visitors who want islands rather than resort beaches.</p>

      <h2>4. Walk the Seven Hanging Valleys Trail</h2>
      <p><strong>Best for:</strong> hiking, viewpoints, photography, active travellers<br><strong>Where:</strong> Lagoa<br><strong>Route:</strong> Praia da Marinha to Praia de Vale Centeanes<br><strong>Good to know:</strong> avoid the hottest hours in summer</p>
      <p>The Seven Hanging Valleys Trail is one of the Algarve’s best-known coastal walks. Visit Algarve lists it as a 6 km linear trail, or 12 km there and back, with an average duration of 3 hours one way or 6 hours return.</p>
      <p>The trail passes through some of the most famous cliff scenery in Lagoa, including areas near Praia da Marinha, Benagil and Vale Centeanes. It is not technically difficult for experienced walkers, but it does require proper shoes, water and care near cliff edges.</p>
      <p>This is an excellent activity outside the peak heat of July and August. In spring, early summer and autumn, it can be one of the best half-day experiences in the Algarve.</p>
      <p><strong>Why do it:</strong> it connects some of the Algarve’s most iconic coastal viewpoints in one route.</p>

      <h2>5. Discover Lagos Old Town</h2>
      <p><strong>Best for:</strong> history, restaurants, evening walks, first-time visitors<br><strong>Where:</strong> Western Algarve<br><strong>Nearby:</strong> Ponta da Piedade, Dona Ana, Camilo, Meia Praia</p>
      <p>Lagos is one of the Algarve’s most complete visitor bases because it combines beaches, boat trips, restaurants and history. Visit Algarve describes Lagos as connected to the Discoveries and to navigators such as Gil Eanes.</p>
      <p>The old town is ideal for a relaxed afternoon or evening. Walk through the streets, visit the historic centre, stop for seafood or petiscos, then continue towards the marina or the waterfront. Lagos also works well as a base for coastal trips to Ponta da Piedade and the western Algarve.</p>
      <p>Unlike purely resort-focused areas, Lagos feels like both a holiday destination and a historic town. That makes it one of the best Algarve choices for travellers who want beach days without losing cultural atmosphere.</p>
      <p><strong>Why do it:</strong> Lagos gives visitors an easy mix of scenery, history, restaurants and boat-trip access.</p>

      <h2>6. Visit Tavira and Tavira Island</h2>
      <p><strong>Best for:</strong> traditional Algarve, couples, slower travel, island beaches<br><strong>Where:</strong> Eastern Algarve<br><strong>Nearby:</strong> Santa Luzia, Praia do Barril, Cabanas, Ria Formosa</p>
      <p>Tavira is one of the most elegant towns in the Algarve. Visit Algarve presents the municipality through its beaches, orange groves, castle walls, church towers, the River Gilão and white houses.</p>
      <p>This is the place to slow down. Walk along the river, explore the historic centre, visit churches and viewpoints, then continue to the island beaches. Ilha de Tavira is one of the most popular beach escapes in the eastern Algarve, and Visit Algarve notes that the beach area includes summer houses, a campsite and tourist facilities.</p>
      <p>Tavira is especially strong for visitors who want charm rather than nightlife. It is also a good option for low-season travel, when the town feels calmer and more local.</p>
      <p><strong>Why do it:</strong> Tavira combines historic atmosphere with access to some of the Algarve’s best island beaches.</p>

      <h2>7. Spend a day in Faro</h2>
      <p><strong>Best for:</strong> culture, short stays, no-car visitors, Ria Formosa access<br><strong>Where:</strong> Central / Eastern Algarve<br><strong>Nearby:</strong> Faro Old Town, marina, Ilha Deserta, Ilha do Farol</p>
      <p>Faro is often treated as only the airport city, but it deserves time. VisitPortugal describes Faro as the capital of the Algarve since 1756 and the gateway for travellers arriving by plane. Its Manuel Bivar Gardens overlook the marina, Ria Formosa and the sea.</p>
      <p>A good Faro day includes the walled Old Town, the cathedral area, the marina and a boat trip into the Ria Formosa. VisitPortugal’s Faro itinerary also recommends discovering the Muslim heritage of “vila-adentro”, visiting the cathedral tower for views over the city and ria, walking the riverside, and watching sunset from the islands of Faro or Culatra.</p>
      <p>Faro is particularly useful for visitors without a car because it has train, bus, airport and boat connections.</p>
      <p><strong>Why do it:</strong> Faro is the Algarve’s most practical cultural base and a strong gateway to the Ria Formosa.</p>

      <h2>8. Visit Silves Castle</h2>
      <p><strong>Best for:</strong> history, families, inland day trips, photography<br><strong>Where:</strong> Silves<br><strong>Nearby:</strong> River Arade, Silves town centre, Lagoa, Monchique route</p>
      <p>Silves Castle is one of the Algarve’s most important monuments. VisitPortugal describes it as one of the main and most beautiful Muslim fortifications in Portugal and the largest castle in the Algarve.</p>
      <p>Silves is a strong inland alternative when visitors want a break from the coast. The red sandstone castle walls, old streets and river setting make it one of the best cultural day trips in the region. VisitPortugal also notes that the castle’s towers and walls offer viewpoints over the surrounding fertile fields near the River Arade.</p>
      <p>This is a good family activity because it is visual, walkable and easy to combine with lunch in town.</p>
      <p><strong>Why do it:</strong> Silves gives visitors a clear sense of the Algarve’s Moorish and medieval history.</p>

      <h2>9. Go to Sagres and Cabo de São Vicente</h2>
      <p><strong>Best for:</strong> sunsets, cliffs, surf, road trips, wild scenery<br><strong>Where:</strong> Far western Algarve<br><strong>Nearby:</strong> Sagres Fortress, Praia do Tonel, Beliche, Cabo de São Vicente</p>
      <p>Sagres feels different from the central Algarve. It is wilder, windier and more dramatic, shaped by the Atlantic rather than resort development. VisitPortugal describes the Ponta de Sagres as a giant finger of stone pointing into the ocean, associated with the history of Prince Henry the Navigator, and notes that nearby Cabo de São Vicente sits at the extreme south-west of continental Europe.</p>
      <p>This is one of the Algarve’s best areas for sunset. The cliffs are immense, the horizon is open, and the landscape feels more elemental than polished. It is also a strong area for surf culture and road-trip itineraries.</p>
      <p>Bring a jacket even in warm months. Sagres can be much windier than Albufeira, Vilamoura or Tavira.</p>
      <p><strong>Why do it:</strong> Sagres is the Algarve at its most Atlantic: rugged, historic and unforgettable at sunset.</p>

      <h2>10. Visit Loulé Market</h2>
      <p><strong>Best for:</strong> local culture, food, architecture, rainy mornings, inland Algarve<br><strong>Where:</strong> Loulé<br><strong>Nearby:</strong> Quarteira, Vilamoura, Almancil, São Brás de Alportel</p>
      <p>Loulé Market is one of the best places to experience a more local side of the Algarve. Visit Algarve states that the Municipal Market of Loulé was inaugurated in June 1908 and is one of the best examples of revivalist architecture in the Algarve.</p>
      <p>The market is useful for visitors who want more than beaches: fresh produce, fish, regional products, local rhythm and a beautiful building in the centre of town. It also combines well with a short walk through Loulé’s historic centre.</p>
      <p>This is a particularly good option for a cloudy morning, a food-focused itinerary, or a cultural break from coastal towns.</p>
      <p><strong>Why do it:</strong> Loulé Market connects visitors to everyday Algarve life, not just resort tourism.</p>

      <h2>11. Spend a family day at Zoomarine</h2>
      <p><strong>Best for:</strong> families, children, full-day entertainment<br><strong>Where:</strong> Guia, near Albufeira<br><strong>Good to know:</strong> check seasonal opening dates and ticket options before visiting</p>
      <p>Zoomarine is one of the Algarve’s major family attractions. Its official website presents it as a place where fun merges with learning, focused on the marine world, with areas dedicated to conservation, science, environmental education and rehabilitation.</p>
      <p>For families with children, this is one of the easiest full-day activities in the central Algarve. It works especially well when visitors want a break from beach logistics or need something structured for younger travellers.</p>
      <p>As with all seasonal attractions, opening times, shows and ticket rules should be checked before travelling.</p>
      <p><strong>Why do it:</strong> Zoomarine is one of the Algarve’s strongest family-friendly alternatives to a beach day.</p>

      <h2>12. Explore the Costa Vicentina</h2>
      <p><strong>Best for:</strong> surf, hiking, nature, road trips, quieter beaches<br><strong>Where:</strong> Western Algarve, from Odeceixe towards Burgau<br><strong>Nearby:</strong> Aljezur, Arrifana, Monte Clérigo, Odeceixe, Carrapateira</p>
      <p>The Costa Vicentina is the Algarve’s wild side. VisitPortugal describes the coastal strip between Odeceixe and Burgau as a different part of the Algarve, where preserved nature has a strong, wild character and creates landscapes of great majesty.</p>
      <p>This is not the Algarve of marinas and resort beaches. It is a place for surf, cliffs, wind, walking trails, smaller villages and powerful Atlantic scenery. The beaches can be spectacular, but conditions are often stronger than on the south coast, so visitors should respect flags, tides and local safety advice.</p>
      <p>The Costa Vicentina is best explored by car, especially if you want to visit several beaches in one day.</p>
      <p><strong>Why do it:</strong> it reveals a less commercial, more natural side of the Algarve.</p>

      <h2>Best Algarve itinerary for first-time visitors</h2>
      <p>For a balanced first trip, combine coast, culture and nature.</p>
      <ul>
        <li><strong>Day 1:</strong> Lagos Old Town, Ponta da Piedade and Praia do Camilo.</li>
        <li><strong>Day 2:</strong> Benagil Cave boat trip, Praia da Marinha and the Seven Hanging Valleys Trail.</li>
        <li><strong>Day 3:</strong> Faro Old Town and a Ria Formosa island boat trip.</li>
        <li><strong>Day 4:</strong> Tavira, Praia do Barril or Tavira Island.</li>
        <li><strong>Day 5:</strong> Silves Castle, Loulé Market or a family day at Zoomarine.</li>
        <li><strong>Day 6:</strong> Sagres and Cabo de São Vicente for sunset.</li>
        <li><strong>Day 7:</strong> Free beach day at Falésia, Rocha, Dona Ana, Barril or Ilha Deserta.</li>
      </ul>

      <h2>Best things to do in the Algarve without a car</h2>
      <p>The best no-car bases are Faro, Lagos, Tavira, Portimão and Albufeira. From these towns, visitors can access boat trips, old towns, beaches, restaurants and some regional transport.</p>
      <p>For no-car travellers, the easiest activities are:</p>
      <ul>
        <li>Faro Old Town and Ria Formosa boat trips.</li>
        <li>Lagos Old Town and Ponta da Piedade tours.</li>
        <li>Tavira and Tavira Island.</li>
        <li>Albufeira boat trips to caves and dolphins.</li>
        <li>Portimão marina tours and Praia da Rocha.</li>
        <li>Train-based visits between Faro, Tavira, Olhão, Portimão and Lagos.</li>
      </ul>
      <p>For Sagres, Costa Vicentina, remote beaches and inland villages, a car or organised tour is much more practical.</p>

      <h2>Practical tips before planning Algarve activities</h2>
      <p>Book boat trips early in summer, especially for Benagil and Ponta da Piedade. Sea conditions can affect routes, cancellations and whether caves can be entered safely.</p>
      <p>For cliff walks, wear proper shoes and avoid walking close to unstable edges. Bring water, sunscreen and a hat, particularly between June and September. For Ria Formosa islands, check ferry times before travelling, because return schedules can shape the whole day.</p>
      <p>For family attractions such as Zoomarine, confirm opening dates and hours before planning the day. For west coast beaches, always take sea conditions seriously, because the Atlantic side can be stronger than the south coast.</p>

      <h2>Final recommendation</h2>
      <p>For the best Algarve experience, do not choose only one type of activity. Combine Benagil or Ponta da Piedade for coastal drama, Ria Formosa for nature, Lagos or Tavira for town atmosphere, Silves or Loulé for culture, and Sagres or Costa Vicentina for the wild western Algarve.</p>
      <p>That combination gives visitors the real Algarve: beaches and cliffs, yes, but also history, islands, markets, family attractions, natural parks and Atlantic landscapes.</p>
    $article$::text AS content,
    '/images/region-carvoeiro-800w-CVkjcyBE.webp'::text AS featured_image,
    'travel-guides'::public.blog_category AS category,
    ARRAY[
      'best things to do in the Algarve',
      'Algarve attractions',
      'Algarve boat trips',
      'Benagil Cave',
      'Ponta da Piedade',
      'Ria Formosa',
      'Algarve itinerary',
      'family attractions',
      'Costa Vicentina'
    ]::text[] AS tags,
    14::integer AS reading_time,
    '2026-05-14T07:20:00Z'::timestamptz AS published_at,
    '12 Best Things to Do in the Algarve, Portugal'::text AS seo_title,
    'Discover the best things to do in the Algarve, from Benagil Cave and Ponta da Piedade to Ria Formosa islands, Silves Castle, Tavira, Faro, Sagres and family attractions.'::text AS seo_description,
    'best things to do in the Algarve, Algarve attractions, Algarve boat trips, Benagil Cave, Ponta da Piedade, Ria Formosa, Algarve itinerary'::text AS focus_keywords,
    ARRAY[
      'praia-de-benagil-lagoa',
      'praia-da-marinha-lagoa',
      'praia-de-vale-centeanes-lagoa',
      'praia-de-dona-ana-lagos',
      'praia-do-camilo-lagos',
      'meia-praia-lagos',
      'praia-da-ilha-deserta-barreta-faro',
      'praia-da-culatra-faro',
      'praia-da-armona-olhao',
      'praia-da-ilha-de-tavira',
      'praia-do-barril-tavira',
      'praia-da-rocha-portimao',
      'praia-da-falesia-albufeira',
      'praia-do-tonel-vila-do-bispo',
      'praia-do-beliche-vila-do-bispo',
      'praia-da-arrifana-aljezur',
      'praia-de-odeceixe-aljezur',
      'praia-da-bordeira-carrapateira-aljezur'
    ]::text[] AS related_slugs
),
related_listings AS (
  SELECT COALESCE(
    array_agg(l.id ORDER BY array_position(a.related_slugs, l.slug)),
    '{}'::uuid[]
  ) AS related_listing_ids
  FROM article a
  JOIN public.listings l
    ON l.slug = ANY(a.related_slugs)
   AND l.status = 'published'
)
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  author_id,
  category,
  tags,
  reading_time,
  related_listing_ids,
  status,
  published_at,
  seo_title,
  seo_description,
  focus_keywords
)
SELECT
  a.title,
  a.slug,
  a.excerpt,
  a.content,
  a.featured_image,
  sa.author_id,
  a.category,
  a.tags,
  a.reading_time,
  rl.related_listing_ids,
  'published'::public.blog_status,
  a.published_at,
  a.seo_title,
  a.seo_description,
  a.focus_keywords
FROM article a
CROSS JOIN seed_author sa
CROSS JOIN related_listings rl
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  reading_time = EXCLUDED.reading_time,
  related_listing_ids = EXCLUDED.related_listing_ids,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  focus_keywords = EXCLUDED.focus_keywords,
  updated_at = now();
