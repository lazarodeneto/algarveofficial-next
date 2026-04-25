const TIER_SCORE: Record<string, number> = {
  signature: 1000,
  verified: 100,
  unverified: 10,
};

export interface RankingInput {
  tier?: string | null;
  created_at: string;
  featured_rank?: number | null;
}

export function getListingScore(listing: RankingInput): number {
  const tier = listing.tier ?? "unverified";
  return TIER_SCORE[tier] ?? 10;
}

export function sortListings<T extends RankingInput>(listings: T[]): T[] {
  return [...listings].sort((a, b) => {
    const aRank = a.featured_rank ?? 999;
    const bRank = b.featured_rank ?? 999;

    if (aRank !== bRank) return aRank - bRank;

    return getListingScore(b) - getListingScore(a);
  });
}