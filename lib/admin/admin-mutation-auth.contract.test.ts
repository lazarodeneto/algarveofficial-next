import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();

interface AdminRouteContract {
  path: string;
  requiredSnippets: string[];
}

const ADMIN_MUTATION_ROUTE_CONTRACTS: AdminRouteContract[] = [
  {
    path: "app/api/admin/email/[entity]/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/footer/[entity]/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/global-settings/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/media-library/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/cms/page-config/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Server is missing SUPABASE_SERVICE_ROLE_KEY for CMS page config writes.'],
  },
  {
    path: "app/api/admin/cms/media-upload/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Server is missing SUPABASE_SERVICE_ROLE_KEY for CMS media uploads.'],
  },
  {
    path: "app/api/admin/navigation/[menu]/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/settings/[table]/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'allowedRoles: ["admin"]'],
  },
  {
    path: "app/api/admin/subscriptions/pricing/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/subscriptions/promotions/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/taxonomy/[entity]/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/listings/bulk-tier/route.ts",
    requiredSnippets: ['get_user_role', 'Only admins can update listing tiers.'],
  },
  {
    path: "app/api/admin/listings/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can manage listings.'],
  },
  {
    path: "app/api/admin/listings/[listingId]/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can manage listings.'],
  },
  {
    path: "app/api/admin/listings/[listingId]/golf/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can manage golf setup.'],
  },
  {
    path: "app/api/admin/listings/featured/reorder/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins or editors can reorder featured listings.'],
  },
  {
    path: "app/api/admin/listings/import/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can import listings.', 'allowedRoles: ["admin"]'],
  },
  {
    path: "app/api/admin/json-upsert/route.ts",
    requiredSnippets: ['@/app/api/admin/listings/import/route'],
  },
  {
    path: "app/api/admin/pin-listing/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can pin listings.', 'allowedRoles: ["admin"]'],
  },
  {
    path: "app/api/admin/upload-category-fallback/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can upload category fallbacks.'],
  },
  {
    path: "app/api/admin/chat/read/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins or editors can mark admin chat threads as read.'],
  },
  {
    path: "app/api/admin/chat/message/route.ts",
    requiredSnippets: [
      'requireAdminWriteClient',
      'Only admins or editors can send admin chat messages.',
      'Only admins or editors can delete admin chat messages.',
    ],
  },
  {
    path: "app/api/admin/chat/threads/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins or editors can update admin chat threads.'],
  },
  {
    path: "app/api/admin/curated-assignments/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can manage curated assignments.'],
  },
  {
    path: "app/api/admin/users/[userId]/route.ts",
    requiredSnippets: ['get_user_role', 'Only admins can manage users.'],
  },
  {
    path: "app/api/admin/i18n/sync/route.ts",
    requiredSnippets: ['get_user_role', 'role !== "admin" && role !== "editor"'],
  },
  {
    path: "app/api/admin/translations/jobs/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins or editors can manage translation jobs.'],
  },
  {
    path: "app/api/admin/subscriptions/override/route.ts",
    requiredSnippets: ['requireAdminWriteClient', 'Only admins can set subscription tier overrides.'],
  },
];

describe("admin mutation auth contract", () => {
  it("requires role-guarded auth checks on every admin mutation route", () => {
    for (const route of ADMIN_MUTATION_ROUTE_CONTRACTS) {
      const absolutePath = join(REPO_ROOT, route.path);
      const source = readFileSync(absolutePath, "utf8");
      for (const snippet of route.requiredSnippets) {
        expect(
          source,
          `Route ${route.path} is missing required auth guard snippet: ${snippet}`,
        ).toContain(snippet);
      }
    }
  });

  it("keeps listing protected-field trigger compatible with server-side admin writes", () => {
    const migration = readFileSync(
      join(REPO_ROOT, "supabase/migrations/20260515000000_allow_service_role_listing_admin_writes.sql"),
      "utf8",
    );

    expect(migration).toContain("auth.role() = 'service_role'");
    expect(migration).toContain("public.is_admin_or_editor(auth.uid())");
    expect(migration).toContain("Only administrators can modify listing tier");
  });
});
