"use client";

import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

const LANG_PREFIXES = SUPPORTED_LOCALES.map((l) => `/${l}`);

export function useLangPrefix(): string {
  const pathname = usePathname() ?? "";

  if (!pathname) return "";

  for (const prefix of LANG_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return prefix;
    }
  }

  return "";
}

export function buildLangPath(prefix: string, path: string): string {
  if (!prefix) return path;
  if (path === "/") return prefix;
  return `${prefix}${path}`;
}
