import { redirect } from "next/navigation";

export default async function AboutUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/about-us");
}