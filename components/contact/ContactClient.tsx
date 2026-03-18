"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { NavigationType, Router, createPath, type To } from "react-router";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";

import ContactPage from "@/pages/public/Contact";
import type { ContactSettings } from "@/hooks/useContactSettings";

type LegacyNavigator = {
  createHref: (to: To) => string;
  go: (delta: number) => void;
  push: (to: To) => void;
  replace: (to: To) => void;
};

export interface ContactClientProps {
  initialContactSettings: ContactSettings | null;
}

function resolveToPath(to: To) {
  return typeof to === "string" ? to : createPath(to);
}

export default function ContactClient({
  initialContactSettings,
}: ContactClientProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const search = nextSearchParams.toString();

  const location = useMemo(
    () => ({
      pathname,
      search: search ? `?${search}` : "",
      hash: "",
      state: null,
      key: `${pathname}${search ? `?${search}` : ""}`,
    }),
    [pathname, search],
  );

  const navigator = useMemo<LegacyNavigator>(
    () => ({
      createHref: (to) => resolveToPath(to),
      go: (delta) => {
        window.history.go(delta);
      },
      push: (to) => {
        router.push(resolveToPath(to));
      },
      replace: (to) => {
        router.replace(resolveToPath(to));
      },
    }),
    [router],
  );

  useEffect(() => {
    queryClient.setQueryData(["contact-settings"], initialContactSettings);
    const serverShell = document.getElementById("contact-server-shell");
    if (serverShell) {
      serverShell.style.display = "none";
    }
    setMounted(true);
  }, [initialContactSettings, queryClient]);

  if (!mounted) {
    return null;
  }

  return (
    <HelmetProvider>
      <Router
        location={location as never}
        navigator={navigator as never}
        navigationType={NavigationType.Pop}
      >
        <ContactPage />
      </Router>
    </HelmetProvider>
  );
}
