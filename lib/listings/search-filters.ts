const SEARCHABLE_LISTING_COLUMNS = [
  "name",
  "short_description",
  "description",
  "address",
  "website_url",
] as const;

export function sanitizeListingSearchTerm(raw: string | null | undefined): string {
  return String(raw ?? "")
    .replace(/[,%(){}'"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeListingSearchTerm(raw: string | null | undefined): string[] {
  const term = sanitizeListingSearchTerm(raw);
  if (!term) return [];

  return term
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}_-]/gu, ""))
    .filter((token) => token.length >= 2)
    .slice(0, 6);
}

function buildColumnClauses(term: string): string[] {
  return SEARCHABLE_LISTING_COLUMNS.map((column) => `${column}.ilike.%${term}%`);
}

function buildTagClause(token: string): string | null {
  return /^[\p{L}\p{N}_-]+$/u.test(token) ? `tags.cs.{${token}}` : null;
}

export function buildListingSearchOrGroups(
  rawSearch: string | null | undefined,
  matchingCategoryIds: string[] = [],
): string[] {
  const term = sanitizeListingSearchTerm(rawSearch);
  if (!term) return [];

  const tokens = tokenizeListingSearchTerm(term);

  if (tokens.length <= 1) {
    const token = tokens[0] ?? term;
    const clauses = buildColumnClauses(term);
    const tagClause = buildTagClause(token);

    if (tagClause) {
      clauses.push(tagClause);
    }

    if (matchingCategoryIds.length > 0) {
      clauses.push(`category_id.in.(${matchingCategoryIds.join(",")})`);
    }

    return [clauses.join(",")];
  }

  // Multi-word searches should narrow results by requiring every meaningful token.
  // Each OR group is appended separately by the Supabase query builder, which makes
  // the groups combine with AND semantics at the PostgREST layer.
  return tokens.map((token) => {
    const clauses = buildColumnClauses(token);
    const tagClause = buildTagClause(token);

    if (tagClause) {
      clauses.push(tagClause);
    }

    return clauses.join(",");
  });
}
