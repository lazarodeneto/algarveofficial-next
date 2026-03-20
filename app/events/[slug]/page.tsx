import { redirect } from "next/navigation";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/en/events/${slug}`);
}
