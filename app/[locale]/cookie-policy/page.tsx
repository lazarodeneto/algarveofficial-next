import { redirect } from "next/navigation";

export default function CookiePolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/cookie-policy`);
}