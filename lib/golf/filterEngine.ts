import type { GolfListing } from "@/lib/golf";
import { inferGolfExperienceTags } from "@/lib/golf/experienceTags";

export interface GolfFilterCriteria {
  difficulty?: "low" | "medium" | "high";
  holes?: number;
  region?: string;
  tags?: string[];
}

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[_\s]+/g, "-") ?? "";
}

function matchesText(value: string | null | undefined, expected: string | null | undefined) {
  const normalizedValue = normalize(value);
  const normalizedExpected = normalize(expected);
  if (!normalizedValue || !normalizedExpected) return false;
  return normalizedValue === normalizedExpected || normalizedValue.includes(normalizedExpected);
}

function scoreCourse(course: GolfListing, criteria: GolfFilterCriteria) {
  let score = 0;
  const details = course.details;

  if (criteria.holes) {
    if (details?.holes === criteria.holes) {
      score += 3;
    }
  }

  if (criteria.difficulty) {
    const difficulty = normalize(details?.difficulty);
    if (difficulty === criteria.difficulty) {
      score += 3;
    } else if (
      (criteria.difficulty === "high" && difficulty.includes("championship")) ||
      (criteria.difficulty === "low" && difficulty.includes("easy"))
    ) {
      score += 2;
    }
  }

  if (criteria.region) {
    if (matchesText(course.region?.slug, criteria.region) || matchesText(course.region?.name, criteria.region)) {
      score += 2;
    }
  }

  if (criteria.tags && criteria.tags.length > 0) {
    const courseTags = inferGolfExperienceTags(course);
    for (const tag of criteria.tags) {
      if (courseTags.includes(normalize(tag) as never)) {
        score += 2;
      }
    }
  }

  if (course.tier === "signature") {
    score += 5;
  } else if (course.tier === "verified") {
    score += 2;
  }

  return score;
}

function hasCriteria(criteria: GolfFilterCriteria) {
  return Boolean(criteria.difficulty || criteria.holes || criteria.region || (criteria.tags && criteria.tags.length > 0));
}

export function rankGolfCourses(listings: GolfListing[], criteria: GolfFilterCriteria) {
  if (!hasCriteria(criteria)) return listings;

  return listings
    .map((listing, index) => ({
      listing,
      index,
      score: scoreCourse(listing, criteria),
    }))
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      return a.index - b.index;
    })
    .map(({ listing }) => listing);
}

export function filterGolfCourses(listings: GolfListing[], criteria: GolfFilterCriteria) {
  return rankGolfCourses(listings, criteria);
}
