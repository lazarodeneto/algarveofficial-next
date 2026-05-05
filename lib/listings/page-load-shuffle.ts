type RandomSource = () => number;

function randomIndex(maxExclusive: number, random: RandomSource) {
  return Math.floor(random() * maxExclusive);
}

function getItemKeys<T>(items: readonly T[], getId: (item: T) => string) {
  return items.map((item) => getId(item));
}

function countPositionMatches<T>(
  items: readonly T[],
  previousIds: readonly string[],
  getId: (item: T) => string,
) {
  return items.reduce(
    (count, item, index) => count + (previousIds[index] === getId(item) ? 1 : 0),
    0,
  );
}

function hasNoPositionMatches<T>(
  items: readonly T[],
  previousIds: readonly string[],
  getId: (item: T) => string,
) {
  return countPositionMatches(items, previousIds, getId) === 0;
}

function fisherYates<T>(items: readonly T[], random: RandomSource) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, random);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function rotate<T>(items: readonly T[], offset: number) {
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function buildShiftedPreviousOrder<T>(
  items: readonly T[],
  previousIds: readonly string[],
  getId: (item: T) => string,
  random: RandomSource,
) {
  const itemById = new Map(items.map((item) => [getId(item), item]));
  const currentIds = new Set(getItemKeys(items, getId));
  const previousHasSameItems =
    previousIds.length === items.length &&
    previousIds.every((id) => currentIds.has(id));

  if (!previousHasSameItems) return null;

  const offset = 1 + randomIndex(items.length - 1, random);
  const shiftedIds = rotate(previousIds, offset);
  const shiftedItems = shiftedIds
    .map((id) => itemById.get(id))
    .filter((item): item is T => Boolean(item));

  return shiftedItems.length === items.length ? shiftedItems : null;
}

function repairPositionMatches<T>(
  items: readonly T[],
  previousIds: readonly string[],
  getId: (item: T) => string,
) {
  const next = [...items];

  for (let index = 0; index < next.length; index += 1) {
    if (previousIds[index] !== getId(next[index])) continue;

    const swapIndex = next.findIndex((candidate, candidateIndex) => {
      if (candidateIndex === index) return false;

      const currentItemCanMove =
        previousIds[candidateIndex] !== getId(next[index]);
      const candidateCanMove =
        previousIds[index] !== getId(candidate);

      return currentItemCanMove && candidateCanMove;
    });

    if (swapIndex !== -1) {
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
  }

  return next;
}

export function shuffleItemsForPageLoad<T>(
  items: readonly T[],
  getId: (item: T) => string,
  previousIds?: readonly string[] | null,
  random: RandomSource = Math.random,
) {
  if (items.length <= 1) return [...items];

  const fallbackReferenceIds = getItemKeys(items, getId);
  const referenceIds =
    previousIds && previousIds.length > 0
      ? previousIds
      : fallbackReferenceIds;
  let best = fisherYates(items, random);
  let bestMatchCount = countPositionMatches(best, referenceIds, getId);

  if (bestMatchCount === 0) return best;

  const shiftedPreviousOrder = buildShiftedPreviousOrder(
    items,
    referenceIds,
    getId,
    random,
  );

  if (
    shiftedPreviousOrder &&
    hasNoPositionMatches(shiftedPreviousOrder, referenceIds, getId)
  ) {
    return shiftedPreviousOrder;
  }

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = fisherYates(items, random);
    const matchCount = countPositionMatches(candidate, referenceIds, getId);

    if (matchCount === 0) return candidate;
    if (matchCount < bestMatchCount) {
      best = candidate;
      bestMatchCount = matchCount;
    }
  }

  const repaired = repairPositionMatches(best, referenceIds, getId);
  if (hasNoPositionMatches(repaired, referenceIds, getId)) {
    return repaired;
  }

  for (let offset = 1; offset < items.length; offset += 1) {
    const rotated = rotate(best, offset);

    if (hasNoPositionMatches(rotated, referenceIds, getId)) {
      return rotated;
    }
  }

  return best;
}
