import { useEffect } from "react";
import { useLocation, useNavigationType } from "@/components/router/nextRouterCompat";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Preserve browser back/forward scroll restoration.
    if (navigationType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, navigationType]);

  return null;
}
