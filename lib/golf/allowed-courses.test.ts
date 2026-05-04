import { describe, expect, it } from "vitest";

import {
  approvedGolfCourses,
  approvedGolfCourseSlugs,
  isApprovedGolfCourse,
} from "@/lib/golf/allowed-courses";

const EXPECTED_APPROVED_SLUGS = [
  "espiche-golf",
  "boavista-golf-spa-resort",
  "palmares-ocean-living-golf",
  "alto-golf-course",
  "morgado-golf-course",
  "alamos-golf-course",
  "gramacho-golf-course",
  "vale-da-pinta-golf-course",
  "amendoeira-oconnor-jnr",
  "amendoeira-faldo-course",
  "silves-golf-course",
  "salgados-golf-course",
  "pine-cliffs-golf-course",
  "laguna-golf-course",
  "millennium-golf-course",
  "pinhal-golf-course",
  "old-course-vilamoura",
  "the-els-club-vilamoura",
  "vila-sol-golf-course",
  "vale-de-lobo-golf-club",
  "san-lorenzo-golf-course",
  "quinta-do-lago-ns",
  "quinta-do-lago-south-course",
  "quinta-do-lago-laranjal-course",
  "ombria-golf-course",
  "benamor-golf",
  "quinta-da-ria-golf-course",
  "monte-rei-golf-country-club",
  "quinta-do-vale-golf-course",
];

describe("approved Algarve golf course allowlist", () => {
  it("contains exactly the 29 approved course slugs", () => {
    expect(approvedGolfCourseSlugs).toHaveLength(29);
    expect(new Set(approvedGolfCourseSlugs).size).toBe(29);
    expect(approvedGolfCourseSlugs).toEqual(EXPECTED_APPROVED_SLUGS);
  });

  it("approves every canonical course by slug and name", () => {
    for (const course of approvedGolfCourses) {
      expect(isApprovedGolfCourse({ slug: course.canonicalSlug, name: "Wrong name" })).toBe(true);
      expect(isApprovedGolfCourse({ slug: "wrong-slug", name: course.canonicalName })).toBe(true);
    }
  });

  it("approves only explicit safe aliases and punctuation variants", () => {
    expect(isApprovedGolfCourse({ name: "Álamos Golf Course" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Amendoeira O’Connor Jnr." })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Amendoeira OConnor Jnr" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Quinta do Lago North & South" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Quinta do Lago North Course" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "The Old Course Vilamoura" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Dom Pedro Laguna" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Dom Pedro Millennium" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Dom Pedro Pinhal" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Vale do Lobo Golf Club" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Benamor Golf Course" })).toBe(true);
    expect(isApprovedGolfCourse({ name: "Palmares Golf" })).toBe(true);
  });

  it("rejects unrelated golf listings without broad fuzzy matching", () => {
    expect(isApprovedGolfCourse({ slug: "random-golf-academy", name: "Random Golf Academy" })).toBe(false);
    expect(isApprovedGolfCourse({ slug: "vilamoura-golf-shop", name: "Vilamoura Golf Shop" })).toBe(false);
    expect(isApprovedGolfCourse({ slug: "quinta-do-lago-driving-range", name: "Quinta do Lago Driving Range" })).toBe(false);
    expect(isApprovedGolfCourse({ slug: "monte-gordo-golf-hotel", name: "Monte Gordo Golf Hotel" })).toBe(false);
  });
});
