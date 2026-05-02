import { AdminDashboardPage } from "@/components/routes/AdminDashboardPage";
import { guardDashboardRoute } from "@/lib/server/dashboard-access";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminGolfTeeTimeRequestsPage({ params }: PageProps) {
  const { locale } = await params;
  await guardDashboardRoute({
    locale,
    basePath: "/admin",
    slug: ["golf", "tee-time-requests"],
    allowedRoles: ["admin", "editor"],
  });

  return <AdminDashboardPage route="golf/tee-time-requests" />;
}
