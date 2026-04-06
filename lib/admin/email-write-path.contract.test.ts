import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(REPO_ROOT, relativePath), "utf8");
}

describe("email admin write path contract", () => {
  it("keeps contact writes behind the admin API client", () => {
    const source = read("hooks/useEmailContacts.ts");
    expect(source).toContain('callAdminEmailApi<EmailContact>("contacts", "POST"');
    expect(source).toContain('callAdminEmailApi<EmailContact>("contacts", "PATCH"');
    expect(source).toContain('callAdminEmailApi("contacts", "DELETE"');

    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*insert\(/);
    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*update\(/);
    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*upsert\(/);
    expect(source).not.toMatch(/from\("email_contacts"\)\s*\.\s*delete\(/);
  });

  it("keeps automation writes behind the admin API client", () => {
    const source = read("legacy-pages/admin/email/EmailAutomations.tsx");
    expect(source).toContain('callAdminEmailApi("automations", "POST"');
    expect(source).toContain('callAdminEmailApi("automations", "PATCH"');
    expect(source).toContain('callAdminEmailApi("automations", "DELETE"');

    expect(source).not.toMatch(/from\("email_automations"\)\s*\.\s*insert\(/);
    expect(source).not.toMatch(/from\("email_automations"\)\s*\.\s*update\(/);
    expect(source).not.toMatch(/from\("email_automations"\)\s*\.\s*delete\(/);
  });
});
