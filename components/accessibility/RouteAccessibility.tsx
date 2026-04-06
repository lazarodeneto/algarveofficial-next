import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

const MAIN_CONTENT_ID = "main-content";
const ANNOUNCE_DELAY_MS = 160;
const FOCUS_RETRY_DELAY_MS = 80;
const MAX_FOCUS_ATTEMPTS = 12;

function getVisibleMain(): HTMLElement | null {
  const mains = Array.from(document.querySelectorAll<HTMLElement>("main"));

  return (
    mains.find((main) => {
      if (main.hidden) return false;
      if (main.getAttribute("aria-hidden") === "true") return false;
      return true;
    }) ?? null
  );
}

function getRouteFocusTarget(main: HTMLElement): HTMLElement {
  return (
    main.querySelector<HTMLElement>("[data-route-focus-target]") ??
    main.querySelector<HTMLElement>("h1") ??
    main.querySelector<HTMLElement>('[role="heading"][aria-level="1"]') ??
    main
  );
}

function ensureFocusable(target: HTMLElement) {
  if (target.matches("a,button,input,select,textarea,summary,[tabindex]")) return;
  target.setAttribute("tabindex", "-1");
}

function ensureMainTarget(): HTMLElement | null {
  const main = getVisibleMain();
  if (!main) return null;

  document.querySelectorAll<HTMLElement>(`#${MAIN_CONTENT_ID}`).forEach((element) => {
    if (element !== main) {
      element.removeAttribute("id");
    }
  });

  if (main.id !== MAIN_CONTENT_ID) {
    main.id = MAIN_CONTENT_ID;
  }

  return main;
}

function focusRouteContent(preventScroll: boolean) {
  const main = ensureMainTarget();
  if (!main) return false;

  const target = getRouteFocusTarget(main);
  ensureFocusable(target);
  target.focus({ preventScroll });

  return document.activeElement === target;
}

export function RouteAccessibility() {
  const pathname = usePathname() ?? "";
  const nextSearchParams = useSearchParams();
  const searchValue = nextSearchParams?.toString() ?? "";
  const search = searchValue ? `?${searchValue}` : "";
  const [hash, setHash] = useState("");
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState("");
  const initialRouteRef = useRef(true);

  useEffect(() => {
    const syncHash = () => {
      setHash(window.location.hash || "");
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  useEffect(() => {
    ensureMainTarget();
  }, [hash, pathname, search]);

  useEffect(() => {
    if (initialRouteRef.current) {
      initialRouteRef.current = false;
      return;
    }

    const activeHash = hash || (typeof window !== "undefined" ? window.location.hash : "");
    if (activeHash) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    let frameOne = 0;
    let frameTwo = 0;
    let attempts = 0;

    const tryFocus = () => {
      if (cancelled) return;

      if (focusRouteContent(true)) return;

      if (attempts >= MAX_FOCUS_ATTEMPTS) return;
      attempts += 1;
      timeoutId = window.setTimeout(tryFocus, FOCUS_RETRY_DELAY_MS);
    };

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(tryFocus);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [hash, pathname, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const title = document.title?.trim();
      if (!title) return;

      const nextAnnouncement = t("accessibility.routeChanged", {
          title,
          defaultValue: `Navigated to ${title}`,
        });

      setAnnouncement((previous) => (
        previous === nextAnnouncement ? `${nextAnnouncement}\u00A0` : nextAnnouncement
      ));
    }, ANNOUNCE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, search, t]);

  return (
    <>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        onClick={(event) => {
          event.preventDefault();
          focusRouteContent(false);
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[250] focus:rounded-full focus:border focus:border-primary/30 focus:bg-background focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {t("accessibility.skipToContent", "Skip to main content")}
      </a>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </>
  );
}
