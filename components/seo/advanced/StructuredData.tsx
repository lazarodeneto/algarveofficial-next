"use client";

import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
  id?: string;
}

export function StructuredData({ data, id }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = id || `sd-${Math.random().toString(36).substr(2, 9)}`;
    const existing = document.getElementById(scriptId);

    if (existing && existing.getAttribute("data-algarveofficial-structured-data") !== "true") {
      return () => {};
    }

    if (existing?.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.setAttribute("data-algarveofficial-structured-data", "true");
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [data, id]);

  return null;
}

interface BreadcrumbStructuredDataProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <StructuredData data={data} id="breadcrumb-schema" />;
}
