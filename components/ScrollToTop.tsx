import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname() ?? "";
  const isPopNavigationRef = useRef(false);

  useEffect(() => {
    const markPopNavigation = () => {
      isPopNavigationRef.current = true;
    };

    window.addEventListener("popstate", markPopNavigation);
    return () => {
      window.removeEventListener("popstate", markPopNavigation);
    };
  }, []);

  useEffect(() => {
    // Preserve browser back/forward scroll restoration.
    if (isPopNavigationRef.current) {
      isPopNavigationRef.current = false;
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
