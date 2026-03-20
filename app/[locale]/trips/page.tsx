import { redirect } from "next/navigation";

export default function TripsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/trips`);
}