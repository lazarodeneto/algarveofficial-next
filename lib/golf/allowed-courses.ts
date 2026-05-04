export interface ApprovedGolfCourse {
  canonicalName: string;
  canonicalSlug: string;
  area: string;
  city: string;
  holeCount?: number;
  aliases?: string[];
}

export interface GolfCourseApprovalCandidate {
  slug?: string | null;
  name?: string | null;
}

const LAGOS_PORTIMAO = "Lagos / Portimao";
const CARVOEIRO_SILVES = "Carvoeiro / Silves";
const ALBUFEIRA_VILAMOURA = "Albufeira / Vilamoura";
const GOLDEN_TRIANGLE = "Golden Triangle";
const INTERIOR_NORTH = "Interior / North Algarve";
const EASTERN_ALGARVE = "Eastern Algarve";

export const approvedGolfCourses: ApprovedGolfCourse[] = [
  {
    canonicalName: "Espiche Golf",
    canonicalSlug: "espiche-golf",
    area: LAGOS_PORTIMAO,
    city: "Lagos",
    aliases: ["Espiche Golf Course"],
  },
  {
    canonicalName: "Boavista Golf & Spa Resort",
    canonicalSlug: "boavista-golf-spa-resort",
    area: LAGOS_PORTIMAO,
    city: "Lagos",
    aliases: ["Boavista Golf", "Boavista Golf Course", "Boavista Golf Resort"],
  },
  {
    canonicalName: "Palmares Ocean Living & Golf",
    canonicalSlug: "palmares-ocean-living-golf",
    area: LAGOS_PORTIMAO,
    city: "Odiaxere, Lagos",
    holeCount: 27,
    aliases: ["Palmares Golf", "Palmares Golf Course", "Palmares Ocean Living and Golf"],
  },
  {
    canonicalName: "Alto Golf Course",
    canonicalSlug: "alto-golf-course",
    area: LAGOS_PORTIMAO,
    city: "Portimao",
    aliases: ["Alto Golf"],
  },
  {
    canonicalName: "Morgado Golf Course",
    canonicalSlug: "morgado-golf-course",
    area: LAGOS_PORTIMAO,
    city: "Portimao",
    aliases: ["Morgado Golf"],
  },
  {
    canonicalName: "Alamos Golf Course",
    canonicalSlug: "alamos-golf-course",
    area: LAGOS_PORTIMAO,
    city: "Portimao",
    aliases: ["Alamos Golf", "Alamos Golf Course", "Alamos"],
  },
  {
    canonicalName: "Gramacho Golf Course",
    canonicalSlug: "gramacho-golf-course",
    area: CARVOEIRO_SILVES,
    city: "Carvoeiro",
    aliases: ["Gramacho Golf"],
  },
  {
    canonicalName: "Vale da Pinta Golf Course",
    canonicalSlug: "vale-da-pinta-golf-course",
    area: CARVOEIRO_SILVES,
    city: "Carvoeiro",
    aliases: ["Vale da Pinta Golf"],
  },
  {
    canonicalName: "Amendoeira O'Connor Jnr.",
    canonicalSlug: "amendoeira-oconnor-jnr",
    area: CARVOEIRO_SILVES,
    city: "Alcantarilha",
    aliases: [
      "Amendoeira O'Connor Jnr",
      "Amendoeira O'Connor Jnr. Course",
      "Amendoeira OConnor Jnr",
      "O'Connor Jnr.",
      "O'Connor Jnr",
      "OConnor Jnr",
      "O'Connor Course",
    ],
  },
  {
    canonicalName: "Amendoeira Faldo Course",
    canonicalSlug: "amendoeira-faldo-course",
    area: CARVOEIRO_SILVES,
    city: "Alcantarilha",
    aliases: ["Faldo Course", "Faldo Course Amendoeira", "Amendoeira Golf Faldo Course"],
  },
  {
    canonicalName: "Silves Golf Course",
    canonicalSlug: "silves-golf-course",
    area: CARVOEIRO_SILVES,
    city: "Silves",
    aliases: ["Silves Golf"],
  },
  {
    canonicalName: "Salgados Golf Course",
    canonicalSlug: "salgados-golf-course",
    area: CARVOEIRO_SILVES,
    city: "Guia, Albufeira",
    aliases: ["Salgados Golf"],
  },
  {
    canonicalName: "Pine Cliffs Golf Course",
    canonicalSlug: "pine-cliffs-golf-course",
    area: ALBUFEIRA_VILAMOURA,
    city: "Albufeira",
    holeCount: 9,
    aliases: ["Pine Cliffs Golf", "Pine Cliffs"],
  },
  {
    canonicalName: "Laguna Golf Course",
    canonicalSlug: "laguna-golf-course",
    area: ALBUFEIRA_VILAMOURA,
    city: "Vilamoura",
    aliases: ["Laguna Golf", "Dom Pedro Laguna", "Dom Pedro Laguna Golf Course"],
  },
  {
    canonicalName: "Millennium Golf Course",
    canonicalSlug: "millennium-golf-course",
    area: ALBUFEIRA_VILAMOURA,
    city: "Vilamoura",
    aliases: ["Millennium Golf", "Dom Pedro Millennium", "Dom Pedro Millennium Golf Course"],
  },
  {
    canonicalName: "Pinhal Golf Course",
    canonicalSlug: "pinhal-golf-course",
    area: ALBUFEIRA_VILAMOURA,
    city: "Vilamoura",
    aliases: ["Pinhal Golf", "Dom Pedro Pinhal", "Dom Pedro Pinhal Golf Course"],
  },
  {
    canonicalName: "Old Course Vilamoura",
    canonicalSlug: "old-course-vilamoura",
    area: ALBUFEIRA_VILAMOURA,
    city: "Vilamoura",
    aliases: ["The Old Course Vilamoura", "Dom Pedro Old Course", "Old Course", "The Old Course"],
  },
  {
    canonicalName: "The Els Club Vilamoura",
    canonicalSlug: "the-els-club-vilamoura",
    area: ALBUFEIRA_VILAMOURA,
    city: "Vilamoura",
    aliases: ["Els Club Vilamoura", "The Els Club"],
  },
  {
    canonicalName: "Vila Sol Golf Course",
    canonicalSlug: "vila-sol-golf-course",
    area: GOLDEN_TRIANGLE,
    city: "Quarteira",
    holeCount: 27,
    aliases: ["Vila Sol Golf", "Pestana Vila Sol Golf"],
  },
  {
    canonicalName: "Vale de Lobo Golf Club",
    canonicalSlug: "vale-de-lobo-golf-club",
    area: GOLDEN_TRIANGLE,
    city: "Vale de Lobo",
    aliases: [
      "Vale do Lobo Golf Club",
      "Vale de Lobo Golf",
      "Vale do Lobo Golf",
      "Vale de Lobo Royal Course",
      "Vale de Lobo Ocean Course",
    ],
  },
  {
    canonicalName: "San Lorenzo Golf Course",
    canonicalSlug: "san-lorenzo-golf-course",
    area: GOLDEN_TRIANGLE,
    city: "Almancil",
    aliases: ["San Lorenzo Golf", "Sao Lorenzo Golf Course"],
  },
  {
    canonicalName: "Quinta do Lago N&S",
    canonicalSlug: "quinta-do-lago-ns",
    area: GOLDEN_TRIANGLE,
    city: "Almancil",
    aliases: [
      "Quinta do Lago North & South",
      "Quinta do Lago North and South",
      "Quinta do Lago North Course",
      "Quinta do Lago North",
      "Quinta do Lago N and S",
    ],
  },
  {
    canonicalName: "Quinta do Lago South Course",
    canonicalSlug: "quinta-do-lago-south-course",
    area: GOLDEN_TRIANGLE,
    city: "Almancil",
    aliases: ["Quinta do Lago South", "South Course Quinta do Lago"],
  },
  {
    canonicalName: "Quinta do Lago Laranjal Course",
    canonicalSlug: "quinta-do-lago-laranjal-course",
    area: GOLDEN_TRIANGLE,
    city: "Almancil",
    aliases: ["Quinta do Lago Laranjal", "Laranjal Course"],
  },
  {
    canonicalName: "Ombria Golf Course",
    canonicalSlug: "ombria-golf-course",
    area: INTERIOR_NORTH,
    city: "Querenca, Loule",
    aliases: ["Ombria Golf", "Ombria Algarve"],
  },
  {
    canonicalName: "Benamor Golf",
    canonicalSlug: "benamor-golf",
    area: EASTERN_ALGARVE,
    city: "Tavira",
    aliases: ["Benamor Golf Course"],
  },
  {
    canonicalName: "Quinta da Ria Golf Course",
    canonicalSlug: "quinta-da-ria-golf-course",
    area: EASTERN_ALGARVE,
    city: "Vila Nova de Cacela",
    aliases: ["Quinta da Ria Golf"],
  },
  {
    canonicalName: "Monte Rei Golf & Country Club",
    canonicalSlug: "monte-rei-golf-country-club",
    area: EASTERN_ALGARVE,
    city: "Vila Nova de Cacela",
    aliases: ["Monte Rei Golf", "Monte Rei Golf and Country Club", "Monte Rei"],
  },
  {
    canonicalName: "Quinta do Vale Golf Course",
    canonicalSlug: "quinta-do-vale-golf-course",
    area: EASTERN_ALGARVE,
    city: "Castro Marim",
    aliases: ["Quinta do Vale Golf"],
  },
];

export const approvedGolfCourseSlugs = approvedGolfCourses.map(
  (course) => course.canonicalSlug,
);

const approvedSlugs = new Set(approvedGolfCourseSlugs);

function normalizeCourseKey(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/&/g, " and ")
    .replace(/\+/g, " and ")
    .replace(/\bn\s*and\s*s\b/g, "north and south")
    .replace(/\bn\s*s\b/g, "north south")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bjnr\b/g, "junior")
    .replace(/\bjunr\b/g, "junior")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToNameKey(value: string | null | undefined): string {
  if (!value) return "";
  return normalizeCourseKey(value.replace(/-/g, " "));
}

const approvedNameKeys = new Set(
  approvedGolfCourses.flatMap((course) => [
    normalizeCourseKey(course.canonicalName),
    slugToNameKey(course.canonicalSlug),
    ...(course.aliases ?? []).map((alias) => normalizeCourseKey(alias)),
  ]),
);

export function isApprovedGolfCourse(course: GolfCourseApprovalCandidate): boolean {
  const slug = course.slug?.trim().toLowerCase();
  if (slug && approvedSlugs.has(slug)) return true;

  const nameKey = normalizeCourseKey(course.name);
  if (nameKey && approvedNameKeys.has(nameKey)) return true;

  const slugNameKey = slugToNameKey(slug);
  return Boolean(slugNameKey && approvedNameKeys.has(slugNameKey));
}
