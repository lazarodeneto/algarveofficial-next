import { revalidatePath, revalidateTag } from "next/cache";

import {
  addLocaleToPathname,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";

function reportRevalidationFailure(target: string, error: unknown) {
  if (process.env.NODE_ENV === "test") return;
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[homepage-revalidate] Failed to revalidate ${target}: ${message}`);
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch (error) {
    reportRevalidationFailure(path, error);
  }
}

function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag, "max");
  } catch (error) {
    reportRevalidationFailure(`tag ${tag}`, error);
  }
}

export function revalidateHomepageRoutes() {
  const paths = new Set<string>(["/"]);

  SUPPORTED_LOCALES.forEach((locale) => {
    paths.add(addLocaleToPathname("/", locale as Locale));
  });

  paths.forEach((path) => safeRevalidatePath(path));
  safeRevalidateTag("cms:home");
}
