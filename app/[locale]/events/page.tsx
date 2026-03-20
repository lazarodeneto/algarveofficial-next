import { redirect } from "next/navigation";

export default function EventsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/events`);
}