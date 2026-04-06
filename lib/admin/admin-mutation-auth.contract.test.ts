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
    path: "app/api/admin/navigation/[menu]/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
  },
  {
    path: "app/api/admin/settings/[table]/route.ts",
    requiredSnippets: ['requireAdminWriteClient'],
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
    path: "app/api/admin/users/[userId]/route.ts",
    requiredSnippets: ['get_user_role', 'Only admins can manage users.'],
  },
  {
    path: "app/api/admin/i18n/sync/route.ts",
    requiredSnippets: ['get_user_role', 'role !== "admin" && role !== "editor"'],
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
});
