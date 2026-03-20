import { redirect } from "next/navigation";

export default async function OwnerPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { locale, slug } = await params;
  const path = slug ? slug.join("/") : "";
  redirect(`/owner${path ? `/${path}` : ""}`);
}