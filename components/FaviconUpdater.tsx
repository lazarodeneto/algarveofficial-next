import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * FaviconUpdater component that listens to site settings
 * and dynamically updates the browser's favicon.
 */
export function FaviconUpdater() {
    useSiteSettings();

    useEffect(() => {
        const faviconUrl = "/algarveofficial-icon-gold.png";
        const appleTouchIconUrl = "/icons/apple-touch-icon.png";

        const upsertLink = (selector: string, rel: string, href: string, type?: string, sizes?: string) => {
            let link = document.querySelector<HTMLLinkElement>(selector);

            if (!link) {
                link = document.createElement("link");
                link.rel = rel;
                document.head.appendChild(link);
            }

            link.href = href;
            if (type) link.type = type;
            if (sizes) {
                link.sizes.value = sizes;
            } else {
                link.removeAttribute("sizes");
            }
        };

        upsertLink("link[rel='shortcut icon']", "shortcut icon", faviconUrl, "image/png", "128x128");
        upsertLink("link[rel='icon']", "icon", faviconUrl, "image/png", "128x128");
        upsertLink("link[rel='apple-touch-icon']", "apple-touch-icon", appleTouchIconUrl, "image/png", "180x180");
    }, []);

    return null;
}
