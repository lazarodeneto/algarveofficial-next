export type GolfTeeColor = "white" | "yellow" | "red";

export function isGolfTeeColor(value: unknown): value is GolfTeeColor {
  return value === "white" || value === "yellow" || value === "red";
}

export interface GolfRoundCourseRef {
  id: string;
  slug: string;
  name: string;
}

export interface GolfHoleDefinition {
  holeNumber: number;
  par: number;
  strokeIndex: number | null;
  distanceWhite: number | null;
  distanceYellow: number | null;
  distanceRed: number | null;
}

export interface GolfRoundHole extends GolfHoleDefinition {
  strokes: number | null;
}

export interface GolfRound {
  id: string;
  userId: string;
  listingId: string;
  teeColor: GolfTeeColor;
  totalScore: number | null;
  totalVsPar: number | null;
  startedAt: string;
  finishedAt: string | null;
  course: GolfRoundCourseRef;
  holes: GolfRoundHole[];
  enteredHoles: number;
}

export function formatVsParLabel(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "E";
  if (value > 0) return `+${value}`;
  return `${value}`;
}
