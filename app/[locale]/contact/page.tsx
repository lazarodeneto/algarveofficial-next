import { redirect } from "next/navigation";

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/contact`);
}