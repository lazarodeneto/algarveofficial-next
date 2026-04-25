import { sortListings, type RankingInput } from "./ranking";

export function applyRanking<T extends RankingInput>(listings: T[]): T[] {
  return sortListings(listings);
}