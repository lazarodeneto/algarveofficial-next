import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  join(process.cwd(), "components", "ui", "whatsapp-chat-button.tsx"),
  "utf8",
);

describe("WhatsAppChatButton mobile placement", () => {
  it("keeps the concierge bell above the mobile bottom-nav edge", () => {
    expect(SOURCE).toContain('import { useMobileChromeScrollState } from "@/hooks/useMobileChromeScrollState"');
    expect(SOURCE).toContain("const { isUserScrolling } = useMobileChromeScrollState();");
    expect(SOURCE).toContain("bottom-[calc(env(safe-area-inset-bottom)+5.7rem)]");
    expect(SOURCE).toContain("translate-y-[calc(100%+env(safe-area-inset-bottom)+5.7rem+1rem)]");
    expect(SOURCE).not.toContain("bottom-[calc(env(safe-area-inset-bottom)+4.5rem)]");
  });
});
