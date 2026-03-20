import { redirect } from "next/navigation";

export default function PrivacyPolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/privacy-policy`);
}