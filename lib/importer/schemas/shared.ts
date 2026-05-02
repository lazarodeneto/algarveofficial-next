import { z } from "zod";

export const requiredPositiveInt = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.number().int().positive());

export const optionalNullableNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}, z.number().finite().nullable().optional());

export const optionalNullableString = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return value;
}, z.string().nullable().optional());

export const optionalNullableBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "") return null;
    if (["true", "yes", "y", "1", "sim"].includes(normalized)) return true;
    if (["false", "no", "n", "0", "nao", "não"].includes(normalized)) return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return value;
}, z.boolean().nullable().optional());

export const stringArrayClean = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return [];
  if (!Array.isArray(value)) return value;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : item))
    .filter((item) => typeof item === "string" && item.length > 0);
}, z.array(z.string()));

export function flattenZodErrors(error: z.ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
