import { redirect } from "next/navigation";

export default function RealEstatePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/real-estate`);
}