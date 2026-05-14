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
    'Where to Stay in the Algarve: Lagos, Albufeira, Vilamoura, Tavira or Faro?'::text AS title,
    'where-to-stay-in-the-algarve-portugal'::text AS slug,
    'Discover where to stay in the Algarve, Portugal, from Lagos and Albufeira to Vilamoura, Tavira, Faro, Carvoeiro, Portimão and the Golden Triangle.'::text AS excerpt,
    $article$
      <h2>Where to Stay in the Algarve: Lagos, Albufeira, Vilamoura, Tavira or Faro?</h2>

      <h2>Choosing the right Algarve base matters</h2>
      <p>The Algarve may look compact on a map, but the experience changes dramatically depending on where you stay. Lagos feels scenic and adventurous. Albufeira is central, lively and highly convenient. Vilamoura is polished, marina-focused and golf-oriented. Tavira is slower, elegant and traditional. Faro is practical, historic and excellent for short stays or Ria Formosa access.</p>
      <p>This choice matters because most visitors are not only booking accommodation — they are choosing the rhythm of their trip. A family wanting easy beaches and restaurants will not need the same base as a golfer, a digital nomad, a couple looking for old-town atmosphere, or a visitor relying on trains and buses.</p>
      <p>The Algarve remains one of Portugal’s strongest tourism regions. In the second quarter of 2025, it recorded the highest share of overnight stays in the country, with 27.1% of the national total. It was also named World’s Leading Beach Destination 2025, reinforcing the region’s international pull as a coastal destination.</p>
      <p>This guide compares the best areas to stay in the Algarve, with clear recommendations by travel style.</p>

      <h2>Quick answer: best Algarve base by traveller type</h2>
      <table>
        <thead>
          <tr><th>Traveller type</th><th>Best place to stay</th></tr>
        </thead>
        <tbody>
          <tr><td>First-time visitors</td><td>Lagos or Albufeira</td></tr>
          <tr><td>Families</td><td>Albufeira, Carvoeiro, Vilamoura or Tavira</td></tr>
          <tr><td>Couples</td><td>Lagos, Tavira, Carvoeiro or Faro</td></tr>
          <tr><td>Nightlife</td><td>Albufeira or Praia da Rocha</td></tr>
          <tr><td>Golf</td><td>Vilamoura, Quinta do Lago, Vale do Lobo or Carvoeiro</td></tr>
          <tr><td>Luxury resort stays</td><td>Quinta do Lago, Vale do Lobo or Vilamoura</td></tr>
          <tr><td>Without a car</td><td>Faro, Lagos, Albufeira, Portimão or Tavira</td></tr>
          <tr><td>Quiet traditional Algarve</td><td>Tavira, Olhão, Cacela Velha or Moncarapacho</td></tr>
          <tr><td>Nature and islands</td><td>Faro, Olhão or Tavira</td></tr>
          <tr><td>Surf and wild coast</td><td>Sagres, Aljezur, Arrifana or Odeceixe</td></tr>
          <tr><td>Relocation scouting</td><td>Faro, Loulé, Tavira, Lagos or Lagoa</td></tr>
        </tbody>
      </table>

      <h2>1. Lagos — best for scenery, beaches and first-time Algarve visitors</h2>
      <p><strong>Best for:</strong> couples, first-time visitors, photographers, coastal walks, boat trips<br><strong>Atmosphere:</strong> scenic, historic, active, international<br><strong>Nearby highlights:</strong> Ponta da Piedade, Praia Dona Ana, Praia do Camilo, Meia Praia, Lagos old town</p>
      <p>Lagos is one of the best places to stay in the Algarve if you want a strong mix of beaches, history, restaurants, boat trips and dramatic coastal scenery. It is especially good for travellers who want the Algarve’s famous golden cliffs without staying in a purely resort-style environment.</p>
      <p>The town has a historic centre, a marina, easy access to beaches, and one of the region’s most photographed coastal landscapes: Ponta da Piedade. Visit Algarve describes Ponta da Piedade, located around 2 km from Lagos, as an area of grottos, quiet beaches and striking coastal views. VisitPortugal also identifies Lagos as a city connected to the period of the Discoveries, giving it a stronger historic identity than many beach-only resort areas.</p>
      <p>Lagos works well for visitors who want to explore during the day and still have a lively town to return to in the evening. You can walk through the old town, take boat or kayak tours, visit cliff beaches, or use Lagos as a base for the western Algarve.</p>
      <p>The main downside is popularity. In July and August, Lagos can feel busy, and parking near beaches or the historic centre can be difficult. Accommodation should be booked early for summer.</p>
      <p><strong>Stay in Lagos if you want:</strong> the classic Algarve experience: cliffs, coves, boat trips, restaurants and a real town atmosphere.</p>

      <h2>2. Albufeira — best for convenience, nightlife and central location</h2>
      <p><strong>Best for:</strong> groups, families, nightlife, beach holidays, first-time visitors without complex planning<br><strong>Atmosphere:</strong> lively, commercial, central, easy<br><strong>Nearby highlights:</strong> Praia dos Pescadores, Praia da Oura, São Rafael, Galé, Falésia, Albufeira Marina</p>
      <p>Albufeira is one of the Algarve’s most practical bases. It is central, highly developed for tourism, and offers a wide range of accommodation, restaurants, beaches, activities and nightlife. For many visitors, especially those who want a straightforward holiday with minimal logistics, Albufeira is the easiest answer.</p>
      <p>The official Visit Albufeira tourism site highlights the city’s varied nightlife, from Oura’s party atmosphere to the Old Town and the Marina’s seafront terraces. VisitPortugal also describes Albufeira and Portimão as more cosmopolitan towns that are bustling by night and day.</p>
      <p>Albufeira is not one single experience. The Old Town is better for visitors who want restaurants, bars, beach access and atmosphere without staying directly in the loudest nightlife zone. The Strip / Oura is better for late nights and groups. Galé and São Rafael feel more relaxed and beach-focused. Falésia / Açoteias works well for resort stays and long walks.</p>
      <p>The main drawback is that some parts of Albufeira can feel very busy and commercial in peak season. It is not the best choice for visitors looking for quiet traditional Algarve charm.</p>
      <p><strong>Stay in Albufeira if you want:</strong> beaches, restaurants, nightlife, tours and a central Algarve base with everything close by.</p>

      <h2>3. Vilamoura — best for golf, marina lifestyle and polished resort stays</h2>
      <p><strong>Best for:</strong> golfers, couples, families, marina dining, resort hotels<br><strong>Atmosphere:</strong> polished, organised, leisure-focused, upscale<br><strong>Nearby highlights:</strong> Vilamoura Marina, golf courses, Praia da Falésia, Quarteira, Loulé, Quinta do Lago</p>
      <p>Vilamoura is one of the Algarve’s most developed leisure destinations. It is built around the marina, with hotels, apartments, restaurants, golf, beach access and boat trips all close together. VisitPortugal describes Vilamoura as modern, lively and sophisticated, developed around its marina, and one of Europe’s largest leisure resorts.</p>
      <p>This is one of the best bases for golf. Visit Algarve notes that much of the region’s golf is clustered less than 30 minutes from Faro Airport around Quinta do Lago and Vilamoura Marina. VisitPortugal also describes the Algarve as a major golf destination with favourable year-round playing conditions and 33 courses with 18 or 27 holes.</p>
      <p>Vilamoura is easier than Lagos or Tavira if you want a resort-style stay with predictable services, marina dining, beach clubs, golf courses and high-quality accommodation nearby. It is not the most traditional Algarve town, but that is part of its appeal: it is designed for comfort.</p>
      <p>The main drawback is that Vilamoura can feel less authentic than older towns. It is better for leisure and lifestyle than historic discovery.</p>
      <p><strong>Stay in Vilamoura if you want:</strong> golf, marina restaurants, resort comfort and a polished central Algarve base.</p>

      <h2>4. Tavira — best for traditional charm, slow travel and the eastern Algarve</h2>
      <p><strong>Best for:</strong> couples, culture, slower holidays, families, island beaches<br><strong>Atmosphere:</strong> elegant, traditional, calm, historic<br><strong>Nearby highlights:</strong> Ilha de Tavira, Praia do Barril, Santa Luzia, Cabanas, Ria Formosa</p>
      <p>Tavira is one of the best places to stay in the Algarve if you want beauty without the intensity of the central resort towns. It has a historic centre, churches, tiled façades, river views, traditional architecture and access to long island beaches.</p>
      <p>Visit Algarve describes Tavira through its empty beaches, orange-tree fields, castle walls, church towers, River Gilão and white houses. VisitPortugal calls Tavira a showcase for traditional architecture.</p>
      <p>This is not the place for intense nightlife or a packed resort strip. Tavira is better for walking, long lunches, ferry rides, beach days on Ilha de Tavira, visits to Praia do Barril, and exploring the quieter eastern Algarve. It also works well for travellers interested in a more local, slower rhythm.</p>
      <p>The beaches are excellent, but many require a ferry, small train, bridge or short transfer. That makes Tavira less immediate than a beachfront resort, but more rewarding for travellers who enjoy the journey.</p>
      <p><strong>Stay in Tavira if you want:</strong> traditional Algarve charm, island beaches and a calmer base with strong character.</p>

      <h2>5. Faro — best for short stays, culture, transport and Ria Formosa</h2>
      <p><strong>Best for:</strong> short trips, city breaks, no-car travellers, Ria Formosa tours, practical arrivals<br><strong>Atmosphere:</strong> historic, local, urban, practical<br><strong>Nearby highlights:</strong> Faro Old Town, Faro Marina, Ria Formosa, Ilha Deserta, Ilha do Farol, Olhão</p>
      <p>Faro is often treated as only the airport gateway, but it deserves more attention. It is the Algarve’s regional capital, with a historic centre, marina, restaurants, cultural sites, transport links and easy access to Ria Formosa island trips.</p>
      <p>VisitPortugal says Faro is the gateway to the region and deserves a long stop for its beautiful historic centre. In its “day out in Faro” guide, VisitPortugal also highlights the 11th-century Arab Gateway, described as the oldest horseshoe arch in the country.</p>
      <p>Faro is one of the best Algarve bases without a car because it has the airport nearby, a train station, bus links and boat access to Ria Formosa. It is especially good for short stays, early or late flights, remote workers who want an urban base, and visitors who prefer restaurants and culture over resort infrastructure.</p>
      <p>The main limitation is beach immediacy. Faro has excellent island beaches nearby, but you normally reach them by boat or transport rather than walking directly from most accommodation.</p>
      <p><strong>Stay in Faro if you want:</strong> practicality, history, transport links and easy access to Ria Formosa islands.</p>

      <h2>6. Carvoeiro and Lagoa — best for families, cliffs and a relaxed central base</h2>
      <p><strong>Best for:</strong> families, couples, scenic beaches, villas, road trips<br><strong>Atmosphere:</strong> relaxed, scenic, compact, family-friendly<br><strong>Nearby highlights:</strong> Praia do Carvoeiro, Algar Seco, Benagil, Praia da Marinha, Ferragudo, Seven Hanging Valleys Trail</p>
      <p>Carvoeiro and the wider Lagoa area are excellent for travellers who want the central Algarve’s cliff scenery but prefer a smaller, more relaxed base than Albufeira or Portimão. Lagoa’s official tourism portal describes Carvoeiro Beach as linked to a former fishing village that has become a cosmopolitan tourist resort while keeping picturesque architectural features.</p>
      <p>This area is especially strong for scenic day trips. Praia da Marinha, Benagil, Algar Seco, Vale de Centeanes and Ferragudo are all part of the broader Lagoa / Carvoeiro travel zone. Visit Algarve describes Lagoa through its turquoise sea, ochre cliffs and sandy beaches.</p>
      <p>Carvoeiro is also a good base for villa stays and families who want restaurants, beaches and coastal walks without the intensity of a major nightlife town. A car is useful here, especially if you want to explore beaches, wineries, water parks and nearby villages.</p>
      <p><strong>Stay in Carvoeiro or Lagoa if you want:</strong> central Algarve cliffs, a family-friendly atmosphere and easy access to some of the region’s most famous coastal scenery.</p>

      <h2>7. Portimão and Praia da Rocha — best for lively beach holidays and value</h2>
      <p><strong>Best for:</strong> beach holidays, nightlife, groups, families, value-focused travellers<br><strong>Atmosphere:</strong> urban, lively, beach-focused, energetic<br><strong>Nearby highlights:</strong> Praia da Rocha, Praia dos Três Castelos, Praia do Vau, Portimão Marina, Ferragudo, Alvor</p>
      <p>Portimão is one of the Algarve’s larger cities, while Praia da Rocha is its best-known beach resort area. This is a strong base for travellers who want a wide beach, plenty of restaurants, nightlife options, boat trips and generally good access to the western and central Algarve.</p>
      <p>VisitPortugal groups Portimão with Albufeira as one of the Algarve’s more cosmopolitan towns, active by night and day. Portimão is also practical for visitors who want a mix of beach resort and city infrastructure.</p>
      <p>Praia da Rocha is busier and more commercial, while nearby Alvor feels smaller and more relaxed. This makes the Portimão area flexible: you can choose resort energy, family beach convenience, or a quieter village-style stay nearby.</p>
      <p><strong>Stay in Portimão or Praia da Rocha if you want:</strong> a big beach, lively evenings, strong facilities and a practical base near the western Algarve.</p>

      <h2>8. Quinta do Lago and Vale do Lobo — best for premium resort stays and golf</h2>
      <p><strong>Best for:</strong> golf, luxury villas, families, premium resorts, beach clubs<br><strong>Atmosphere:</strong> exclusive, landscaped, calm, residential<br><strong>Nearby highlights:</strong> Quinta do Lago, Vale do Lobo, Ancão, Garrão, Ria Formosa, Loulé, Vilamoura</p>
      <p>Quinta do Lago and Vale do Lobo form part of the Algarve’s most established premium resort belt, often called the Golden Triangle together with Vilamoura and Almancil. This area is ideal for travellers who want privacy, villas, golf, beach restaurants, high-end resorts and a quieter luxury environment.</p>
      <p>The location is especially convenient for golf because Visit Algarve identifies the area around Quinta do Lago and Vilamoura Marina as one of the region’s main golf clusters, close to Faro Airport. It is also close to Ria Formosa, Loulé, Vilamoura and some of the Algarve’s best-known resort beaches.</p>
      <p>This is not the best area for budget travellers or people who want to walk from a historic old town to local restaurants every night. It works best with a car, resort transfer or private transport.</p>
      <p><strong>Stay in Quinta do Lago or Vale do Lobo if you want:</strong> privacy, golf, premium villas, refined resorts and a calmer high-end Algarve base.</p>

      <h2>9. Olhão — best for Ria Formosa islands, food and a more local feel</h2>
      <p><strong>Best for:</strong> island beaches, food, independent travellers, local atmosphere<br><strong>Atmosphere:</strong> authentic, working-town, waterfront, understated<br><strong>Nearby highlights:</strong> Culatra, Armona, Farol, Ria Formosa, Faro, Fuseta</p>
      <p>Olhão is one of the best bases for travellers who want Ria Formosa island access and a more local Algarve atmosphere. It is less polished than Vilamoura, less resort-driven than Albufeira, and more practical than some small eastern villages.</p>
      <p>The key reason to stay here is access to the barrier islands. VisitPortugal describes Ria Formosa as a protected coastal system of canals, islands, marshes and sandy beaches extending for about 60 km along the Algarve coast. From Olhão, visitors can reach islands such as Culatra, Armona and Farol by boat.</p>
      <p>Olhão is not for everyone. It is not a conventional beach resort, and most beaches require a boat journey. But for food lovers, photographers and travellers who prefer a less packaged Algarve, it can be an excellent choice.</p>
      <p><strong>Stay in Olhão if you want:</strong> Ria Formosa, island beaches, seafood, local markets and a more authentic eastern Algarve base.</p>

      <h2>10. Sagres and Aljezur — best for surf, nature and the wild west coast</h2>
      <p><strong>Best for:</strong> surfers, hikers, road trips, nature lovers, slower travel<br><strong>Atmosphere:</strong> wild, Atlantic, rugged, less resort-focused<br><strong>Nearby highlights:</strong> Sagres, Cabo de São Vicente, Arrifana, Monte Clérigo, Odeceixe, Costa Vicentina</p>
      <p>Sagres and Aljezur offer a very different Algarve. This is the region for surf beaches, Atlantic cliffs, wind, hiking, sunsets and a less developed coastal mood. It is ideal for travellers who want nature over resort convenience.</p>
      <p>This western side is best with a car. Distances are greater, public transport is less convenient, and the best experiences often involve moving between beaches, viewpoints and small villages. It is not the best base for a first-time visitor who wants easy restaurant choice, nightlife and classic resort facilities.</p>
      <p>But for the right traveller, this is one of the Algarve’s most rewarding areas. Stay here for surf, silence, wild beaches and a more elemental version of southern Portugal.</p>
      <p><strong>Stay in Sagres or Aljezur if you want:</strong> surf, nature, cliffs, sunsets and the wilder side of the Algarve.</p>

      <h2>Best Algarve base if you do not have a car</h2>
      <p>For visitors without a car, the safest choices are:</p>
      <ul>
        <li><strong>Faro</strong> — best for airport, trains, buses, historic centre and Ria Formosa boats.</li>
        <li><strong>Lagos</strong> — best for beaches, boat trips, old town and western Algarve atmosphere.</li>
        <li><strong>Albufeira</strong> — best for easy tourism infrastructure, beaches, restaurants and tours.</li>
        <li><strong>Portimão</strong> — best for Praia da Rocha, transport, shopping and western Algarve access.</li>
        <li><strong>Tavira</strong> — best for train access, historic charm and island beaches.</li>
      </ul>
      <p>The Algarve train line connects several key towns, but it does not always stop directly beside beaches or resort centres. For beaches, golf courses, villas and smaller villages, a car or transfer still gives much more freedom.</p>

      <h2>Best Algarve base for families</h2>
      <p>Families usually do best in areas with easy restaurants, beach access, accommodation choice and manageable logistics.</p>
      <p>Best family choices:</p>
      <ul>
        <li>Carvoeiro for a smaller, scenic family base.</li>
        <li>Albufeira for choice, beaches and activities.</li>
        <li>Vilamoura for resort comfort, marina walks and golf.</li>
        <li>Tavira for calmer holidays and island beaches.</li>
        <li>Praia da Rocha / Alvor for wide beaches and family-friendly facilities.</li>
      </ul>
      <p>For families with young children, check beach access carefully. Some of the Algarve’s most beautiful beaches have long stairs, limited parking or strong seasonal crowds.</p>

      <h2>Best Algarve base for golf</h2>
      <p>For golf, the strongest bases are:</p>
      <ul>
        <li><strong>Vilamoura</strong> — the most obvious golf base, with marina lifestyle and nearby courses.</li>
        <li><strong>Quinta do Lago / Vale do Lobo</strong> — premium golf, villas and resort stays.</li>
        <li><strong>Carvoeiro / Lagoa</strong> — good for central Algarve golf and scenic coastal access.</li>
        <li><strong>Portimão / Alvor</strong> — useful for western Algarve courses.</li>
        <li><strong>Monte Rei / Eastern Algarve</strong> — better for a quieter, premium golf-focused trip.</li>
      </ul>
      <p>Portugal was again recognised as the World’s Best Golf Destination in 2025 by the World Golf Awards, according to Turismo de Portugal. For AlgarveOfficial, this makes golf accommodation guides commercially valuable because golf visitors often plan around courses, transfers, restaurants and premium services.</p>

      <h2>Best Algarve base for relocation scouting</h2>
      <p>Visitors considering relocation should think differently from holidaymakers. Instead of choosing only the prettiest beach, they should test daily life: supermarkets, schools, healthcare, transport, winter atmosphere, parking, community and access to services.</p>
      <p>Strong bases for relocation scouting include:</p>
      <ul>
        <li>Faro for infrastructure, airport access, services and year-round life.</li>
        <li>Loulé for inland character, markets and central access.</li>
        <li>Tavira for traditional eastern Algarve living.</li>
        <li>Lagos for international community and coastal lifestyle.</li>
        <li>Lagoa / Carvoeiro for central positioning and family-friendly areas.</li>
        <li>Olhão for value, authenticity and Ria Formosa access.</li>
      </ul>
      <p>A good relocation trip should include both summer-style coastal visits and ordinary weekday routines.</p>

      <h2>Final recommendation: where should you stay?</h2>
      <p>For a first Algarve holiday, choose Lagos if you want scenery, beaches and atmosphere. Choose Albufeira if you want convenience, nightlife and central access. Choose Vilamoura if golf, marina dining and resort comfort matter most. Choose Tavira if you want traditional charm and a slower eastern Algarve stay. Choose Faro if you want transport, culture and Ria Formosa access.</p>
      <p>For families, Carvoeiro, Vilamoura, Albufeira and Tavira are usually the safest choices. For golf, focus on Vilamoura, Quinta do Lago, Vale do Lobo and selected central Algarve resorts. For a quieter, more authentic experience, look east to Tavira and Olhão, or west to Sagres and Aljezur.</p>
      <p>The best place to stay in the Algarve is not simply the most famous town. It is the place that matches the trip you actually want: beach, golf, nightlife, nature, culture, relocation, or slow coastal living.</p>
    $article$::text AS content,
    '/images/region-lagos-800w-C_edT6EI.webp'::text AS featured_image,
    'travel-guides'::public.blog_category AS category,
    ARRAY[
      'where to stay in the Algarve',
      'best places to stay Algarve',
      'Lagos Algarve',
      'Albufeira Algarve',
      'Vilamoura',
      'Tavira',
      'Faro',
      'Algarve holiday base',
      'Carvoeiro',
      'Golden Triangle'
    ]::text[] AS tags,
    16::integer AS reading_time,
    '2026-05-14T07:10:00Z'::timestamptz AS published_at,
    'Where to Stay in the Algarve: Best Towns and Areas for Every Type of Trip'::text AS seo_title,
    'Discover where to stay in the Algarve, Portugal — from Lagos and Albufeira to Vilamoura, Tavira, Faro, Carvoeiro, Portimão and the Golden Triangle.'::text AS seo_description,
    'where to stay in the Algarve, best places to stay Algarve, Lagos Algarve, Albufeira Algarve, Vilamoura, Tavira, Faro, Algarve holiday base'::text AS focus_keywords,
    ARRAY[
      'praia-de-dona-ana-lagos',
      'praia-do-camilo-lagos',
      'meia-praia-lagos',
      'praia-dos-pescadores-albufeira',
      'praia-da-oura-albufeira',
      'praia-de-sao-rafael-albufeira',
      'praia-da-gale-albufeira',
      'praia-da-falesia-albufeira',
      'praia-da-ilha-de-tavira',
      'praia-do-barril-tavira',
      'praia-da-ilha-deserta-barreta-faro',
      'praia-do-carvoeiro-lagoa',
      'praia-de-benagil-lagoa',
      'praia-da-marinha-lagoa',
      'praia-de-vale-centeanes-lagoa',
      'praia-da-rocha-portimao',
      'praia-dos-tres-castelos-portimao',
      'praia-do-vau-portimao',
      'praia-do-ancao-loule',
      'praia-do-garrao-loule',
      'praia-da-culatra-faro',
      'praia-da-armona-olhao',
      'praia-da-arrifana-aljezur',
      'praia-de-odeceixe-aljezur'
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
