import { LOCALE_CONFIGS, type Locale } from "@/lib/i18n/config";
import type { CanonicalCategorySlug } from "./category-slugs";
import { getCategoryDisplayName } from "./category-slugs";
import type { ProgrammaticListing } from "./category-city-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeoContentBlock {
  h1: string;
  intro: string;
  bodyParagraph: string;
  closingParagraph: string;
  metaTitle: string;
  metaDescription: string;
}

export interface CitySeoContentBlock {
  h1: string;
  intro: string;
  bodyParagraph: string;
  closingParagraph: string;
  metaTitle: string;
  metaDescription: string;
}

interface ContentContext {
  locale: Locale;
  canonical: CanonicalCategorySlug;
  cityName: string;
  cityDescription: string | null;
  categoryDisplayName: string;
  count: number;
  topListings: Pick<ProgrammaticListing, "name" | "google_rating" | "tier">[];
  avgRating: number | null;
  highestTier: string;
}

interface CityContentContext {
  locale: Locale;
  cityName: string;
  cityDescription: string | null;
  count: number;
  topCategoryNames: string[];
  topListingNames: string[];
  avgRating: number | null;
  year: number;
}

// ─── City landmark hints (supplements DB descriptions) ───────────────────────

/**
 * Normalise a city name to a consistent ASCII key for CITY_CONTEXT lookup.
 * Strips diacritics so that both "Portimão" and "Portimao" resolve to "portimao".
 */
function normalizeCityKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritical marks
    .replace(/\s+/g, "-");           // spaces → hyphens (e.g. "armacao de pera" → "armacao-de-pera")
}

const CITY_CONTEXT: Record<string, string> = {
  albufeira: "golden beaches and vibrant marina",
  vilamoura: "luxury marina and championship golf courses",
  lagos: "dramatic clifftop scenery and historic old town",
  portimao: "Praia da Rocha and the River Arade",
  tavira: "Roman bridge and Ria Formosa lagoon",
  faro: "old city walls and Ria Formosa Nature Park",
  "quinta-do-lago": "prestigious golf estates and nature reserve",
  "vale-do-lobo": "luxury resort and championship golf courses",
  carvoeiro: "dramatic rock formations and sea caves",
  sagres: "Atlantic cliffs and surf beaches at Europe's southwestern tip",
  quarteira: "long sandy promenade and traditional fish market",
  silves: "Moorish castle and orange groves",
  "armacao-de-pera": "sweeping bay and fishing heritage",
  monchique: "mountain spa retreats and eucalyptus forests",
  olhao: "cubist architecture and island beaches",
  loule: "weekly market and craft traditions",
  alvor: "tranquil lagoon estuary and medieval fishing village",
  ferragudo: "hilltop castle overlooking the Arade river mouth",
  luz: "sheltered beach and dramatic cliff walks",
  aljezur: "wild surf beaches within Costa Vicentina Natural Park",
  altura: "long sandy beach on the eastern Algarve coast",
  "vila-real-de-santo-antonio": "riverside promenade on the Spanish border",
  alcoutim: "medieval hilltop village on the Guadiana river",
  fuseta: "lagoon island beaches within Ria Formosa",
};

// ─── Template systems ─────────────────────────────────────────────────────────

type Templates = {
  h1: (ctx: ContentContext) => string;
  intro: (ctx: ContentContext) => string;
  body: (ctx: ContentContext) => string;
  closing: (ctx: ContentContext) => string;
  metaTitle: (ctx: ContentContext) => string;
  metaDescription: (ctx: ContentContext) => string;
};

const TEMPLATES: Record<Locale, Templates> = {
  en: {
    h1: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} in ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings
        .slice(0, 3)
        .map((l) => l.name)
        .join(", ");
      const ratingStr =
        avgRating !== null ? ` With an average rating of ${avgRating.toFixed(1)} stars,` : "";
      return `${cityName} is home to ${count} curated ${categoryDisplayName.toLowerCase()} listings on AlgarveOfficial.${ratingStr} you'll find premium options including ${topNames || "handpicked local gems"} — all verified by our team of Algarve experts.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "stunning Atlantic coastline";
      const cityDesc =
        cityDescription?.slice(0, 120) ?? `${cityName}'s ${cityContext}`;
      const categoryBlurbs: Record<CanonicalCategorySlug, string> = {
        restaurants:
          `From fresh seafood and traditional petiscos to fine-dining tables with Michelin-level ambition, ${cityName}'s restaurant scene is one of the Algarve's most compelling. ${cityDesc}. Whether you're planning a romantic dinner, a family lunch, or a leisurely brunch by the water, our curated selection ensures you never settle for less.`,
        accommodation:
          `Accommodation in ${cityName} ranges from boutique guesthouses with hand-painted azulejos to five-star resorts with private pools and Atlantic views. ${cityDesc}. AlgarveOfficial only lists properties that meet our premium standards — independent inspections, guest experience focus, and genuine local character.`,
        golf:
          `${cityName} sits within reach of some of the Algarve's most celebrated fairways, where Atlantic breezes and year-round sunshine create near-perfect playing conditions. ${cityDesc}. Whether you're chasing a low handicap or simply want to enjoy 18 holes in exceptional surroundings, our curated golf listings deliver it.`,
        experiences:
          `Beyond the beaches, ${cityName} rewards the curious traveller with an extraordinary range of experiences. ${cityDesc}. From private boat tours along the coastline to immersive cultural workshops and adrenaline-fuelled water sports, AlgarveOfficial connects you with the Algarve's most memorable activities.`,
        "beach-clubs":
          `The beaches near ${cityName} have earned their place among Europe's finest — golden sand, turquoise water, and a laid-back atmosphere that defines the Algarve experience. ${cityDesc}. Our listings include both unspoiled coves and fully serviced beach clubs where premium sunbeds and cocktails await.`,
        "wellness-spas":
          `Wellness in ${cityName} goes far beyond a standard spa day. ${cityDesc}. Whether you're looking for a restorative massage, a thermal thalassotherapy circuit, or a multi-day holistic retreat, our curated wellness listings bring the best of Algarve relaxation directly to you.`,
        shopping:
          `Shopping in ${cityName} means discovering independent boutiques, artisan markets, and concept stores that reflect the authentic character of the Algarve. ${cityDesc}. From handcrafted cork products and locally designed ceramics to contemporary fashion and gourmet food, our listings guide you to the best retail experiences.`,
        "concierge-services":
          `Making the most of the Algarve requires the right support — from luxury transfers and private concierge services to property management and yacht charters. ${cityDesc}. AlgarveOfficial's service listings in ${cityName} are vetted for professionalism, reliability, and the elevated standards our members expect.`,
        events:
          `${cityName}'s events calendar reflects the full energy of Algarve life. ${cityDesc}. From jazz-by-the-sea evenings and gastronomy festivals to exclusive private dinners and cultural celebrations, our curated events listings keep you connected to what's happening right now.`,
        "family-attractions":
          `Family attractions in ${cityName} offer unforgettable experiences for all ages. ${cityDesc}. From theme parks and animal encounters to interactive museums and adventure centers, our listings showcase the best family-friendly activities the Algarve has to offer.`,
        beaches:
          `The beaches near ${cityName} have earned their place among Europe's finest — golden sand, turquoise water, and a laid-back atmosphere that defines the Algarve experience. ${cityDesc}. Our listings include both unspoiled coves and fully serviced beach areas.`,
        "real-estate":
          `Real estate in ${cityName} offers exceptional opportunities in the Algarve market. ${cityDesc}. From luxury villas to investment properties, our curated listings connect you with the best real estate options in the region.`,
        transportation:
          `Transportation services in ${cityName} ensure seamless travel throughout the Algarve. ${cityDesc}. From private transfers to car rentals and yacht charters, our listings provide reliable options for every journey.`,
        "security-services":
          `Security services in ${cityName} provide peace of mind for residents and visitors. ${cityDesc}. Our curated listings connect you with professional security providers.`,
        "architecture-design":
          `Architecture and design in ${cityName} showcases the best of Algarve's built environment. ${cityDesc}. From luxury renovations to new constructions, our listings feature the finest architects and designers.`,
      };
      return categoryBlurbs[canonical] ?? `Explore the best ${categoryDisplayName.toLowerCase()} in ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `All ${count} ${categoryDisplayName.toLowerCase()} listings for ${cityName} on AlgarveOfficial have been independently reviewed and selected for quality. Bookmark your favourites, compare options, and plan your perfect Algarve experience — from a single search.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} in ${cityName} | Algarve's Best`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Discover the ${count} best ${categoryDisplayName.toLowerCase()} in ${cityName}, Algarve.${avgRating !== null ? ` Avg. ${avgRating.toFixed(1)}★.` : ""} Curated by local experts on AlgarveOfficial.`,
  },

  "pt-pt": {
    h1: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} em ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      const ratingStr = avgRating !== null ? ` Com uma avaliação média de ${avgRating.toFixed(1)} estrelas,` : "";
      return `${cityName} tem ${count} opções de ${categoryDisplayName.toLowerCase()} selecionadas no AlgarveOfficial.${ratingStr} encontrará propostas de qualidade como ${topNames || "as melhores opções locais"} — todas verificadas pela nossa equipa de especialistas do Algarve.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "costa atlântica deslumbrante";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName}, com ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `De mariscos frescos e petiscos tradicionais a mesas de fine dining com ambição Michelin, a cena gastronómica de ${cityName} é uma das mais interessantes do Algarve. ${cityDesc}. Seja para um jantar romântico, almoço em família ou brunch à beira-mar, a nossa seleção garante uma experiência inesquecível.`,
        "accommodation": `O alojamento em ${cityName} vai desde casas de hóspedes boutique com azulejos pintados à mão a resorts de cinco estrelas com piscina privada e vistas para o Atlântico. ${cityDesc}. O AlgarveOfficial lista apenas propriedades que cumprem os nossos critérios de excelência.`,
        golf: `${cityName} está próxima de alguns dos campos de golfe mais célebres do Algarve, onde a brisa atlântica e o sol praticamente todo o ano criam condições de jogo quase perfeitas. ${cityDesc}.`,
        "experiences": `Para além das praias, ${cityName} surpreende o visitante com uma oferta de experiências extraordinária. ${cityDesc}. Desde passeios de barco privado até workshops culturais imersivos.`,
        "beach-clubs": `As praias perto de ${cityName} conquistaram o seu lugar entre as melhores da Europa. ${cityDesc}. A nossa seleção inclui enseadas desertas e beach clubs com serviço premium.`,
        "wellness-spas": `O bem-estar em ${cityName} vai muito além de uma massagem simples. ${cityDesc}. Desde circuitos de talassoterapia a retiros holísticos de vários dias.`,
        "shopping": `Fazer compras em ${cityName} é descobrir boutiques independentes, mercados de artesãos e concept stores que refletem o carácter autêntico do Algarve. ${cityDesc}.`,
        "concierge-services": `Tirar o máximo partido do Algarve requer o apoio certo — desde transfers de luxo a serviços de concierge privado. ${cityDesc}.`,
        "events": `A agenda de eventos de ${cityName} reflete a energia do Algarve. ${cityDesc}. De noites de jazz à beira-mar a festivais de gastronomia e jantares privados exclusivos.`,
        "family-attractions": `Atrações familiares em ${cityName} oferecem experiências inesquecíveis para todas as idades. ${cityDesc}. De parques temáticos a encounters com animais.`,
        "beaches": `As praias perto de ${cityName} estão entre as melhores da Europa. ${cityDesc}. Areia dourada, água turquesa e atmosfera relaxante.`,
        "real-estate": `Imóveis em ${cityName} oferecem excecionais oportunidades no mercado algarvio. ${cityDesc}. De moradias de luxo a propriedades de investimento.`,
        "transportation": `Serviços de transporte em ${cityName} garantem viagens perfeitas pelo Algarve. ${cityDesc}. From transferes privados a aluguer de carros.`,
        "security-services": `Serviços de segurança em ${cityName} proporcionam tranquilidade. ${cityDesc}. Os nossos listings conectam-no com profissionais de confiança.`,
        "architecture-design": `Arquitetura e design em ${cityName} mostram o melhor do ambiente construído do Algarve. ${cityDesc}. De renovações de luxo a novas construções.`,
      };
      return blurbs[canonical] ?? `Explore os melhores ${categoryDisplayName.toLowerCase()} em ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Todas as ${count} opções de ${categoryDisplayName.toLowerCase()} em ${cityName} no AlgarveOfficial foram analisadas e selecionadas pela sua qualidade. Guarde os seus favoritos, compare e planeie a sua experiência perfeita no Algarve.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} em ${cityName} | Melhores do Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Descubra os ${count} melhores ${categoryDisplayName.toLowerCase()} em ${cityName}, Algarve.${avgRating !== null ? ` Avaliação média ${avgRating.toFixed(1)}★.` : ""} Curados por especialistas no AlgarveOfficial.`,
  },

  fr: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} à ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      return `${cityName} compte ${count} options de ${categoryDisplayName.toLowerCase()} sélectionnées sur AlgarveOfficial. Parmi les meilleures adresses : ${topNames || "une sélection soigneuse d'établissements locaux"} — toutes vérifiées par notre équipe d'experts de l'Algarve.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "côte atlantique exceptionnelle";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName}, avec ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `De fruits de mer frais et tapas traditionnels aux tables gastronomiques, ${cityName} propose une scène culinaire remarquable. Avec ses ${cityContext}, la ville se prête à tous les plaisirs de table. AlgarveOfficial sélectionne les meilleures adresses pour chaque occasion.`,
        "accommodation": `L'hébergement à ${cityName} va des maisons d'hôtes boutique aux complexes cinq étoiles avec piscine privée et vue sur l'Atlantique. Grâce à ses ${cityContext}, chaque séjour devient une expérience à part entière.`,
        golf: `${cityName} est à portée de certains des plus beaux parcours de golf de l'Algarve, où la brise atlantique et le soleil toute l'année offrent des conditions de jeu idéales.`,
        "experiences": `Au-delà des plages, ${cityName} surprend par l'extraordinaire variété de ses expériences. Des croisières privées aux ateliers culturels, en passant par les sports nautiques.`,
        "beach-clubs": `Les plages de ${cityName} figurent parmi les plus belles d'Europe — sable doré, eaux turquoise et une atmosphère détendue qui définit l'expérience Algarve.`,
        "wellness-spas": `Le bien-être à ${cityName} dépasse la simple journée spa. Circuits thalasso, retraites holistiques et massages signature : AlgarveOfficial sélectionne le meilleur pour vous ressourcer.`,
        "shopping": `Faire du shopping à ${cityName}, c'est découvrir des boutiques indépendantes, marchés artisanaux et concept stores qui reflètent l'authenticité de l'Algarve.`,
        "concierge-services": `Pour profiter pleinement de l'Algarve, il faut les bons partenaires — transferts privés, conciergerie de luxe, gestion de propriété et location de yachts.`,
        "events": `L'agenda d'événements de ${cityName} reflète toute l'énergie de l'Algarve — soirées jazz en bord de mer, festivals gastronomiques et dîners privés exclusifs.`,
        "family-attractions": `Les attractions familiales à ${cityName} offrent des expériences inoubliables pour tous les ages. ${cityDesc}. Des parks thématiques aux rencontres animales.`,
        "beaches": `Les plages de ${cityName} sont parmi les meilleures d'Europe. ${cityDesc}. Sable doré, eau turquoise et atmosphère décontractée.`,
        "real-estate": `L'immobilier à ${cityName} offre des opportunités exceptionnelles sur le marché Algarve. ${cityDesc}. Des villas de luxe aux propriétés d'investissement.`,
        "transportation": `Les services de transport à ${cityName} garantissent des voyages parfaits dans l'Algarve. ${cityDesc}. Des transferts privés à la location de voitures.`,
        "security-services": `Les services de sécurité à ${cityName} offrent une tranquillité d'esprit. ${cityDesc}. Nos listings vous connectent avec des professionnels de confiance.`,
        "architecture-design": `L'architecture et le design à ${cityName} mettent en valeur le meilleur de l'environnement construit de l'Algarve. ${cityDesc}. Des rénovations de luxe aux nouvelles constructions.`,
      } as const;
      return blurbs[canonical] ?? `Découvrez les meilleurs ${categoryDisplayName.toLowerCase()} à ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `L'ensemble des ${count} ${categoryDisplayName.toLowerCase()} à ${cityName} sur AlgarveOfficial ont été sélectionnés pour leur excellence. Comparez, enregistrez vos favoris et planifiez votre expérience Algarve idéale.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} à ${cityName} | Les Meilleurs de l'Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName }) =>
      `Découvrez les ${count} meilleurs ${categoryDisplayName.toLowerCase()} à ${cityName}, Algarve. Sélectionnés par des experts sur AlgarveOfficial.`,
  },

  de: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} in ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      return `${cityName} bietet ${count} kuratierte ${categoryDisplayName}-Einträge auf AlgarveOfficial. Zu den Top-Adressen zählen ${topNames || "handverlesene lokale Highlights"} — alle von unserem Algarve-Expertenteam geprüft.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "atemberaubende Atlantikküste";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName}, mit ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Von frischen Meeresfrüchten und traditionellen Petiscos bis hin zu Fine-Dining-Restaurants mit Michelin-Ambitionen bietet ${cityName} eine beeindruckende Gastronomieszene. Mit seinen ${cityContext} ist die Stadt der perfekte Rahmen für unvergessliche Mahlzeiten.`,
        "accommodation": `Die Unterkünfte in ${cityName} reichen von charmanten Boutique-Hotels bis zu Fünf-Sterne-Resorts mit Privatpool und Atlantikblick. AlgarveOfficial listet nur Immobilien, die unseren Premium-Standards entsprechen.`,
        golf: `${cityName} liegt in der Nähe einiger der renommiertesten Golfplätze der Algarve, wo atlantische Brisen und nahezu ganzjähriger Sonnenschein für perfekte Spielbedingungen sorgen.`,
        "experiences": `Jenseits der Strände überrascht ${cityName} mit einem außergewöhnlichen Erlebnisangebot — von privaten Bootstouren bis zu kulturellen Workshops.`,
        "beach-clubs": `Die Strände bei ${cityName} gehören zu Europas schönsten — goldener Sand, türkisfarbenes Wasser und das entspannte Flair, das die Algarve ausmacht.`,
        "wellness-spas": `Wellness in ${cityName} geht weit über einen gewöhnlichen Spa-Tag hinaus. Thalasso-Therapie, ganzheitliche Retreats und Signature-Massagen erwarten Sie.`,
        "shopping": `Shopping in ${cityName} bedeutet, unabhängige Boutiquen, Handwerksmärkte und Concept Stores zu entdecken, die den authentischen Charakter der Algarve widerspiegeln.`,
        "concierge-services": `Um das Beste aus der Algarve herauszuholen, brauchen Sie die richtigen Partner — Luxustransfers, privater Concierge-Service und Yachtcharter.`,
        "events": `Der Veranstaltungskalender in ${cityName} spiegelt die volle Energie der Algarve wider — Jazzabende am Meer, Gastronomiefestivals und exklusive private Dinners.`,
        "family-attractions": `Familienattraktionen in ${cityName} bieten unvergessliche Erlebnisse für alle Altersgruppen. ${cityDesc}. Von Themenparks bis zu Tierbegegnungen.`,
        "beaches": `Die Strände bei ${cityName} gehören zu Europas schönsten. ${cityDesc}. Goldener Sand, türkisfarbenes Wasser und entspannte Atmosphäre.`,
        "real-estate": `Immobilien in ${cityName} bieten außergewöhnliche Möglichkeiten auf dem Algarve-Markt. ${cityDesc}. Von Luxusvillen bis zu Investitionsobjekten.`,
        "transportation": `Transportdienste in ${cityName} gewährleisten perfekte Reisen durch die Algarve. ${cityDesc}. Von privaten Transfers bis zur Autovermietung.`,
        "security-services": `Sicherheitsdienste in ${cityName} bieten Sicherheit. ${cityDesc}. Unsere Listings verbinden Sie mit vertrauenswürdigen Profis.`,
        "architecture-design": `Architektur und Design in ${cityName} zeigen das Beste der gebauten Umgebung der Algarve. ${cityDesc}. Von Luxusrenovierungen bis zum Neubau.`,
      } as const;
      return blurbs[canonical] ?? `Entdecken Sie die besten ${categoryDisplayName} in ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Alle ${count} ${categoryDisplayName}-Einträge für ${cityName} auf AlgarveOfficial wurden unabhängig geprüft und für ihre Qualität ausgewählt. Merken Sie sich Ihre Favoriten und planen Sie Ihr perfektes Algarve-Erlebnis.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} in ${cityName} | Die Besten der Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName }) =>
      `Entdecken Sie die ${count} besten ${categoryDisplayName.toLowerCase()} in ${cityName}, Algarve. Kuratiert von Experten auf AlgarveOfficial.`,
  },

  es: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} en ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      return `${cityName} alberga ${count} opciones de ${categoryDisplayName.toLowerCase()} en AlgarveOfficial. Entre las mejores: ${topNames || "joyas locales seleccionadas a mano"} — todas verificadas por nuestro equipo de expertos del Algarve.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "espectacular costa atlántica";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName}, con ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Desde mariscos frescos y petiscos tradicionales hasta mesas de alta cocina con ambición Michelin, ${cityName} ofrece una escena gastronómica excepcional. Con sus ${cityContext}, la ciudad invita a cada tipo de experiencia culinaria.`,
        "accommodation": `El alojamiento en ${cityName} va desde casas rurales boutique con azulejos pintados hasta resorts de cinco estrellas con piscina privada y vistas al Atlántico.`,
        golf: `${cityName} está cerca de algunos de los mejores campos de golf del Algarve, donde la brisa atlántica y el sol casi permanente crean condiciones de juego ideales.`,
        "experiences": `Más allá de las playas, ${cityName} sorprende con una extraordinaria variedad de experiencias — desde excursiones en barco privado hasta talleres culturales inmersivos.`,
        "beach-clubs": `Las playas de ${cityName} están entre las mejores de Europa — arena dorada, aguas turquesas y el ambiente relajado que define la experiencia del Algarve.`,
        "wellness-spas": `El bienestar en ${cityName} va mucho más allá de un día de spa. Circuitos de talasoterapia, retiros holísticos y masajes exclusivos esperan a los visitantes.`,
        "shopping": `Hacer compras en ${cityName} es descubrir boutiques independientes, mercados de artesanos y concept stores que reflejan el carácter auténtico del Algarve.`,
        "concierge-services": `Para aprovechar al máximo el Algarve se necesitan los socios adecuados — transfers de lujo, servicio de conserjería privado y alquiler de yates.`,
        "events": `La agenda de eventos de ${cityName} refleja toda la energía del Algarve — noches de jazz junto al mar, festivales gastronómicos y cenas privadas exclusivas.`,
        "family-attractions": `Las atracciones familiares en ${cityName} ofrecen experiencias inovidables para todas las edades. ${cityDesc}. De parques temáticos a encuentros con animales.`,
        "beaches": `Las playas de ${cityName} están entre las mejores de Europa. ${cityDesc}. Arena dorada, aguas turquesas y atmósfera relajada.`,
        "real-estate": `Bienes raíces en ${cityName} ofrecen oportunidades excepcionales en el mercado del Algarve. ${cityDesc}. De villas de lujo a propiedades de inversión.`,
        "transportation": `Los servicios de transporte en ${cityName} garantizan viajes perfectos por el Algarve. ${cityDesc}. De transfers privados al alquiler de coches.`,
        "security-services": `Los servicios de seguridad en ${cityName} ofrecen tranquilidad. ${cityDesc}. Nuestros listings le conectan con profesionales de confianza.`,
        "architecture-design": `Arquitectura y diseño en ${cityName} muestran lo mejor del entorno construido del Algarve. ${cityDesc}. De renovaciones de lujo a nuevas construcciones.`,
      } as const;
      return blurbs[canonical] ?? `Explore los mejores ${categoryDisplayName.toLowerCase()} en ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Todas las ${count} opciones de ${categoryDisplayName.toLowerCase()} en ${cityName} en AlgarveOfficial han sido seleccionadas por su calidad. Compare, guarde sus favoritos y planifique su experiencia perfecta en el Algarve.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} en ${cityName} | Los Mejores del Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName }) =>
      `Descubra los ${count} mejores ${categoryDisplayName.toLowerCase()} en ${cityName}, Algarve. Curados por expertos en AlgarveOfficial.`,
  },

  it: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} a ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      const ratingStr = avgRating !== null ? ` Con una valutazione media di ${avgRating.toFixed(1)} stelle,` : "";
      return `${cityName} ospita ${count} opzioni di ${categoryDisplayName.toLowerCase()} su AlgarveOfficial.${ratingStr} Tra i migliori: ${topNames || "gemme locali scelte a mano"} — tutte verificate dal nostro team di esperti dell'Algarve.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "splendida costa atlantica";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName} con ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Da frutti di mare freschi e petiscos tradizionali a tavole di alta cucina con ambizioni Michelin, ${cityName} offre una scena gastronomica eccezionale. ${cityDesc}. Che stiate pianificando una cena romantica, un pranzo in famiglia o un brunch vista mare, la nostra selezione garantisce un'esperienza indimenticabile.`,
        "accommodation": `L'alloggio a ${cityName} spazia da boutique guesthouse con azulejos dipinti a resort a cinque stelle con piscina privata e vista sull'Atlantico. ${cityDesc}. AlgarveOfficial elenca solo strutture che soddisfano i nostri standard premium — ispezioni indipendenti, attenzione all'esperienza degli ospiti e autentico carattere locale.`,
        golf: `${cityName} si trova vicino ad alcuni dei campi da golf più celebri dell'Algarve, dove la brezza atlantica e il sole quasi tutto l'anno creano condizioni di gioco quasi perfette. ${cityDesc}. Che vogliate abbassare il vostro handicap o semplicemente godervi 18 buche in un ambiente eccezionale, le nostre selezioni curate vi soddisfaranno.`,
        "experiences": `Oltre alle spiagge, ${cityName} sorprende il visitatore con una gamma straordinaria di esperienze. ${cityDesc}. Dalle escursioni private in barca lungo la costa ai workshop culturali immersivi e agli sport acquatici adrenalinici, AlgarveOfficial vi mette in contatto con le attività più memorabili dell'Algarve.`,
        "beach-clubs": `Le spiagge vicino a ${cityName} hanno guadagnato il loro posto tra le migliori d'Europa — sabbia dorata, acqua turchese e un'atmosfera rilassata che definisce l'esperienza dell'Algarve. ${cityDesc}. La nostra selezione include calette incontaminate e beach club con servizio completo dove lettini premium e cocktail vi aspettano.`,
        "wellness-spas": `Il benessere a ${cityName} va ben oltre una semplice giornata in spa. ${cityDesc}. Che cerchiate un massaggio rigenerante, un circuito di talassoterapia termale o un ritiro olistico di più giorni, le nostre strutture wellness curate portano il meglio del relax dell'Algarve direttamente a voi.`,
        "shopping": `Fare shopping a ${cityName} significa scoprire boutique indipendenti, mercati artigianali e concept store che riflettono il carattere autentico dell'Algarve. ${cityDesc}. Da prodotti artigianali in sughero e ceramiche di design locale alla moda contemporanea e al cibo gourmet, le nostre selezioni vi guidano verso le migliori esperienze di acquisto.`,
        "concierge-services": `Sfruttare al massimo l'Algarve richiede il giusto supporto — da transfer di lusso e servizi di concierge privato alla gestione di proprietà e noleggio di yacht. ${cityDesc}. Le selezioni di servizi di AlgarveOfficial a ${cityName} sono verificate per professionalità, affidabilità e gli standard elevati che i nostri membri si aspettano.`,
        "events": `Il calendario eventi di ${cityName} riflette tutta l'energia della vita dell'Algarve. ${cityDesc}. Da serate jazz sul mare e festival gastronomici a cene private esclusive e celebrazioni culturali, le nostre selezioni di eventi vi tengono aggiornati su ciò che accade ora.`,
        "family-attractions": `Le attrazioni familiari a ${cityName} offrono esperienze indimenticabili per tutte le età. ${cityDesc}. Da parchi tematici a incontri con animali.`,
        "beaches": `Le spiagge vicino a ${cityName} sono tra le migliori d'Europa. ${cityDesc}. Sabbia dorata, acqua turchese e atmosfera rilassata.`,
        "real-estate": `Immobili a ${cityName} offrono opportunità eccezionali sul mercato algarvio. ${cityDesc}. Dalle ville di lusso alle proprietà per investimento.`,
        "transportation": `I servizi di trasporto a ${cityName} garantiscono viaggi perfetti in Algarve. ${cityDesc}. Dai transfer privati al noleggio auto.`,
        "security-services": `I servizi di sicurezza a ${cityName} offrono tranquillità. ${cityDesc}. I nostri listings vi connettono con professionisti fidati.`,
        "architecture-design": `Architettura e design a ${cityName} mostrano il meglio dell'ambiente costruito dell'Algarve. ${cityDesc}. Dalle ristrutturazioni di lusso alle nuove costruzioni.`,
      } as const;
      return blurbs[canonical] ?? `Esplora i migliori ${categoryDisplayName.toLowerCase()} a ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Tutte le ${count} opzioni di ${categoryDisplayName.toLowerCase()} a ${cityName} su AlgarveOfficial sono state esaminate e selezionate in modo indipendente per la loro qualità. Aggiungi i tuoi preferiti, confronta le opzioni e pianifica la tua perfetta esperienza in Algarve.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} a ${cityName} | I Migliori dell'Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Scopri i ${count} migliori ${categoryDisplayName.toLowerCase()} a ${cityName}, Algarve.${avgRating !== null ? ` Media ${avgRating.toFixed(1)}★.` : ""} Curati da esperti su AlgarveOfficial.`,
  },

  nl: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} in ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      const ratingStr = avgRating !== null ? ` Met een gemiddelde beoordeling van ${avgRating.toFixed(1)} sterren` : "";
      return `${cityName} heeft ${count} gecureerde ${categoryDisplayName.toLowerCase()}-vermeldingen op AlgarveOfficial.${ratingStr} vindt u premium opties zoals ${topNames || "zorgvuldig geselecteerde lokale toppers"} — allemaal geverifieerd door ons team van Algarve-experts.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "prachtige Atlantische kust";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName} met ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Van verse zeevruchten en traditionele petiscos tot gastronomische tafels met Michelin-ambities biedt ${cityName} een indrukwekkende culinaire scene. ${cityDesc}. Of u nu een romantisch diner, een familiemaaltijd of een relaxte brunch aan het water plant, onze gecureerde selectie garandeert een onvergetelijke ervaring.`,
        "accommodation": `Accommodaties in ${cityName} variëren van charmante boutique-hotels met handgeschilderde azulejos tot vijfsterrenresorts met privézwembad en uitzicht op de Atlantische Oceaan. ${cityDesc}. AlgarveOfficial vermeldt alleen accommodaties die voldoen aan onze premiumstandaarden — onafhankelijke inspecties, gasttevredenheid en authentiek lokaal karakter.`,
        golf: `${cityName} ligt op korte afstand van enkele van de meest gerenommeerde golfbanen van de Algarve, waar atlantische bries en bijna het hele jaar zon zorgen voor bijna perfecte speelomstandigheden. ${cityDesc}. Of u nu uw handicap wilt verlagen of gewoon wilt genieten van 18 holes in een uitzonderlijke omgeving, onze gecureerde golfselecties leveren het.`,
        "experiences": `Voorbij de stranden verrast ${cityName} de nieuwsgierige reiziger met een buitengewone reeks ervaringen. ${cityDesc}. Van privé-boottochten langs de kust tot meeslepende culturele workshops en adrenalinestimulerende watersporten, AlgarveOfficial verbindt u met de meest memorabele activiteiten van de Algarve.`,
        "beach-clubs": `De stranden bij ${cityName} hebben hun plaats verdiend onder de mooiste van Europa — goudkleurig zand, turquoise water en een ontspannen sfeer die de Algarve-ervaring definieert. ${cityDesc}. Onze selecties omvatten zowel ongerepte baaien als volledig voorziene strandclubs waar premium ligbedden en cocktails op u wachten.`,
        "wellness-spas": `Wellness in ${cityName} gaat veel verder dan een gewone spadag. ${cityDesc}. Of u nu op zoek bent naar een herstellende massage, een thermaal thalassotherapiecircuit of een meerdaags holistisch retreat, onze gecureerde wellnessselecties brengen het beste van Algarve-ontspanning direct naar u toe.`,
        "shopping": `Winkelen in ${cityName} betekent het ontdekken van onafhankelijke boetiekjes, ambachtsmarkten en conceptstores die het authentieke karakter van de Algarve weerspiegelen. ${cityDesc}. Van handgemaakte kurkproducten en lokaal ontworpen keramiek tot hedendaagse mode en gastronomisch voedsel, onze selecties leiden u naar de beste winkelervaring.`,
        "concierge-services": `Het meeste halen uit de Algarve vereist de juiste ondersteuning — van luxe transfers en privé-conciërgdiensten tot vastgoedbeheer en jachtcharter. ${cityDesc}. De servicevermeldingen van AlgarveOfficial in ${cityName} zijn gecontroleerd op professionaliteit, betrouwbaarheid en de hoge standaarden die onze leden verwachten.`,
        "events": `De evenementenagenda van ${cityName} weerspiegelt de volledige energie van het leven in de Algarve. ${cityDesc}. Van jazz-aan-zee-avonden en gastronomische festivals tot exclusieve privédineers en culturele vieringen, onze gecureerde evenementenselecties houden u verbonden met wat er nu gebeurt.`,
        "family-attractions": `Familieattracties in ${cityName} bieden onvergetelijke ervaringen voor alle leeftijden. ${cityDesc}. Van themaparken tot dierenontmoetingen.`,
        "beaches": `De stranden bij ${cityName} behoren tot de beste van Europa. ${cityDesc}. Goudkleurig zand, turquoise water en ontspannen sfeer.`,
        "real-estate": `Onroerend goed in ${cityName} biedt uitzonderlijke kansen op de Algarve-markt. ${cityDesc}. Van luxevilla's tot investeringspanden.`,
        "transportation": `Vervoersdiensten in ${cityName} garanderen perfecte reizen door de Algarve. ${cityDesc}. Van privétansfers tot autoverhuur.`,
        "security-services": `Beveiligingsdiensten in ${cityName} bieden gemoedsrust. ${cityDesc}. Onze listings verbinden u met betrouwbare professionals.`,
        "architecture-design": `Architectuur en design in ${cityName} tonen het beste van de gebouwde omgeving van de Algarve. ${cityDesc}. Van luxerenovaties tot nieuwbouw.`,
      } as const;
      return blurbs[canonical] ?? `Ontdek de beste ${categoryDisplayName.toLowerCase()} in ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Alle ${count} ${categoryDisplayName.toLowerCase()}-vermeldingen voor ${cityName} op AlgarveOfficial zijn onafhankelijk beoordeeld en geselecteerd op kwaliteit. Sla uw favorieten op, vergelijk opties en plan uw perfecte Algarve-ervaring.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} in ${cityName} | Beste van de Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Ontdek de ${count} beste ${categoryDisplayName.toLowerCase()} in ${cityName}, Algarve.${avgRating !== null ? ` Gem. ${avgRating.toFixed(1)}★.` : ""} Gecureerd door experts op AlgarveOfficial.`,
  },

  sv: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} i ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      const ratingStr = avgRating !== null ? ` Med ett genomsnittligt betyg på ${avgRating.toFixed(1)} stjärnor` : "";
      return `${cityName} erbjuder ${count} utvalda ${categoryDisplayName.toLowerCase()}-alternativ på AlgarveOfficial.${ratingStr} hittar du premiumalternativ som ${topNames || "handplockade lokala pärlor"} — alla granskade av våra Algarve-experter.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "fantastiska atlantkusten";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName} med ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Från färsk skaldjur och traditionella petiscos till fine dining-restauranger med Michelin-ambitioner erbjuder ${cityName} en enastående gastronomisk scen. ${cityDesc}. Oavsett om du planerar en romantisk middag, en familjemiddag eller en avslappnad brunch vid vattnet säkerställer vårt urval en oförglömlig upplevelse.`,
        "accommodation": `Boendealternativ i ${cityName} sträcker sig från boutique-gästhus med handmålade azulejos till femstjärniga resorter med privata pooler och utsikt över Atlanten. ${cityDesc}. AlgarveOfficial listar bara fastigheter som uppfyller våra premiumstandarder — oberoende inspektioner, fokus på gästupplevelse och genuint lokalt karaktär.`,
        golf: `${cityName} ligger nära några av Algarvens mest berömda golfbanor, där atlantiska briser och sol nästan hela året skapar nära perfekta spelförhållanden. ${cityDesc}. Oavsett om du vill sänka ditt handicap eller bara njuta av 18 hål i enastående omgivningar levererar våra utvalda golfalternativ det.`,
        "experiences": `Bortom stränderna överraskar ${cityName} den nyfikne resenären med ett extraordinärt utbud av upplevelser. ${cityDesc}. Från privata båtturer längs kusten till fördjupande kulturella workshops och adrenalinfyllda vattensporter kopplar AlgarveOfficial dig samman med Algarvens mest minnesvärda aktiviteter.`,
        "beach-clubs": `Stränderna nära ${cityName} har förtjänat sin plats bland Europas finaste — guldsand, turkost vatten och en avslappnad atmosfär som definierar Algarve-upplevelsen. ${cityDesc}. Våra urval inkluderar både orörda vikar och fullt betjänade strandklubbar där premiumligsoffor och cocktails väntar.`,
        "wellness-spas": `Wellness i ${cityName} går långt bortom en vanlig spadag. ${cityDesc}. Oavsett om du söker en återhämtande massage, ett termalt thalassoterapiprogram eller en flerdag holistisk retreat tar våra utvalda wellnessalternativ med det bästa av Algarvens avkoppling direkt till dig.`,
        "shopping": `Shopping i ${cityName} innebär att upptäcka oberoende butiker, hantverksmarknader och konceptbutiker som speglar Algarvens autentiska karaktär. ${cityDesc}. Från handgjorda korkprodukter och lokalt designad keramik till modern mode och gourmetmat guidar våra urval dig till de bästa butiksupplevelserna.`,
        "concierge-services": `Att få ut det mesta av Algarve kräver rätt stöd — från lyxiga transfertjänster och privat concierge till fastighetsförvaltning och yacht-charter. ${cityDesc}. AlgarveOfficial:s serviceurval i ${cityName} är verifierade för professionalism, tillförlitlighet och de höga standarder våra medlemmar förväntar sig.`,
        "events": `${cityName}s evenemangskalender speglar all energi i Algarvens liv. ${cityDesc}. Från jazzkväll vid havet och gastronomiifestivaler till exklusiva privata middagar och kulturella firanden håller våra utvalda evenemang dig uppdaterad med vad som händer just nu.`,
        "family-attractions": `Familjeattraktioner i ${cityName} erbjuder oförglömliga upplevelser för alla åldrar. ${cityDesc}. Från temaparker till djurmöten.`,
        "beaches": `Stränderna nära ${cityName} tillhör de bästa i Europa. ${cityDesc}. Guldsand, turkost vatten och avslappnad atmosfär.`,
        "real-estate": `Fastigheter i ${cityName} erbjuder exceptionella möjligheter på Algarve-marknaden. ${cityDesc}. Från lyxvillor till investeringsfastigheter.`,
        "transportation": `Transporttjänster i ${cityName} garanterar perfekta resor genom Algarve. ${cityDesc}. Från privata transfer till biluthyrning.`,
        "security-services": `Säkerhetstjänster i ${cityName} ger sinnesfrid. ${cityDesc}. Våra listings förbinder dig med pålitliga proffs.`,
        "architecture-design": `Arkitektur och design i ${cityName} visar det bästa av Algarvens byggda miljö. ${cityDesc}. Från lyxrenoveringar till nybyggen.`,
      } as const;
      return blurbs[canonical] ?? `Utforska de bästa ${categoryDisplayName.toLowerCase()} i ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Alla ${count} ${categoryDisplayName.toLowerCase()}-alternativ i ${cityName} på AlgarveOfficial har granskats och valts ut oberoende för sin kvalitet. Spara dina favoriter, jämför alternativ och planera din perfekta Algarve-upplevelse.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} i ${cityName} | Bäst i Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Upptäck de ${count} bästa ${categoryDisplayName.toLowerCase()} i ${cityName}, Algarve.${avgRating !== null ? ` Snittbetyg ${avgRating.toFixed(1)}★.` : ""} Utvalda av experter på AlgarveOfficial.`,
  },

  no: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} i ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      const ratingStr = avgRating !== null ? ` Med en gjennomsnittlig vurdering på ${avgRating.toFixed(1)} stjerner` : "";
      return `${cityName} tilbyr ${count} kuraterte ${categoryDisplayName.toLowerCase()}-alternativer på AlgarveOfficial.${ratingStr} finner du premiumalternativer som ${topNames || "håndplukkede lokale perler"} — alle gjennomgått av våre Algarve-eksperter.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "fantastiske Atlanterhavskysten";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName} med ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Fra fersk sjømat og tradisjonelle petiscos til fine dining-restauranter med Michelin-ambisjoner tilbyr ${cityName} en enestående gastronomisk scene. ${cityDesc}. Enten du planlegger en romantisk middag, en familiemiddag eller en avslappet brunch ved vannet, sikrer vårt kuraterte utvalg en uforglemmelig opplevelse.`,
        "accommodation": `Overnattingsmuligheter i ${cityName} spenner fra sjarmerende boutique-gjestehus med håndmalte azulejos til femstjerners resorter med private bassenger og utsikt over Atlanterhavet. ${cityDesc}. AlgarveOfficial lister bare eiendommer som oppfyller våre premiumstandarder — uavhengige inspeksjoner, fokus på gjesteopplevelse og ekte lokal karakter.`,
        golf: `${cityName} ligger nær noen av Algarvens mest kjente golfbaner, der atlantiske briser og sol nesten hele året skaper nær perfekte spilleforhold. ${cityDesc}. Enten du ønsker å senke handicapet ditt eller rett og slett vil nyte 18 hull i enestående omgivelser, leverer våre kuraterte golfalternativer det.`,
        "experiences": `Bortenfor strendene overrasker ${cityName} den nysgjerrige reisende med et ekstraordinært spekter av opplevelser. ${cityDesc}. Fra private båtturer langs kysten til fordypende kulturelle workshops og adrenalinfylte vannsporter, kobler AlgarveOfficial deg med Algarvens mest minnerike aktiviteter.`,
        "beach-clubs": `Strendene nær ${cityName} har fortjent sin plass blant Europas fineste — gylden sand, turkist vann og en avslappet atmosfære som definerer Algarve-opplevelsen. ${cityDesc}. Utvalget vårt inkluderer både urørte viker og fullt betjente strandklubber der premiumsolsenger og cocktailer venter.`,
        "wellness-spas": `Velvære i ${cityName} går langt utover en vanlig spadag. ${cityDesc}. Enten du søker en gjenopprettende massasje, et termalt thalassoterapi-program eller et flerdagers holistisk retreat, bringer våre kuraterte velværevalg det beste av Algarvens avslapning direkte til deg.`,
        "shopping": `Shopping i ${cityName} betyr å oppdage uavhengige butikker, håndverksmarkeder og konseptbutikker som gjenspeiler Algarvens autentiske karakter. ${cityDesc}. Fra håndlagde korkprodukter og lokalt designet keramikk til moderne mote og gourmetmat, guider utvalgene våre deg til de beste handleopplevelsene.`,
        "concierge-services": `Å få mest mulig ut av Algarve krever riktig støtte — fra luksustransfer og privat conciergjetjeneste til eiendomsforvaltning og yachtcharter. ${cityDesc}. AlgarveOfficial:s tjenesteutvalg i ${cityName} er verifisert for profesjonalitet, pålitelighet og de høye standardene våre medlemmer forventer.`,
        "events": `${cityName}s arrangementskalender gjenspeiler all energien i Algarvens liv. ${cityDesc}. Fra jazzkvelder ved sjøen og gastronomifestivaler til eksklusive private middager og kulturelle feiringer, holder våre kuraterte arrangementsvalg deg oppdatert med hva som skjer nå.`,
        "family-attractions": `Familieattraksjoner i ${cityName} tilbyr uforglemmelige opplevelser for alle aldre. ${cityDesc}. Fra temaparker til dyremøter.`,
        "beaches": `Strendene nær ${cityName} tilhører de beste i Europa. ${cityDesc}. Gylden sand, turkist vann og avslappet atmosfære.`,
        "real-estate": `Eiendom i ${cityName} tilbyr exceptionelle muligheter i Algarve-markedet. ${cityDesc}. Fra luksusvillaer til investeringseiendom.`,
        "transportation": `Transporttjenester i ${cityName} garanterer perfekte reiser gjennom Algarve. ${cityDesc}. Fra private transfer til bilutleie.`,
        "security-services": `Sikkerhetstjenester i ${cityName} gir trygghet. ${cityDesc}. Våre listings kobler deg med pålitelige fagfolk.`,
        "architecture-design": `Arkitektur og design i ${cityName} viser det beste av Algarvens bygde miljø. ${cityDesc}. Fra luksusrenoveringer til nybygg.`,
      } as const;
      return blurbs[canonical] ?? `Utforsk de beste ${categoryDisplayName.toLowerCase()} i ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Alle ${count} ${categoryDisplayName.toLowerCase()}-alternativer i ${cityName} på AlgarveOfficial er uavhengig gjennomgått og valgt for sin kvalitet. Lagre favorittene dine, sammenlign alternativer og planlegg din perfekte Algarve-opplevelse.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} i ${cityName} | Beste i Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Oppdag de ${count} beste ${categoryDisplayName.toLowerCase()} i ${cityName}, Algarve.${avgRating !== null ? ` Snittkarakter ${avgRating.toFixed(1)}★.` : ""} Kuratert av eksperter på AlgarveOfficial.`,
  },

  da: {
    h1: ({ categoryDisplayName, cityName }) => `${categoryDisplayName} i ${cityName}, Algarve`,
    intro: ({ count, categoryDisplayName, cityName, topListings, avgRating }) => {
      const topNames = topListings.slice(0, 3).map((l) => l.name).join(", ");
      const ratingStr = avgRating !== null ? ` Med en gennemsnitlig vurdering på ${avgRating.toFixed(1)} stjerner` : "";
      return `${cityName} byder på ${count} udvalgte ${categoryDisplayName.toLowerCase()}-muligheder på AlgarveOfficial.${ratingStr} finder du premiumvalg som ${topNames || "håndplukkede lokale perler"} — alle gennemgået af vores Algarve-eksperter.`;
    },
    body: ({ categoryDisplayName, cityName, canonical, cityDescription }) => {
      const cityContext = CITY_CONTEXT[normalizeCityKey(cityName)] ?? "fantastiske Atlanterhavskyst";
      const cityDesc = cityDescription?.slice(0, 120) ?? `${cityName} med ${cityContext}`;
      const blurbs: Record<CanonicalCategorySlug, string> = {
        restaurants: `Fra frisk skaldyr og traditionelle petiscos til fine dining-restauranter med Michelin-ambitioner tilbyder ${cityName} en enestående gastronomisk scene. ${cityDesc}. Hvad enten du planlægger en romantisk middag, en familiefrokost eller en afslappet brunch ved vandet, sikrer vores kuraterede udvalg en uforglemmelig oplevelse.`,
        "accommodation": `Overnatningsmulighederne i ${cityName} spænder fra charmerende boutique-gæstehuse med håndmalede azulejos til femstjernede resorts med private pools og udsigt over Atlanterhavet. ${cityDesc}. AlgarveOfficial viser kun ejendomme, der opfylder vores premiumstandarder — uafhængige inspektioner, fokus på gæsteoplevelsen og ægte lokal karakter.`,
        golf: `${cityName} ligger tæt på nogle af Algarvens mest berømte golfbaner, hvor atlantisk brise og sol næsten hele året skaber næsten perfekte spilleforhold. ${cityDesc}. Hvad enten du ønsker at sænke dit handicap eller blot nyde 18 huller i enestående omgivelser, leverer vores kuraterede golfvalg det.`,
        "experiences": `Ud over strændene overrasker ${cityName} den nysgerrige rejsende med et ekstraordinært udvalg af oplevelser. ${cityDesc}. Fra private bådture langs kysten til fordybende kulturelle workshops og adrenalinfyldte vandsport forbinder AlgarveOfficial dig med Algarvens mest mindeværdige aktiviteter.`,
        "beach-clubs": `Strændene nær ${cityName} har fortjent deres plads blandt Europas fineste — gyldent sand, turkisblåt vand og en afslappet atmosfære, der definerer Algarve-oplevelsen. ${cityDesc}. Vores udvalg inkluderer både uberørte vige og fuldt betjente strandklubber, hvor premium-solsenge og cocktails venter.`,
        "wellness-spas": `Wellness i ${cityName} går langt ud over en almindelig spadag. ${cityDesc}. Hvad enten du søger en genoprettende massage, et termisk thalassoterapi-kredsløb eller et flerdages holistisk retreat, bringer vores kuraterede wellnessvalg det bedste af Algarvens afslapning direkte til dig.`,
        "shopping": `Shopping i ${cityName} betyder at opdage uafhængige butikker, håndværksmarkeder og konceptbutikker, der afspejler Algarvens autentiske karakter. ${cityDesc}. Fra håndlavede korkprodukter og lokalt designet keramik til moderne mode og gourmetmad guider vores udvalg dig til de bedste butiksoplevelser.`,
        "concierge-services": `At få mest muligt ud af Algarve kræver den rette støtte — fra luksuriøs transfer og privat concierge-service til ejendomsadministration og yachtcharter. ${cityDesc}. AlgarveOfficial:s servicevalg i ${cityName} er verificeret for professionalisme, pålidelighed og de høje standarder, som vores medlemmer forventer.`,
        "events": `${cityName}s begivenhedskalender afspejler al energien i det algarvske liv. ${cityDesc}. Fra jazz-ved-havet-aftener og gastronomifestivaler til eksklusive private middage og kulturelle fejringer holder vores kuraterede begivenhedsvalg dig forbundet med, hvad der sker lige nu.`,
        "family-attractions": `Familieattraktioner i ${cityName} tilbyder uforglemmelige oplevelser for alle aldre. ${cityDesc}. Fra temaparker til dyreoplevelser.`,
        "beaches": `Strændene nær ${cityName} hører til de bedste i Europa. ${cityDesc}. Gyldent sand, turkisblåt vand og afslappet atmosfære.`,
        "real-estate": `Ejendom i ${cityName} tilbyder exceptionelle muligheder i Algarve-markedet. ${cityDesc}. Fra luksusvillaer til investeringsejendom.`,
        "transportation": `Transporttjenester i ${cityName} garanterer perfekte rejser gennem Algarve. ${cityDesc}. Fra private transfer til biludlejning.`,
        "security-services": `Sikkerhedstjenester i ${cityName} giver tryghed. ${cityDesc}. Vores listings forbinder dig med pålidelige fagfolk.`,
        "architecture-design": `Arkitektur og design i ${cityName} viser det bedste af Algarvens byggede miljø. ${cityDesc}. Fra luksusrenoveringer til nybyggeri.`,
      } as const;
      return blurbs[canonical] ?? `Udforsk de bedste ${categoryDisplayName.toLowerCase()} i ${cityName}, Algarve.`;
    },
    closing: ({ count, categoryDisplayName, cityName }) =>
      `Alle ${count} ${categoryDisplayName.toLowerCase()}-muligheder i ${cityName} på AlgarveOfficial er uafhængigt gennemgået og udvalgt for deres kvalitet. Gem dine favoritter, sammenlign muligheder og planlæg din perfekte Algarve-oplevelse.`,
    metaTitle: ({ categoryDisplayName, cityName }) =>
      `${categoryDisplayName} i ${cityName} | Bedste i Algarve`,
    metaDescription: ({ count, categoryDisplayName, cityName, avgRating }) =>
      `Opdag de ${count} bedste ${categoryDisplayName.toLowerCase()} i ${cityName}, Algarve.${avgRating !== null ? ` Gns. ${avgRating.toFixed(1)}★.` : ""} Kurateret af eksperter på AlgarveOfficial.`,
  },
};

type CityTemplates = {
  h1: (ctx: CityContentContext) => string;
  intro: (ctx: CityContentContext) => string;
  body: (ctx: CityContentContext) => string;
  closing: (ctx: CityContentContext) => string;
  metaTitle: (ctx: CityContentContext) => string;
  metaDescription: (ctx: CityContentContext) => string;
};

function formatLocalizedList(locale: Locale, values: string[], fallback: string): string {
  if (values.length === 0) return fallback;

  try {
    const formatter = new Intl.ListFormat(LOCALE_CONFIGS[locale].hreflang, {
      style: "long",
      type: "conjunction",
    });
    return formatter.format(values);
  } catch {
    return values.join(", ");
  }
}

const CITY_TEMPLATES: Record<Locale, CityTemplates> = {
  en: {
    h1: ({ cityName }) => `Best Things to Do in ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("en", topCategoryNames, "restaurants, hotels and experiences");
      const highlights = formatLocalizedList("en", topListingNames, "handpicked local favourites");
      const rating = avgRating !== null ? ` With an average rating of ${avgRating.toFixed(1)} stars across rated listings,` : "";
      return `${cityName} is one of the Algarve's most searched coastal destinations, and this guide brings together ${count} curated listings across ${categories}.${rating} you can start with standout options such as ${highlights}, then branch out into the experiences, places to stay, and local services that shape a stronger stay in southern Portugal.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("en", topCategoryNames, "dining, stays and experiences");
      const context = cityDescription?.trim() || `${cityName} combines Atlantic scenery, walkable local character, and easy access to the best of the Algarve.`;
      return `${context} Rather than relying on thin filter pages, this city landing page is built to help travellers and residents discover high-quality ${categories} in one place, with real listing inventory, descriptive context, and clear onward paths into deeper category pages for more specific intent.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("en", topListingNames, "the city's most trusted addresses");
      return `Use this page as your starting point for ${cityName}: compare the top options, save favourites, and continue into the dedicated category pages when you want a more focused shortlist around ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `Best Things to Do in ${cityName}, Algarve (${year} Guide)`,
    metaDescription: ({ cityName, count, topCategoryNames, avgRating }) => {
      const categories = formatLocalizedList("en", topCategoryNames, "restaurants, places to stay, and experiences");
      const rating = avgRating !== null ? ` Avg. ${avgRating.toFixed(1)}★.` : "";
      return `Discover ${count} curated listings in ${cityName}, Algarve across ${categories}.${rating} Plan with AlgarveOfficial.`;
    },
  },
  "pt-pt": {
    h1: ({ cityName }) => `Melhores coisas para fazer em ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("pt-pt", topCategoryNames, "restaurantes, alojamento e experiências");
      const highlights = formatLocalizedList("pt-pt", topListingNames, "sugestões locais selecionadas");
      const rating = avgRating !== null ? ` Com uma avaliação média de ${avgRating.toFixed(1)} estrelas nas opções avaliadas,` : "";
      return `${cityName} é um dos destinos mais procurados do Algarve e este guia reúne ${count} listagens curadas em áreas como ${categories}.${rating} pode começar por nomes em destaque como ${highlights} e depois aprofundar restaurantes, alojamentos, atividades e serviços locais com contexto útil para planear melhor a estadia.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("pt-pt", topCategoryNames, "gastronomia, estadias e experiências");
      const context = cityDescription?.trim() || `${cityName} combina paisagem atlântica, identidade local e acesso fácil ao melhor do Algarve.`;
      return `${context} Em vez de depender de páginas vazias ou filtros soltos, esta landing page da cidade foi pensada para apresentar ${categories} com inventário real, texto útil e ligações internas claras para páginas de categoria mais específicas.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("pt-pt", topListingNames, "alguns dos melhores locais da cidade");
      return `Use esta página como ponto de partida para explorar ${cityName}, comparar opções e avançar para páginas dedicadas quando quiser uma seleção mais focada em torno de ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `Melhores coisas para fazer em ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Descubra os melhores restaurantes, hotéis e experiências em ${cityName}, Algarve. Recomendações locais selecionadas.`,
  },
  fr: {
    h1: ({ cityName }) => `Les meilleures choses à faire à ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("fr", topCategoryNames, "restaurants, hébergements et expériences");
      const highlights = formatLocalizedList("fr", topListingNames, "adresses locales sélectionnées");
      const rating = avgRating !== null ? ` Avec une note moyenne de ${avgRating.toFixed(1)} étoiles pour les lieux notés,` : "";
      return `${cityName} fait partie des destinations les plus recherchées de l'Algarve et ce guide réunit ${count} adresses sélectionnées dans des univers comme ${categories}.${rating} vous pouvez commencer par ${highlights}, puis explorer plus en profondeur les restaurants, hôtels, activités et services locaux.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("fr", topCategoryNames, "gastronomie, séjours et expériences");
      const context = cityDescription?.trim() || `${cityName} combine paysages atlantiques, charme local et accès facile au meilleur de l'Algarve.`;
      return `${context} Plutôt qu'une simple page de filtres, cette page ville est conçue pour aider les voyageurs à découvrir les meilleures options de ${categories} avec du contenu utile, un vrai inventaire et des liens internes vers des pages de catégorie plus ciblées.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("fr", topListingNames, "les adresses les plus fiables de la ville");
      return `Utilisez cette page comme point de départ pour organiser votre séjour à ${cityName}, comparer les meilleures options et poursuivre vers des pages thématiques autour de ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `Les meilleures choses à faire à ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Découvrez les meilleurs restaurants, hôtels et expériences à ${cityName}, Algarve. Recommandations locales sélectionnées.`,
  },
  de: {
    h1: ({ cityName }) => `Die besten Aktivitäten in ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("de", topCategoryNames, "Restaurants, Unterkünfte und Erlebnisse");
      const highlights = formatLocalizedList("de", topListingNames, "ausgewählte lokale Favoriten");
      const rating = avgRating !== null ? ` Mit einer durchschnittlichen Bewertung von ${avgRating.toFixed(1)} Sternen bei bewerteten Einträgen` : "";
      return `${cityName} gehört zu den gefragtesten Reisezielen der Algarve, und dieser Guide bündelt ${count} kuratierte Einträge aus Bereichen wie ${categories}.${rating} starten Sie mit Highlights wie ${highlights} und entdecken Sie danach tiefergehende Seiten für Restaurants, Hotels, Aktivitäten und Services.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("de", topCategoryNames, "Kulinarik, Aufenthalte und Erlebnisse");
      const context = cityDescription?.trim() || `${cityName} verbindet Atlantikküste, authentischen Ortscharakter und schnellen Zugang zu den besten Seiten der Algarve.`;
      return `${context} Statt einer dünnen Filterseite bietet diese Städte-Seite echte Listings, nützlichen Kontext und klare interne Weiterleitungen, damit Besucher hochwertige Optionen für ${categories} direkt entdecken können.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("de", topListingNames, "den zuverlässigsten Adressen der Stadt");
      return `Nutzen Sie diese Seite als Ausgangspunkt für ${cityName}, vergleichen Sie die besten Optionen und wechseln Sie danach in fokussierte Kategorieseiten rund um ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `Die besten Aktivitäten in ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Entdecken Sie die besten Restaurants, Hotels und Erlebnisse in ${cityName}, Algarve. Kuratierte lokale Empfehlungen.`,
  },
  es: {
    h1: ({ cityName }) => `Las mejores cosas que hacer en ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("es", topCategoryNames, "restaurantes, alojamientos y experiencias");
      const highlights = formatLocalizedList("es", topListingNames, "lugares locales seleccionados");
      const rating = avgRating !== null ? ` Con una valoración media de ${avgRating.toFixed(1)} estrellas en los perfiles valorados,` : "";
      return `${cityName} es uno de los destinos más buscados del Algarve y esta guía reúne ${count} recomendaciones curadas en categorías como ${categories}.${rating} puede empezar por ${highlights} y seguir con páginas más específicas para comer, alojarse, descubrir actividades y reservar servicios locales.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("es", topCategoryNames, "gastronomía, estancias y experiencias");
      const context = cityDescription?.trim() || `${cityName} combina paisaje atlántico, ambiente local y acceso fácil a lo mejor del Algarve.`;
      return `${context} En lugar de una página vacía basada solo en filtros, esta landing de ciudad reúne inventario real, contexto útil y enlaces internos claros para descubrir mejores opciones de ${categories}.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("es", topListingNames, "las direcciones más fiables de la ciudad");
      return `Use esta página como punto de partida para explorar ${cityName}, comparar opciones y avanzar hacia páginas de categoría más específicas alrededor de ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `Las mejores cosas que hacer en ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Descubra los mejores restaurantes, hoteles y experiencias en ${cityName}, Algarve. Recomendaciones locales seleccionadas.`,
  },
  it: {
    h1: ({ cityName }) => `Le migliori cose da fare a ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("it", topCategoryNames, "ristoranti, alloggi ed esperienze");
      const highlights = formatLocalizedList("it", topListingNames, "indirizzi locali selezionati");
      const rating = avgRating !== null ? ` Con una valutazione media di ${avgRating.toFixed(1)} stelle tra le schede recensite,` : "";
      return `${cityName} è una delle destinazioni più ricercate dell'Algarve e questa guida riunisce ${count} proposte curate tra ${categories}.${rating} si può iniziare da ${highlights} e poi approfondire ristoranti, soggiorni, attività e servizi locali attraverso pagine più specifiche.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("it", topCategoryNames, "gastronomia, soggiorni ed esperienze");
      const context = cityDescription?.trim() || `${cityName} unisce paesaggi atlantici, carattere locale e accesso rapido al meglio dell'Algarve.`;
      return `${context} Invece di una semplice pagina di filtri, questa landing cittadina mette insieme inventario reale, contenuti utili e link interni chiari per aiutare gli utenti a scoprire il meglio di ${categories}.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("it", topListingNames, "gli indirizzi più affidabili della città");
      return `Usa questa pagina come punto di partenza per ${cityName}, confronta le migliori opzioni e prosegui verso pagine di categoria dedicate intorno a ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `Le migliori cose da fare a ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Scopri i migliori ristoranti, hotel ed esperienze a ${cityName}, Algarve. Raccomandazioni locali selezionate.`,
  },
  nl: {
    h1: ({ cityName }) => `De beste dingen om te doen in ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("nl", topCategoryNames, "restaurants, accommodaties en ervaringen");
      const highlights = formatLocalizedList("nl", topListingNames, "geselecteerde lokale favorieten");
      const rating = avgRating !== null ? ` Met een gemiddelde beoordeling van ${avgRating.toFixed(1)} sterren bij beoordeelde vermeldingen,` : "";
      return `${cityName} is een van de populairste bestemmingen van de Algarve en deze gids bundelt ${count} zorgvuldig geselecteerde vermeldingen in categorieën zoals ${categories}.${rating} begin met ${highlights} en ga daarna verder naar meer gerichte pagina's voor eten, overnachten, activiteiten en lokale diensten.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("nl", topCategoryNames, "eten, verblijf en ervaringen");
      const context = cityDescription?.trim() || `${cityName} combineert Atlantische landschappen, lokale charme en snelle toegang tot het beste van de Algarve.`;
      return `${context} In plaats van een dunne filterpagina biedt deze stadspagina echte inventaris, nuttige context en duidelijke interne links om betere opties voor ${categories} te ontdekken.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("nl", topListingNames, "de meest betrouwbare adressen van de stad");
      return `Gebruik deze pagina als vertrekpunt voor ${cityName}, vergelijk de beste opties en ga daarna door naar gerichte categoriepagina's rond ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `De beste dingen om te doen in ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Ontdek de beste restaurants, hotels en ervaringen in ${cityName}, Algarve. Samengestelde lokale aanbevelingen.`,
  },
  sv: {
    h1: ({ cityName }) => `De bästa sakerna att göra i ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("sv", topCategoryNames, "restauranger, boenden och upplevelser");
      const highlights = formatLocalizedList("sv", topListingNames, "utvalda lokala favoriter");
      const rating = avgRating !== null ? ` Med ett genomsnittsbetyg på ${avgRating.toFixed(1)} stjärnor bland betygsatta listningar,` : "";
      return `${cityName} är en av Algarves mest efterfrågade destinationer och den här guiden samlar ${count} kurerade listningar inom områden som ${categories}.${rating} börja med ${highlights} och gå sedan vidare till mer fokuserade sidor för mat, boende, aktiviteter och lokala tjänster.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("sv", topCategoryNames, "mat, boende och upplevelser");
      const context = cityDescription?.trim() || `${cityName} kombinerar atlantkust, lokal karaktär och enkel tillgång till det bästa av Algarve.`;
      return `${context} I stället för en tunn filtersida samlar denna stadssida verkligt innehåll, användbar kontext och tydliga interna länkar för att hjälpa besökare att hitta bättre alternativ inom ${categories}.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("sv", topListingNames, "stadens mest pålitliga adresser");
      return `Använd den här sidan som startpunkt för ${cityName}, jämför de bästa alternativen och gå vidare till dedikerade kategorisidor kring ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `De bästa sakerna att göra i ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Upptäck de bästa restaurangerna, hotellen och upplevelserna i ${cityName}, Algarve. Kurerade lokala rekommendationer.`,
  },
  no: {
    h1: ({ cityName }) => `De beste tingene å gjøre i ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("no", topCategoryNames, "restauranter, overnatting og opplevelser");
      const highlights = formatLocalizedList("no", topListingNames, "utvalgte lokale favoritter");
      const rating = avgRating !== null ? ` Med en gjennomsnittsvurdering på ${avgRating.toFixed(1)} stjerner blant vurderte oppføringer,` : "";
      return `${cityName} er en av Algarves mest etterspurte destinasjoner, og denne guiden samler ${count} kuraterte oppføringer innen ${categories}.${rating} start med ${highlights} og fortsett deretter til mer fokuserte sider for mat, overnatting, aktiviteter og lokale tjenester.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("no", topCategoryNames, "mat, opphold og opplevelser");
      const context = cityDescription?.trim() || `${cityName} kombinerer atlanterhavskyst, lokal karakter og enkel tilgang til det beste av Algarve.`;
      return `${context} I stedet for en tynn filterside gir denne bysiden ekte innhold, nyttig kontekst og tydelige interne lenker slik at besøkende kan finne bedre alternativer innen ${categories}.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("no", topListingNames, "byens mest pålitelige adresser");
      return `Bruk denne siden som startpunkt for ${cityName}, sammenlign de beste valgene og gå videre til dedikerte kategorisider rundt ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `De beste tingene å gjøre i ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Oppdag de beste restaurantene, hotellene og opplevelsene i ${cityName}, Algarve. Kuraterte lokale anbefalinger.`,
  },
  da: {
    h1: ({ cityName }) => `De bedste ting at lave i ${cityName}, Algarve`,
    intro: ({ cityName, count, topCategoryNames, topListingNames, avgRating }) => {
      const categories = formatLocalizedList("da", topCategoryNames, "restauranter, overnatning og oplevelser");
      const highlights = formatLocalizedList("da", topListingNames, "udvalgte lokale favoritter");
      const rating = avgRating !== null ? ` Med en gennemsnitlig vurdering på ${avgRating.toFixed(1)} stjerner blandt bedømte profiler,` : "";
      return `${cityName} er en af Algarves mest eftertragtede destinationer, og denne guide samler ${count} kuraterede profiler på tværs af ${categories}.${rating} start med ${highlights}, og fortsæt derefter til mere fokuserede sider for mad, ophold, aktiviteter og lokale services.`;
    },
    body: ({ cityName, cityDescription, topCategoryNames }) => {
      const categories = formatLocalizedList("da", topCategoryNames, "mad, ophold og oplevelser");
      const context = cityDescription?.trim() || `${cityName} kombinerer Atlanterhavskyst, lokal karakter og nem adgang til det bedste af Algarve.`;
      return `${context} I stedet for en tynd filterside giver denne byside rigtigt indhold, nyttig kontekst og klare interne links, så besøgende kan opdage stærkere muligheder inden for ${categories}.`;
    },
    closing: ({ cityName, topListingNames }) => {
      const highlights = formatLocalizedList("da", topListingNames, "byens mest pålidelige adresser");
      return `Brug denne side som startpunkt for ${cityName}, sammenlign de bedste muligheder, og gå videre til dedikerede kategorisider omkring ${highlights}.`;
    },
    metaTitle: ({ cityName, year }) => `De bedste ting at lave i ${cityName}, Algarve (${year})`,
    metaDescription: ({ cityName }) => `Opdag de bedste restauranter, hoteller og oplevelser i ${cityName}, Algarve. Kuraterede lokale anbefalinger.`,
  },
};

// ─── Public API ────────────────────────────────────────────────────────────────

function buildZeroResultCategoryContent(
  locale: Locale,
  categoryDisplayName: string,
  cityName: string,
): SeoContentBlock {
  const categoryLabel = categoryDisplayName.toLowerCase();
  const year = new Date().getFullYear();

  const byLocale: Record<Locale, SeoContentBlock> = {
    en: {
      h1: `Explore ${categoryDisplayName} in ${cityName}, Algarve`,
      intro: `Explore ${categoryLabel} in ${cityName}, Algarve. New listings are being added.`,
      bodyParagraph: `This page is available to help visitors discover ${categoryLabel} in ${cityName} as new listings go live.`,
      closingParagraph: "Check back soon for new listings, or explore other cities and categories across the Algarve.",
      metaTitle: `Explore ${categoryDisplayName} in ${cityName}, Algarve (${year})`,
      metaDescription: `Explore ${categoryLabel} in ${cityName}, Algarve. New listings are being added.`,
    },
    "pt-pt": {
      h1: `Explorar ${categoryDisplayName} em ${cityName}, Algarve`,
      intro: `Explore ${categoryLabel} em ${cityName}, Algarve. Novas listagens estão a ser adicionadas.`,
      bodyParagraph: `Esta página está disponível para ajudar visitantes a descobrir ${categoryLabel} em ${cityName} à medida que novas listagens são publicadas.`,
      closingParagraph: "Volte em breve para ver novas listagens ou explore outras cidades e categorias do Algarve.",
      metaTitle: `Explorar ${categoryDisplayName} em ${cityName}, Algarve (${year})`,
      metaDescription: `Explore ${categoryLabel} em ${cityName}, Algarve. Novas listagens estão a ser adicionadas.`,
    },
    fr: {
      h1: `Explorer ${categoryDisplayName} à ${cityName}, Algarve`,
      intro: `Explorez ${categoryLabel} à ${cityName}, Algarve. De nouvelles adresses sont en cours d'ajout.`,
      bodyParagraph: `Cette page est disponible pour aider les visiteurs à découvrir ${categoryLabel} à ${cityName} au fur et à mesure de la publication de nouvelles adresses.`,
      closingParagraph: "Revenez bientôt pour consulter les nouvelles adresses ou explorez d'autres villes et catégories de l'Algarve.",
      metaTitle: `Explorer ${categoryDisplayName} à ${cityName}, Algarve (${year})`,
      metaDescription: `Explorez ${categoryLabel} à ${cityName}, Algarve. De nouvelles adresses sont en cours d'ajout.`,
    },
    de: {
      h1: `Entdecken Sie ${categoryDisplayName} in ${cityName}, Algarve`,
      intro: `Entdecken Sie ${categoryLabel} in ${cityName}, Algarve. Neue Einträge werden derzeit hinzugefügt.`,
      bodyParagraph: `Diese Seite hilft Besuchern dabei, ${categoryLabel} in ${cityName} zu entdecken, während neue Einträge veröffentlicht werden.`,
      closingParagraph: "Schauen Sie bald wieder vorbei oder entdecken Sie weitere Städte und Kategorien an der Algarve.",
      metaTitle: `${categoryDisplayName} in ${cityName}, Algarve entdecken (${year})`,
      metaDescription: `Entdecken Sie ${categoryLabel} in ${cityName}, Algarve. Neue Einträge werden derzeit hinzugefügt.`,
    },
    es: {
      h1: `Explorar ${categoryDisplayName} en ${cityName}, Algarve`,
      intro: `Explore ${categoryLabel} en ${cityName}, Algarve. Se están añadiendo nuevas fichas.`,
      bodyParagraph: `Esta página está disponible para ayudar a los visitantes a descubrir ${categoryLabel} en ${cityName} a medida que se publican nuevas fichas.`,
      closingParagraph: "Vuelva pronto para ver nuevas fichas o explore otras ciudades y categorías del Algarve.",
      metaTitle: `Explorar ${categoryDisplayName} en ${cityName}, Algarve (${year})`,
      metaDescription: `Explore ${categoryLabel} en ${cityName}, Algarve. Se están añadiendo nuevas fichas.`,
    },
    it: {
      h1: `Esplora ${categoryDisplayName} a ${cityName}, Algarve`,
      intro: `Esplora ${categoryLabel} a ${cityName}, Algarve. Nuove schede stanno per essere aggiunte.`,
      bodyParagraph: `Questa pagina aiuta i visitatori a scoprire ${categoryLabel} a ${cityName} mentre nuove schede vengono pubblicate.`,
      closingParagraph: "Torna presto per vedere nuove schede oppure esplora altre città e categorie dell'Algarve.",
      metaTitle: `Esplora ${categoryDisplayName} a ${cityName}, Algarve (${year})`,
      metaDescription: `Esplora ${categoryLabel} a ${cityName}, Algarve. Nuove schede stanno per essere aggiunte.`,
    },
    nl: {
      h1: `Ontdek ${categoryDisplayName} in ${cityName}, Algarve`,
      intro: `Ontdek ${categoryLabel} in ${cityName}, Algarve. Nieuwe vermeldingen worden toegevoegd.`,
      bodyParagraph: `Deze pagina helpt bezoekers om ${categoryLabel} in ${cityName} te ontdekken terwijl nieuwe vermeldingen live gaan.`,
      closingParagraph: "Kom binnenkort terug voor nieuwe vermeldingen of ontdek andere steden en categorieën in de Algarve.",
      metaTitle: `${categoryDisplayName} in ${cityName}, Algarve ontdekken (${year})`,
      metaDescription: `Ontdek ${categoryLabel} in ${cityName}, Algarve. Nieuwe vermeldingen worden toegevoegd.`,
    },
    sv: {
      h1: `Utforska ${categoryDisplayName} i ${cityName}, Algarve`,
      intro: `Utforska ${categoryLabel} i ${cityName}, Algarve. Nya listningar läggs till.`,
      bodyParagraph: `Den här sidan hjälper besökare att upptäcka ${categoryLabel} i ${cityName} medan nya listningar publiceras.`,
      closingParagraph: "Kom snart tillbaka för nya listningar eller utforska andra städer och kategorier i Algarve.",
      metaTitle: `Utforska ${categoryDisplayName} i ${cityName}, Algarve (${year})`,
      metaDescription: `Utforska ${categoryLabel} i ${cityName}, Algarve. Nya listningar läggs till.`,
    },
    no: {
      h1: `Utforsk ${categoryDisplayName} i ${cityName}, Algarve`,
      intro: `Utforsk ${categoryLabel} i ${cityName}, Algarve. Nye oppføringer blir lagt til.`,
      bodyParagraph: `Denne siden hjelper besøkende med å oppdage ${categoryLabel} i ${cityName} mens nye oppføringer publiseres.`,
      closingParagraph: "Kom snart tilbake for nye oppføringer eller utforsk andre byer og kategorier i Algarve.",
      metaTitle: `Utforsk ${categoryDisplayName} i ${cityName}, Algarve (${year})`,
      metaDescription: `Utforsk ${categoryLabel} i ${cityName}, Algarve. Nye oppføringer blir lagt til.`,
    },
    da: {
      h1: `Udforsk ${categoryDisplayName} i ${cityName}, Algarve`,
      intro: `Udforsk ${categoryLabel} i ${cityName}, Algarve. Nye profiler bliver tilføjet.`,
      bodyParagraph: `Denne side hjælper besøgende med at opdage ${categoryLabel} i ${cityName}, mens nye profiler bliver offentliggjort.`,
      closingParagraph: "Kom snart tilbage for nye profiler, eller udforsk andre byer og kategorier i Algarve.",
      metaTitle: `Udforsk ${categoryDisplayName} i ${cityName}, Algarve (${year})`,
      metaDescription: `Udforsk ${categoryLabel} i ${cityName}, Algarve. Nye profiler bliver tilføjet.`,
    },
  };

  return byLocale[locale] ?? byLocale.en;
}

function buildZeroResultCityContent(
  locale: Locale,
  cityName: string,
): CitySeoContentBlock {
  const year = new Date().getFullYear();

  const byLocale: Record<Locale, CitySeoContentBlock> = {
    en: {
      h1: `Explore ${cityName}, Algarve`,
      intro: `Explore ${cityName}, Algarve. New listings and local recommendations are being added.`,
      bodyParagraph: `This page is available to help visitors discover places to stay, restaurants, activities, and local services in ${cityName} as new listings go live.`,
      closingParagraph: "Check back soon for new listings, or continue exploring other cities and categories across the Algarve.",
      metaTitle: `Explore ${cityName}, Algarve (${year} Guide)`,
      metaDescription: `Explore ${cityName}, Algarve. New listings and local recommendations are being added.`,
    },
    "pt-pt": {
      h1: `Explorar ${cityName}, Algarve`,
      intro: `Explore ${cityName}, Algarve. Novas listagens e recomendações locais estão a ser adicionadas.`,
      bodyParagraph: `Esta página está disponível para ajudar visitantes a descobrir alojamento, restauração, atividades e serviços locais em ${cityName} à medida que novas listagens são publicadas.`,
      closingParagraph: "Volte em breve para ver novas listagens ou continue a explorar outras cidades e categorias do Algarve.",
      metaTitle: `Explorar ${cityName}, Algarve (${year})`,
      metaDescription: `Explore ${cityName}, Algarve. Novas listagens e recomendações locais estão a ser adicionadas.`,
    },
    fr: {
      h1: `Explorer ${cityName}, Algarve`,
      intro: `Explorez ${cityName}, Algarve. De nouvelles adresses et recommandations locales sont en cours d'ajout.`,
      bodyParagraph: `Cette page aide les visiteurs à découvrir hébergements, restaurants, activités et services locaux à ${cityName} au fur et à mesure de la publication de nouvelles adresses.`,
      closingParagraph: "Revenez bientôt pour consulter les nouvelles adresses ou explorez d'autres villes et catégories de l'Algarve.",
      metaTitle: `Explorer ${cityName}, Algarve (${year})`,
      metaDescription: `Explorez ${cityName}, Algarve. De nouvelles adresses et recommandations locales sont en cours d'ajout.`,
    },
    de: {
      h1: `${cityName}, Algarve entdecken`,
      intro: `Entdecken Sie ${cityName}, Algarve. Neue Einträge und lokale Empfehlungen werden derzeit hinzugefügt.`,
      bodyParagraph: `Diese Seite hilft Besuchern dabei, Unterkünfte, Restaurants, Aktivitäten und lokale Services in ${cityName} zu entdecken, während neue Einträge veröffentlicht werden.`,
      closingParagraph: "Schauen Sie bald wieder vorbei oder entdecken Sie weitere Städte und Kategorien an der Algarve.",
      metaTitle: `${cityName}, Algarve entdecken (${year})`,
      metaDescription: `Entdecken Sie ${cityName}, Algarve. Neue Einträge und lokale Empfehlungen werden derzeit hinzugefügt.`,
    },
    es: {
      h1: `Explorar ${cityName}, Algarve`,
      intro: `Explore ${cityName}, Algarve. Se están añadiendo nuevas fichas y recomendaciones locales.`,
      bodyParagraph: `Esta página ayuda a los visitantes a descubrir alojamiento, restaurantes, actividades y servicios locales en ${cityName} a medida que se publican nuevas fichas.`,
      closingParagraph: "Vuelva pronto para ver nuevas fichas o explore otras ciudades y categorías del Algarve.",
      metaTitle: `Explorar ${cityName}, Algarve (${year})`,
      metaDescription: `Explore ${cityName}, Algarve. Se están añadiendo nuevas fichas y recomendaciones locales.`,
    },
    it: {
      h1: `Esplora ${cityName}, Algarve`,
      intro: `Esplora ${cityName}, Algarve. Nuove schede e consigli locali stanno per essere aggiunti.`,
      bodyParagraph: `Questa pagina aiuta i visitatori a scoprire alloggi, ristoranti, attività e servizi locali a ${cityName} mentre nuove schede vengono pubblicate.`,
      closingParagraph: "Torna presto per vedere nuove schede oppure esplora altre città e categorie dell'Algarve.",
      metaTitle: `Esplora ${cityName}, Algarve (${year})`,
      metaDescription: `Esplora ${cityName}, Algarve. Nuove schede e consigli locali stanno per essere aggiunti.`,
    },
    nl: {
      h1: `Ontdek ${cityName}, Algarve`,
      intro: `Ontdek ${cityName}, Algarve. Nieuwe vermeldingen en lokale aanbevelingen worden toegevoegd.`,
      bodyParagraph: `Deze pagina helpt bezoekers om verblijven, restaurants, activiteiten en lokale diensten in ${cityName} te ontdekken terwijl nieuwe vermeldingen live gaan.`,
      closingParagraph: "Kom binnenkort terug voor nieuwe vermeldingen of ontdek andere steden en categorieën in de Algarve.",
      metaTitle: `Ontdek ${cityName}, Algarve (${year})`,
      metaDescription: `Ontdek ${cityName}, Algarve. Nieuwe vermeldingen en lokale aanbevelingen worden toegevoegd.`,
    },
    sv: {
      h1: `Utforska ${cityName}, Algarve`,
      intro: `Utforska ${cityName}, Algarve. Nya listningar och lokala rekommendationer läggs till.`,
      bodyParagraph: `Den här sidan hjälper besökare att upptäcka boenden, restauranger, aktiviteter och lokala tjänster i ${cityName} medan nya listningar publiceras.`,
      closingParagraph: "Kom snart tillbaka för nya listningar eller utforska andra städer och kategorier i Algarve.",
      metaTitle: `Utforska ${cityName}, Algarve (${year})`,
      metaDescription: `Utforska ${cityName}, Algarve. Nya listningar och lokala rekommendationer läggs till.`,
    },
    no: {
      h1: `Utforsk ${cityName}, Algarve`,
      intro: `Utforsk ${cityName}, Algarve. Nye oppføringer og lokale anbefalinger blir lagt til.`,
      bodyParagraph: `Denne siden hjelper besøkende med å oppdage overnatting, restauranter, aktiviteter og lokale tjenester i ${cityName} mens nye oppføringer publiseres.`,
      closingParagraph: "Kom snart tilbake for nye oppføringer eller utforsk andre byer og kategorier i Algarve.",
      metaTitle: `Utforsk ${cityName}, Algarve (${year})`,
      metaDescription: `Utforsk ${cityName}, Algarve. Nye oppføringer og lokale anbefalinger blir lagt til.`,
    },
    da: {
      h1: `Udforsk ${cityName}, Algarve`,
      intro: `Udforsk ${cityName}, Algarve. Nye profiler og lokale anbefalinger bliver tilføjet.`,
      bodyParagraph: `Denne side hjælper besøgende med at opdage overnatning, restauranter, aktiviteter og lokale services i ${cityName}, mens nye profiler bliver offentliggjort.`,
      closingParagraph: "Kom snart tilbage for nye profiler, eller udforsk andre byer og kategorier i Algarve.",
      metaTitle: `Udforsk ${cityName}, Algarve (${year})`,
      metaDescription: `Udforsk ${cityName}, Algarve. Nye profiler og lokale anbefalinger bliver tilføjet.`,
    },
  };

  return byLocale[locale] ?? byLocale.en;
}

export function generateSeoContentBlock(
  locale: Locale,
  canonical: CanonicalCategorySlug,
  cityName: string,
  cityDescription: string | null,
  listings: ProgrammaticListing[],
  totalCount?: number,
): SeoContentBlock {
  const count = totalCount ?? listings.length;
  const categoryDisplayName = getCategoryDisplayName(canonical, locale);

  if (count === 0) {
    return buildZeroResultCategoryContent(locale, categoryDisplayName, cityName);
  }

  // Compute avg rating from listings with ratings
  const rated = listings.filter((l) => l.google_rating !== null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, l) => sum + (l.google_rating ?? 0), 0) / rated.length
      : null;

  // Highest tier present
  const tierPriority = { signature: 3, verified: 2, unverified: 1 };
  const highestTier =
    listings.reduce(
      (best, l) =>
        (tierPriority[l.tier as keyof typeof tierPriority] ?? 0) >
        (tierPriority[best as keyof typeof tierPriority] ?? 0)
          ? l.tier
          : best,
      "unverified",
    ) ?? "verified";

  const ctx: ContentContext = {
    locale,
    canonical,
    cityName,
    cityDescription,
    categoryDisplayName,
    count,
    topListings: listings.slice(0, 5),
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    highestTier,
  };

  const T = TEMPLATES[locale] ?? TEMPLATES.en;

  return {
    h1: T.h1(ctx),
    intro: T.intro(ctx),
    bodyParagraph: T.body(ctx),
    closingParagraph: T.closing(ctx),
    metaTitle: T.metaTitle(ctx),
    metaDescription: T.metaDescription(ctx),
  };
}

export function generateCitySeoContentBlock(
  locale: Locale,
  cityName: string,
  cityDescription: string | null,
  listings: ProgrammaticListing[],
  topCategoryNames: string[],
  totalCount?: number,
): CitySeoContentBlock {
  const count = totalCount ?? listings.length;
  if (count === 0) {
    return buildZeroResultCityContent(locale, cityName);
  }

  const rated = listings.filter((listing) => listing.google_rating !== null);
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, listing) => sum + (listing.google_rating ?? 0), 0) / rated.length
      : null;

  const ctx: CityContentContext = {
    locale,
    cityName,
    cityDescription,
    count,
    topCategoryNames: topCategoryNames.slice(0, 4),
    topListingNames: listings.slice(0, 4).map((listing) => listing.name),
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    year: new Date().getFullYear(),
  };

  const template = CITY_TEMPLATES[locale] ?? CITY_TEMPLATES.en;

  return {
    h1: template.h1(ctx),
    intro: template.intro(ctx),
    bodyParagraph: template.body(ctx),
    closingParagraph: template.closing(ctx),
    metaTitle: template.metaTitle(ctx),
    metaDescription: template.metaDescription(ctx),
  };
}
