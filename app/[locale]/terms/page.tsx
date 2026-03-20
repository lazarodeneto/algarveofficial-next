import { redirect } from "next/navigation";

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/terms`);
}