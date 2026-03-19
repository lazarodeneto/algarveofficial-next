import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface BreadcrumbConfig {
  basePath: string;
  baseKey: string;
  routes: Record<string, string>;
}

const dashboardConfigs: Record<string, BreadcrumbConfig> = {
  admin: {
    basePath: "/admin",
    baseKey: "common.adminDashboard",
    routes: {
      analytics: "admin.sidebar.analytics",
      listings: "admin.sidebar.listings",
      "listings/new": "admin.overview.createListing",
      curated: "admin.sidebar.curatedExcellence",
      moderation: "admin.sidebar.moderationQueue",
      cities: "admin.sidebar.cities",
      regions: "admin.sidebar.luxuryRegions",
      categories: "admin.sidebar.categories",
      users: "admin.sidebar.usersRoles",
      messages: "admin.sidebar.messages",
      settings: "admin.sidebar.settings",
      // CMS Content routes
      "content/home": "admin.sidebar.homePage",
      "content/partner": "admin.sidebar.partnerPage",
      "content/support": "admin.sidebar.supportPage",
      "content/events": "admin.sidebar.events",
      "content/events/new": "admin.sidebar.newEvent",
      "content/events/moderation": "admin.sidebar.eventModeration",
      "content/terms": "admin.sidebar.termsOfService",
      "content/privacy": "admin.sidebar.privacyPolicy",
      "content/cookies": "admin.sidebar.cookiePolicy",
      "content/pages": "admin.sidebar.pages",
      "content/regions": "admin.sidebar.regions",
      "content/destinations": "admin.sidebar.destinations",
      "content/cities": "admin.sidebar.cities",
      "content/categories": "admin.sidebar.categories",
      "content/header": "admin.sidebar.headerMenu",
      "content/footer": "admin.sidebar.footerMenu",
      "content/media": "admin.sidebar.mediaLibrary",
      "content/settings": "admin.sidebar.settings",
      // Email Marketing routes
      email: "admin.sidebar.emailMarketing",
      "email/contacts": "admin.sidebar.contacts",
      "email/segments": "admin.sidebar.segments",
      "email/campaigns": "admin.sidebar.campaigns",
      "email/templates": "admin.sidebar.templates",
      "email/automations": "admin.sidebar.automations",
      "email/reports": "admin.sidebar.reports",
      "email/settings": "admin.sidebar.settings",
      // Blog routes
      blog: "admin.sidebar.blog",
      "blog/new": "admin.sidebar.newPost",
      "blog/comments": "admin.sidebar.comments",
    },
  },
  owner: {
    basePath: "/owner",
    baseKey: "common.ownerDashboard",
    routes: {
      listings: "owner.sidebar.myListings",
      events: "owner.sidebar.myEvents",
      media: "owner.sidebar.photosMedia",
      membership: "owner.sidebar.membership",
      messages: "owner.sidebar.messages",
      support: "owner.sidebar.support",
    },
  },
  dashboard: {
    basePath: "/dashboard",
    baseKey: "nav.myDashboard",
    routes: {
      trips: "dashboard.sidebar.tripPlanner",
      favorites: "dashboard.sidebar.favorites",
      destinations: "dashboard.breadcrumb.savedDestinations",
      messages: "dashboard.sidebar.messages",
      profile: "dashboard.sidebar.profile",
    },
  },
};

export function DashboardBreadcrumb() {
  const { t } = useTranslation();
  const pathname = usePathname() ?? "";

  // Determine which dashboard we're in
  const dashboardType = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/owner")
    ? "owner"
    : pathname.startsWith("/dashboard")
    ? "dashboard"
    : null;

  if (!dashboardType) return null;

  const config = dashboardConfigs[dashboardType];
  const relativePath = pathname.replace(config.basePath, "").replace(/^\//, "");
  
  // Build breadcrumb segments
  const segments: { label: string; href: string; isLast: boolean }[] = [
    { label: t(config.baseKey), href: config.basePath, isLast: relativePath === "" },
  ];

  if (relativePath) {
    // Check for exact match first
    if (config.routes[relativePath]) {
      segments.push({
        label: t(config.routes[relativePath]),
        href: `${config.basePath}/${relativePath}`,
        isLast: true,
      });
    } else {
      // Handle nested routes like "listings/new" or "listings/:id/edit"
      const pathParts = relativePath.split("/");
      let currentPath = "";
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        // Skip dynamic segments like IDs
        if (/^[a-f0-9-]{20,}$/.test(part) || /^\d+$/.test(part)) {
          continue;
        }
        
        // Check if this path segment has a label
        if (config.routes[currentPath]) {
          segments.push({
            label: t(config.routes[currentPath]),
            href: `${config.basePath}/${currentPath}`,
            isLast: i === pathParts.length - 1,
          });
        } else if (config.routes[part]) {
          segments.push({
            label: t(config.routes[part]),
            href: `${config.basePath}/${currentPath}`,
            isLast: i === pathParts.length - 1,
          });
        } else if (part === "edit") {
          segments.push({
            label: t("common.edit"),
            href: pathname,
            isLast: true,
          });
        }
      }
    }
  }

  return (
    <nav className="flex min-w-0 items-center gap-1 text-xs sm:text-sm" aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground"
        title={t("common.goToHomepage")}
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => (
        <div
          key={segment.href}
          className={cn(
            "min-w-0 items-center gap-1",
            segment.isLast ? "flex" : index === 0 ? "hidden md:flex" : "hidden xl:flex",
          )}
        >
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
          {segment.isLast ? (
            <span className="block max-w-[9rem] truncate font-medium text-foreground sm:max-w-[13rem] lg:max-w-[18rem] 2xl:max-w-none">
              {segment.label}
            </span>
          ) : (
            <Link
              href={segment.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                index === 0 && "hidden lg:inline"
              )}
            >
              {segment.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
