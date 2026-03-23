import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LegacyListingPage({ params }: Props) {
  const { id } = await params;
  redirect(`/${DEFAULT_LOCALE}/listing/${id}`);
}
