import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/**
 * FaviconUpdater component that listens to site settings
 * and dynamically updates the browser's favicon.
 */
export function FaviconUpdater() {
    const { settings } = useSiteSettings();
    const faviconUrl = settings?.favicon_url;

    useEffect(() => {
        if (!faviconUrl) return;

        // Support both .svg and modern icon formats
        const isSvg = faviconUrl.toLowerCase().endsWith(".svg");

        // Find or create favicon links
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");

        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(link);
        }

        link.type = isSvg ? "image/svg+xml" : "image/x-icon";
        link.href = faviconUrl;

        // Handle SVG specific link if it exists in index.html
        const svgLink: HTMLLinkElement | null = document.querySelector("link[type='image/svg+xml']");
        if (svgLink && isSvg) {
            svgLink.href = faviconUrl;
        } else if (svgLink && !isSvg) {
            // If we have an .ico but index.html has an .svg link, we might want to disable the svg one
            // or just let the generic 'icon' link take precedence.
            // For best compatibility, we update the main one.
        }

    }, [faviconUrl]);

    return null;
}
