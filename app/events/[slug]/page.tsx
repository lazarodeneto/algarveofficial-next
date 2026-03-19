import { notFound } from "next/navigation";

import { EventDetailPageClient } from "./EventDetailPageClient";
import { getPublishedEventBySlug } from "./eventData";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailPageClient />;
}
