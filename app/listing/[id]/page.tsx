import { redirectToPreferredLocalePath } from "@/lib/i18n/serverRedirect";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LegacyListingPage({ params }: Props) {
  const { id } = await params;
  await redirectToPreferredLocalePath(`/listing/${id}`);
}
