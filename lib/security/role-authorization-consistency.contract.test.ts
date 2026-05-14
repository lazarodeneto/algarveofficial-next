import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function source(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("role authorization consistency", () => {
  it("keeps database admin helpers on user_roles instead of JWT role claims", () => {
    const migration = source("supabase/migrations/20260514235955_normalize_role_authorization.sql");

    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.is_admin()");
    expect(migration).toContain("public.has_role(auth.uid(), 'admin'::public.app_role)");
    expect(migration).toContain("public.has_role(auth.uid(), 'editor'::public.app_role)");
    expect(migration).not.toContain("auth.jwt() ->> 'role'");
  });

  it("restricts direct branding bucket writes to admins and editors", () => {
    const migration = source("supabase/migrations/20260514235955_normalize_role_authorization.sql");

    expect(migration).toContain('DROP POLICY IF EXISTS "Admin Upload" ON storage.objects');
    expect(migration).toContain("WITH CHECK (bucket_id = 'branding' AND public.is_admin_or_editor(auth.uid()))");
    expect(migration).toContain("USING (bucket_id = 'branding' AND public.is_admin_or_editor(auth.uid()))");
  });

  it("requires owner role helper before owner listing change requests use service-role reads", () => {
    const route = source("app/api/owner/listing-change-requests/route.ts");

    expect(route).toContain("requireAuthenticatedOwner(request)");
    expect(route).toContain('.eq("owner_id", auth.userId)');
    expect(route.indexOf("requireAuthenticatedOwner(request)")).toBeLessThan(
      route.indexOf("createServiceRoleClient()"),
    );
    expect(route).not.toContain("auth.getUser()");
  });

  it("keeps admin inbox APIs admin-only when the page shell is admin-only", () => {
    const urgentCountRoute = source("app/api/admin/inbox/urgent-count/route.ts");

    expect(urgentCountRoute).toContain('requireAdminSession(request, ["admin"])');
  });
});
