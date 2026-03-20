import { redirect } from "next/navigation";

export default function LoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/login`);
}