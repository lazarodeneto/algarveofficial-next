import { redirect } from "next/navigation";

export default function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/${locale}/blog`);
}