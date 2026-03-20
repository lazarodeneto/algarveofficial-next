import { redirect } from "next/navigation";

export default function PartnerPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/partner`);
}