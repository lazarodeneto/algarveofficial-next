import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await redirectToPreferredLocalePath(`/events/${slug}`);
}
