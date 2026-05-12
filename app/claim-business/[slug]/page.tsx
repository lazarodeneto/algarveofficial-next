import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

interface RootClaimBusinessSlugPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RootClaimBusinessSlugPage({ params }: RootClaimBusinessSlugPageProps) {
  const { slug } = await params;
  await redirectToPreferredLocalePath(`/claim-business/${slug}`);
}
