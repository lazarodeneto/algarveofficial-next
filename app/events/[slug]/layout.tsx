import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { normalizePublicImageUrl } from "@/lib/imageUrls";
import { buildMetadata } from "@/lib/metadata";
import { getPublishedEventBySlug } from "./eventData";

interface EventDetailLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const title = event.meta_title?.trim() || event.title;
  const description =
    event.meta_description?.trim() ||
    event.short_description ||
    "View event details, schedule, location, and ticket information for AlgarveOfficial featured events.";

  return buildMetadata({
    title,
    description,
    path: `/events/${slug}`,
    image: normalizePublicImageUrl(event.image) || "/og-image.png",
    type: "article",
    publishedTime: event.created_at,
    modifiedTime: event.updated_at,
    section: "Events",
  });
}

export default function EventDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
