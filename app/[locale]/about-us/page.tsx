import { redirect } from "next/navigation";

export default function AboutUsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/about-us`);
}