import { redirect } from "next/navigation";

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/live");
}