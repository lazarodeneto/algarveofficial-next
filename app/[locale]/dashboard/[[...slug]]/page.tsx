import { UserDashboardPage } from "@/components/routes/UserDashboardPage";

interface LocaleDashboardPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function LocaleDashboardPage({ params }: LocaleDashboardPageProps) {
  const { slug } = await params;
  const route = Array.isArray(slug) ? slug.join("/") : slug ?? "";

  return <UserDashboardPage route={route} />;
}
