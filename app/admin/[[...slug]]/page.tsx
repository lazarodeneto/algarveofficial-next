"use client";

import { useMemo, type ReactElement } from "react";
import { useParams } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "@/legacy-pages/admin/AdminOverview";
import AdminAnalytics from "@/legacy-pages/admin/AdminAnalytics";
import AdminListings from "@/legacy-pages/admin/AdminListings";
import ListingForm from "@/legacy-pages/admin/ListingForm";
import AdminCurated from "@/legacy-pages/admin/AdminCurated";
import AdminModeration from "@/legacy-pages/admin/AdminModeration";
import AdminCities from "@/legacy-pages/admin/AdminCities";
import AdminCategories from "@/legacy-pages/admin/AdminCategories";
import AdminUsers from "@/legacy-pages/admin/AdminUsers";
import AdminMessages from "@/legacy-pages/admin/AdminMessages";
import AdminOwnerCRM from "@/legacy-pages/admin/AdminOwnerCRM";
import AdminGlobalSettings from "@/legacy-pages/admin/cms/AdminGlobalSettings";
import AdminSubscriptions from "@/legacy-pages/admin/AdminSubscriptions";
import AdminClaims from "@/legacy-pages/admin/AdminClaims";
import AdminImport from "@/legacy-pages/admin/AdminImport";
import AdminImageGeneration from "@/legacy-pages/admin/AdminImageGeneration";
import AdminHomePage from "@/legacy-pages/admin/cms/AdminHomePage";
import AdminPartnerPage from "@/legacy-pages/admin/cms/AdminPartnerPage";
import AdminSupportPage from "@/legacy-pages/admin/cms/AdminSupportPage";
import AdminContactPage from "@/legacy-pages/admin/cms/AdminContactPage";
import AdminEvents from "@/legacy-pages/admin/events/AdminEvents";
import AdminEventForm from "@/legacy-pages/admin/events/AdminEventForm";
import AdminEventModeration from "@/legacy-pages/admin/events/AdminEventModeration";
import AdminTermsPage from "@/legacy-pages/admin/cms/AdminTermsPage";
import AdminPrivacyPage from "@/legacy-pages/admin/cms/AdminPrivacyPage";
import AdminCookiePage from "@/legacy-pages/admin/cms/AdminCookiePage";
import AdminPages from "@/legacy-pages/admin/cms/AdminPages";
import AdminCmsRegions from "@/legacy-pages/admin/cms/AdminCmsRegions";
import AdminCmsDestinations from "@/legacy-pages/admin/cms/AdminCmsDestinations";
import AdminCmsCities from "@/legacy-pages/admin/cms/AdminCmsCities";
import AdminCmsCategories from "@/legacy-pages/admin/cms/AdminCmsCategories";
import AdminHeaderMenu from "@/legacy-pages/admin/cms/AdminHeaderMenu";
import AdminLeftMenu from "@/legacy-pages/admin/cms/AdminLeftMenu";
import AdminFooterMenu from "@/legacy-pages/admin/cms/AdminFooterMenu";
import AdminMediaLibrary from "@/legacy-pages/admin/cms/AdminMediaLibrary";
import AdminPageBuilder from "@/legacy-pages/admin/cms/AdminPageBuilder";
import AdminTranslations from "@/legacy-pages/admin/cms/AdminTranslations";
import EmailMarketingOverview from "@/legacy-pages/admin/email/EmailMarketingOverview";
import EmailContacts from "@/legacy-pages/admin/email/EmailContacts";
import EmailSegments from "@/legacy-pages/admin/email/EmailSegments";
import EmailCampaigns from "@/legacy-pages/admin/email/EmailCampaigns";
import EmailTemplates from "@/legacy-pages/admin/email/EmailTemplates";
import EmailAutomations from "@/legacy-pages/admin/email/EmailAutomations";
import EmailReports from "@/legacy-pages/admin/email/EmailReports";
import EmailSettings from "@/legacy-pages/admin/email/EmailSettings";
import AdminBlog from "@/legacy-pages/admin/blog/AdminBlog";
import AdminBlogForm from "@/legacy-pages/admin/blog/AdminBlogForm";
import AdminBlogComments from "@/legacy-pages/admin/blog/AdminBlogComments";

const staticRouteMap: Record<string, ReactElement> = {
  "": <AdminOverview />,
  analytics: <AdminAnalytics />,
  listings: <AdminListings />,
  curated: <AdminCurated />,
  moderation: <AdminModeration />,
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

  return staticRouteMap[route] ?? <AdminOverview />;
}

export default function AdminPage() {
  const params = useParams<{ slug?: string[] }>();

  const route = useMemo(() => {
    const raw = params?.slug;
    if (!raw) return "";
    return Array.isArray(raw) ? raw.join("/") : raw;
  }, [params]);

  const activePage = useMemo(() => resolveAdminPage(route), [route]);

  return (
    <ProtectedRoute allowedRoles={["admin", "editor"]}>
      <AdminLayout>
        {activePage}
      </AdminLayout>
    </ProtectedRoute>
  );
}
