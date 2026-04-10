import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

interface LegacyRealEstateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyRealEstateDetailPage({
  params,
}: LegacyRealEstateDetailPageProps) {
  const { slug } = await params;
  await redirectToPreferredLocalePath(`/listing/${slug}`);
}
