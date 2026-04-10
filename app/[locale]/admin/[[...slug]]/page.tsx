import { AdminDashboardPage } from "@/components/routes/AdminDashboardPage";

interface LocaleAdminPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function LocaleAdminPage({ params }: LocaleAdminPageProps) {
  const { slug } = await params;
  const route = Array.isArray(slug) ? slug.join("/") : slug ?? "";

  return <AdminDashboardPage route={route} />;
}
