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
    '8 Best Beaches in the Algarve, Portugal: From Praia da Marinha to Praia da Falésia'::text AS title,
    'best-beaches-algarve-portugal'::text AS slug,
    'Discover the best beaches in the Algarve, Portugal, from Praia da Marinha and Praia da Falésia to Lagos coves, Ria Formosa islands, family beaches and surf spots.'::text AS excerpt,
    $article$
      <h2>8 Best Beaches in the Algarve, Portugal: From Praia da Marinha to Praia da Falésia</h2>

      <h2>The Algarve’s beaches are the region’s signature experience</h2>
      <p>The Algarve is not just one beach destination. It is a coastline of contrasts: golden limestone cliffs in Lagoa and Lagos, long resort beaches in Albufeira and Portimão, wild Atlantic surf on the west coast, and calm island beaches inside the Ria Formosa Natural Park. That variety is one of the reasons the Algarve was named World’s Leading Beach Destination 2025 by the World Travel Awards.</p>
      <p>For first-time visitors, the question is rarely whether to visit the beach. The real question is which Algarve beach fits your trip. Some beaches are made for dramatic photographs and boat tours. Others are better for families, long walks, beach restaurants, surfing, or quiet days away from resort crowds.</p>
      <p>This guide highlights the Algarve beaches worth knowing first, with practical advice on who each beach is best for, when to visit, and what to see nearby.</p>

      <h2>1. Praia da Marinha, Lagoa</h2>
      <p><strong>Best for:</strong> iconic Algarve views, photography, coastal walks, boat-trip scenery<br><strong>Nearby:</strong> Benagil, Carvalho, Vale de Centeanes, Seven Hanging Valleys Trail<br><strong>Good to know:</strong> arrive early in summer; parking fills quickly</p>
      <p>Praia da Marinha is one of the Algarve’s most recognisable beaches. Set below high limestone cliffs, with sea stacks, arches and clear water, it represents the classic image of the central Algarve coast. VisitPortugal describes Marinha as a beach backed by a tall cliff shaped by erosion and notes that its beauty has been ranked among the top 100 beaches worldwide.</p>
      <p>This is not the Algarve’s easiest beach for a lazy family day, especially during peak summer. Access involves steps and the beach can feel small when the tide is high. But for scenery, it is exceptional. The clifftop viewpoints above Praia da Marinha are among the best places in the Algarve for sunrise, late-afternoon light and coastal photography.</p>
      <p>It is also closely linked to the Percurso dos Sete Vales Suspensos, the Seven Hanging Valleys Trail, one of the Algarve’s most famous coastal walks. Lagoa’s tourism information lists the route as a linear walking trail in the municipality, with an 11.2 km return distance.</p>
      <p><strong>Why visit:</strong> Praia da Marinha is the beach to choose when you want the postcard Algarve: cliffs, turquoise water, rock formations and dramatic viewpoints.</p>

      <h2>2. Praia da Falésia, Albufeira / Loulé</h2>
      <p><strong>Best for:</strong> long beach walks, resort stays, families, sunsets<br><strong>Nearby:</strong> Açoteias, Olhos de Água, Vilamoura, Pine Cliffs<br><strong>Good to know:</strong> the beach is long, so access point matters</p>
      <p>Praia da Falésia is completely different from Marinha. Instead of a small cove, it offers a vast ribbon of sand backed by red, orange and white cliffs. Visit Algarve describes Praia da Falésia as part of a continuous stretch of sand almost 6 km long, flanked by high cliffs in deep tones.</p>
      <p>This makes it one of the Algarve’s best beaches for people who want space. Even in summer, walking further along the sand can help you find quieter sections. The beach is popular with resort guests, families and couples, but it still feels open because of its scale.</p>
      <p>Praia da Falésia is especially beautiful in the late afternoon, when the cliffs become warmer in colour and the beach feels softer and more cinematic. It is also one of the best Algarve beaches for a simple, low-effort day: arrive, walk, swim, eat nearby, and stay for sunset.</p>
      <p><strong>Why visit:</strong> choose Praia da Falésia if you want one of the Algarve’s grandest beaches, with space, colour and easy resort access.</p>

      <h2>3. Praia de Dona Ana, Lagos</h2>
      <p><strong>Best for:</strong> Lagos visitors, sheltered scenery, classic cliff views<br><strong>Nearby:</strong> Ponta da Piedade, Praia do Camilo, Lagos old town<br><strong>Good to know:</strong> popular and busy in peak season</p>
      <p>Praia de Dona Ana is one of Lagos’ most famous beaches. It sits between cliffs, with calm, clear water and rock formations that rise from the sand and sea. VisitPortugal describes Dona Ana as one of the highest-profile landmarks of the Algarve, with shaped rocks that give the landscape a picturesque quality.</p>
      <p>This beach works particularly well for visitors staying in Lagos because it is close to the town centre and easy to combine with Ponta da Piedade, boat trips and nearby restaurants. The scenery is dramatic but more accessible than some of the smaller coves.</p>
      <p>Dona Ana is not a secret beach. In July and August, expect crowds. For the best experience, visit early morning, late afternoon, or outside the busiest summer weeks.</p>
      <p><strong>Why visit:</strong> Praia de Dona Ana is one of the best choices for visitors who want Lagos’ famous cliff scenery without travelling far from town.</p>

      <h2>4. Praia do Camilo, Lagos</h2>
      <p><strong>Best for:</strong> photography, couples, scenic coves, short visits<br><strong>Nearby:</strong> Ponta da Piedade, Dona Ana, Lagos<br><strong>Good to know:</strong> access is via a long staircase</p>
      <p>Praia do Camilo is smaller than Dona Ana but often even more photogenic. It is set between ochre cliffs and reached by a wooden staircase. VisitPortugal notes that Camilo Beach is reached by a stairway involving around 200 steps and recommends stopping before the descent to take in the natural surroundings.</p>
      <p>Because it is compact, Praia do Camilo can feel full quickly. It is best enjoyed early in the day or as part of a coastal walk around the Lagos headland. The viewpoint above the stairs is one of the most photographed beach angles in the Algarve.</p>
      <p>This is not the ideal beach if you are carrying a lot of equipment, travelling with limited mobility, or looking for a full-service beach day. But for a memorable swim and a beautiful setting, it is one of Lagos’ highlights.</p>
      <p><strong>Why visit:</strong> Praia do Camilo is perfect for travellers who want a small, dramatic Algarve cove with exceptional views.</p>

      <h2>5. Praia da Rocha, Portimão</h2>
      <p><strong>Best for:</strong> lively beach holidays, restaurants, nightlife, easy access<br><strong>Nearby:</strong> Portimão Marina, Praia dos Três Castelos, Praia do Vau<br><strong>Good to know:</strong> one of the busiest beaches in the Algarve</p>
      <p>Praia da Rocha is one of the Algarve’s most established resort beaches. It has a wide sandy area, striking cliffs and a full tourism infrastructure around it. Visit Portimão describes Praia da Rocha as one of the Algarve’s most emblematic beaches, with a vast sandy area extending for more than 1 km.</p>
      <p>This is the opposite of a hidden beach. It is energetic, accessible and commercial, with restaurants, bars, hotels and nightlife close by. For some visitors, that is exactly the appeal. Praia da Rocha is convenient, social and easy to enjoy without planning.</p>
      <p>It is a strong choice for families, groups of friends, first-time Algarve visitors and anyone who wants the beach and town atmosphere together.</p>
      <p><strong>Why visit:</strong> Praia da Rocha is ideal when you want a large, lively beach with everything nearby.</p>

      <h2>6. Praia do Barril, Tavira</h2>
      <p><strong>Best for:</strong> Ria Formosa scenery, families, history, relaxed beach days<br><strong>Nearby:</strong> Tavira, Santa Luzia, Pedras d’el Rei<br><strong>Good to know:</strong> known for the anchor cemetery</p>
      <p>Praia do Barril is one of the Algarve’s most distinctive eastern beaches. It sits on Ilha de Tavira, inside the Ria Formosa, and combines a wide sandy beach with a strong sense of place. Tavira’s municipal information describes Barril as a natural beach with services, heritage and quality flags, and highlights its former tuna fishing structures and the emblematic “cemitério das âncoras” — the anchor cemetery.</p>
      <p>The beach is reached from Pedras d’el Rei by walking across the Ria Formosa landscape or taking the small tourist train. That journey is part of the experience. Once there, the beach feels more open and less urban than central resort beaches.</p>
      <p>Praia do Barril is especially good for visitors who want a calmer Algarve, with nature, dunes, history and a slower rhythm.</p>
      <p><strong>Why visit:</strong> Praia do Barril is one of the best beaches in the eastern Algarve for combining nature, heritage and an easy beach day.</p>

      <h2>7. Ilha Deserta / Barreta, Faro</h2>
      <p><strong>Best for:</strong> quiet escapes, nature, long sandy beaches, boat access<br><strong>Nearby:</strong> Faro, Ria Formosa, Ilha do Farol, Culatra<br><strong>Good to know:</strong> access is by boat from Faro</p>
      <p>Ilha Deserta, also known as Ilha da Barreta, is one of the most peaceful beach experiences near Faro. VisitPortugal describes the island as having a vast sandy area and clear water, with no constructions except those supporting the beach.</p>
      <p>This beach is part of the Ria Formosa, a protected coastal system of canals, islands, marshland and sandy beaches extending around 60 km along the Algarve coast between Garrão and Manta Rota.</p>
      <p>Ilha Deserta is not where you go for nightlife, shopping or resort energy. It is where you go to feel distance: water, dunes, silence and horizon. It is one of the best beach choices for travellers staying in Faro who want something wilder without driving across the Algarve.</p>
      <p><strong>Why visit:</strong> Ilha Deserta is ideal for visitors who want a quiet island beach and a more natural Algarve experience.</p>

      <h2>8. Praia de Odeceixe, Aljezur</h2>
      <p><strong>Best for:</strong> west coast scenery, surf, families at low tide, nature lovers<br><strong>Nearby:</strong> Odeceixe village, Costa Vicentina, Aljezur<br><strong>Good to know:</strong> sea conditions can be stronger than on the south coast</p>
      <p>Praia de Odeceixe sits in the far north-west of the Algarve, where the river meets the Atlantic. VisitPortugal notes that the beach is located at the mouth of the Ribeira de Seixe and offers the choice between sea bathing and river bathing; at low tide, small lagoons form on the broad sand and are appreciated by children.</p>
      <p>This beach has a completely different atmosphere from the central Algarve. It feels wilder, more Atlantic and less resort-focused. It is a strong choice for travellers exploring the Costa Vicentina, surfers, walkers and families who prefer nature over beach clubs.</p>
      <p>Because this is the west coast, visitors should pay close attention to flags, currents and sea conditions.</p>
      <p><strong>Why visit:</strong> Praia de Odeceixe is one of the Algarve’s best beaches for wild beauty and a different coastal mood.</p>

      <h2>Which Algarve beach should you choose?</h2>
      <p>For a first Algarve trip, the best approach is to mix different types of beaches:</p>
      <table>
        <thead>
          <tr><th>Travel style</th><th>Best beaches</th></tr>
        </thead>
        <tbody>
          <tr><td>Iconic Algarve scenery</td><td>Praia da Marinha, Praia do Camilo, Dona Ana</td></tr>
          <tr><td>Long walks and space</td><td>Praia da Falésia, Praia da Rocha, Meia Praia</td></tr>
          <tr><td>Families</td><td>Praia da Falésia, Praia do Barril, Praia da Rocha</td></tr>
          <tr><td>Quiet nature</td><td>Ilha Deserta, Praia do Barril, Odeceixe</td></tr>
          <tr><td>Lagos base</td><td>Dona Ana, Camilo, Ponta da Piedade area</td></tr>
          <tr><td>Resort convenience</td><td>Praia da Rocha, Falésia, Vilamoura / Loulé beaches</td></tr>
          <tr><td>Photography</td><td>Marinha, Camilo, Falésia, Dona Ana</td></tr>
          <tr><td>Surf and wild Atlantic coast</td><td>Odeceixe, Arrifana, Amado, Monte Clérigo</td></tr>
        </tbody>
      </table>

      <h2>Best time to visit Algarve beaches</h2>
      <p>The Algarve beach season is longest between May and October, but each period feels different.</p>
      <p>May and June are excellent for visitors who want warm weather, flowers, clearer roads and fewer crowds. July and August bring the strongest summer atmosphere, but also higher prices, busier car parks and full beaches. September is one of the best months overall: the sea is usually warmer than in spring, the light is softer, and the region remains lively. October can still be beautiful, especially for walking and relaxed beach days.</p>
      <p>For photography, the best times are early morning and late afternoon. For families, mid-morning is often easier. For cliff beaches, always check tide times and avoid sitting directly under unstable cliff faces.</p>

      <h2>Practical beach tips for the Algarve</h2>
      <p>The Algarve is beautiful, but beach conditions vary. Cliff beaches can have falling-rock risks, west coast beaches can have stronger currents, and small coves may lose sand space at high tide. Always follow beach flags, respect lifeguard instructions and check local signage before swimming.</p>
      <p>In summer, bring water, sun protection and footwear suitable for hot sand or cliff paths. Many famous beaches have steps, uneven access or limited parking. For Praia da Marinha, Praia do Camilo and other small beaches, arriving early can completely change the experience.</p>
      <p>For Ria Formosa island beaches, check ferry or boat schedules before travelling. For beaches such as Ilha Deserta, Culatra, Armona and Tavira Island, the journey is part of the attraction, but it requires more planning than simply driving to the sand.</p>

      <h2>Final recommendation</h2>
      <p>For the most complete Algarve beach experience, combine Praia da Marinha for iconic cliffs, Praia da Falésia for scale and colour, Dona Ana or Camilo for Lagos scenery, and Praia do Barril or Ilha Deserta for the quieter eastern Algarve.</p>
      <p>That combination gives visitors the real range of the Algarve: dramatic limestone coves, long golden beaches, resort convenience, island landscapes, protected nature and Atlantic wilderness. This is why the Algarve remains one of Europe’s most compelling coastal regions — not because every beach is the same, but because each part of the coast offers a different version of Portugal’s southern edge.</p>
    $article$::text AS content,
    '/images/region-lagos-800w-C_edT6EI.webp'::text AS featured_image,
    'travel-guides'::public.blog_category AS category,
    ARRAY[
      'best beaches in the Algarve',
      'Algarve beaches',
      'Praia da Marinha',
      'Praia da Falésia',
      'best beaches Portugal',
      'Algarve beach guide',
      'Ria Formosa beaches',
      'Lagos beaches'
    ]::text[] AS tags,
    13::integer AS reading_time,
    '2026-05-14T07:00:00Z'::timestamptz AS published_at,
    '8 Best Beaches in the Algarve: Praia da Marinha, Praia da Falésia & More'::text AS seo_title,
    'Discover the best beaches in the Algarve, Portugal — from Praia da Marinha and Praia da Falésia to Lagos coves, Ria Formosa islands, family beaches and surf spots.'::text AS seo_description,
    'best beaches in the Algarve, Algarve beaches, Praia da Marinha, Praia da Falésia, best beaches Portugal, Algarve beach guide'::text AS focus_keywords,
    ARRAY[
      'praia-da-marinha-lagoa',
      'praia-da-falesia-albufeira',
      'praia-de-dona-ana-lagos',
      'praia-do-camilo-lagos',
      'praia-da-rocha-portimao',
      'praia-do-barril-tavira',
      'praia-da-ilha-deserta-barreta-faro',
      'praia-de-odeceixe-aljezur',
      'praia-de-benagil-lagoa',
      'praia-do-carvalho-lagoa',
      'praia-de-vale-centeanes-lagoa',
      'praia-dos-tres-castelos-portimao',
      'praia-do-vau-portimao',
      'meia-praia-lagos',
      'praia-da-arrifana-aljezur',
      'praia-do-amado-aljezur',
      'praia-da-culatra-faro',
      'praia-da-armona-olhao',
      'praia-da-ilha-de-tavira'
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
