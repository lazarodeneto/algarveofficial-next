import { guardDashboardRoute } from "@/lib/server/dashboard-access";

interface LocaleOwnerPageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export default async function LocaleOwnerPage({ params }: LocaleOwnerPageProps) {
  const { locale, slug } = await params;
  const route = Array.isArray(slug) ? slug.join("/") : slug ?? "";

  await guardDashboardRoute({
    locale,
    slug,
    basePath: "/owner",
    allowedRoles: ["owner", "admin"],
  });

  const { OwnerDashboardPage } = await import("@/components/routes/OwnerDashboardPage");

  return <OwnerDashboardPage route={route} />;
}
