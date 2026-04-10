import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { buildMetadata } from "@/lib/metadata";
import { getPublishedEventBySlug } from "./eventData";

interface EventDetailLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: EventDetailLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return buildMetadata({
    title: "Redirecting to Event",
    description: "Redirecting to the canonical localized event page.",
    path: `/events/${event.slug}`,
    image: normalizePublicImageUrl(event.image) || "/og-image.png",
    type: "article",
    noIndex: true,
    noFollow: true,
    localeCode: DEFAULT_LOCALE,
    publishedTime: event.created_at,
    modifiedTime: event.updated_at,
    section: "Events",
  });
}

export default function EventDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
