import type { GolfListing } from "@/lib/golf";

export type GolfExperienceTag = "championship" | "coastal" | "luxury" | "beginner" | "quick-9";
export type GolfBestForKey =
  | "experiencedGolfers"
  | "championshipPlay"
  | "premiumExperience"
  | "quickRounds"
  | "scenicRounds"
  | "relaxedPlay";

export const GOLF_EXPERIENCE_TAGS: GolfExperienceTag[] = [
  "championship",
  "coastal",
  "luxury",
  "beginner",
  "quick-9",
];

const COASTAL_HINTS = [
  "lagos",
  "albufeira",
  "vilamoura",
  "quinta-do-lago",
  "vale-do-lobo",
  "alvor",
  "portimao",
  "quarteira",
  "carvoeiro",
];

const LUXURY_HINTS = [
  "golden-triangle",
  "quinta-do-lago",
  "vale-do-lobo",
  "vilamoura",
  "prestige",
  "luxury",
];

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[_\s]+/g, "-") ?? "";
}

function includesAny(values: Array<string | null | undefined>, hints: string[]) {
  const normalized = values.map(normalize).filter(Boolean);
  return normalized.some((value) => hints.some((hint) => value.includes(hint)));
}

export function inferGolfExperienceTags(course: GolfListing): GolfExperienceTag[] {
  const tags = new Set<GolfExperienceTag>();
  const details = course.details;
  const holes = details?.holes;
  const difficulty = normalize(details?.difficulty);
  const courseType = normalize(details?.courseType);
  const priceRange = normalize(details?.priceRange);

  if (holes === 18 || courseType.includes("championship") || difficulty === "high") {
    tags.add("championship");
  }

  if (holes === 9) {
    tags.add("quick-9");
  }

  if (course.tier === "signature" || priceRange === "luxury" || includesAny([course.region?.slug, course.region?.name], LUXURY_HINTS)) {
    tags.add("luxury");
  }

  if (difficulty === "low" || difficulty === "easy") {
    tags.add("beginner");
  }

  if (includesAny([course.city?.slug, course.city?.name, course.region?.slug, course.region?.name], COASTAL_HINTS)) {
    tags.add("coastal");
  }

  return Array.from(tags);
}

export function courseMatchesExperienceTag(course: GolfListing, tag: GolfExperienceTag) {
  return inferGolfExperienceTags(course).includes(tag);
}

export function getPrimaryBestForKey(course: GolfListing): GolfBestForKey | null {
  const tags = inferGolfExperienceTags(course);
  const difficulty = normalize(course.details?.difficulty);

  if (course.tier === "signature" || tags.includes("luxury")) return "premiumExperience";
  if (difficulty === "high") return "experiencedGolfers";
  if (tags.includes("championship")) return "championshipPlay";
  if (tags.includes("quick-9")) return "quickRounds";
  if (tags.includes("coastal")) return "scenicRounds";
  if (tags.includes("beginner")) return "relaxedPlay";

  return null;
}

export function getBestForKeys(course: GolfListing): GolfBestForKey[] {
  const tags = inferGolfExperienceTags(course);
  const difficulty = normalize(course.details?.difficulty);
  const keys = new Set<GolfBestForKey>();

  if (difficulty === "high") keys.add("experiencedGolfers");
  if (tags.includes("championship")) keys.add("championshipPlay");
  if (course.tier === "signature" || tags.includes("luxury")) keys.add("premiumExperience");
  if (tags.includes("quick-9")) keys.add("quickRounds");
  if (tags.includes("coastal")) keys.add("scenicRounds");
  if (tags.includes("beginner")) keys.add("relaxedPlay");

  return Array.from(keys);
}

export function filterGolfCoursesByExperienceTag(courses: GolfListing[], tag: GolfExperienceTag) {
  return courses.filter((course) => courseMatchesExperienceTag(course, tag));
}

export function sortGolfDiscoveryCourses(courses: GolfListing[]) {
  const tierWeight = (tier: string | null | undefined) => {
    if (tier === "signature") return 0;
    if (tier === "verified") return 1;
    return 2;
  };

  return [...courses].sort((a, b) => {
    const tierDiff = tierWeight(a.tier) - tierWeight(b.tier);
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });
}
