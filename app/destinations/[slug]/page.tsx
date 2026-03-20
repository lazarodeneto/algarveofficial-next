import { redirect } from "next/navigation";

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/en/destinations/${slug}`);
}
