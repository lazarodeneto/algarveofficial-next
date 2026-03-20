import { redirect } from "next/navigation";

export default function MapPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/map`);
}