"use client";

import type { ComponentType, ReactElement } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { DashboardRouteLoading } from "@/components/routes/DashboardRouteLoading";
import { Button } from "@/components/ui/button";
import AdminPagesDeprecated from "@/legacy-pages/admin/cms/AdminPagesDeprecated";

const withAdminLoading = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
) =>
  dynamic(loader, {
    loading: () => <DashboardRouteLoading label="Loading admin workspace..." />,
  });

const AdminAnalytics = withAdminLoading(() => import("@/legacy-pages/admin/AdminAnalytics"));
const AdminCategories = withAdminLoading(() => import("@/legacy-pages/admin/AdminCategories"));
const AdminCities = withAdminLoading(() => import("@/legacy-pages/admin/AdminCities"));
const AdminClaims = withAdminLoading(() => import("@/legacy-pages/admin/AdminClaims"));
const AdminCurated = withAdminLoading(() => import("@/legacy-pages/admin/AdminCurated"));
const AdminImport = withAdminLoading(() => import("@/legacy-pages/admin/AdminImport"));
const AdminListings = withAdminLoading(() => import("@/legacy-pages/admin/AdminListings"));
const AdminMessages = withAdminLoading(() => import("@/legacy-pages/admin/AdminMessages"));
const AdminModeration = withAdminLoading(() => import("@/legacy-pages/admin/AdminModeration"));
const AdminOverview = withAdminLoading(() => import("@/legacy-pages/admin/AdminOverview"));
const AdminOwnerCRM = withAdminLoading(() => import("@/legacy-pages/admin/AdminOwnerCRM"));
const AdminReviewModeration = withAdminLoading(
  () => import("@/legacy-pages/admin/AdminReviewModeration"),
);
const AdminSubscriptions = withAdminLoading(
  () => import("@/legacy-pages/admin/AdminSubscriptions"),
);
const AdminUsers = withAdminLoading(() => import("@/legacy-pages/admin/AdminUsers"));
const ListingForm = withAdminLoading(() => import("@/legacy-pages/admin/ListingForm"));
const AdminBlog = withAdminLoading(() => import("@/legacy-pages/admin/blog/AdminBlog"));
const AdminBlogComments = withAdminLoading(
  () => import("@/legacy-pages/admin/blog/AdminBlogComments"),
);
const AdminBlogForm = withAdminLoading(() => import("@/legacy-pages/admin/blog/AdminBlogForm"));
const AdminCmsCategories = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminCmsCategories"),
);
const AdminCmsCities = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminCmsCities"),
);
const AdminCmsRegions = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminCmsRegions"),
);
const AdminContactPage = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminContactPage"),
);
const AdminCookiePage = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminCookiePage"),
);
const AdminFooterMenu = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminFooterMenu"),
);
const AdminGlobalSettings = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminGlobalSettings"),
);
const AdminHeaderMenu = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminHeaderMenu"),
);
const AdminHomePage = withAdminLoading(() => import("@/legacy-pages/admin/cms/AdminHomePage"));
const AdminLeftMenu = withAdminLoading(() => import("@/legacy-pages/admin/cms/AdminLeftMenu"));
const AdminMediaLibrary = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminMediaLibrary"),
);
const AdminPageBuilder = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminPageBuilder"),
);
const AdminPartnerPage = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminPartnerPage"),
);
const AdminPrivacyPage = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminPrivacyPage"),
);
const AdminSupportPage = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminSupportPage"),
);
const AdminTermsPage = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminTermsPage"),
);
const AdminTranslations = withAdminLoading(
  () => import("@/legacy-pages/admin/cms/AdminTranslations"),
);
const EmailAutomations = withAdminLoading(
  () => import("@/legacy-pages/admin/email/EmailAutomations"),
);
const EmailCampaigns = withAdminLoading(
  () => import("@/legacy-pages/admin/email/EmailCampaigns"),
);
const EmailContacts = withAdminLoading(() => import("@/legacy-pages/admin/email/EmailContacts"));
const EmailMarketingOverview = withAdminLoading(
  () => import("@/legacy-pages/admin/email/EmailMarketingOverview"),
);
const EmailReports = withAdminLoading(() => import("@/legacy-pages/admin/email/EmailReports"));
const EmailSegments = withAdminLoading(() => import("@/legacy-pages/admin/email/EmailSegments"));
const EmailSettings = withAdminLoading(() => import("@/legacy-pages/admin/email/EmailSettings"));
const EmailTemplates = withAdminLoading(() => import("@/legacy-pages/admin/email/EmailTemplates"));
const AdminEventForm = withAdminLoading(
  () => import("@/legacy-pages/admin/events/AdminEventForm"),
);
const AdminEventModeration = withAdminLoading(
  () => import("@/legacy-pages/admin/events/AdminEventModeration"),
);
const AdminEvents = withAdminLoading(() => import("@/legacy-pages/admin/events/AdminEvents"));

function AdminRouteNotFound({ route }: { route: string }) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-6 py-10 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h1 className="text-2xl font-serif font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The admin route <code className="rounded bg-muted px-1.5 py-0.5">/admin/{route ?? ""}</code> is not configured.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <LocaleLink href="/admin">Back to Overview</LocaleLink>
        </Button>
        <Button variant="outline" asChild>
          <LocaleLink href="/admin/listings">Go to Listings</LocaleLink>
        </Button>
      </div>
    </div>
  );
}

const staticRouteMap: Record<string, ComponentType> = {
  "": AdminOverview,
  analytics: AdminAnalytics,
  listings: AdminListings,
  curated: AdminCurated,
  moderation: AdminModeration,
  reviews: AdminReviewModeration,
  cities: AdminCities,
  categories: AdminCategories,
  users: AdminUsers,
  messages: AdminMessages,
  crm: AdminOwnerCRM,
  settings: AdminGlobalSettings,
  subscriptions: AdminSubscriptions,
  claims: AdminClaims,
  import: AdminImport,
  "content/home": AdminHomePage,
  "content/partner": AdminPartnerPage,
  "content/support": AdminSupportPage,
  "content/contact": AdminContactPage,
  "content/events": AdminEvents,
  "content/events/moderation": AdminEventModeration,
  "content/terms": AdminTermsPage,
  "content/privacy": AdminPrivacyPage,
  "content/cookies": AdminCookiePage,
  "content/regions": AdminCmsRegions,
  "content/cities": AdminCmsCities,
  "content/categories": AdminCmsCategories,
  "content/header": AdminHeaderMenu,
  "content/left-menu": AdminLeftMenu,
  "content/footer": AdminFooterMenu,
  "content/media": AdminMediaLibrary,
  "content/page-builder": AdminPageBuilder,
  "content/translations": AdminTranslations,
  email: EmailMarketingOverview,
  "email/contacts": EmailContacts,
  "email/segments": EmailSegments,
  "email/campaigns": EmailCampaigns,
  "email/templates": EmailTemplates,
  "email/automations": EmailAutomations,
  "email/reports": EmailReports,
  "email/settings": EmailSettings,
  blog: AdminBlog,
  "blog/comments": AdminBlogComments,
  events: AdminEvents,
  "events/moderation": AdminEventModeration,
};

const staticRouteElements: Record<string, ReactElement> = {
  "content/pages": <AdminPagesDeprecated />,
};

function resolveAdminPage(route: string): ReactElement {
  if (route === "listings/new" || /^listings\/[^/]+\/edit$/.test(route)) {
    return <ListingForm />;
  }

  if (route === "content/events/new" || /^content\/events\/[^/]+\/edit$/.test(route)) {
    return <AdminEventForm />;
  }

  if (route === "events/new" || /^events\/[^/]+\/edit$/.test(route)) {
    return <AdminEventForm />;
  }

  if (route === "blog/new" || /^blog\/[^/]+\/edit$/.test(route)) {
    return <AdminBlogForm />;
  }

  if (route in staticRouteElements) {
    return staticRouteElements[route];
  }

  if (route in staticRouteMap) {
    const PageComponent = staticRouteMap[route];
    return <PageComponent />;
  }

  return <AdminRouteNotFound route={route} />;
}

interface AdminDashboardPageProps {
  route?: string;
}

export function AdminDashboardPage({ route = "" }: AdminDashboardPageProps) {
  const activePage = resolveAdminPage(route);

  return <ProtectedRoute allowedRoles={["admin", "editor"]}>{activePage}</ProtectedRoute>;
}
