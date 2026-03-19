import { redirect } from "next/navigation";

interface LegacyRealEstateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyRealEstateDetailPage({
  params,
}: LegacyRealEstateDetailPageProps) {
  const { slug } = await params;
  redirect(`/listing/${slug}`);
}
