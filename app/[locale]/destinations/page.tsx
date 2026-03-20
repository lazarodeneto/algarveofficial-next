import { redirect } from "next/navigation";

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/destinations`);
}