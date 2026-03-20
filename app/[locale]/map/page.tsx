import { redirect } from "next/navigation";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/map");
}