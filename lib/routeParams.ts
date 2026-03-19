export type RouteParams = Record<string, string | string[] | undefined>;

export function extractIdParam(params: RouteParams): string | undefined {
  const directId = params.id;
  if (typeof directId === "string") {
    return directId;
  }
  if (Array.isArray(directId)) {
    return directId[0];
  }

  const slugSegments = params.slug;
  if (Array.isArray(slugSegments) && slugSegments.length >= 3 && slugSegments[slugSegments.length - 1] === "edit") {
    return slugSegments[slugSegments.length - 2];
  }

  return undefined;
}
