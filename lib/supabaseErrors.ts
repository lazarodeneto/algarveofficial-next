type LooseSupabaseError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  status?: number | null;
};

export function isMissingSupabaseRelation(error: unknown, relationName?: string): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as LooseSupabaseError;
  const haystack = [
    candidate.code,
    candidate.message,
    candidate.details,
    candidate.hint,
    candidate.status?.toString(),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const relationToken = relationName?.toLowerCase();
  const mentionsRelation = relationToken ? haystack.includes(relationToken) : true;

  return (
    candidate.code === "42P01"
    || candidate.code === "PGRST205"
    || (
      mentionsRelation
      && (
        haystack.includes("does not exist")
        || haystack.includes("schema cache")
        || haystack.includes("could not find the table")
        || haystack.includes("relation")
        || haystack.includes("not found")
      )
    )
  );
}
