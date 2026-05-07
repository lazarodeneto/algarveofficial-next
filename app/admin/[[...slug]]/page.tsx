import { AdminDashboardPage } from "@/components/routes/AdminDashboardPage";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { guardDashboardRoute } from "@/lib/server/dashboard-access";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const route = Array.isArray(slug) ? slug.join("/") : slug ?? "";

  await guardDashboardRoute({
    locale: DEFAULT_LOCALE,
    slug,
    basePath: "/admin",
    allowedRoles: ["admin", "editor"],
  });

  return <AdminDashboardPage route={route} />;
}
