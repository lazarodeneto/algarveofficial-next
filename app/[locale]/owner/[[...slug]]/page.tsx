import { OwnerDashboardPage } from "@/components/routes/OwnerDashboardPage";

interface LocaleOwnerPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function LocaleOwnerPage({ params }: LocaleOwnerPageProps) {
  const { slug } = await params;
  const route = Array.isArray(slug) ? slug.join("/") : slug ?? "";

  return <OwnerDashboardPage route={route} />;
}
