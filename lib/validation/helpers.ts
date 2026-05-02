import { z } from "zod";

export const optionalNullableNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;

    return value;
  }

  return value;
}, z.number().finite().nullable().optional());
