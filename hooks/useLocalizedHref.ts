"use client";

import { usePathname } from "next/navigation";
import { localizeHref } from "@/lib/navigation/localizeHref";

export function useLocalizedHref() {
  const pathname = usePathname() || "/";

  return (href: string) => localizeHref(pathname, href);
}
