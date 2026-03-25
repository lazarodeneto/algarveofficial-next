import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export default async function OwnerPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug?.length ? `/${slug.join("/")}` : "";
  redirect(`/${DEFAULT_LOCALE}/owner${path}`);
}
