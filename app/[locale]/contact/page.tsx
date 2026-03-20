import { redirect } from "next/navigation";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  redirect("/contact");
}