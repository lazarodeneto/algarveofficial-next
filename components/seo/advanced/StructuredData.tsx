"use client";

import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
  id?: string;
}

export function StructuredData({ data, id }: StructuredDataProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id || `sd-${Math.random().toString(36).substr(2, 9)}`;
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById(script.id);
      if (existing) {
        document.head.removeChild(existing);
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
