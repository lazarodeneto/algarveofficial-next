import { redirect } from "next/navigation";

export default function DestinationsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/destinations`);
}