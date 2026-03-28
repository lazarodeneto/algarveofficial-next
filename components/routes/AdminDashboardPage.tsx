"use client";

import { useMemo, type ReactElement } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LocaleLink } from "@/components/navigation/LocaleLink";
import { Button } from "@/components/ui/button";
import AdminAnalytics from "@/legacy-pages/admin/AdminAnalytics";
import AdminCategories from "@/legacy-pages/admin/AdminCategories";
import AdminCities from "@/legacy-pages/admin/AdminCities";
import AdminClaims from "@/legacy-pages/admin/AdminClaims";
import AdminCurated from "@/legacy-pages/admin/AdminCurated";
import AdminImageGeneration from "@/legacy-pages/admin/AdminImageGeneration";
import AdminImport from "@/legacy-pages/admin/AdminImport";
import AdminListings from "@/legacy-pages/admin/AdminListings";
import AdminMessages from "@/legacy-pages/admin/AdminMessages";
import AdminModeration from "@/legacy-pages/admin/AdminModeration";
import AdminOverview from "@/legacy-pages/admin/AdminOverview";
import AdminOwnerCRM from "@/legacy-pages/admin/AdminOwnerCRM";
import AdminReviewModeration from "@/legacy-pages/admin/AdminReviewModeration";
import AdminSubscriptions from "@/legacy-pages/admin/AdminSubscriptions";
import AdminUsers from "@/legacy-pages/admin/AdminUsers";
import ListingForm from "@/legacy-pages/admin/ListingForm";
import AdminBlog from "@/legacy-pages/admin/blog/AdminBlog";
import AdminBlogComments from "@/legacy-pages/admin/blog/AdminBlogComments";
import AdminBlogForm from "@/legacy-pages/admin/blog/AdminBlogForm";
import AdminCmsCategories from "@/legacy-pages/admin/cms/AdminCmsCategories";
import AdminCmsCities from "@/legacy-pages/admin/cms/AdminCmsCities";
import AdminCmsDestinations from "@/legacy-pages/admin/cms/AdminCmsDestinations";
import AdminCmsRegions from "@/legacy-pages/admin/cms/AdminCmsRegions";
import AdminContactPage from "@/legacy-pages/admin/cms/AdminContactPage";
import AdminCookiePage from "@/legacy-pages/admin/cms/AdminCookiePage";
import AdminFooterMenu from "@/legacy-pages/admin/cms/AdminFooterMenu";
import AdminGlobalSettings from "@/legacy-pages/admin/cms/AdminGlobalSettings";
import AdminHeaderMenu from "@/legacy-pages/admin/cms/AdminHeaderMenu";
import AdminHomePage from "@/legacy-pages/admin/cms/AdminHomePage";
import AdminLeftMenu from "@/legacy-pages/admin/cms/AdminLeftMenu";
import AdminMediaLibrary from "@/legacy-pages/admin/cms/AdminMediaLibrary";
import AdminPageBuilder from "@/legacy-pages/admin/cms/AdminPageBuilder";
import AdminPages from "@/legacy-pages/admin/cms/AdminPages";
import AdminPartnerPage from "@/legacy-pages/admin/cms/AdminPartnerPage";
import AdminPrivacyPage from "@/legacy-pages/admin/cms/AdminPrivacyPage";
import AdminSupportPage from "@/legacy-pages/admin/cms/AdminSupportPage";
import AdminTermsPage from "@/legacy-pages/admin/cms/AdminTermsPage";
import AdminTranslations from "@/legacy-pages/admin/cms/AdminTranslations";
import EmailAutomations from "@/legacy-pages/admin/email/EmailAutomations";
import EmailCampaigns from "@/legacy-pages/admin/email/EmailCampaigns";
import EmailContacts from "@/legacy-pages/admin/email/EmailContacts";
import EmailMarketingOverview from "@/legacy-pages/admin/email/EmailMarketingOverview";
import EmailReports from "@/legacy-pages/admin/email/EmailReports";
import EmailSegments from "@/legacy-pages/admin/email/EmailSegments";
import EmailSettings from "@/legacy-pages/admin/email/EmailSettings";
import EmailTemplates from "@/legacy-pages/admin/email/EmailTemplates";
import AdminEventForm from "@/legacy-pages/admin/events/AdminEventForm";
import AdminEventModeration from "@/legacy-pages/admin/events/AdminEventModeration";
import AdminEvents from "@/legacy-pages/admin/events/AdminEvents";

function AdminRouteNotFound({ route }: { route: string }) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-6 py-10 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-amber-500" />
      <h1 className="text-2xl font-serif font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The admin route <code className="rounded bg-muted px-1.5 py-0.5">/admin/{route || ""}</code> is not configured.
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

const staticRouteMap: Record<string, ReactElement> = {
  "": <AdminOverview />,
  analytics: <AdminAnalytics />,
  listings: <AdminListings />,
  curated: <AdminCurated />,
  moderation: <AdminModeration />,
  reviews: <AdminReviewModeration />,
  cities: <AdminCities />,
  categories: <AdminCategories />,
  users: <AdminUsers />,
  messages: <AdminMessages />,
  crm: <AdminOwnerCRM />,
  settings: <AdminGlobalSettings />,
  subscriptions: <AdminSubscriptions />,
  claims: <AdminClaims />,
  import: <AdminImport />,
  images: <AdminImageGeneration />,
  "content/home": <AdminHomePage />,
  "content/partner": <AdminPartnerPage />,
  "content/support": <AdminSupportPage />,
  "content/contact": <AdminContactPage />,
  "content/events": <AdminEvents />,
  "content/events/moderation": <AdminEventModeration />,
  "content/terms": <AdminTermsPage />,
  "content/privacy": <AdminPrivacyPage />,
  "content/cookies": <AdminCookiePage />,
  "content/pages": <AdminPages />,
  "content/regions": <AdminCmsRegions />,
  "content/destinations": <AdminCmsDestinations />,
  "content/cities": <AdminCmsCities />,
  "content/categories": <AdminCmsCategories />,
  "content/header": <AdminHeaderMenu />,
  "content/left-menu": <AdminLeftMenu />,
  "content/footer": <AdminFooterMenu />,
  "content/media": <AdminMediaLibrary />,
  "content/page-builder": <AdminPageBuilder />,
  "content/translations": <AdminTranslations />,
  email: <EmailMarketingOverview />,
  "email/contacts": <EmailContacts />,
  "email/segments": <EmailSegments />,
  "email/campaigns": <EmailCampaigns />,
  "email/templates": <EmailTemplates />,
  "email/automations": <EmailAutomations />,
  "email/reports": <EmailReports />,
  "email/settings": <EmailSettings />,
  blog: <AdminBlog />,
  "blog/comments": <AdminBlogComments />,
  events: <AdminEvents />,
  "events/moderation": <AdminEventModeration />,
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

  if (route in staticRouteMap) {
    return staticRouteMap[route];
  }

  return <AdminRouteNotFound route={route} />;
}

export function AdminDashboardPage() {
  const params = useParams<{ slug?: string[] }>();

  const route = useMemo(() => {
    const raw = params?.slug;
    if (!raw) return "";
    return Array.isArray(raw) ? raw.join("/") : raw;
  }, [params]);

  const activePage = useMemo(() => resolveAdminPage(route), [route]);

  return (
    <ProtectedRoute allowedRoles={["admin", "editor"]}>
      <AdminLayout>{activePage}</AdminLayout>
    </ProtectedRoute>
  );
}
